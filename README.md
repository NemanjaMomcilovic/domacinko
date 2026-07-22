# Domaćinko v7.2.2

**AI pomoćnik za domaćinstvo** — prvi proizvod platforme [10KEY](https://github.com/NemanjaMomcilovic/domacinko).

[![PWA](https://img.shields.io/badge/PWA-ready-2d8f5c)](manifest.json)
[![Version](https://img.shields.io/badge/version-7.2.2-blue)](docs/changelog.md)
[![Language](https://img.shields.io/badge/jezik-srpski-red)](pages/home.html)
[![Android](https://img.shields.io/badge/Android-Capacitor-3DDC84)](docs/android-build.md)

Domaćinko prati vaše finansije, kupovinu, održavanje, inventar i popravke — sa proaktivnim jutarnjim brifingom, AI savetnikom, **porodičnom sinhronizacijom** i offline PWA podrškom.

## ✨ Ključne funkcije

| Modul | Opis |
|-------|------|
| 🏠 **Početna** | Digitalni domaćin — jutarnji brifing sa 20+ scenarija |
| 👨‍👩‍👧‍👦 **Porodica** | Deljenje troškova i kupovine — pozivni kod, Supabase sync |
| 💰 **Finansije** | Budžet, trend, nedeljni pregled, **Štampaj izveštaj** (PDF) |
| 🤖 **AI** | Savetnik, Majstor, Vizuelni asistent — offline + OpenAI opcija |
| 🍽️ **Plan obroka** | Drag-and-drop, 24+ srpska jela, auto lista za kupovinu |
| 👤 **Lokalni profili** | Više članova na istom uređaju + porodična sinhronizacija |
| 🛒 **Kupovina** | Lista sa kategorijama, omiljeni proizvodi, upozorenja ostave |
| 🔧 **Održavanje** | Sezonski zadaci, podsetnici, garancije |
| 📱 **Android APK** | Capacitor wrapper — build lokalno u Android Studio |

## 🚀 Pokretanje

```powershell
cd C:\Users\pc\10KEY\domacinko
python -m http.server 8080
# Otvorite http://localhost:8080
```

Ili direktno otvorite `index.html` u browseru (Service Worker zahteva lokalni server).

### GitHub Pages

Aplikacija je podešena za deploy na GitHub Pages — sve putanje koriste relativne linkove (`../`, `./pages/`).

### Supabase (opciono)

Za sinhronizaciju naloga i **porodičnog deljenja**, pogledajte [docs/supabase-setup.md](docs/supabase-setup.md).

**Beta launch:** korak-po-korak vodič → [docs/SETUP-KORAK-PO-KORAK.md](docs/SETUP-KORAK-PO-KORAK.md) (SQL: [supabase-ALL-IN-ONE.sql](docs/supabase-ALL-IN-ONE.sql))

1. Kreirajte Supabase projekat
2. Pokrenite SQL šemu (`docs/supabase-ALL-IN-ONE.sql` — sve u jednom)
3. Unesite ključeve u **Podešavanja → Poveži nalog**
4. **Podešavanja → Pozovi porodicu** — kreirajte domaćinstvo i podelite 6-cifreni kod

### Android APK

Za native Android aplikaciju:

```powershell
npm install
npx cap add android    # prvi put
npx cap sync android
npx cap open android   # Build APK u Android Studio
```

Detaljno uputstvo: [docs/android-build.md](docs/android-build.md)

## 📱 PWA

- Instalirajte na početni ekran (Android/iOS)
- Offline keširanje (Service Worker v7.2.2)
- Prečice: Dodaj trošak, Lista za kupovinu, AI Savetnik
- Push podsetnici za račune, budžet i održavanje

## 🏗️ Arhitektura

```
domacinko/
├── pages/          # 26+ HTML stranica
├── js/
│   ├── storage.js          # localStorage API + lokalni profili
│   ├── household-sync.js   # Porodična sinhronizacija (Supabase)
│   ├── ui-helpers.js       # Deljeni UI (toast, skeleton, offline)
│   ├── modules/            # Briefing, registry, AI kontekst
│   └── pages/              # Page-specific logika
├── css/            # Dizajn sistem v2 (tamna tema, pristupačnost)
├── capacitor.config.ts     # Android wrapper
└── docs/           # Vizija, changelog, roadmap, android-build
```

Čist **HTML + CSS + JavaScript** — bez frameworka. Podaci u `localStorage`, opciona sinhronizacija preko Supabase.

## 📖 Dokumentacija

- **[Beta launch — korak po korak](docs/SETUP-KORAK-PO-KORAK.md)** ← počni ovde za friend beta
- [Vizija proizvoda](docs/vision.md)
- [Changelog](docs/changelog.md)
- [Brzi vodič za korisnike](docs/user-quickstart.md)
- [Roadmap](docs/roadmap.md)
- [Supabase podešavanje](docs/supabase-setup.md)
- [Android build](docs/android-build.md)
- [Poznati problemi](docs/known-issues.md)

## Powered by 10KEY

Domaćinko je deo 10KEY ekosistema — pametnih alata za svakodnevni život.
