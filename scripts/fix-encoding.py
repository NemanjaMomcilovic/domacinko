#!/usr/bin/env python3
"""Fix UTF-8 Serbian character encoding across HTML/JS files."""
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTTP_EQUIV = '  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n'

# HTML-only branding / text fixes
HTML_REPLACEMENTS = [
    ('Doma?inko', 'Domaćinko'),
    ('Doma?inka', 'Domaćinka'),
    ('Doma?instvo', 'Domaćinstvo'),
    ('Domacinko', 'Domaćinko'),
    ('domacinstvo', 'domaćinstvo'),
    ('Domacinka', 'Domaćinka'),
    ('Domacinstvo', 'Domaćinstvo'),
    ('generi?ite', 'generišite'),
    ('generi?i', 'generiši'),
    ('U?itelj', 'Učitelj'),
    ('ku?ne', 'kućne'),
    ('ku?e', 'kuće'),
    ('Kucni', 'Kućni'),
    ('kucne', 'kućne'),
    ('?ta ', 'Šta '),
    ('Nau?ite', 'Naučite'),
    ('Opi?ite', 'Opišite'),
    ('Pretra?i', 'Pretraži'),
    ('procitati', 'pročitati'),
    ('Mesecn', 'Mesečn'),
    ('Mesecni', 'Mesečni'),
    ('Mesecna', 'Mesečna'),
    ('preskociti', 'preskočiti'),
    ('Preskoci', 'Preskoči'),
    ('Odlicno', 'Odlično'),
    ('vec ', 'već '),
    (' kuce ', ' kuće '),
    ('kuce —', 'kuće —'),
    (' ce ', ' će '),
    ('racun', 'račun'),
    ('Racuni', 'Računi'),
    ('racuni', 'računi'),
    ('Fotografi?i', 'Fotografiši'),
    ('Jos ', 'Još '),
]

# JS string content fixes only (not identifiers)
JS_STRING_REPLACEMENTS = [
    ('Doma?inko', 'Domaćinko'),
    ('Doma?instvo', 'Domaćinstvo'),
    ('generi?ite', 'generišite'),
    ('generi?i', 'generiši'),
    ('ku?e', 'kuće'),
    ('?ta ', 'Šta '),
]

ONBOARDING_EMOJIS = [
    ('data-screen="1">\n        <div class="onboarding__emoji">??</div>', 'data-screen="1">\n        <div class="onboarding__emoji">👋</div>'),
    ('data-screen="2">\n        <div class="onboarding__emoji">??</div>', 'data-screen="2">\n        <div class="onboarding__emoji">🧊</div>'),
    ('data-screen="3">\n        <div class="onboarding__emoji">??</div>', 'data-screen="3">\n        <div class="onboarding__emoji">📄</div>'),
    ('data-screen="4">\n        <div class="onboarding__emoji">??</div>', 'data-screen="4">\n        <div class="onboarding__emoji">🚗</div>'),
    ('data-screen="5">\n        <div class="onboarding__emoji">??</div>', 'data-screen="5">\n        <div class="onboarding__emoji">🎉</div>'),
    ('<li>?? Prati troškove', '<li>💰 Prati troškove'),
    ('<li>?? Prati tro', '<li>💰 Prati tro'),
    ('<li>?? Lista za kupovinu', '<li>🛒 Lista za kupovinu'),
    ('<li>?? Domaćinstvo', '<li>🏠 Domaćinstvo'),
    ('<li>?? Domacinstvo', '<li>🏠 Domaćinstvo'),
    ('<li>?? AI saveti', '<li>🤖 AI saveti'),
]

EMOJI_FIXES = [
    ('?? Savetnik', '🤖 Savetnik'),
    ('?? Majstor', '🔧 Majstor'),
    ('?? Učitelj', '📚 Učitelj'),
    ('?? Fotografiši', '📷 Fotografiši'),
    ('?? Otpremi', '📁 Otpremi'),
    ('?? Dodajte sliku', '📷 Dodajte sliku'),
    ('?? Generiši', '🛒 Generiši'),
    ('<span class="quick-action__icon">??</span>Profil kuće', '<span class="quick-action__icon">🏠</span>Profil kuće'),
    ('<span class="quick-action__icon">??</span>Bezbednost', '<span class="quick-action__icon">🛡️</span>Bezbednost'),
    ('<span class="quick-action__icon">??</span>Alati', '<span class="quick-action__icon">🔧</span>Alati'),
    ('<span style="font-size:3rem">??</span>', '<span style="font-size:3rem">🧾</span>'),
]


def read_file(path):
    raw = open(path, 'rb').read()
    had_bom = raw.startswith(b'\xef\xbb\xbf')
    if had_bom:
        raw = raw[3:]
    try:
        return raw.decode('utf-8'), had_bom, 'utf-8'
    except UnicodeDecodeError:
        return raw.decode('cp1250'), had_bom, 'cp1250'


def apply_fixes(text, is_html):
    if is_html:
        for old, new in HTML_REPLACEMENTS:
            text = text.replace(old, new)
        for old, new in ONBOARDING_EMOJIS + EMOJI_FIXES:
            text = text.replace(old, new)
    else:
        for old, new in JS_STRING_REPLACEMENTS:
            text = text.replace(old, new)
    return text


def add_http_equiv(text):
    if 'http-equiv' in text[:3000] and 'charset=UTF-8' in text[:3000]:
        return text
    match = re.search(r'(<meta charset="UTF-8">\s*\n)', text, re.IGNORECASE)
    if match:
        return text[:match.end()] + HTTP_EQUIV + text[match.end():]
    return text


def ensure_charset(text):
    if '<meta charset' not in text[:2000].lower():
        text = re.sub(r'(<head>\s*\n)', r'\1  <meta charset="UTF-8">\n', text, count=1, flags=re.IGNORECASE)
    return text


def write_utf8(path, text):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


def process_file(path):
    rel = os.path.relpath(path, ROOT)
    is_html = path.endswith('.html')
    text, had_bom, src_enc = read_file(path)
    original = text
    text = apply_fixes(text, is_html)
    if is_html:
        text = ensure_charset(text)
        text = add_http_equiv(text)
    changed = text != original or had_bom
    if changed:
        write_utf8(path, text)
    return changed, rel, src_enc, had_bom


def main():
    changed_files = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        if '.git' in dirpath or 'node_modules' in dirpath:
            continue
        for name in filenames:
            if not name.endswith(('.html', '.js')):
                continue
            if name == 'fix-encoding.py':
                continue
            path = os.path.join(dirpath, name)
            changed, rel, enc, bom = process_file(path)
            if changed:
                changed_files.append((rel, enc, bom))

    print(f'Fixed {len(changed_files)} files:')
    for rel, enc, bom in sorted(changed_files):
        print(f'  {rel} (was {enc}{", BOM" if bom else ""})')

    errors = []
    for dirpath, _, filenames in os.walk(ROOT):
        if '.git' in dirpath:
            continue
        for name in filenames:
            if not name.endswith(('.html', '.js')):
                continue
            path = os.path.join(dirpath, name)
            raw = open(path, 'rb').read()
            if raw.startswith(b'\xef\xbb\xbf'):
                errors.append(f'BOM: {name}')
            try:
                raw.lstrip(b'\xef\xbb\xbf').decode('utf-8')
            except UnicodeDecodeError as e:
                errors.append(f'UTF8: {name} - {e}')

    if errors:
        print('\nRemaining issues:')
        for e in errors:
            print(f'  {e}')
    else:
        print('\nAll files valid UTF-8 without BOM.')


if __name__ == '__main__':
    main()
