#!/usr/bin/env python3
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read_utf8(path):
    raw = open(path, 'rb').read()
    if raw.startswith(b'\xef\xbb\xbf'):
        raw = raw[3:]
    try:
        return raw.decode('utf-8')
    except UnicodeDecodeError:
        return raw.decode('cp1250')


def write_utf8(path, text):
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


# Fix onboarding emojis
path = os.path.join(ROOT, 'pages', 'onboarding.html')
text = read_utf8(path)
emoji_map = {
    'data-screen="1">\n        <div class="onboarding__emoji">??</div>': 'data-screen="1">\n        <div class="onboarding__emoji">👋</div>',
    'data-screen="2">\n        <div class="onboarding__emoji">??</div>': 'data-screen="2">\n        <div class="onboarding__emoji">🧊</div>',
    'data-screen="3">\n        <div class="onboarding__emoji">??</div>': 'data-screen="3">\n        <div class="onboarding__emoji">📄</div>',
    'data-screen="4">\n        <div class="onboarding__emoji">??</div>': 'data-screen="4">\n        <div class="onboarding__emoji">🚗</div>',
}
for old, new in emoji_map.items():
    text = text.replace(old, new)
text = text.replace('pomažu Domacinku', 'pomažu Domaćinku')
write_utf8(path, text)
print('onboarding emoji remaining:', text.count('??'))

# Fix onboarding emojis with regex
emojis = {'1': '👋', '2': '🧊', '3': '📄', '4': '🚗', '5': '🎉'}
path = os.path.join(ROOT, 'pages', 'onboarding.html')
text = read_utf8(path)
text = re.sub(
    r'data-screen="(\d)">\s*\n\s*<div class="onboarding__emoji">\?\?</div>',
    lambda m: f'data-screen="{m.group(1)}">\n        <div class="onboarding__emoji">{emojis[m.group(1)]}</div>',
    text,
)
write_utf8(path, text)
print('onboarding after regex:', text.count('??'))

# meal-plan
path = os.path.join(ROOT, 'pages', 'meal-plan.html')
text = read_utf8(path)
for old, new in [
    ('Doma?inko', 'Domaćinko'),
    ('generi?ite', 'generišite'),
    ('generi?i', 'generiši'),
    ('?ta ', 'Šta '),
    ('Doma?instvo', 'Domaćinstvo'),
    ('?? Generi?i', '🛒 Generiši'),
    (' — ', ' — '),
]:
    text = text.replace(old, new)
write_utf8(path, text)
print('meal-plan ?? left:', text.count('??'))

# inventory cp1250 mojibake fixes
path = os.path.join(ROOT, 'pages', 'inventory.html')
text = read_utf8(path)
for old, new in [
    ('Vať inventar', 'Vaš inventar'),
    ('ťrafovi ť brza pretraga ťimam', 'šrafovi — brza pretraga "imam'),
    ('Pretraťi', 'Pretraži'),
    ('?? Dodajte sliku', '📷 Dodajte sliku'),
    ('Domaćinko ť Inventar', 'Domaćinko — Inventar'),
]:
    text = text.replace(old, new)
write_utf8(path, text)
print('inventory fixed')

