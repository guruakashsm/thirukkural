#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const DEFAULTS = {
  lang: 'ta',
  start: 1,
  end: 1330,
  delayMs: 250,
  chunkSize: 180,
  force: false,
  updateJson: true,
  mode: 'both',
  jsonPath: 'src/data/kurals.json',
  outputDir: 'public/audio',
  kuralField: '',
  porulField: '',
  porulLabel: '',
}

function printHelp() {
  console.log(`
Generate Kural audio files from src/data/kurals.json

Usage:
  node scripts/generate-kural-audio.mjs [options]

Options:
  --lang <code>            TTS language code (default: ta)
  --start <n>              Start kural number (default: 1)
  --end <n>                End kural number (default: 1330)
  --mode <both|kural|porul>
                           Generate only kural, only kural+porul, or both (default: both)
  --delay-ms <n>           Delay between API calls in ms (default: 250)
  --chunk-size <n>         Max text length per TTS request (default: 180)
  --output-dir <path>      Output folder under public (default: public/audio)
  --json-path <path>       Kural JSON path (default: src/data/kurals.json)
  --kural-field <name>     JSON field used for base recitation text
  --porul-field <name>     JSON field used for porul text
  --porul-label <text>     Label between kural and porul (default: "பொருள்" for ta, "Meaning" otherwise)
  --force                  Regenerate even if files exist
  --no-update-json         Do not write audio paths back into kural JSON
  --help                   Show this help

Examples:
  node scripts/generate-kural-audio.mjs
  node scripts/generate-kural-audio.mjs --start 1 --end 50 --force
  node scripts/generate-kural-audio.mjs --lang en --kural-field englishMeaning --porul-field englishMeaning --output-dir public/audio/en
`)
}

function parseArgs(argv) {
  const options = { ...DEFAULTS }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]

    if (arg === '--help' || arg === '-h') {
      options.help = true
      return options
    }

    if (arg === '--force') {
      options.force = true
      continue
    }

    if (arg === '--no-update-json') {
      options.updateJson = false
      continue
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for ${arg}`)
    }

    switch (arg) {
      case '--lang':
        options.lang = next
        i += 1
        break
      case '--start':
        options.start = Number.parseInt(next, 10)
        i += 1
        break
      case '--end':
        options.end = Number.parseInt(next, 10)
        i += 1
        break
      case '--delay-ms':
        options.delayMs = Number.parseInt(next, 10)
        i += 1
        break
      case '--chunk-size':
        options.chunkSize = Number.parseInt(next, 10)
        i += 1
        break
      case '--output-dir':
        options.outputDir = next
        i += 1
        break
      case '--json-path':
        options.jsonPath = next
        i += 1
        break
      case '--mode':
        options.mode = next
        i += 1
        break
      case '--kural-field':
        options.kuralField = next
        i += 1
        break
      case '--porul-field':
        options.porulField = next
        i += 1
        break
      case '--porul-label':
        options.porulLabel = next
        i += 1
        break
      default:
        throw new Error(`Unknown option: ${arg}`)
    }
  }

  return options
}

function assertValidOptions(options) {
  if (!Number.isFinite(options.start) || options.start < 1) {
    throw new Error('Invalid --start value')
  }
  if (!Number.isFinite(options.end) || options.end < options.start) {
    throw new Error('Invalid --end value')
  }
  if (!Number.isFinite(options.delayMs) || options.delayMs < 0) {
    throw new Error('Invalid --delay-ms value')
  }
  if (!Number.isFinite(options.chunkSize) || options.chunkSize < 40) {
    throw new Error('Invalid --chunk-size value')
  }
  if (!['both', 'kural', 'porul'].includes(options.mode)) {
    throw new Error('Invalid --mode. Use: both | kural | porul')
  }
}

function normalizeText(text) {
  return String(text || '').replace(/\s+/g, ' ').trim()
}

function splitText(text, maxLength) {
  const normalized = normalizeText(text)
  if (!normalized) return []

  const words = normalized.split(' ')
  const chunks = []
  let current = ''

  for (const word of words) {
    if (!current) {
      current = word
      continue
    }

    if (`${current} ${word}`.length <= maxLength) {
      current = `${current} ${word}`
      continue
    }

    chunks.push(current)
    current = word

    while (current.length > maxLength) {
      chunks.push(current.slice(0, maxLength))
      current = current.slice(maxLength)
    }
  }

  if (current) chunks.push(current)
  return chunks
}

function ttsUrl(lang, text) {
  const url = new URL('https://translate.google.com/translate_tts')
  url.searchParams.set('ie', 'UTF-8')
  url.searchParams.set('client', 'tw-ob')
  url.searchParams.set('tl', lang)
  url.searchParams.set('q', text)
  return url.toString()
}

async function sleep(ms) {
  if (!ms) return
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

async function downloadTtsSegment(url, outputFile, delayMs) {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'audio/mpeg,audio/*,*/*;q=0.8',
        },
      })

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.status} ${response.statusText}`)
      }

      const bytes = Buffer.from(await response.arrayBuffer())
      if (bytes.length < 256) {
        throw new Error('TTS response too small, likely blocked or invalid')
      }

      await fs.writeFile(outputFile, bytes)
      await sleep(delayMs)
      return
    } catch (error) {
      if (attempt >= maxAttempts) throw error
      await sleep(delayMs + attempt * 500)
    }
  }
}

