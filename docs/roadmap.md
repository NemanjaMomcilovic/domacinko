# Domaćinko — Roadmap

## Faza 1 — Prototip ✅

- [x] Osnovna struktura projekta
- [x] CSS dizajn sistem (zelena primarna, mobile-first)
- [x] Početna stranica sa dashboard-om
- [x] Dodavanje i praćenje troškova
- [x] Finansijski pregled sa kategorijama
- [x] Finansijsko zdravlje (skor 0–100)
- [x] AI asistent sa lokalnim mock odgovorima
- [x] Lista za kupovinu
- [x] Skeniranje računa (pregled slike)
- [x] Domaćinstvo (placeholder sekcije)
- [x] Podešavanja i reset podataka
- [x] localStorage integracija

## Faza 2 — Poboljšanja ✅

- [x] Grafikoni troškova (Chart.js)
- [x] OCR za skeniranje računa
- [x] Notifikacije i podsetnici (PWA, client-side)
- [x] Izvezi/uvozi podatke (JSON)
- [x] Tamna tema
- [x] PWA podrška (offline, instalacija)
- [x] Onboarding za nove korisnike
- [x] Plan obroka sa generisanjem liste za kupovinu
- [x] Landing stranica

## Faza 3 — Backend i AI (delimično ✅)

- [x] Korisnički nalozi i autentifikacija (Supabase)
- [x] Sinhronizacija između uređaja (`user_data` JSONB + profil)
- [x] Prošireni onboarding (5 koraka: profil, frižider, računi, auto)
- [x] Email, Google i Facebook prijava
- [x] Gost režim (localStorage fallback)
- [ ] **Sledeći korak**: Sinhronizacija domaćinstva između članova porodice
- [x] Lokalni profili na uređaju (v6.4.0 — priprema za family sync)
- [x] Pravi AI asistent (OpenAI opcioni ključ)
- [x] Personalizovani saveti na osnovu podataka
- [ ] Deljenje domaćinstva sa članovima porodice (zahteva backend + Supabase)

## Faza 4 — Moduli i platforma ✅ (v4.0.0)

- [x] Modularna arhitektura (`registry.js`, `ai-context.js`)
- [x] `docs/vision.md` — puna vizija proizvoda na srpskom
- [x] **AI Majstor** — popravke sa DIY savetima (8 kategorija)
- [x] **Održavanje** — predefinisani i prilagođeni zadaci, podsetnici
- [x] **Inventar 2.0** — garancije, lokacije, slika računa
- [x] **Budžet po kategorijama** — limiti, progress barovi, upozorenja
- [x] AI tabovi: Savetnik | Majstor | Učitelj
- [x] Početna: održavanje, garancije, upozorenja budžeta
- [x] PWA notifikacije za održavanje i garancije

## Faza 5 — 10KEY platforma

- [x] Landing stranica za Domaćinko / 10KEY
- [x] Centralna autentifikacija (Supabase — email, Google, Facebook)
- [ ] Premium funkcije
- [ ] Mobilne aplikacije (iOS/Android)

## Faza 6 — Vizija v6 ✅ (6.0.0)

- [x] Profil kuće — kvadratura, grejanje, aparati
- [x] Jutarnji brifing na početnoj
- [x] Finansijski trener
- [x] Kućni magacin u inventaru
- [x] Vizuelni asistent (rule-based + OpenAI Vision)
- [x] Prognoza troškova
- [x] Baza znanja
- [x] Inventar alata
- [x] Dnevnik kuće
- [x] Sezonski plan
- [x] Projekti sa listom materijala
- [x] Bezbednost (detektori, lekovi)
- [x] Bašta
- [x] Glasovni režim (Web Speech API)
- [x] Navike kupovine + lista praćenja cena
- [x] Mreža majstora (placeholder)
- [x] `docs/vision.md` — puna vizija na srpskom

## Faza 7 — Auth i mobilni (v6.1.0) ✅

- [x] Supabase konfiguracija bez `config.js` (localStorage u Podešavanjima)
- [x] GitHub Pages spremnost — ključevi na uređaju, ne u repou
- [x] Reset lozinke (email)
- [x] PWA install hint na početnoj
- [x] AI Majstor → Baza znanja link
- [x] Rođendani u prognozi troškova
- [x] Facebook OAuth vodič (dokumentacija — setup sutra)

## Faza 8 — UX i offline (v6.4.0) ✅

- [x] Kontekstualna pomoć (? tooltips) sa localStorage dismissed state
- [x] Prošireni proaktivni brifing (digitalni domaćin)
- [x] Drag-and-drop plan obroka (mobile touch)
- [x] Lokalni profili na uređaju (priprema za porodični sync)
- [x] PDF mesečni finansijski izveštaj sa 10KEY brandingom
- [x] Prošireni offline AI odgovori (struja, gas, grejanje...)
- [x] `docs/user-quickstart.md`

## Faza 9 — Buduće ideje

- [ ] **Lokalni profili → Supabase family sync** (članovi porodice, deljeni podaci)
- [ ] AI Učitelj v2 — kvizovi i sertifikati
- [ ] Skeniranje dokumenata (OCR)
- [ ] Integracija sa bankama / open banking
- [ ] Pravi direktorijum majstora
- [ ] Automatska upozorenja o cenama
- [ ] Deljeni inventar i zadaci u porodici
