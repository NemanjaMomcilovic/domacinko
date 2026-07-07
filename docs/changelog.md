# Domaćinko — Changelog

## [4.1.1] — 2026-07-07

### Dodato
- **10KEY i Domaćinko logotipi** (`assets/logos/10key.png`, `assets/logos/domacinko.png`) — kopirani iz originalnog projekta
- Splash ekran sa 10KEY logom i loader animacijom (tamna pozadina, zlatni brending)
- Presents ekran sa Domaćinko logom i animacijom
- Logotipi u landing hero/footer i podešavanjima (Powered by 10KEY)
- PWA ikone generisane iz Domaćinko loga (`assets/icons/icon-192.png`, `icon-512.png`)

### Poboljšano
- `manifest.json` — Domaćinko logo kao primarna PWA ikona
- Service worker keš ažuriran na v4.1.1 sa logo assetima

## [4.1.0] — 2026-07-07

### Dodato
- **Gamifikacija finansijskog zdravlja**: titule (Početnik → Domaćin godine), ocena X/100, 10-segmentni progress bar
- **Stanje domaćinstva**: labela Odlično / Dobro / Pažnja na početnoj i finansijama
- **Naziv cilja štednje** (`savingsGoalName`) u podešavanjima — prikaz „Ušteđeno X / Još Y do [naziv]"
- **Finansijski feedback** sa ✔ i ⚠ tačkama na osnovu stvarnih podataka
- **Avatar** pored pozdrava (inicijal ili 🏡)
- **Gradient kartice** na dashboardu (zelena, žuta, ljubičasta)
- **„Domaćinko kaže"** — budžet-svesni saveti (npr. „Potrošio si 78% budžeta")
- **Splash uvod** (10KEY → Domaćinko predstavlja) samo pri prvoj poseti (`splashSeen`)
- **Proširena domaćinstvo forma**: dan plaćanja i iznos računa, mesečni iznos pretplata, datum registracije auta, tip člana
- **Svi moduli** hub kartice u podešavanjima
- **AI offline odgovori** za struju, vodu, auto, kupovinu, račune i uštedu

### Poboljšano
- Početna i finansije koriste isti health score prikaz iz starog Domaćinka
- `index.html` rutiranje: splash → onboarding → početna

## [4.0.0] — 2026-07-07

### Dodato
- **Modularna arhitektura**: `js/modules/registry.js` i `js/modules/ai-context.js`
- **`docs/vision.md`**: puna vizija proizvoda na srpskom (svi moduli, 10KEY, AI)
- **AI Majstor** (`pages/repairs.html`): 8 kategorija popravki, korak-po-korak saveti, težina, alati, DIY vs majstor, procena troška
- Pravila + opcioni OpenAI; istorija popravki u localStorage
- **Održavanje** (`pages/maintenance.html`): bojler, filter, klima, auto, detektor, sezonski + prilagođeni zadaci
- **Inventar 2.0** (`pages/inventory.html`): lokacija, garancija, slika računa, podsetnici
- **Budžet po kategorijama** u podešavanjima sa progress barovima na finansijama
- Upozorenja na 80% i prekoračenje na 100%
- **AI tabovi**: Savetnik | Majstor | Učitelj (osnovne lekcije)
- Početna: održavanje na redu, garancije ističu, upozorenja budžeta
- PWA notifikacije za održavanje, garancije i budžet kategorija
- Brze akcije: AI Majstor, Održavanje, Inventar

### Poboljšano
- AI savetnik koristi unified kontekst iz svih modula
- Finansijsko zdravlje uzima u obzir budžet po kategorijama
- Service worker ažuriran na v4

## [3.0.0] — 2026-07-07

### Dodato
- **Onboarding**: 3 koraka za nove korisnike (dobrodošlica, budžet + ime, prvi trošak)
- Preskoči opcija na svakom koraku, `onboardingComplete` flag u localStorage
- "Ponovo prikaži uvod" u podešavanjima
- **Plan obroka**: nedeljni planer (Pon–Ned), generisanje liste za kupovinu iz obroka
- "Šta mogu da skuvam?" — predlozi na osnovu ostave u domaćinstvu
- **PWA obaveštenja**: podsetnici za račune, budžet (>80%), listu za kupovinu
- Prekidač obaveštenja u podešavanjima
- **Landing stranica** (`landing.html`) — marketing prezentacija sa 10KEY brendingom
- **Pošalji predlog** u podešavanjima (lokalno čuvanje + clipboard + mailto)
- **Izvezi/Uvezi podatke** (JSON backup/restore)
- Ostava sekcija u domaćinstvu za namirnice
- Brza akcija "Plan obroka" na početnoj

### Poboljšano
- `index.html` usmerava na onboarding ili početnu
- Prazna stanja za mesečne račune i domaćinstvo
- Service worker ažuriran na v3 sa podrškom za notifikacije

## [2.0.0] — 2026-07-07

### Dodato
- **PWA**: manifest.json, service worker za offline keširanje, ikone aplikacije
- Meta tagovi za mobilne uređaje (theme-color, apple-mobile-web-app)
- Tamna tema sa prekidačem u podešavanjima
- CSS animacije za troškove i listu za kupovinu
- Prazna stanja sa prijateljskim porukama na svim stranicama
- **Finansije**: izmena i brisanje troškova, filteri po kategoriji i datumu
- Chart.js grafikon raspodele troškova po kategorijama
- Poređenje sa prošlim mesecom ("X% manje/više")
- Progress bar za cilj štednje
- Mesečni računi (ponavljajući troškovi) sa podsetnicima na početnoj
- **AI asistent**: kontekstualni odgovori na osnovu stvarnih podataka
- Opcioni OpenAI API ključ u podešavanjima
- Brza pitanja (chips): "Gde najviše trošim?", "Koliko mi je ostalo?", "Šta da kupim?"
- **Skeniranje računa**: Tesseract.js OCR za iznos, prodavnicu i datum
- Dugme "Kreiraj trošak" nakon skeniranja

### Poboljšano
- AI više ne koristi nasumične odgovore — analizira budžet, troškove i kupovinu
- Finansijska stranica sa kompletnim pregledom i grafikonima

## [1.0.0] — 2026-07-07

### Dodato
- Inicijalni prototip Domaćinko aplikacije
- Početna stranica sa dashboard-om, finansijskim zdravljem i savetom dana
- Dodavanje i brisanje troškova sa 12 kategorija
- Finansijski pregled sa raspodelom po kategorijama
- AI chat asistent "Pitaj Domaćinka" sa lokalnim odgovorima
- Lista za kupovinu sa označavanjem kupljenih stavki
- Skeniranje računa (pregled slike)
- Domaćinstvo sa 9 sekcija (članovi, automobili, računi, ljubimci, pretplate, aparati, dokumenti, garancije, datumi)
- Podešavanja: profil, valuta, budžet, cilj štednje, reset podataka
- Donja navigacija: Početna, Finansije, AI, Kupovina, Više
- localStorage za sve podatke
- Srpski jezik UI
- Mobile-first responsive dizajn (max 480px)
