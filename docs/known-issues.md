# Domaćinko — Poznati problemi

Dokumentacija poznatih ograničenja i problema u v7.0.0. Ažurirano: jul 2026.

---

## Platforma i okruženje

| Problem | Opis | Zaobilazno rešenje |
|---------|------|-------------------|
| **GitHub Pages + config.js** | `config.js` nije u repou (bezbednost) | Unesite Supabase ključeve u Podešavanjima na uređaju |
| **Lokalni server obavezan** | `file://` protokol ne podržava Service Worker | Koristite `python -m http.server 8080` |
| **iOS PWA ograničenja** | Push notifikacije ograničene na iOS | Koristite Android PWA ili native APK |

---

## Resursi i ikone

| Problem | Opis | Zaobilazno rešenje |
|---------|------|-------------------|
| **PNG ikone** | Neke instalacije nemaju `icon-192.png` / `icon-512.png` | SVG ikone u `assets/icons/` rade u PWA; za Android koristite `@capacitor/assets` |
| **Logotipi** | `assets/logos/` može nedostajati u minimalnom klonu | Dodajte `domacinko.png` i `10key.png` ručno |

---

## Porodična sinhronizacija

| Problem | Opis | Zaobilazno rešenje |
|---------|------|-------------------|
| **SQL šema** | Tabele `households`, `household_members`, `household_data` moraju postojati | Pokrenite SQL iz `docs/supabase-setup.md` §3b |
| **Konflikti podataka** | Istovremena izmena na dva uređaja — poslednja sinhronizacija pobedi | Ručno „Sinhronizuj sada" na stranici Porodica |
| **Lična podešavanja** | Budžet i ime su po nalogu, ne po domaćinstvu | Namerno — svaki član ima svoj profil |
| **Gost režim** | Porodična sinhronizacija zahteva Supabase nalog | Prijavite se ili registrujte se |

---

## Android (Capacitor)

| Problem | Opis | Zaobilazno rešenje |
|---------|------|-------------------|
| **APK build** | Zahteva Android Studio + JDK 17 + SDK | Pratite `docs/android-build.md`; `npm run cap:sync` radi i bez SDK |
| **`android/` / `www/`** | Generišu se lokalno | Nisu u gitu — `npm run cap:add` / `cap:sync` |
| **Ollama na telefonu** | `localhost:11434` je PC, ne telefon | Companion / LAN IP / VPN — vidi `docs/ollama-setup.md` |
| **Supabase OAuth redirect** | Native scheme `https://localhost` | Dodajte u Supabase Redirect URLs; produkcija: HTTPS + intent-filter |
| **npm SSL greška** | `UNABLE_TO_VERIFY_LEAF_SIGNATURE` na nekim mrežama | `$env:NODE_OPTIONS='--use-system-ca'` pre `npm install` |

---

## UI i pristupačnost

| Problem | Opis | Zaobilazno rešenje |
|---------|------|-------------------|
| **Chart.js offline** | Grafikoni na Finansijama zahtevaju CDN | Prvi put otvorite sa internetom |
| **OCR računa** | Tesseract.js je velik (~2 MB) | Koristite na Wi-Fi; stranica kešira biblioteku |
| **Glasovni režim** | Web Speech API nije podržan u svim pregledačima | Chrome/Edge na Androidu rade najbolje |

---

## Autentifikacija

| Problem | Opis | Zaobilazno rešenje |
|---------|------|-------------------|
| **Facebook dev mod** | Samo test korisnici mogu da se prijave | Prebacite Meta app u Live mod |
| **Email potvrda** | Registracija čeka potvrdu emaila | Isključite u Supabase za razvoj |
| **OAuth redirect** | Pogrešan URL blokira Google/Facebook | Dodajte tačan URL u Supabase i provider konzolu |

---

## Prijavljivanje grešaka

Otvorite issue na [GitHub](https://github.com/NemanjaMomcilovic/domacinko/issues) sa:

- Verzija (v7.0.0)
- Uređaj i pregledač
- Koraci za reprodukciju
- Screenshot konzole (F12 → Console)

---

**Domaćinko v7.0.0** — Powered by 10KEY
