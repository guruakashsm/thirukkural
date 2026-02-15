#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const DEFAULT_SOURCE_URL = 'https://www.thirukkural.net/ta/kural'
const DEFAULT_OUTPUT = 'src/data/kurals-enriched.json'
const DEFAULT_KURALS = 'src/data/kurals.json'
const DEFAULT_PDF = 'Thirukkural English Translation - G.U. Pope.pdf'

function parseArgs(argv) {
  const args = {
    sourceUrl: DEFAULT_SOURCE_URL,
    out: DEFAULT_OUTPUT,
    kuralsFile: DEFAULT_KURALS,
    pdf: DEFAULT_PDF,
    dryRun: false,
    strictPope: false,
  }

  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--source-url') args.sourceUrl = argv[++i]
    else if (a === '--out') args.out = argv[++i]
    else if (a === '--kurals-file') args.kuralsFile = argv[++i]
    else if (a === '--pdf') args.pdf = argv[++i]
    else if (a === '--dry-run') args.dryRun = true
    else if (a === '--strict-pope') args.strictPope = true
    else if (a === '--help' || a === '-h') {
      printHelp()
      process.exit(0)
    } else {
      throw new Error(`Unknown argument: ${a}`)
    }
  }

  return args
}

function printHelp() {
  console.log(`Usage: node scripts/scrape-kural-translations.mjs [options]

Options:
  --source-url <url>      Base URL for chapter pages
                           (default: ${DEFAULT_SOURCE_URL})
  --out <file>            Output enriched JSON file
                           (default: ${DEFAULT_OUTPUT})
  --kurals-file <file>    Base kurals file for Pope fallback
                           (default: ${DEFAULT_KURALS})
  --pdf <file>            G.U. Pope PDF path
                           (default: ${DEFAULT_PDF})
  --dry-run               Do not write file, only report
  --strict-pope           Do not fallback to kurals.json for missing Pope
  --help, -h              Show this help
`)
}

function decodeHtmlEntities(input) {
  return input
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&mdash;|&#8212;/g, '—')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
}

function stripTags(input) {
  return decodeHtmlEntities(input)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalTamilScholar(rawScholar) {
  const normalized = stripTags(rawScholar)
    .replace(/\s*\(.*\)\s*$/, '')
    .trim()

  if (/புலியூர்க்\s*கேசிகன்/.test(normalized)) return 'புலியூர்க் கேசிகன்'
  if (/வரதராச/.test(normalized)) return 'மு. வரதராசன்'
  if (/பாப்பையா/.test(normalized)) return 'சாலமன் பாப்பையா'
  if (/கருணாநிதி/.test(normalized)) return 'மு. கருணாநிதி'
  return normalized
}

function uniqueByScholar(items) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    if (!item?.scholar || !item?.text) continue
    if (seen.has(item.scholar)) continue
    seen.add(item.scholar)
    out.push(item)
  }
  return out
}

function toSortedNumericObjectKeys(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort((a, b) => Number(a) - Number(b))
  for (const k of keys) {
    sorted[k] = obj[k]
  }
  return sorted
}

async function fetchTextWithRetry(url, maxAttempts = 3) {
  let lastError
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      return await response.text()
    } catch (err) {
      lastError = err
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt))
      }
    }
  }
  throw new Error(`Failed to fetch ${url}: ${lastError?.message || 'unknown error'}`)
}

