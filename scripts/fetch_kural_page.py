#!/usr/bin/env python3
"""
Fetch translations from kural.page for French, German, Malayalam, Telugu, Korean.
Merges into src/data/kurals-enriched.json.

Usage:
  python3 fetch_kural_page.py              # all languages
  python3 fetch_kural_page.py french       # specific language(s)
"""

import json, re, time, sys
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

BASE_URL = "https://kural.page"
DATA_FILE = Path(__file__).parent.parent / "src/data/kurals-enriched.json"

LANG_SCHOLAR = {
    "french":   "G.U. Pope (French)",
    "german":   "Various (German)",
    "malayalam":"Various (Malayalam)",
    "telugu":   "Various (Telugu)",
    "korean":   "Various (Korean)",
}

# French slugs (hand-verified, 133 chapters)
FRENCH_SLUGS = [
    "chapitre-louange-de-dieu","chapitre-grandeur-de-la-pluie","chapitre-la-grandeur-des-ascetes",
    "chapitre-la-vertu-affirmee","chapitre-la-vie-de-famille","chapitre-la-femme-modele",
    "chapitre-les-enfants","chapitre-l-amour","chapitre-l-hospitalite",
    "chapitre-les-douces-paroles","chapitre-les-bienfaits","chapitre-l-equite",
    "chapitre-la-retention","chapitre-la-vertu-possedee","chapitre-ne-pas-tuer",
    "chapitre-la-non-permanence","chapitre-le-renoncement","chapitre-la-science",
    "chapitre-sans-envie","chapitre-eviter-le-mensonge","chapitre-ne-pas-tuer-les-etres",
    "chapitre-l-impermanence","chapitre-l-abnegation","chapitre-le-destin",
    "chapitre-la-vie-ascetique","chapitre-la-vraie-grandeur","chapitre-ne-pas-manger-la-chair",
    "chapitre-la-penitence","chapitre-l-imposture","chapitre-la-verite",
    "chapitre-la-colere","chapitre-ne-pas-faire-le-mal","chapitre-ne-pas-supprimer-la-vie",
    "chapitre-la-fragilite-du-monde","chapitre-le-detachement","chapitre-la-connaissance-de-soi",
    "chapitre-supprimer-le-desir","chapitre-le-sort","chapitre-l-ascese",
    "chapitre-eviter-l-envie","chapitre-la-vraie-noblesse","chapitre-la-mauvaise-vie",
    "chapitre-s-abstenir-de-chair","chapitre-la-maceration","chapitre-la-duplicite",
    "chapitre-le-mensonge","chapitre-l-abnegation-2","chapitre-la-connaissance-2",
    "chapitre-le-savoir","chapitre-eviter-la-fraude","chapitre-la-non-violence",
    "chapitre-les-devoirs-du-roi","chapitre-l-enseignement","chapitre-ecouter",
    "chapitre-la-sagesse","chapitre-eviter-le-vice","chapitre-les-bonnes-vertus-du-roi",
    "chapitre-la-cruaute","chapitre-l-espionnage","chapitre-l-energie",
    "chapitre-la-grandeur-du-roi","chapitre-eviter-les-mauvaises-actions","chapitre-connaitre-le-bon-moment",
    "chapitre-la-bonne-administration","chapitre-l-armee","chapitre-la-vaillance",
    "chapitre-l-amitie","chapitre-tester-ses-amis","chapitre-l-ancienne-amitie",
    "chapitre-la-rupture-de-l-amitie","chapitre-la-mauvaise-amitie","chapitre-la-folie",
    "chapitre-consulter","chapitre-le-conseil","chapitre-refuser-d-agir",
    "chapitre-agir-vite","chapitre-l-amitie-des-forts","chapitre-eviter-les-mechants",
    "chapitre-la-vigueur","chapitre-ne-pas-garder-rancune","chapitre-le-renoncement-aux-choses-males",
    "chapitre-la-bonte","chapitre-les-coutumes","chapitre-la-richesse",
    "chapitre-la-honte","chapitre-la-noblesse","chapitre-se-vanter",
    "chapitre-la-sottise","chapitre-l-ignorance","chapitre-l-hostilite",
    "chapitre-l-inimitie","chapitre-la-betise","chapitre-la-crainte",
    "chapitre-la-calomnie","chapitre-les-paroles-vaines","chapitre-la-mechancete",
    "chapitre-la-cruaute-2","chapitre-l-impurete","chapitre-le-desir",
    "chapitre-la-femme","chapitre-la-concupiscence","chapitre-la-richesse-mauvaise",
    "chapitre-l-amour-2","chapitre-les-signes-de-la-belle","chapitre-l-union",
    "chapitre-les-louanges-de-la-beaute","chapitre-les-pensees-du-coeur","chapitre-la-pudeur",
    "chapitre-la-declaration-d-amour","chapitre-la-jalousie","chapitre-la-joie",
    "chapitre-la-retenue","chapitre-la-plainte","chapitre-le-desir-ardent",
    "chapitre-le-songe","chapitre-la-tristesse","chapitre-la-paleur",
    "chapitre-la-solitude","chapitre-l-oiseau","chapitre-le-messager",
    "chapitre-l-abattement","chapitre-la-separation","chapitre-la-douleur",
    "chapitre-le-reconfort","chapitre-la-joie-de-l-amour","chapitre-le-secret",
    "chapitre-la-reunion","chapitre-la-detresse","chapitre-la-vitalite",
    "chapitre-la-passion","chapitre-la-douceur-de-la-souffrance","chapitre-la-reunion-apres-la-separation",
    "chapitre-le-vrai-amour","chapitre-la-joie-de-la-reunion","chapitre-les-mots-de-la-femme",
    "chapitre-la-tristesse-de-la-separation","chapitre-la-nostalgie","chapitre-l-attente",
    "chapitre-la-peur-de-la-separation","chapitre-le-message-a-l-oiseau","chapitre-le-message",
    "chapitre-la-nuit-de-la-separation","chapitre-la-nostalgie-de-la-lune","chapitre-la-lamentation",
    "chapitre-le-changement-de-couleur","chapitre-l-amour-de-la-belle",
]


