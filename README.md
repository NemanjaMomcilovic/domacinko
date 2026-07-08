# Domaćinko v6.5

**AI pomoćnik za domaćinstvo** — prvi proizvod platforme [10KEY](https://github.com/NemanjaMomcilovic/domacinko).

[![PWA](https://img.shields.io/badge/PWA-ready-2d8f5c)](manifest.json)
[![Version](https://img.shields.io/badge/version-6.5.0-blue)](docs/changelog.md)
[![Language](https://img.shields.io/badge/jezik-srpski-red)](pages/home.html)

Domaćinko prati vaše finansije, kupovinu, održavanje, inventar i popravke — sa proaktivnim jutarnjim brifingom, AI savetnikom i offline PWA podrškom.

## ✨ Ključne funkcije

| Modul | Opis |
|-------|------|
| 🏠 **Početna** | Digitalni domaćin — jutarnji brifing sa 15+ scenarija |
| 💰 **Finansije** | Budžet, trend, nedeljni pregled, **Štampaj izveštaj** (PDF) |
| 🤖 **AI** | Savetnik, Majstor, Vizuelni asistent — offline + OpenAI opcija |
| 🍽️ **Plan obroka** | Drag-and-drop, srpska jela, auto lista za kupovinu |
| 👤 **Lokalni profili** | Više članova na istom uređaju (priprema za family sync) |
| ❓ **Pomoć** | Kontekstualni ? tooltips na složenim ekranima |
| 🛒 **Kupovina** | Lista sa kategorijama, omiljeni proizvodi, upozorenja ostave |
| 🔧 **Održavanje** | Sezonski zadaci, podsetnici, garancije |

## 📸 Snimci ekrana

> Placeholder — dodajte snimke u `docs/screenshots/`:
> - `home-briefing.png` — jutarnji brifing
> - `finances-report.png` — mesečni izveštaj
> - `meal-plan-drag.png` — plan obroka
> - `ai-savetnik.png` — AI chat

## 🚀 Pokretanje

```powershell
cd C:\Users\pc\10KEY\domacinko
python -m http.server 8080
# Otvorite http://localhost:8080
```

Ili direktno otvorite `index.html` u browseru.

### GitHub Pages

Aplikacija je podešena za deploy na GitHub Pages — sve putanje koriste relativne linkove (`../`, `./pages/`).

### Supabase (opciono)

Za sinhronizaciju naloga između uređaja, pogledajte [docs/supabase-setup.md](docs/supabase-setup.md).

## 📱 PWA

- Instalirajte na početni ekran (Android/iOS)
- Offline keširanje (Service Worker v6.5.0)
- Prečice: Dodaj trošak, Lista za kupovinu, AI Savetnik
- Push podsetnici za račune, budžet i održavanje

## 🏗️ Arhitektura

```
domacinko/
├── pages/          # 25+ HTML stranica
├── js/
│   ├── storage.js      # localStorage API + lokalni profili
│   ├── help-tooltips.js
│   ├── ui-helpers.js   # Deljeni UI (toast, skeleton, offline)
│   ├── modules/        # Briefing, registry, AI kontekst
│   └── pages/          # Page-specific logika
├── css/            # Dizajn sistem (tamna tema, pristupačnost)
└── docs/           # Vizija, changelog, roadmap, user-quickstart
```

Čist **HTML + CSS + JavaScript** — bez frameworka. Podaci u `localStorage`, opciona sinhronizacija preko Supabase.

## 📖 Dokumentacija

- [Vizija proizvoda](docs/vision.md)
- [Changelog](docs/changelog.md)
- [Brzi vodič za korisnike](docs/user-quickstart.md)
- [Roadmap](docs/roadmap.md)

## Powered by 10KEY

Domaćinko je deo 10KEY ekosistema — pametnih alata za svakodnevni život.
