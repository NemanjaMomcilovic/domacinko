# Domaćinko v6.2

**AI pomoćnik za domaćinstvo** — prvi proizvod platforme [10KEY](https://github.com/NemanjaMomcilovic/domacinko).

[![PWA](https://img.shields.io/badge/PWA-ready-2d8f5c)](manifest.json)
[![Version](https://img.shields.io/badge/version-6.3.0-blue)](docs/changelog.md)
[![Language](https://img.shields.io/badge/jezik-srpski-red)](pages/home.html)

Domaćinko prati vaše finansije, kupovinu, održavanje, inventar i popravke — sa proaktivnim jutarnjim brifingom, AI savetnikom i offline PWA podrškom.

## ✨ Ključne funkcije

| Modul | Opis |
|-------|------|
| 🏠 **Početna** | Jutarnji brifing, brza statistika, personalizovani saveti |
| 💰 **Finansije** | Budžet, trend grafikon, nedeljni pregled, PDF izvoz |
| 🤖 **AI** | Savetnik, Majstor, Vizuelni asistent, Baza znanja |
| 🛒 **Kupovina** | Lista sa kategorijama, omiljeni proizvodi, upozorenja ostave |
| 🔧 **Održavanje** | Sezonski zadaci, podsetnici, garancije |
| 📦 **Inventar** | Lokacije, garancije, alati za DIY |

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
- Offline keširanje (Service Worker v6.3.0)
- Prečice: Dodaj trošak, Lista za kupovinu
- Push podsetnici za račune, budžet i održavanje

## 🏗️ Arhitektura

```
domacinko/
├── pages/          # 25+ HTML stranica
├── js/
│   ├── storage.js      # localStorage API
│   ├── ui-helpers.js   # Deljeni UI (toast, skeleton, offline)
│   ├── modules/        # Briefing, registry, AI kontekst
│   └── pages/          # Page-specific logika
├── css/            # Dizajn sistem (tamna tema, pristupačnost)
└── docs/           # Vizija, changelog, roadmap
```

Čist **HTML + CSS + JavaScript** — bez frameworka. Podaci u `localStorage`, opciona sinhronizacija preko Supabase.

## 📖 Dokumentacija

- [Vizija proizvoda](docs/vision.md)
- [Changelog](docs/changelog.md)
- [Roadmap](docs/roadmap.md)

## Powered by 10KEY

Domaćinko je deo 10KEY ekosistema — pametnih alata za svakodnevni život.

