#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import process from 'node:process'

const DEFAULTS = {
  start: 1,
  end: 1330,
  out: 'src/data/kurals-enriched.json',
  baseUrl: 'https://thirukkural.site/kural',
  chromePath: process.env.CHROME_PATH || 'google-chrome',
  virtualTimeBudget: 12000,
  delayMs: 150,
  dryRun: false,
}

function printHelp() {
  console.log(`Usage: node scripts/scrape-thirukkural-site-commentaries.mjs [options]

Scrapes Tamil commentaries from thirukkural.site rendered pages and merges them into:
  <kural>.translations.tamil in src/data/kurals-enriched.json

Options:
  --start <n>                 Start kural number (default: ${DEFAULTS.start})
  --end <n>                   End kural number (default: ${DEFAULTS.end})
  --out <file>                Enriched JSON output path (default: ${DEFAULTS.out})
  --base-url <url>            Base page URL (default: ${DEFAULTS.baseUrl})
  --chrome-path <path>        Chrome/Chromium binary path (default: ${DEFAULTS.chromePath})
  --virtual-time-budget <ms>  JS render budget per page in ms (default: ${DEFAULTS.virtualTimeBudget})
  --delay-ms <ms>             Delay between pages in ms (default: ${DEFAULTS.delayMs})
  --dry-run                   Parse and report only, do not write file
  --help, -h                  Show this help
`)
}

function parseArgs(argv) {
  const args = { ...DEFAULTS }

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]

    if (token === '--help' || token === '-h') {
      args.help = true
      return args
    }

    if (token === '--dry-run') {
      args.dryRun = true
      continue
    }

    const next = argv[i + 1]
    if (!next || next.startsWith('--')) {
      throw new Error(`Missing value for ${token}`)
    }

    switch (token) {
      case '--start':
        args.start = Number.parseInt(next, 10)
        i += 1
        break
      case '--end':
        args.end = Number.parseInt(next, 10)
        i += 1
        break
      case '--out':
        args.out = next
        i += 1
        break
      case '--base-url':
        args.baseUrl = next.replace(/\/+$/, '')
        i += 1
        break
      case '--chrome-path':
        args.chromePath = next
        i += 1
        break
      case '--virtual-time-budget':
        args.virtualTimeBudget = Number.parseInt(next, 10)
        i += 1
        break
      case '--delay-ms':
        args.delayMs = Number.parseInt(next, 10)
        i += 1
        break
      default:
        throw new Error(`Unknown option: ${token}`)
    }
  }

  return args
}

