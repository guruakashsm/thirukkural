export type UraiSourceKey =
  | 'default'
  | 'parimel'
  | 'manakkudavar'
  | 'varadarasan'
  | 'puliyur'
  | 'pappaiya'
  | 'karunanidhi'
  | 'munisamy'

export const URAI_SOURCES: { key: UraiSourceKey; label: string }[] = [
  { key: 'parimel', label: 'பரிமேலழகர்' },
  { key: 'manakkudavar', label: 'மணக்குடவர்' },
  { key: 'varadarasan', label: 'மு. வரதராசன்' },
  { key: 'puliyur', label: 'புலியூர்க் கேசிகன்' },
  { key: 'pappaiya', label: 'சாலமன் பாப்பையா' },
  { key: 'karunanidhi', label: 'மு. கருணாநிதி' },
  { key: 'munisamy', label: 'வி. முனிசாமி' },
]

type EnrichedKural = {
  translations?: {
    tamil?: { scholar: string; text: string }[]
  }
}

let enrichedCache: Record<string, EnrichedKural> | null = null

async function getEnriched(): Promise<Record<string, EnrichedKural>> {
  if (enrichedCache) return enrichedCache
  const mod = await import('../data/kurals-enriched.json')
  enrichedCache = (mod.default ?? mod) as Record<string, EnrichedKural>
  return enrichedCache
}

const SCHOLAR_MATCH: Record<Exclude<UraiSourceKey, 'default'>, string[]> = {
  parimel: ['பரிமேலழகர்'],
  manakkudavar: ['மணக்குடவர்'],
  varadarasan: ['மு. வரதராசன்', 'மு.வரதராசன்'],
  puliyur: ['புலியூர்க் கேசிகன்', 'புலியூர் கேசிகன்'],
  pappaiya: ['சாலமன் பாப்பையா'],
  karunanidhi: ['மு. கருணாநிதி', 'மு.கருணாநிதி'],
  munisamy: ['வி. முனிசாமி', 'வீ. முனிசாமி', 'திருக்குறளார் வீ. முனிசாமி'],
}

export async function getTamilUraiText(opts: {
  kuralNumber: number
  source: UraiSourceKey
  fallback: string
}): Promise<string> {
  const { kuralNumber, source, fallback } = opts
  if (source === 'default') return fallback

  const enriched = await getEnriched()
  const entry = enriched[String(kuralNumber)]
  const tamil = entry?.translations?.tamil ?? []
  if (!tamil.length) return fallback

  const matches = SCHOLAR_MATCH[source]
  const found = tamil.find((row) => matches.some((m) => row.scholar.includes(m)))?.text
  return found || fallback
}
