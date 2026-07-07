# Domaćinko — Vizija proizvoda

## Brend i platforma

**10KEY** je glavna platforma i brend — ekosistem pametnih alata za svakodnevni život. **Domaćinko** je prvi proizvod pod 10KEY brendom: AI-pokretan pomoćnik za domaćinstvo, dostupan kao PWA (Progressive Web App) bez obaveznog backend-a.

**ChatGPT za dom** — Domaćinko koristi lokalnu inteligenciju i opcioni OpenAI ključ da postane personalizovani savetnik koji poznaje vaše troškove, kupovinu, održavanje i inventar.

---

## Misija

Pomoći svakom domaćinstvu da bolje upravlja finansijama, kupovinom, popravkama i svakodnevnim obavezama — kroz jednostavan, prijatan i inteligentan alat koji raste sa korisnikom.

---

## Moduli Domaćinko v4

### 💰 Finansije
- Praćenje troškova po 12 kategorija
- Mesečni budžet i cilj štednje
- **Budžet po kategorijama** sa upozorenjima (>80%, >100%)
- Finansijsko zdravlje (skor 0–100)
- Grafikoni i poređenje sa prošlim mesecom
- Filteri, izmena i brisanje troškova

### 🛒 Pametna kupovina
- Lista za kupovinu sa označavanjem kupljenog
- Plan obroka (Pon–Ned) sa generisanjem liste
- „Šta mogu da skuvam?" na osnovu ostave
- Integracija sa finansijama i AI savetnikom

### 📷 Fiskalni računi
- Skeniranje računa (OCR — Tesseract.js)
- Automatsko prepoznavanje iznosa, prodavnice, datuma
- Kreiranje troška iz skeniranog računa

### 🔧 Popravke — AI Majstor
- Kategorije: Elektrika, Vodovod, Gips, Keramika, Moleraj, Bašta, Nameštaj, Alati
- Opis problema → korak-po-korak savet na srpskom
- Težina, potrebni alati, DIY vs majstor, procena troška
- Pravila + opcioni OpenAI iz podešavanja
- Istorija popravki u localStorage

### 🏠 Održavanje
- Predefinisani zadaci: bojler, filter, klima, auto, detektor dima, sezonski
- Prilagođeni zadaci sa intervalom i datumom poslednjeg izvršenja
- Prikaz na početnoj kada je na redu
- PWA notifikacije za zakasnele zadatke

### 🍽️ Kuhinja
- Nedeljni plan obroka
- Generisanje liste za kupovinu iz obroka
- Ostava (pantry) u domaćinstvu
- Predlozi jela na osnovu namirnica

### 📦 Inventar 2.0
- Naziv, lokacija, datum kupovine, garancija
- Slika računa (lokalno čuvanje)
- Podsetnici za istek garancije
- Prikaz na početnoj

### 🏡 Domaćinstvo
- Članovi porodice, ljubimci, automobili
- Računi, pretplate, aparati
- Dokumenti, garancije, važni datumi
- Ostava / namirnice

### 💬 AI Savetnik
- Chat sa kontekstom iz svih modula
- Brza pitanja (chips)
- Lokalni pametni odgovori + opcioni OpenAI

### 🔧 AI Majstor (tab)
- Ista funkcionalnost kao stranica Popravke
- Ugrađen u AI tabove

### 📚 AI Učitelj (v1)
- Kratke lekcije: budžetiranje, kuvanje, popravke, održavanje, energija, kupovina
- Praćenje pročitanih tema

### 👨‍👩‍👧 Porodica i vozila
- U okviru modula Domaćinstvo
- Planirano: deljenje između članova (backend)

### 📋 Dokumenti
- Evidencija važnih dokumenata u domaćinstvu
- Planirano: skeniranje i kategorizacija

### 🚗 Vozila
- Evidencija automobila
- Servis u modulu Održavanje

---

## AI arhitektura (v4)

### Modularni registar (`js/modules/registry.js`)
Centralni registar svih modula aplikacije — ime, ikona, putanja, init i getContext.

### Unified AI kontekst (`js/modules/ai-context.js`)
Svaki modul ima `getContext()` funkciju koja prikuplja relevantne podatke za AI:
- Finansije, kupovina, računi, popravke, održavanje, kuhinja, inventar, domaćinstvo
- `buildFullAIContext()` za kompletan pregled

---

## Ton komunikacije

- Prijateljski i topao
- Jednostavan i razumljiv — srpski jezik
- Ohrabrujući — nikada osuđujući
- Fokus na pomoć, ne na kritiku
- Bezbednost na prvom mestu kod DIY saveta

---

## Dizajn

- **Mobile-first** — max širina 480px, optimizovano za telefon
- Čist, moderan izgled sa zaobljenim karticama
- **Zelena primarna boja** (#2d8f5c) — Domaćinko
- **Zlatna** (#c9a227) — isključivo 10KEY brending
- Donja navigacija: Početna, Finansije, AI, Kupovina, Više
- Tamna tema (opciono)
- PWA: offline, instalacija, notifikacije

---

## Ciljna publika

Porodice i pojedinci u Srbiji i regionu koji žele:
- Pregled mesečnih troškova i kontrolu budžeta
- Organizovanu kupovinu i plan obroka
- Savete za uštedu i popravke
- Podsetnike za održavanje i garancije
- Centralizovano upravljanje domaćinstvom — bez komplikovanih aplikacija

---

## Tehnologija

### Trenutna faza (v4 prototip)
- Čist HTML / CSS / JavaScript — bez frameworka
- localStorage za sve podatke
- Service Worker za offline i PWA
- Chart.js za grafikone
- Tesseract.js za OCR
- Opcioni OpenAI API ključ (korisnikov, lokalno čuvan)

### Sledeća faza (roadmap)
- Supabase backend — nalozi, sinhronizacija
- Deljenje domaćinstva između članova porodice
- Centralna 10KEY autentifikacija
- Premium funkcije
- Native mobilne aplikacije (iOS / Android)

---

## 10KEY platforma — dugoročna vizija

Domaćinko je temelj. Pod 10KEY brendom planirani su dodatni proizvodi:
- Zajednička autentifikacija i profil
- Cross-app integracije
- Premium tier sa naprednim AI i sinhronizacijom
- Landing i marketing na `landing.html`

---

## Uspeh proizvoda

Korisnik koji:
1. Otvori aplikaciju i odmah vidi finansijsko zdravlje i šta je na redu
2. Dobije koristan savet bez da traži po internetu
3. Ne zaboravi servis bojlera ili istek garancije
4. Oseća da aplikacija „poznaje" njegovo domaćinstvo
5. Preporuči Domaćinko porodici i prijateljima

**Domaćinko — vaš AI pomoćnik za dom. Powered by 10KEY.** 💚