function validateArgs(args) {
  if (!Number.isFinite(args.start) || args.start < 1 || args.start > 1330) {
    throw new Error('Invalid --start. Use 1..1330')
  }
  if (!Number.isFinite(args.end) || args.end < args.start || args.end > 1330) {
    throw new Error('Invalid --end. Use start..1330')
  }
  if (!Number.isFinite(args.virtualTimeBudget) || args.virtualTimeBudget < 1000) {
    throw new Error('Invalid --virtual-time-budget. Use >= 1000')
  }
  if (!Number.isFinite(args.delayMs) || args.delayMs < 0) {
    throw new Error('Invalid --delay-ms. Use >= 0')
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
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
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function stripTags(input) {
  return decodeHtmlEntities(String(input || ''))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function canonicalTamilScholar(rawScholar) {
  const scholar = stripTags(rawScholar)
    .replace(/\s*உரை\s*$/u, '')
    .replace(/\s+/g, ' ')
    .trim()

  if (/புலியூர்க்?\s*கேசிகன்/u.test(scholar)) return 'புலியூர்க் கேசிகன்'
  if (/வரதராச/u.test(scholar)) return 'மு. வரதராசன்'
  if (/பாப்பையா/u.test(scholar)) return 'சாலமன் பாப்பையா'
  if (/கருணாநிதி/u.test(scholar)) return 'மு. கருணாநிதி'
  if (/பரிமேலழகர்/u.test(scholar)) return 'பரிமேலழகர்'
  if (/மணக்குடவர்/u.test(scholar)) return 'மணக்குடவர்'
  if (/முனிசாமி/u.test(scholar)) return 'திருக்குறளார் வீ. முனிசாமி'

  return scholar
}

function uniqueByScholar(items) {
  const out = []
  const seen = new Set()
  for (const item of items) {
    if (!item?.scholar || !item?.text) continue
    if (seen.has(item.scholar)) continue
    seen.add(item.scholar)
    out.push(item)
  }
  return out
}

function extractRenderedHtml(rawOutput) {
  const doctypeIndex = rawOutput.indexOf('<!DOCTYPE')
  if (doctypeIndex >= 0) return rawOutput.slice(doctypeIndex)
  const htmlIndex = rawOutput.indexOf('<html')
  if (htmlIndex >= 0) return rawOutput.slice(htmlIndex)
  return rawOutput
}

function extractTamilCommentaries(renderedHtml) {
  const sectionMarker = 'Tamil Commentaries (தமிழ் உரைகள்)'
  if (!renderedHtml.includes(sectionMarker)) return []

  const blockRegex = /<div[^>]*class="[^"]*content-section tamil-content[^"]*"[^>]*>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>[\s\S]*?<\/div>/g
  const entries = []
  let match

  while ((match = blockRegex.exec(renderedHtml)) !== null) {
    const scholar = canonicalTamilScholar(match[1])
    const text = stripTags(match[2])

    if (!scholar || !text) continue
    entries.push({ scholar, text })
  }

  return uniqueByScholar(entries)
}

function renderPageWithChrome({ chromePath, virtualTimeBudget, url }) {
  const output = execFileSync(
    chromePath,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--disable-logging',
      '--log-level=3',
      `--virtual-time-budget=${String(virtualTimeBudget)}`,
      '--dump-dom',
      url,
    ],
    {
      encoding: 'utf8',
      maxBuffer: 40 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'ignore'],
      env: {
        ...process.env,
        NO_AT_BRIDGE: '1',
      },
    },
  )

  return extractRenderedHtml(output)
}

async function scrapeKuralCommentaries(args, number) {
  const url = `${args.baseUrl}/${number}`
  const maxAttempts = 3
  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const html = renderPageWithChrome({
        chromePath: args.chromePath,
        virtualTimeBudget: args.virtualTimeBudget,
        url,
      })

      const parsed = extractTamilCommentaries(html)
      if (parsed.length === 0) {
        throw new Error('No Tamil commentary blocks found')
      }
      return parsed
    } catch (error) {
      lastError = error
      if (attempt < maxAttempts) {
        await sleep(300 * attempt)
      }
    }
  }

  throw new Error(`Failed for ${url}: ${lastError?.message || 'unknown error'}`)
}

function mergeTamilCommentaries(existingTamil, scrapedTamil) {
  return uniqueByScholar([...(existingTamil || []), ...scrapedTamil])
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  if (args.help) {
    printHelp()
    return
  }

  validateArgs(args)

  const enrichedRaw = await readFile(args.out, 'utf8')
  const enriched = JSON.parse(enrichedRaw)

  let scanned = 0
  let updated = 0
  let appendedTotal = 0
  const failures = []

  for (let number = args.start; number <= args.end; number += 1) {
    scanned += 1
    const key = String(number)

    try {
      const scrapedTamil = await scrapeKuralCommentaries(args, number)
      const current = enriched[key] || {}
      const translations = current.translations || { english: [], tamil: [] }
      const beforeTamil = Array.isArray(translations.tamil) ? translations.tamil : []
      const mergedTamil = mergeTamilCommentaries(beforeTamil, scrapedTamil)
      const added = mergedTamil.length - beforeTamil.length

      if (added > 0) {
        appendedTotal += added
        updated += 1
      }

      current.translations = {
        english: Array.isArray(translations.english) ? translations.english : [],
        tamil: mergedTamil,
      }
      enriched[key] = current

      const progressTag = `[${number}]`
      if (added > 0) {
        console.log(`${progressTag} appended ${added} Tamil commentator(s)`)
      } else {
        console.log(`${progressTag} no new commentators`)
      }
    } catch (error) {
      failures.push({ number, error: error.message || String(error) })
      console.warn(`[${number}] failed: ${error.message || error}`)
    }

    if (number < args.end && args.delayMs > 0) {
      await sleep(args.delayMs)
    }
  }

  console.log(`Scanned: ${scanned}`)
  console.log(`Updated kurals: ${updated}`)
  console.log(`Total Tamil commentators appended: ${appendedTotal}`)
  console.log(`Failures: ${failures.length}`)

  if (failures.length > 0) {
    const preview = failures.slice(0, 20).map((f) => `${f.number} (${f.error})`).join(', ')
    console.log(`Failure preview: ${preview}`)
  }

  if (args.dryRun) {
    console.log('Dry-run complete. No files written.')
    return
  }

  await writeFile(args.out, `${JSON.stringify(enriched, null, 2)}\n`, 'utf8')
  console.log(`Updated: ${args.out}`)
}

main().catch((error) => {
  console.error(error.message || error)
  process.exit(1)
})