async function generateAudioFile(text, outputFile, options) {
  const cleanedText = normalizeText(text)
  if (!cleanedText) {
    throw new Error(`Empty text for ${outputFile}`)
  }

  if (!options.force && await pathExists(outputFile)) {
    return 'skipped'
  }

  const chunks = splitText(cleanedText, options.chunkSize)
  if (chunks.length === 0) {
    throw new Error(`No chunks generated for ${outputFile}`)
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'kural-tts-'))
  try {
    const segmentNames = []
    for (let i = 0; i < chunks.length; i += 1) {
      const segName = `seg-${String(i + 1).padStart(4, '0')}.mp3`
      const segPath = path.join(tempDir, segName)
      const url = ttsUrl(options.lang, chunks[i])
      await downloadTtsSegment(url, segPath, options.delayMs)
      segmentNames.push(segName)
    }

    if (segmentNames.length === 1) {
      await fs.copyFile(path.join(tempDir, segmentNames[0]), outputFile)
      return 'generated'
    }

    const listFile = path.join(tempDir, 'segments.txt')
    const listContent = segmentNames.map((name) => `file '${name}'`).join('\n')
    await fs.writeFile(listFile, `${listContent}\n`)

    const merged = path.join(tempDir, 'merged.mp3')
    await execFileAsync('ffmpeg', [
      '-hide_banner',
      '-loglevel', 'error',
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listFile,
      '-c', 'copy',
      merged,
    ])

    await fs.copyFile(merged, outputFile)
    return 'generated'
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

function inferDefaults(options) {
  const inferred = { ...options }
  if (!inferred.kuralField) inferred.kuralField = inferred.lang === 'ta' ? 'tamil' : 'englishMeaning'
  if (!inferred.porulField) inferred.porulField = inferred.lang === 'ta' ? 'tamilMeaning' : 'englishMeaning'
  if (!inferred.porulLabel) inferred.porulLabel = inferred.lang === 'ta' ? 'பொருள்' : 'Meaning'
  return inferred
}

async function ensureFfmpeg() {
  try {
    await execFileAsync('ffmpeg', ['-version'])
  } catch {
    throw new Error('ffmpeg is required. Install ffmpeg and re-run.')
  }
}

async function main() {
  const parsed = parseArgs(process.argv.slice(2))
  if (parsed.help) {
    printHelp()
    return
  }

  const options = inferDefaults(parsed)
  assertValidOptions(options)
  await ensureFfmpeg()

  const cwd = process.cwd()
  const jsonPath = path.resolve(cwd, options.jsonPath)
  const outputDir = path.resolve(cwd, options.outputDir)
  await fs.mkdir(outputDir, { recursive: true })

  const publicRoot = path.resolve(cwd, 'public')
  const relativeOutput = path.relative(publicRoot, outputDir).replace(/\\/g, '/')
  if (relativeOutput.startsWith('..')) {
    throw new Error('--output-dir must be inside public/ so paths can be used by the app')
  }
  const pathPrefix = relativeOutput ? `${relativeOutput}/` : ''

  const raw = await fs.readFile(jsonPath, 'utf8')
  const kurals = JSON.parse(raw)

  const includeKural = options.mode !== 'porul'
  const includePorul = options.mode !== 'kural'

  let generated = 0
  let skipped = 0
  let failed = 0

  for (const kural of kurals) {
    const number = Number(kural.number)
    if (!Number.isFinite(number) || number < options.start || number > options.end) continue

    const kuralText = normalizeText(kural[options.kuralField])
    const porulText = normalizeText(kural[options.porulField])
    const withPorulText = normalizeText(`${kuralText}. ${options.porulLabel}: ${porulText}`)

    const kuralFileName = `kural-${number}-kural.mp3`
    const porulFileName = `kural-${number}-kural-porul.mp3`
    const kuralOutput = path.join(outputDir, kuralFileName)
    const porulOutput = path.join(outputDir, porulFileName)

    process.stdout.write(`Kural ${number}: `)

    try {
      const localStatus = []

      if (includeKural) {
        const status = await generateAudioFile(kuralText, kuralOutput, options)
        status === 'generated' ? generated += 1 : skipped += 1
        localStatus.push(`kural=${status}`)
        if (options.updateJson) kural.audioPath = `${pathPrefix}${kuralFileName}`
      }

      if (includePorul) {
        const status = await generateAudioFile(withPorulText, porulOutput, options)
        status === 'generated' ? generated += 1 : skipped += 1
        localStatus.push(`porul=${status}`)
        if (options.updateJson) kural.audioWithPorulPath = `${pathPrefix}${porulFileName}`
      }

      process.stdout.write(`${localStatus.join(', ')}\n`)
    } catch (error) {
      failed += 1
      process.stdout.write(`failed (${error instanceof Error ? error.message : String(error)})\n`)
    }
  }

  if (options.updateJson) {
    await fs.writeFile(jsonPath, `${JSON.stringify(kurals, null, 2)}\n`, 'utf8')
  }

  console.log('\nDone.')
  console.log(`Generated: ${generated}`)
  console.log(`Skipped:   ${skipped}`)
  console.log(`Failed:    ${failed}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exit(1)
})
