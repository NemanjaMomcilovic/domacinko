#!/usr/bin/env python3
"""Fix corrupted Serbian glyphs (ĝ -> č, etc.)."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

GLYPH_FIXES = [
    ('ĝ', 'č'),
    ('Ĝ', 'Č'),
    ('🝠', '🏠'),
    ('Domaćinko ? ', 'Domaćinko — '),
    ('jela ? brzi', 'jela — brzi'),
    ('Domaćinstvo ? Ostava', 'Domaćinstvo → Ostava'),
]

for dirpath, _, files in os.walk(ROOT):
    if '.git' in dirpath or 'scripts' in dirpath:
        continue
    for f in files:
        if not f.endswith(('.html', '.js')):
            continue
        p = os.path.join(dirpath, f)
        t = open(p, encoding='utf-8').read()
        orig = t
        for old, new in GLYPH_FIXES:
            t = t.replace(old, new)
        if t != orig:
            with open(p, 'w', encoding='utf-8', newline='\n') as fh:
                fh.write(t)
            print('fixed', os.path.relpath(p, ROOT))
