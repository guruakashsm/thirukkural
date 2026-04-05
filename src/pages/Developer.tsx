import { Link } from 'react-router-dom'
import { useState } from 'react'

function SectionTitle({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center text-lg shadow-sm shrink-0">
        {icon}
      </div>
      <h2 className="text-xl md:text-2xl font-bold text-dark">{title}</h2>
    </div>
  )
}

function CodeBlock({ code, lang = 'json' }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }
  return (
    <div className="relative group rounded-xl overflow-hidden border border-gold/20 mt-3">
      <div className="flex items-center justify-between px-4 py-2" style={{ background: '#2D1A10' }}>
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(240,218,190,0.5)' }}>{lang}</span>
        <button
          onClick={copy}
          className="text-xs transition-colors px-2 py-0.5 rounded"
          style={{ color: 'rgba(240,218,190,0.65)', border: '1px solid rgba(240,218,190,0.2)' }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-xs md:text-sm font-mono p-4 overflow-x-auto leading-relaxed m-0" style={{ background: '#1c1410', color: 'rgba(240,218,190,0.85)' }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

function FieldRow({ field, type, desc }: { field: string; type: string; desc: string }) {
  return (
    <tr className="border-b border-gold/10 last:border-0">
      <td className="py-2.5 pr-4 font-mono text-xs text-gold-dark font-semibold whitespace-nowrap align-top">{field}</td>
      <td className="py-2.5 pr-4 font-mono text-xs text-copper/80 whitespace-nowrap align-top">{type}</td>
      <td className="py-2.5 text-sm text-gray leading-relaxed">{desc}</td>
    </tr>
  )
}

const DATASET_URL = '/thirukkural-dataset.json'

const KURAL_EXAMPLE = `{
  "number": 1,
  "tamil": "அகர முதல எழுத்தெல்லாம் ஆதி\\nபகவன் முதற்றே உலகு.",
  "tamilMeaning": "எழுத்துக்கள் எல்லாம் அகரத்தை அடிப்படையாக கொண்டிருக்கின்றன...",
  "englishMeaning": "As the letter A is the first of all letters, so the eternal God is first in the world",
  "chapter": 1,
  "chapterTamilName": "கடவுள் வாழ்த்து",
  "chapterEnglishName": "The Praise of God",
  "category": "Aram",
  "audio": {
    "kural": "audio/kural-1-kural.mp3",
    "kuralWithMeaning": "audio/kural-1-kural-porul.mp3"
  },
  "scholarTranslations": {
    "english": [
      { "scholar": "G.U. Pope", "text": "A, as its first of letters..." },
      { "scholar": "S.N. Srinivasa Iyengar", "text": "As the letter A is..." }
    ],
    "tamil": [
      { "scholar": "புலியூர்க் கேசிகன்", "text": "அகர ஒலியே எல்லா எழுத்துகளுக்கும் முதல்..." }
    ],
    "sanskrit": [...],
    "hindi": [...],
    "kannada": [...],
    "french": [...],
    "german": [...],
    "malayalam": [...],
    "telugu": [...],
    "korean": [...]
  },
  "translations": {
    "hi": "अक्षर सबके आदि में...",
    "te": "అచ్చుమూలమైన దక్షరంబుల...",
    "kn": "ಅಕ್ಷರಗಳಿಗೆಲ್ಲಾ ಅಕಾರವೇ ಮೊದಲು...",
    "ml": "അകാരത്തിൽത്തുടങ്ങുന്നു...",
    "fr": "Toutes les lettres ont pour principe 'A'...",
    "de": "Das „A" ist der erste aller Buchstaben...",
    "ru": "Как буква \"а\" есть первая среди всех букв...",
    "zh": "爲世上一切音之起始...",
    "ms": "A ada-lah permulaan segala dunia bunyi...",
    "pl": "Tak jak «A» na początku liter alfabetu...",
    "si": "සැම අකූරටම මුල- ,අ, කාරය...",
    "sv": "Liksom \"A\" är alla bokstävers begynnelse..."
  },
  "application": {
    "summary": "Begin every endeavor by acknowledging a higher purpose...",
    "steps": [
      "Start each day with a moment of gratitude...",
      "Before any important undertaking, pause to reflect..."
    ]
  },
  "story": {
    "title": "The First Letter, The First Cause",
    "narrative": "Just as Tamil grammar begins with the letter 'அ' (a)...",
    "culturalNote": "This kural is the cornerstone of one of humanity's oldest ethical works..."
  }
}`

const CHAPTER_EXAMPLE = `{
  "number": 1,
  "tamilName": "கடவுள் வாழ்த்து",
  "englishName": "The Praise of God",
  "translatedNames": {
    "en": "The Praise of God",
    "ta": "கடவுள் வாழ்த்து",
    "hi": "ईश्वर- स्तुति",
    "te": "దైవ ప్రార్ధన",
    "kn": "ಪೀಠಿಕೆ- ದೈವಸ್ತುತಿ",
    "ml": "ദൈവസ്തുതി",
    "fr": "Louange de Dieu",
    "de": "Verehrung Gottes",
    "ru": "Восхваление Всевышнего",
    "zh": "神明頌",
    "ms": "Pujian kapada Dewata Raya",
    "pl": "Uwielbienie Boga",
    "si": "නමකර",
    "sv": "Lovsång till Gud"
  },
  "icon": "🙏",
  "category": "Aram",
  "kuralStart": 1,
  "kuralEnd": 10,
  "theme": "This opening chapter invokes the divine as the foundation...",
  "historicalBackground": "Ancient Tamil literary tradition required works to begin...",
  "modernRelevance": "The chapter's non-sectarian spirituality resonates with modern..."
}`

const CATEGORY_EXAMPLE = `{
  "name": "Aram",
  "tamilName": "அறத்துப்பால்",
  "englishName": "Virtue",
  "translatedNames": {
    "en": "Virtue",
    "ta": "அறத்துப்பால்",
    "fr": "DE LA VERTU",
    "kn": "ಭಾಗ",
    "ru": "ДОБРОДЕТЕЛИ",
    "pl": "ŻYCIA",
    "si": "කාණ්ඩය",
    "sv": "dygdens natur",
    "te": "కాండము"
  },
  "description": "The section on Virtue (Aram) deals with moral values...",
  "icon": "🪔",
  "color": "#C6A75E",
  "chapterRange": [1, 38]
}`

const FETCH_EXAMPLE = `// Fetch the full dataset (once, then cache it)
const response = await fetch('/thirukkural-dataset.json')
const dataset = await response.json()

// Access metadata
console.log(dataset.meta.totalKurals)   // 1330
console.log(dataset.meta.totalChapters) // 133

// Get kural by number (array, zero-indexed by kural number - 1)
const kural42 = dataset.kurals.find(k => k.number === 42)

// Get all kurals in a chapter
const chapter1Kurals = dataset.kurals.filter(k => k.chapter === 1)

// Get all chapters of a category
const aramChapters = dataset.chapters.filter(c => c.category === 'Aram')`

const META_EXAMPLE = `{
  "title": "Thirukkural Complete Dataset",
  "version": "1.0.0",
  "generated": "2026-04-05",
  "source": "thirukkural.app",
  "license": "CC BY 4.0",
  "totalKurals": 1330,
  "totalChapters": 133,
  "totalCategories": 3,
  "scholarTranslationLanguages": ["english", "tamil", "sanskrit", "hindi",
    "kannada", "french", "german", "malayalam", "telugu", "korean"],
  "kuralTranslationLanguageCodes": ["hi", "te", "kn", "ml", "fr", "de",
    "ru", "zh", "ms", "pl", "si", "sv"],
  "chapterNameLanguageCodes": ["de", "fr", "hi", "kn", "ml", "ms",
    "pl", "ru", "si", "sv", "te", "zh"],
  "categoryNameLanguageCodes": ["fr", "kn", "pl", "ru", "si", "sv", "te"],
  "uiTranslationLanguageCodes": ["en", "ta", "hi", "te", "kn", "ml",
    "fr", "de", "ru", "zh", "ms", "pl", "si", "sv"]
}`

export default function Developer() {
  const cardClass = 'rounded-2xl border border-gold/20 bg-cream p-5 md:p-6 shadow-sm'

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-16 -left-20 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute top-1/3 -right-16 w-56 h-56 rounded-full bg-copper/10 blur-3xl" />
      </div>

      <Link to="/" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-gold-dark hover:text-gold transition-colors no-underline mb-6 border border-gold/25 bg-cream/70">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Hero */}
      <section className="relative rounded-3xl overflow-hidden border border-gold/25 hero-card-bg paper-texture p-6 md:p-8 mb-7 shadow-[0_16px_35px_rgba(168,139,62,0.14)]">
        <div className="corner-ornament top-left left-3 top-3" />
        <div className="corner-ornament top-right right-3 top-3" />
        <div className="corner-ornament bottom-left left-3 bottom-3" />
        <div className="corner-ornament bottom-right right-3 bottom-3" />
        <div className="temple-border-top" />
        <div className="relative z-10 text-center">
          <p className="text-xs tracking-[0.25em] uppercase text-gold-dark/70 font-semibold mb-2">Open Data</p>
          <h1 className="font-tamil text-3xl md:text-4xl font-bold text-dark mb-2 ornamental-underline">
            Developer Dataset
          </h1>
          <p className="text-sm text-gray mt-5 max-w-2xl mx-auto leading-relaxed">
            All 1330 Thirukkurals — with Tamil text, multilingual translations, scholar attributions,
            chapter context, and real-life application notes — as a single structured JSON file.
            Free to use under CC BY 4.0.
          </p>
          <a
            href={DATASET_URL}
            download="thirukkural-dataset.json"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full bg-gold text-white font-semibold text-sm hover:bg-gold-dark transition-colors no-underline shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download Dataset (JSON)
          </a>
        </div>
      </section>

      <div className="space-y-5">

        {/* Why not scrape */}
        <section className={cardClass}>
          <SectionTitle icon="🛡️" title="Why We Provide This Instead of Allowing Scraping" />
          <div className="space-y-3 text-sm md:text-base text-gray leading-relaxed">
            <p>
              This dataset exists so you do not need to scrape the site. Scraping puts unnecessary
              load on the server, is fragile (markup changes break your scraper), and produces
              incomplete data because some enriched fields are assembled at runtime from multiple
              source files.
            </p>
            <p>
              The dataset you download here is the authoritative, complete version — merged from
              all internal source files, formatted consistently, and versioned. It will always be
              more reliable than anything scraped from the rendered HTML.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Scholar translations include the scholar name, which is not always visible on screen.</li>
              <li>Application steps, story narratives, and cultural notes are not rendered on every page.</li>
              <li>Chapter theme, historical background, and modern relevance are collapsed by default.</li>
              <li>Audio paths are encoded in the data, not in the DOM.</li>
            </ul>
            <p>
              Please use this file. If it is missing data you need, open an issue on GitHub or reach
              out via the contact page — we will add it to the next dataset version.
            </p>
          </div>
        </section>

        {/* How we got the data */}
        <section className={cardClass}>
          <SectionTitle icon="📖" title="How the Data Was Collected" />
          <div className="space-y-3 text-sm md:text-base text-gray leading-relaxed">
            <p>
              The Thirukkural text itself is ancient (estimated 2nd century BCE to 5th century CE)
              and in the public domain. The Tamil verses and their primary meanings come from
              established Tamil literary sources.
            </p>
            <p>
              Scholar translations (G.U. Pope, S.N. Srinivasa Iyengar, Shuddhananda Bharati, and
              others) are drawn from 19th- and early 20th-century works that are now in the public
              domain. Sanskrit, Hindi, Kannada, Malayalam, Telugu, Korean, French, German and other
              language translations were compiled from published academic editions.
            </p>
            <p>
              The enriched fields — application summaries, real-life steps, story narratives, chapter
              themes and historical context — were researched and authored for this project, combining
              classical commentary (Parimelazhagar, Manakkudavar) with modern interpretations.
            </p>
            <p>
              Single-text translations in 12 language codes (hi, te, kn, ml, fr, de, ru, zh, ms, pl,
              si, sv) were sourced from published translations and cross-referenced with academic works.
            </p>
          </div>
        </section>

        {/* Dataset structure overview */}
        <section className={cardClass}>
          <SectionTitle icon="🗂️" title="Top-Level Structure" />
          <p className="text-sm text-gray leading-relaxed mb-2">
            The JSON file has four top-level keys:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody>
                <FieldRow field="meta" type="object" desc="Dataset metadata: version, generation date, license, language lists, and counts." />
                <FieldRow field="categories" type="array[3]" desc="The three Pals (Aram, Porul, Inbam) with names in Tamil, English, and translated names in up to 9 languages." />
                <FieldRow field="chapters" type="array[133]" desc="All 133 chapters with names, translated names in up to 14 languages, category, kural range, theme, historical background, and modern relevance." />
                <FieldRow field="kurals" type="array[1330]" desc="All 1330 kurals — the core of the dataset. Sorted by kural number (1–1330)." />
                <FieldRow field="uiTranslations" type="object" desc="UI string translations in 14 languages (en, ta, hi, te, kn, ml, fr, de, ru, zh, ms, pl, si, sv) — useful for building a fully localised interface." />
              </tbody>
            </table>
          </div>
          <CodeBlock code={META_EXAMPLE} lang="json — meta object" />
        </section>

        {/* Kural object */}
        <section className={cardClass}>
          <SectionTitle icon="📜" title="Kural Object" />
          <p className="text-sm text-gray leading-relaxed mb-3">
            Each entry in <code className="font-mono text-gold-dark bg-gold/10 px-1 rounded">kurals[]</code> has
            the following fields:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody>
                <FieldRow field="number" type="number" desc="Kural number, 1 to 1330." />
                <FieldRow field="tamil" type="string" desc="Original Tamil couplet (two lines separated by \n)." />
                <FieldRow field="tamilMeaning" type="string" desc="Tamil prose meaning of the kural." />
                <FieldRow field="englishMeaning" type="string" desc="English prose meaning." />
                <FieldRow field="chapter" type="number" desc="Chapter number (1–133)." />
                <FieldRow field="chapterTamilName" type="string" desc="Chapter name in Tamil." />
                <FieldRow field="chapterEnglishName" type="string" desc="Chapter name in English." />
                <FieldRow field="category" type="string" desc='"Aram", "Porul", or "Inbam".' />
                <FieldRow field="audio" type="object" desc='{ kural, kuralWithMeaning } — relative paths to MP3 files. Prefix with the site origin to build a full URL.' />
                <FieldRow field="scholarTranslations" type="object" desc="Keys: english, tamil, sanskrit, hindi, kannada, french, german, malayalam, telugu, korean. Each value is an array of { scholar, text } objects — multiple scholars per language." />
                <FieldRow field="translations" type="object" desc="Keys: hi, te, kn, ml, fr, de, ru, zh, ms, pl, si, sv. Each value is a single translated string (no scholar attribution)." />
                <FieldRow field="application" type="object" desc="{ summary: string, steps: string[] } — practical modern interpretation of the kural." />
                <FieldRow field="story" type="object" desc="{ title, narrative, culturalNote } — a short narrative and cultural context for the kural." />
              </tbody>
            </table>
          </div>
          <CodeBlock code={KURAL_EXAMPLE} lang="json — kural object (abbreviated)" />
        </section>

        {/* Chapter object */}
        <section className={cardClass}>
          <SectionTitle icon="📚" title="Chapter Object" />
          <p className="text-sm text-gray leading-relaxed mb-3">
            Each entry in <code className="font-mono text-gold-dark bg-gold/10 px-1 rounded">chapters[]</code>:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody>
                <FieldRow field="number" type="number" desc="Chapter number, 1 to 133." />
                <FieldRow field="tamilName" type="string" desc="Chapter name in Tamil." />
                <FieldRow field="englishName" type="string" desc="Chapter name in English." />
                <FieldRow field="translatedNames" type="object" desc="Chapter name keyed by language code (en, ta, hi, te, kn, ml, fr, de, ru, zh, ms, pl, si, sv). Not all languages are available for every chapter." />
                <FieldRow field="icon" type="string" desc="Emoji icon associated with the chapter." />
                <FieldRow field="category" type="string" desc='"Aram", "Porul", or "Inbam".' />
                <FieldRow field="kuralStart" type="number" desc="First kural number in this chapter." />
                <FieldRow field="kuralEnd" type="number" desc="Last kural number in this chapter." />
                <FieldRow field="theme" type="string" desc="Editorial summary of the chapter's central theme." />
                <FieldRow field="historicalBackground" type="string" desc="Historical and literary context of this chapter." />
                <FieldRow field="modernRelevance" type="string" desc="Why this chapter matters in contemporary life." />
              </tbody>
            </table>
          </div>
          <CodeBlock code={CHAPTER_EXAMPLE} lang="json — chapter object" />
        </section>

        {/* Category object */}
        <section className={cardClass}>
          <SectionTitle icon="🏛️" title="Category Object" />
          <p className="text-sm text-gray leading-relaxed mb-3">
            Each entry in <code className="font-mono text-gold-dark bg-gold/10 px-1 rounded">categories[]</code>:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <tbody>
                <FieldRow field="name" type="string" desc='"Aram", "Porul", or "Inbam".' />
                <FieldRow field="tamilName" type="string" desc='Tamil name (e.g. "அறத்துப்பால்").' />
                <FieldRow field="englishName" type="string" desc='English name (e.g. "Virtue").' />
                <FieldRow field="translatedNames" type="object" desc="Category name keyed by language code (en, ta, fr, kn, ru, pl, si, sv, te)." />
                <FieldRow field="description" type="string" desc="Short editorial description of the Pal." />
                <FieldRow field="icon" type="string" desc="Emoji icon." />
                <FieldRow field="color" type="string" desc="Hex color associated with this category." />
                <FieldRow field="chapterRange" type="[number, number]" desc="[firstChapter, lastChapter] numbers in this category." />
              </tbody>
            </table>
          </div>
          <CodeBlock code={CATEGORY_EXAMPLE} lang="json — category object" />
        </section>

        {/* Fetching example */}
        <section className={cardClass}>
          <SectionTitle icon="📡" title="Fetching the Dataset" />
          <p className="text-sm md:text-base text-gray leading-relaxed mb-4">
            Load the full dataset once and cache it — the file is served as static JSON.
          </p>
          <CodeBlock code={FETCH_EXAMPLE} lang="javascript" />
        </section>

        {/* Language codes */}
        <section className={cardClass}>
          <SectionTitle icon="🌐" title="Language Reference" />
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-dark text-sm mb-3">
                Scholar Translations <span className="text-gray font-normal">(key → language)</span>
              </h3>
              <div className="space-y-1.5">
                {[
                  ['english', 'English'],
                  ['tamil', 'Tamil'],
                  ['sanskrit', 'Sanskrit'],
                  ['hindi', 'Hindi'],
                  ['kannada', 'Kannada'],
                  ['french', 'French'],
                  ['german', 'German'],
                  ['malayalam', 'Malayalam'],
                  ['telugu', 'Telugu'],
                  ['korean', 'Korean'],
                ].map(([code, name]) => (
                  <div key={code} className="flex items-center gap-3 text-sm">
                    <code className="font-mono text-xs text-gold-dark bg-gold/10 px-2 py-0.5 rounded w-20 text-center shrink-0">{code}</code>
                    <span className="text-gray">{name} — array of {'{ scholar, text }'}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-dark text-sm mb-3">
                Single-text Translations <span className="text-gray font-normal">(code → language)</span>
              </h3>
              <div className="space-y-1.5">
                {[
                  ['hi', 'Hindi'],
                  ['te', 'Telugu'],
                  ['kn', 'Kannada'],
                  ['ml', 'Malayalam'],
                  ['fr', 'French'],
                  ['de', 'German'],
                  ['ru', 'Russian'],
                  ['zh', 'Chinese'],
                  ['ms', 'Malay'],
                  ['pl', 'Polish'],
                  ['si', 'Sinhala'],
                  ['sv', 'Swedish'],
                ].map(([code, name]) => (
                  <div key={code} className="flex items-center gap-3 text-sm">
                    <code className="font-mono text-xs text-gold-dark bg-gold/10 px-2 py-0.5 rounded w-10 text-center shrink-0">{code}</code>
                    <span className="text-gray">{name} — single string</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray/70 mt-4 leading-relaxed">
            Note: Hindi (hi) and several other languages appear in both scholar translations
            (with attribution) and single-text translations (without attribution). They are
            different source texts — use whichever fits your display needs.
          </p>
        </section>

        {/* License */}
        <section className={`${cardClass} bg-gradient-to-br from-cream to-cream-dark/50`}>
          <SectionTitle icon="⚖️" title="License & Attribution" />
          <div className="space-y-3 text-sm md:text-base text-gray leading-relaxed">
            <p>
              This dataset is released under{' '}
              <strong className="text-dark">Creative Commons Attribution 4.0 (CC BY 4.0)</strong>.
              You are free to use, share, and adapt it for any purpose — including commercial — as
              long as you give appropriate credit.
            </p>
            <p>
              The Thirukkural text itself is ancient and in the public domain worldwide.
              Individual scholar translations (G.U. Pope, Parimelazhagar, etc.) are reproduced
              from works published before 1928 and are also in the public domain.
              The enriched commentary fields (application, story, chapter context) are original
              to this project and are licensed CC BY 4.0.
            </p>
          </div>
        </section>

        <div className="pt-2 text-center">
          <div className="lotus-separator mb-4">
            <span className="text-gold/60 text-xs">✦</span>
          </div>
          <p className="text-sm text-gray">
            Questions about the dataset? Reach out via the{' '}
            <Link to="/contact" className="text-gold-dark hover:text-gold no-underline font-medium">
              contact page
            </Link>
            .
          </p>
        </div>

      </div>
    </div>
  )
}
