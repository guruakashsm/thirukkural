#!/usr/bin/env python3
"""
Thirukkural Dataset Generator
Merges all source JSON files into a single, well-structured dataset
that developers can use to build their own Thirukkural applications.
"""

import json
import os
from datetime import date

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'src', 'data')
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'public')

# Language code → human-readable name
LANG_NAMES = {
    'en': 'English',
    'ta': 'Tamil',
    'hi': 'Hindi',
    'te': 'Telugu',
    'kn': 'Kannada',
    'ml': 'Malayalam',
    'fr': 'French',
    'de': 'German',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ms': 'Malay',
    'pl': 'Polish',
    'si': 'Sinhala',
    'sv': 'Swedish',
}

SCHOLAR_LANG_NAMES = {
    'english': 'English',
    'tamil': 'Tamil',
    'sanskrit': 'Sanskrit',
    'hindi': 'Hindi',
    'kannada': 'Kannada',
    'french': 'French',
    'german': 'German',
    'malayalam': 'Malayalam',
    'telugu': 'Telugu',
    'korean': 'Korean',
}


def load(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def build_categories(categories_data, cat_translations):
    """Build category list with translated names for every available language."""
    # cat_translations['categories'] = { lang_code: { "Aram": "...", ... } }
    translated_cats = cat_translations.get('categories', {})

    result = []
    for cat in categories_data:
        name = cat['name']
        # Gather translations for this category's name
        names_i18n = {'en': cat['englishName'], 'ta': cat['tamilName']}
        for lang_code, mapping in translated_cats.items():
            if name in mapping:
                names_i18n[lang_code] = mapping[name]

        result.append({
            'name': name,
            'tamilName': cat['tamilName'],
            'englishName': cat['englishName'],
            'translatedNames': names_i18n,
            'description': cat.get('description', ''),
            'icon': cat.get('icon', ''),
            'color': cat.get('color', ''),
            'chapterRange': [
                cat['chapters'][0]['number'],
                cat['chapters'][-1]['number'],
            ] if cat.get('chapters') else [],
        })
    return result


def build_chapters_map(categories_data, chapters_enriched, cat_translations):
    """Build a flat chapter map keyed by chapter number, with translated names."""
    # cat_translations['chapters'] = { lang_code: { "1": "...", "2": "...", ... } }
    translated_chapters = cat_translations.get('chapters', {})

    chapters = {}
    for cat in categories_data:
        for ch in cat.get('chapters', []):
            num = ch['number']
            enriched = chapters_enriched.get(str(num), {})

            # Gather translated chapter names
            names_i18n = {'en': ch['englishName'], 'ta': ch['name']}
            for lang_code, mapping in translated_chapters.items():
                translated = mapping.get(str(num), '')
                if translated:
                    names_i18n[lang_code] = translated

            chapters[num] = {
                'number': num,
                'tamilName': ch['name'],
                'englishName': ch['englishName'],
                'translatedNames': names_i18n,
                'icon': ch.get('icon', ''),
                'category': cat['name'],
                'kuralStart': ch['kuralStart'],
                'kuralEnd': ch['kuralEnd'],
                'theme': enriched.get('theme', ''),
                'historicalBackground': enriched.get('historicalBackground', ''),
                'modernRelevance': enriched.get('modernRelevance', ''),
            }
    return chapters


def build_kurals(kurals_base, kurals_enriched, kural_translations):
    """Merge all kural data into a clean list."""
    result = []
    for kural in kurals_base:
        num = kural['number']
        enriched = kurals_enriched.get(str(num), {})
        extra_translations = kural_translations.get(str(num), {})

        entry = {
            'number': num,
            'tamil': kural.get('tamil', ''),
            'tamilMeaning': kural.get('tamilMeaning', ''),
            'englishMeaning': kural.get('englishMeaning', ''),
            'chapter': kural.get('chapter'),
            'chapterTamilName': kural.get('chapterName', ''),
            'chapterEnglishName': kural.get('chapterEnglish', ''),
            'category': kural.get('category', ''),
            'audio': {
                'kural': kural.get('audioPath', ''),
                'kuralWithMeaning': kural.get('audioWithPorulPath', ''),
            },
            # Scholar-attributed multi-text translations (english, tamil, sanskrit…)
            'scholarTranslations': enriched.get('translations', {}),
            # Single-text translations per language code (hi, te, kn, ml, fr…)
            'translations': extra_translations,
            'application': enriched.get('application', {}),
            'story': enriched.get('story', {}),
        }
        result.append(entry)
    return result


def main():
    print('Loading source files…')
    kurals_base = load('kurals.json')
    kurals_enriched = load('kurals-enriched.json')
    kural_translations = load('kural-translations.json')
    chapters_enriched = load('chapters-enriched.json')
    categories_raw = load('categories.json')
    cat_translations = load('category-translations.json')
    ui_translations = load('ui-translations.json')

    print('Building dataset…')
    categories = build_categories(categories_raw, cat_translations)
    chapters_map = build_chapters_map(categories_raw, chapters_enriched, cat_translations)
    chapters_list = [chapters_map[k] for k in sorted(chapters_map.keys())]
    kurals = build_kurals(kurals_base, kurals_enriched, kural_translations)

    # Collect all language codes present in chapter/category translations
    chapter_lang_codes = sorted(set(cat_translations.get('chapters', {}).keys()))
    category_lang_codes = sorted(set(cat_translations.get('categories', {}).keys()))
    ui_lang_codes = sorted(ui_translations.keys())

    dataset = {
        'meta': {
            'title': 'Thirukkural Complete Dataset',
            'description': (
                'All 1330 Thirukkurals by Thiruvalluvar with Tamil text, Tamil meaning, '
                'English meaning, scholar-attributed translations in 10 languages, '
                'single-text translations in 12 additional language codes, translated chapter '
                'and category names in up to 14 languages, chapter context, real-life '
                'application notes, and a cultural story per kural.'
            ),
            'version': '1.0.0',
            'generated': str(date.today()),
            'source': 'thirukkural.app',
            'license': 'CC BY 4.0',
            'attribution': (
                'Compiled by Thirukkural App (thirukkural.app). '
                'Scholar translations are sourced from public-domain works. '
                'Please credit the original scholars when displaying translations.'
            ),
            'totalKurals': len(kurals),
            'totalChapters': len(chapters_list),
            'totalCategories': len(categories),
            'scholarTranslationLanguages': list(SCHOLAR_LANG_NAMES.keys()),
            'kuralTranslationLanguageCodes': sorted(kural_translations.get('1', {}).keys()),
            'chapterNameLanguageCodes': chapter_lang_codes,
            'categoryNameLanguageCodes': category_lang_codes,
            'uiTranslationLanguageCodes': ui_lang_codes,
            'languageNames': LANG_NAMES,
            'scholarLanguageNames': SCHOLAR_LANG_NAMES,
        },
        'categories': categories,
        'chapters': chapters_list,
        'kurals': kurals,
        # UI strings for apps that want to localise their interface
        'uiTranslations': ui_translations,
    }

    out_path = os.path.join(OUTPUT_DIR, 'thirukkural-dataset.json')
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, ensure_ascii=False, indent=2)

    size_mb = os.path.getsize(out_path) / (1024 * 1024)
    print(f'Done! Written to: {out_path}')
    print(f'File size: {size_mb:.2f} MB')
    print(f'  Categories : {len(categories)}')
    print(f'  Chapters   : {len(chapters_list)}')
    print(f'  Kurals     : {len(kurals)}')
    print(f'  UI langs   : {len(ui_translations)}')


if __name__ == '__main__':
    main()