def fetch_page(url: str, retries=3) -> str | None:
    for attempt in range(retries):
        try:
            req = Request(url, headers={"User-Agent": "Mozilla/5.0 (compatible; KuralScraper/1.0)"})
            with urlopen(req, timeout=15) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except (HTTPError, URLError) as e:
            print(f"  Attempt {attempt+1} failed: {e}", file=sys.stderr)
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None


def get_language_slugs(lang: str) -> list[str]:
    """Fetch all chapter slugs for a language from the site's nav."""
    url = f"{BASE_URL}/{lang}"
    html = fetch_page(url)
    if not html:
        return []
    pattern = re.compile(r'href="(/' + re.escape(lang) + r'/[^"]+)"', re.IGNORECASE)
    links = list(dict.fromkeys(pattern.findall(html)))
    return [l.split(f"/{lang}/", 1)[1] for l in links]


def parse_page(html: str) -> dict[int, str]:
    """
    Parse a kural.page chapter page.
    Returns {kural_number: translation_text}.
    """
    clean = re.sub(r'<script[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    clean = re.sub(r'<style[^>]*>.*?</style>', '', clean, flags=re.DOTALL)
    clean = re.sub(r'<[^>]+>', '\n', clean)
    lines = [l.strip() for l in clean.splitlines() if l.strip()]

    results: dict[int, str] = {}
    kural_label = re.compile(r'^(?:Holy\s+Kural|KOURAL|Kural|குறள்)\s*[:#]?\s*(\d+)\s*$', re.IGNORECASE)
    stop_words = {'Tamil Transliteration', 'Explanations'}

    i = 0
    while i < len(lines):
        m = kural_label.match(lines[i])
        if m:
            num = int(m.group(1))
            text_lines = []
            j = i + 1
            while j < len(lines):
                if kural_label.match(lines[j]):
                    break
                if lines[j] in stop_words or lines[j].startswith('Tamil Transliteration'):
                    break
                text_lines.append(lines[j])
                j += 1
            text = ' '.join(text_lines).strip()
            if text and len(text) > 15 and 1 <= num <= 1330:
                results[num] = text
            i = j
        else:
            i += 1

    return results


def scrape_language(lang: str, slugs: list[str]) -> dict[int, str]:
    all_translations: dict[int, str] = {}
    found_chapters = 0
    for idx, slug in enumerate(slugs):
        url = f"{BASE_URL}/{lang}/{slug}"
        short_slug = slug[:55] + '...' if len(slug) > 55 else slug
        sys.stdout.write(f"\r  [{idx+1:3d}/{len(slugs)}] {short_slug:<60}")
        sys.stdout.flush()

        html = fetch_page(url)
        if not html:
            continue

        translations = parse_page(html)
        if len(translations) < 3:
            # section header or empty page, skip silently
            continue

        all_translations.update(translations)
        found_chapters += 1
        time.sleep(0.25)

    print(f"\n  Chapters scraped: {found_chapters}, total kurals: {len(all_translations)}")
    return all_translations


def main():
    print(f"Loading {DATA_FILE}...")
    with open(DATA_FILE) as f:
        data = json.load(f)

    # data is a dict keyed by string kural number
    # Normalize so by_number is int -> entry
    if isinstance(data, dict):
        by_number: dict[int, dict] = {int(k): v for k, v in data.items()}
    else:
        by_number = {entry["number"]: entry for entry in data}

    langs_to_fetch = sys.argv[1:] if sys.argv[1:] else list(LANG_SCHOLAR.keys())

    for lang in langs_to_fetch:
        if lang not in LANG_SCHOLAR:
            print(f"Unknown language: {lang}")
            continue

        print(f"\n{'='*60}")
        print(f"Scraping {lang.upper()}...")

        print(f"  Fetching chapter list from site...")
        slugs = get_language_slugs(lang)
        if not slugs and lang == "french":
            slugs = FRENCH_SLUGS

        print(f"  {len(slugs)} slugs to process")
        print(f"{'='*60}")

        translations = scrape_language(lang, slugs)

        scholar = LANG_SCHOLAR[lang]
        added = 0
        for kural_num, text in translations.items():
            if kural_num not in by_number:
                continue
            entry = by_number[kural_num]
            if "translations" not in entry:
                entry["translations"] = {"english": [], "tamil": []}
            if lang not in entry["translations"]:
                entry["translations"][lang] = []
            existing = entry["translations"][lang]
            if not any(t["scholar"] == scholar for t in existing):
                existing.append({"scholar": scholar, "text": text})
                added += 1

        print(f"  Added {added} new {lang} entries")

    print(f"\nWriting {DATA_FILE}...")
    # Write back as dict keyed by string number
    output = {str(k): v for k, v in sorted(by_number.items())}
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print("Done!")


if __name__ == "__main__":
    main()
