# Domaćinko v7.6.1

**AI pomoćnik za domaćinstvo** — prvi proizvod platforme [10KEY](https://github.com/NemanjaMomcilovic/domacinko).

[![PWA](https://img.shields.io/badge/PWA-ready-2d8f5c)](manifest.json)
[![Version](https://img.shields.io/badge/version-7.6.1-blue)](docs/changelog.md)
[![Language](https://img.shields.io/badge/jezik-srpski-red)](pages/home.html)
[![Android](https://img.shields.io/badge/Android-Capacitor-3DDC84)](docs/android-build.md)

**Sada:** Domaćinko prati troškove, budžet i komunalije, planira obroke i listu za kupovinu, i savetuje preko besplatnog 10KEY Savetnika — sve na jednom mestu, offline i bez registracije.

## ✨ MVP funkcije (v7.5)

| Modul | Opis |
|-------|------|
| 🏠 **Početna** | Jutarnji brifing i pregled budžeta (realni podaci) |
| 💰 **Troškovi** | Dodavanje, lista, mesečni pregled |
| 💡 **Komunalije** | Struja, voda, grejanje… — unos, foto potvrda, plaćeno |
| 🍽️ **Plan obroka** | 3 obroka/dan, 70+ srpskih jela ili samo namirnice, lista za kupovinu |
| 🛒 **Kupovina** | Lista sa dodavanjem i označavanjem kupljenog |
| 💬 **10KEY Savetnik** | Besplatan lokalni asistent — budžet, obroci, kupovina |
| 👤 **Nalog i profil** | Prijava, sinhronizacija, ime i budžet |
| 👨‍👩‍👧 **Porodica** | Pozivni kod i deljenje podataka (Supabase) |

Napredni moduli (održavanje, inventar, bašta…) dolaze u v2 — vidljivi u **Više → Pregled svih modula** kao „Dolazi uskoro". Detalji: [docs/mvp-scope.md](docs/mvp-scope.md).

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
- Offline keširanje (Service Worker v7.6.1)
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

- **[MVP obim (v1 vs v2)](docs/mvp-scope.md)** ← šta app radi sada
- [Vizija proizvoda](docs/vision.md)
- [Changelog](docs/changelog.md)
- [Brzi vodič za korisnike](docs/user-quickstart.md)
- [Roadmap](docs/roadmap.md)
- [Supabase podešavanje](docs/supabase-setup.md)
- [Android build](docs/android-build.md)
- [Poznati problemi](docs/known-issues.md)

## Powered by 10KEY

Domaćinko je deo 10KEY ekosistema — pametnih alata za svakodnevni život.