function parseTamilCommentaryBlock(htmlBlock) {
  const pieces = htmlBlock.split(/<br>\s*<br>/i)
  const entries = []

  for (const rawPiece of pieces) {
    const piece = rawPiece.trim()
    if (!piece) continue

    const match = piece.match(/([\s\S]*?)<br>\s*(?:&mdash;|&#8212;|—)\s*([\s\S]*)/i)
    if (!match) continue

    const text = stripTags(match[1])
    const scholar = canonicalTamilScholar(match[2])
    if (!text || !scholar) continue

    entries.push({ scholar, text })
  }

  const normalized = uniqueByScholar(entries)

  const preferredOrder = [
    'புலியூர்க் கேசிகன்',
    'மு. வரதராசன்',
    'சாலமன் பாப்பையா',
    'மு. கருணாநிதி',
  ]

  normalized.sort((a, b) => {
    const ia = preferredOrder.indexOf(a.scholar)
    const ib = preferredOrder.indexOf(b.scholar)
    const va = ia === -1 ? 999 : ia
    const vb = ib === -1 ? 999 : ib
    return va - vb
  })

  return normalized
}

async function scrapeTamilCommentaries(baseUrl) {
  const result = {}
  const blockRegex = /<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12 para-padding text-left">\s*<h2><a href="kural-(\d{4})\.html">[\s\S]*?<\/h2><span class="kuralOtherLang">([\s\S]*?)<\/span>\s*<\/div>/g

  for (let chapter = 1; chapter <= 133; chapter += 1) {
    const url = `${baseUrl}/adhigaram-${String(chapter).padStart(3, '0')}.html`
    const html = await fetchTextWithRetry(url)

    let match
    let chapterCount = 0
    while ((match = blockRegex.exec(html)) !== null) {
      const kuralNumber = String(parseInt(match[1], 10))
      result[kuralNumber] = parseTamilCommentaryBlock(match[2])
      chapterCount += 1
    }

    if (chapterCount !== 10) {
      throw new Error(`Chapter ${chapter} parsed ${chapterCount} kurals (expected 10)`)
    }
  }

  const missing = []
  for (let k = 1; k <= 1330; k += 1) {
    if (!result[String(k)]) missing.push(k)
  }

  if (missing.length > 0) {
    throw new Error(`Tamil scrape missing ${missing.length} kurals: ${missing.slice(0, 20).join(', ')}`)
  }

  return result
}

function parsePopeStartNumber(line) {
  const trimmed = line.trim()
  const match = trimmed.match(/^(\d{1,4})(?:[.,]|(?:\s*-\w+))?$/)
  if (!match) return null
  const n = Number(match[1])
  return n >= 1 && n <= 1330 ? n : null
}

function isHeadingOrNoise(line) {
  const trimmed = line.trim()
  if (!trimmed) return true
  if (/^\d{1,3}$/.test(trimmed)) return true
  if (/^(PART\b|BOOK\b|CONTENTS\b|English Translation\b|tirukkuRaL\b)/i.test(trimmed)) return true
  if (/^\d+(?:\.\d+)+\.?\s*/.test(trimmed)) return true
  return false
}

function extractPopeTranslationsFromPdf(pdfPath) {
  const rawText = execFileSync('pdftotext', ['-raw', pdfPath, '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  })

  const lines = rawText.replace(/\f/g, '\n').split(/\r?\n/)
  const popeByKural = {}
  let searchStart = 0

  for (let expected = 1; expected <= 1330; expected += 1) {
    let found = false

    for (let i = searchStart; i < lines.length; i += 1) {
      const n = parsePopeStartNumber(lines[i])
      if (n !== expected) continue

      const picked = []
      for (let j = i + 1; j < Math.min(lines.length, i + 40) && picked.length < 2; j += 1) {
        const line = lines[j].trim()
        if (!line) continue
        if (isHeadingOrNoise(line)) continue

        const maybeAnotherStart = parsePopeStartNumber(line)
        if (maybeAnotherStart && maybeAnotherStart !== expected) break

        picked.push(line)
      }

      if (picked.length < 2) continue

      popeByKural[String(expected)] = picked.join(' ').replace(/\s+/g, ' ').trim()
      searchStart = i + 1
      found = true
      break
    }

    if (!found) {
      // Leave missing; caller may fallback from kurals.json if desired.
    }
  }

  return popeByKural
}

function mergeTranslations({ enriched, kurals, tamilByKural, popeByKural, strictPope }) {
  const missingTamil = []
  const missingPope = []
  const popeFallbackUsed = []

  const kuralsByNumber = new Map(kurals.map((k) => [k.number, k]))

  for (let number = 1; number <= 1330; number += 1) {
    const key = String(number)
    const current = enriched[key] || {}
    const currentTranslations = current.translations || { english: [], tamil: [] }

    const existingEnglish = Array.isArray(currentTranslations.english) ? currentTranslations.english : []
    const withoutPope = existingEnglish.filter((tr) => tr?.scholar !== 'G.U. Pope')

    let popeText = popeByKural[key] || ''
    if (!popeText && !strictPope) {
      const fallback = kuralsByNumber.get(number)?.englishMeaning || ''
      if (fallback) {
        popeText = fallback
        popeFallbackUsed.push(number)
      }
    }

    const english = popeText
      ? [{ scholar: 'G.U. Pope', text: popeText }, ...withoutPope]
      : withoutPope

    if (!popeText) missingPope.push(number)

    const tamil = tamilByKural[key] || []
    if (tamil.length < 4) missingTamil.push(number)

    current.translations = {
      english,
      tamil: tamil.length > 0 ? tamil : (Array.isArray(currentTranslations.tamil) ? currentTranslations.tamil : []),
    }

    enriched[key] = current
  }

  return {
    merged: toSortedNumericObjectKeys(enriched),
    missingTamil,
    missingPope,
    popeFallbackUsed,
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const [enrichedRaw, kuralsRaw] = await Promise.all([
    readFile(args.out, 'utf8'),
    readFile(args.kuralsFile, 'utf8'),
  ])

  const enriched = JSON.parse(enrichedRaw)
  const kurals = JSON.parse(kuralsRaw)

  console.log('Scraping Tamil commentaries from thirukkural.net ...')
  const tamilByKural = await scrapeTamilCommentaries(args.sourceUrl)

  console.log('Extracting G.U. Pope translations from PDF ...')
  const popeByKural = extractPopeTranslationsFromPdf(args.pdf)

  const { merged, missingTamil, missingPope, popeFallbackUsed } = mergeTranslations({
    enriched,
    kurals,
    tamilByKural,
    popeByKural,
    strictPope: args.strictPope,
  })

  console.log(`Tamil coverage: ${Object.keys(tamilByKural).length}/1330`)
  console.log(`Pope from PDF: ${Object.keys(popeByKural).length}/1330`)
  if (popeFallbackUsed.length > 0) {
    console.log(`Pope fallback used for ${popeFallbackUsed.length} kurals: ${popeFallbackUsed.join(', ')}`)
  }
  if (missingTamil.length > 0) {
    console.log(`Missing Tamil entries: ${missingTamil.join(', ')}`)
  }
  if (missingPope.length > 0) {
    console.log(`Missing Pope entries after merge: ${missingPope.join(', ')}`)
  }

  if (args.dryRun) {
    console.log('Dry-run complete. No files written.')
    return
  }

  await writeFile(args.out, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
  console.log(`Updated: ${args.out}`)
}

main().catch((err) => {
  console.error(err.message || err)
  process.exit(1)
})