fixes = {
    'pages/scan-receipt.html': [
        ('Fotografi\uFFFDite', 'Fotografišite'),
        ('Fotografi\uFFFDi', 'Fotografiši'),
        ('Jo\uFFFD nema', 'Još nema'),
        ('tro\uFFFDak', 'trošak'),
        ('ra\u010Duna \uFFFD Doma', 'računa — Doma'),
        ('Doma\u0107inko \uFFFD Skeniraj', 'Domaćinko — Skeniraj'),
        ('?? Fotografi', '📷 Fotografi'),
    ],
    'pages/repairs.html': [
        ('Opi\uFFFDite', 'Opišite'),
        ('savet \uFFFD DIY', 'savet — DIY'),
        ('Doma\u0107inko \uFFFD AI', 'Domaćinko — AI'),
    ],
    'pages/maintenance.html': [
        ('Odr\uFFFDavanje', 'Održavanje'),
        ('poslovi \uFFFD ne', 'poslovi — ne'),
        ('vi\uFFFDe', 'više'),
        ('Doma\u0107inko \uFFFD Odr', 'Domaćinko — Odr'),
    ],
    'pages/add-expense.html': [
        ('tro\uFFFDak', 'trošak'),
        ('Doma\u0107inko \uFFFD Dodaj', 'Domaćinko — Dodaj'),
    ],
    'pages/household.html': [
        ('va\uFFFDeg', 'vašeg'),
        ('Doma\u0107inko \uFFFD Doma', 'Domaćinko — Doma'),
        ('<span class="quick-action__icon">??</span>Profil ku\u0107e', '<span class="quick-action__icon">🏠</span>Profil kuće'),
        ('<span class="quick-action__icon">??</span>Bezbednost', '<span class="quick-action__icon">🛡️</span>Bezbednost'),
        ('<span class="quick-action__icon">??</span>Alati', '<span class="quick-action__icon">🔧</span>Alati'),
    ],
    'pages/inventory.html': [
        ('Va\uFFFD inventar', 'Vaš inventar'),
        ('\uFFFDrafovi \uFFFD brza', 'šrafovi — brza'),
        ('\uFFFDimam li', '"imam li'),
        ('Pretra\uFFFDi', 'Pretraži'),
        ('Doma\u0107inko \uFFFD Inventar', 'Domaćinko — Inventar'),
        ('?? Dodajte sliku', '📷 Dodajte sliku'),
    ],
    'pages/ai.html': [
        ('?? Savetnik', '🤖 Savetnik'),
        ('?? Majstor', '🔧 Majstor'),
        ('?? U\u010Ditelj', '📚 Učitelj'),
        ('U\uFFFDitelj', 'Učitelj'),
        ('doma?instva', 'domaćinstva'),
        ('ku\uFFFDne', 'kućne'),
        (' \uFFFD korak', ' — korak'),
        (' \uFFFD kratke', ' — kratke'),
        ('Opi\uFFFDite', 'Opišite'),
        ('Po\uFFFDalji', 'Pošalji'),
    ],
}

for rel, reps in fixes.items():
    p = os.path.join(ROOT, rel.replace('/', os.sep))
    if not os.path.exists(p):
        print('missing', rel)
        continue
    t = read_utf8(p)
    orig = t
    for old, new in reps:
        t = t.replace(old, new)
    if t != orig:
        write_utf8(p, t)
        print('fixed', rel)

# Ensure http-equiv on all HTML
for dirpath, _, files in os.walk(ROOT):
    if '.git' in dirpath or 'scripts' in dirpath:
        continue
    for f in files:
        if not f.endswith('.html'):
            continue
        p = os.path.join(dirpath, f)
        t = read_utf8(p)
        if 'http-equiv' not in t[:3000]:
            t = t.replace(
                '<meta charset="UTF-8">\n',
                '<meta charset="UTF-8">\n  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">\n',
                1,
            )
            write_utf8(p, t)
            print('added meta', os.path.relpath(p, ROOT))

# Final validation
errors = []
for dirpath, _, files in os.walk(ROOT):
    if '.git' in dirpath:
        continue
    for f in files:
        if not f.endswith(('.html', '.js')):
            continue
        p = os.path.join(dirpath, f)
        raw = open(p, 'rb').read()
        if raw.startswith(b'\xef\xbb\xbf'):
            errors.append(f'BOM: {f}')
        try:
            t = raw.lstrip(b'\xef\xbb\xbf').decode('utf-8')
            if '\ufffd' in t:
                errors.append(f'REP: {f}')
            if '??' in t and f.endswith('.html'):
                errors.append(f'EMOJI: {f}')
        except UnicodeDecodeError:
            errors.append(f'UTF8: {f}')

if errors:
    print('Remaining:', *errors, sep='\n  ')
else:
    print('All clean!')
