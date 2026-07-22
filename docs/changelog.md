# Domaćinko — Changelog

## [7.3.0] — 2026-07-22

### MVP focus — jasna v1 granica
- **`docs/mvp-scope.md`** — dokumentovan Core v1 vs v2+ (šta radi sada, šta dolazi kasnije)
- **`js/mvp-config.js`** — centralna lista modula sa `tier: core | v2`
- **Beta režim** — v2 moduli u `modules.html` označeni „Dolazi uskoro" (neklikabilni u beta)
- **Landing + uvod** — sekcija „Šta app radi" (3 stavke), bez obećanja v2 funkcija
- **Više (settings)** — MVP rezime na vrhu; „Više alata" tekst prilagođen beta režimu
- **Kupovina (beta)** — sakrivene v2 sekcije (ostava, navike, praćenje cena)
- **Obroci (beta)** — sakrivena ostava-sekcija „Šta mogu da skuvam?"
- **README** — jedna rečenica šta app radi sada + link na MVP obim

### Vizuelni polish — dizajn sistem v7.3
- **Kartice i senke** — konzistentni radius, hover na desktopu, flat list-item zaobljenja
- **Brze akcije** — gradient pozadine po ćeliji, hover lift, 10KEY zelena paleta
- **Donja navigacija** — aktivni tab sa pozadinskim pill-om i indikatorom
- **Hero brifing** — zlatni 10KEY akcent preko gradienta
- **Troškovi** — FAB (+) za brzo dodavanje rashoda
- **Kupovina** — checklist sa borderom, strikethrough i fade za kupljeno
- **Obroci** — kartice dana sa senkom i hover borderom
- **10KEY Savetnik** — chat bubble gradient, zaobljen input bar, status bedž senka
- **Prijava** — forma u auth-card kartici
- **Moduli hub** — hero baner „Osnovni alati — aktivno" / „Dolazi uskoro"
- **Uvod** — progress tačke proširene u pill za aktivni korak
- **Podešavanja** — section kartice sa zelenim levim akcentom
- **Tamna tema** — glatka tranzicija pri prebacivanju (`data-theme-transition`)
- **Mobilno** — safe-area inset, touch min 48px na form inputima
- **UTF-8** — ispravljeno „Sačuvaj trošak" na add-expense stranici
- Service Worker v7.3.0

## [7.2.3] — 2026-07-22

### Prijava i odjava — UX
- **OAuth povratak** — auth stranica prepoznaje callback (hash/query), čisti URL i automatski preusmerava na onboarding ili početnu
- **Gost na auth stranici** — gosti više nisu automatski preusmereni; mogu da se prijave bez gubljenja lokalnih podataka
- **Učitavanje** — dugmad Google/Facebook prikazuju „Sačekajte..." tokom OAuth-a
- **Greške na srpskom** — jasne poruke za isteklu sesiju, mrežu, pogrešne kredencijale i otkazanu prijavu
- **Odjava** — potvrda, stanje učitavanja, čišćenje keša profila/domaćinstva; preusmeravanje na auth stranicu
- Service Worker v7.2.3

## [7.2.2] — 2026-07-22

### OAuth — izbor naloga
- **Google** — `prompt=select_account` pri OAuth prijavi (uvek prikazuje izbor Google naloga)
- **Facebook** — `auth_type=reauthenticate` za ponovnu prijavu drugim nalogom
- **Auth stranica** — napomena za testere kako da promene Google/Facebook nalog u pregledaču
- **Podešavanja** — ista napomena kada korisnik nije prijavljen
- Service Worker v7.2.2

## [7.2.1] — 2026-07-08

### 10KEY Savetnik — primarni proizvod (Opcija 1)
- **Status bedž** — 🧠 „10KEY Savetnik" po defaultu; GPT samo kao „Napredni režim" dodatak
- **Jači lokalni engine** — namera „danas" i „poslednji troškovi"; dinamički brzi chipovi iz podataka
- **Akcije** — linkovi ka Finansijama, Planu obroka, Dodaj trošak
- **Proaktivni welcome** — kućni asistent od 10KEY, bez naglašavanja OpenAI
- **Podešavanja** — vidljiva sekcija 10KEY Savetnik; OpenAI u sklopljenom Napredni režim
- `docs/10key-savetnik-roadmap.md` — Opcija 1 / 2 / 3 (Ollama budućnost)
- Service Worker v7.2.1

## [7.2.0-beta] — 2026-07-08

### Beta režim — pojednostavljen UI
- **`settings.betaMode: true`** po podrazumevanju — novi korisnici vide fokusiranu aplikaciju
- **Donja navigacija (4 taba)** — Početna · Troškovi · Obroci · Više (pun prikaz: + 10KEY Savetnik · Kupovina)
- **Početna** — max 4 brze akcije (trošak, obroci, Savetnik, kupovina); sakriveni zadaci, održavanje, garancije u beta režimu
- **Uvod (3 koraka)** — ime + veličina domaćinstva → budžet (preskoči) → CTA „Dodaj prvi trošak"
- **Više → Alati za dom** — link ka `modules.html` za napredne module (bašta, dnevnik, projekti…)
- **Napredno → Prikaži sve module** — isključuje beta režim za power korisnike
- **10KEY Savetnik** — brending umesto „AI" u navigaciji i modulima
- **Prazna stanja** — CTA dugmad na troškovima i planu obroka
- Service Worker v7.2.0-beta

## [7.1.0] — 2026-07-08

### AI Savetnik — napredna verzija
- **Lokalni savetnik (Tier 1)** — intent engine sa 25+ namera: budžet, kuvanje, održavanje, kupovina, štednja, računi, prognoza
- **Proaktivni welcome** — pozdrav sa brifingom, kasnim servisima, današnjim obrokom i listom za kupovinu
- **GPT-4o streaming (Tier 2)** — tokeni uživo u chatu kada je OpenAI ključ unet
- **Bogat kontekst** — budžet %, top troškovi, održavanje, plan obroka, štednja, mesečni računi u system promptu
- **Status bedž** — „🧠 Lokalni savetnik" vs „✨ GPT-4o povezan"
- **Brzi chipovi** — „Koliko sam potrošio?", „Šta da kuvam danas?", „Šta kasni u kući?"
- **Glasovni unos** — mikrofon u chat baru (Web Speech API)
- **Akcije** — „Dodaj na listu" dugme i linkovi ka modulima
- **OpenAI ključ** — premešten iz skrivenog „Za developere" u vidljivo Napredno → AI asistent
- **Greške na srpskom** — neispravan ključ, rate limit, mreža
- Service Worker v7.1.0

## [7.0.6] — 2026-07-08

### Poboljšano
- **Više (beta cleanup)** — samo 6 jasnih sekcija bez nasumičnih stavki
- **Napredno** — mesečni računi, budžet po kategorijama, reset podataka; dev stavke u sklopljenom „Za developere"
- **Za developere** — sakriveno za beta korisnike kada `config.js` radi (Supabase, AI ključ, export/import, lokalni profili)
- **Uklonjeno iz Naprednog** — duplikat finansija (već u Moj profil), beta email (već u Pomoć), visok kontrast premešten u Izgled
- **Početna** — brze akcije smanjene na 5 osnovnih modula (bez Bašte, Domaćinstva, Vizuelnog)

### Ispravljeno
- **Pregled dana (brifing)** — više ne prikazuje demo/placeholder sadržaj za nove korisnike
- Uklonjeni hardkodirani sezonski saveti i generički podsetnici na početku meseca
- Sezonski poslovi u brifingu samo ako korisnik koristi sezonski modul
- Održavanje se ne auto-seeduje — podsetnici samo za zadatke sa datumom ili ručno dodate
- Cilj štednje u brifingu samo ako korisnik unese naziv i iznos
- Prazno stanje: „Dodajte trošak, račun ili cilj…" sa linkovima umesto lažnih stavki
- Uklonjeni demo zadaci iz podrazumevanih podataka (Plati struju, Kupi mleko…)
- Service Worker v7.0.6

## [7.0.5] — 2026-07-08

### Poboljšano
- **Više tab (settings)** — 6 jasnih sekcija: Ko sam, Moj dom, Moj profil, Kako app radi, Pomoć, O app
- **Uklonjeno iz Više** — brze akcije, modul kartice, Supabase dev UI (kada `config.js` radi), tehnički linkovi
- **Ko sam** — ime, email, odjava, zeleni bedž „☁️ Sinhronizovano" kada je nalog aktivan
- **Moj dom** — link ka porodičnoj sinhronizaciji i pozivnim kodovima
- **Napredno** — finansije, export/import, AI ključ i lokalni profili samo u sklopljenom `<details>`
- Service Worker v7.0.5

## [7.0.4] — 2026-07-08

### Dodato
- **`pages/modules.html`** — svi moduli organizovani po kategorijama (Finansije, AI, Kuća, Kupovina)
- **Brze akcije** na podešavanjima — Porodica, Beta feedback, Moj profil, Svi moduli

### Poboljšano
- **Redizajn podešavanja (Više tab)** — čistiji raspored: Nalog, Brze akcije, Podešavanja, Napredno (sklopljeno), O aplikaciji
- **Supabase config** — sakriven u Naprednom kada `config.js` radi (zamenjeno u v7.0.5 potpunim uklanjanjem iz korisničkog UI-ja)
- **Napredno podešavanje** — Supabase, AI ključ, lokalni profili, budžet, računi, export/import u `<details>` sekciji
- Uklonjeni duplikati (Profil, Aplikacija, 18+ modul kartice), veliki logo na vrhu
- Service Worker v7.0.4 — keš za modules stranicu

## [7.0.3] — 2026-07-08

### Dodato
- **Beta launch paket** — `docs/SETUP-KORAK-PO-KORAK.md` vodič (TI RADIŠ / VEĆ GOTOWO)
- **`docs/supabase-ALL-IN-ONE.sql`** — jedan SQL za profiles, user_data, households i feedback
- **Politika privatnosti** — `pages/privacy.html` (srpski, za Meta/Facebook)
- **Konfigurabilan feedback email** — `settings.contactEmail` ili `config.js CONTACT_EMAIL`
- **Landing footer** — linkovi Privatnost, Feedback, GitHub

### Poboljšano
- **Beta baner na početnoj** — jasniji CTA „Ostavi feedback →", dugme „Ne sada"
- **Podešavanja** — polje za email feedbacka, link na politiku privatnosti
- **README** — link na SETUP-KORAK-PO-KORAK.md
- Service Worker v7.0.3 — keš za privacy stranicu

## [7.0.2] — 2026-07-08

### Dodato
- **Beta feedback** — nova stranica `pages/feedback.html` sa ocenom (1–5 zvezda), komentarima i dnevnom upotrebom
- **Čuvanje feedbacka** — lokalno u `domacinko_feedback`; opciono Supabase tabela `feedback`
- **Početna** — jednokratni baner „Testirate Domaćinko? Ostavite feedback!"
- **Podešavanja** — link „💬 Beta feedback — pomozite nam"
- **mailto fallback** — „Pošalji emailom" sa popunjenim sadržajem
- **docs/supabase-setup.md** — SQL za `feedback` tabelu i RLS politike

### Poboljšano
- Service Worker v7.0.2 — keš za feedback modul

## [7.0.1] — 2026-07-08

### Dodato
- **Javni `config.js` na GitHub Pages** — svi posetioci vide Supabase povezan bez ručnog unosa ključeva
- **docs/supabase-setup.md** — sekcija „Javni config za sve korisnike" (anon ključ je bezbedan za SPA)

### Poboljšano
- **auth.html** — zeleni baner „Supabase povezan" kada je config.js učitan
- **`.gitignore`** — `config.js` više nije ignorisan; samo `config.secret.js` za dodatne tajne

## [7.0.0] — 2026-07-08

### Dodato
- **Porodična sinhronizacija (Supabase)** — `households`, `household_members`, `household_data` tabele
- **Pozovi porodicu** — kreiranje domaćinstva, 6-cifreni pozivni kod, kopiranje
- **Pridruži se domaćinstvu** — unos koda, lista članova, napuštanje
- **Deljeni podaci** — troškovi, kupovina, domaćinstvo, obroci, održavanje, inventar, zadaci
- **Android (Capacitor)** — `package.json`, `capacitor.config.ts`, `docs/android-build.md`
- **docs/known-issues.md** — dokumentacija poznatih problema

### Poboljšano
- **Dizajn sistem v2** — paleta boja, spacing skala, tipografija, senke
- **Donja navigacija** — aktivni indikator, veći touch targeti (48px)
- **Prazna stanja** — veće ikone/emoji, bolji tekst
- **Tamna tema i visok kontrast** — konzistentnije boje
- **Mobilni layout** — `overflow-x: hidden`, responsive slike
- **Početna** — hero brifing i stats red (postojeći stilovi usklađeni)
- **Auth** — čistiji layout sa logotipima
- **Service Worker** v7.0.0 — keš za household-sync modul

### Tehnički
- `js/household-sync.js` — API za porodično deljenje
- `pages/household-share.html` — UI za pozivanje i pridruživanje
- Automatsko učitavanje household-sync na Supabase stranicama
- Lokalni profili i dalje rade offline (fallback)

## [6.5.0] — 2026-07-08

### Dodato
- **24 srpska jela** u planu obroka (ćevapi, gibanica, podvarak, karađorđeva…)
- **Sezonski plan** — proširen checklist za svih 12 meseci (3–4 zadatka/mesec)
- **Kućni magacin** — filteri po kategoriji, banner niske zalihe
- **Dnevnik** — tipovi (popravka/servis/farbanje), filteri po datumu i tipu
- **Baza znanja** — tagovi, filteri po kategoriji, omiljeni (★)
- **Projekti** — procena troška materijala (min–max RSD) po tipu projekta
- **Finansijski trener** — dnevni budžet, % prihoda, kategorijski saveti
- **Glasovni režim** — brifing, održavanje, navigacija, glasovni trošak
- **PWA** — manifest prečica AI Savetnik; install banner (popravljen `initPwaInstallBanner`)
- **Help tooltips** — prošireno na sve module (shopping, diary, seasonal, garden…)

### Poboljšano
- Jutarnji brifing — 20+ scenarija (spike, štednja, sezonski mesec)
- Export/import backup v6.5.0 sa profilima i metapodacima
- AI HTML encoding (ćirilica, emoji), household quick actions
- Meal-plan drag-and-drop CSS, help popover stilovi
- Service Worker v6.5.0 (ui-helpers + help-tooltips u kešu)

## [6.4.0] — 2026-07-08

### Dodato
- **Kontekstualna pomoć** (`js/help-tooltips.js`) — ? ikone sa srpskim objašnjenjima, dismissed tips u localStorage
- **Prošireni jutarnji brifing** — 15+ scenarija (računi, štednja, rođendani, projekti, spike potrošnje, prvi u mesecu)
- **Drag-and-drop plan obroka** — prevlačenje jela između dana, touch podrška, srpski presets
- **Lokalni profili** — „Članovi aplikacije" u Podešavanjima (prefixed localStorage)
- **Mesečni PDF izveštaj** — 10KEY branding, kategorije, health score, trener uvid
- **docs/user-quickstart.md** — vodič za krajnjeg korisnika na srpskom

### Poboljšano
- Offline AI: ključne reči struja, gas, grejanje, kirija, kredit, frižider, veš mašina, bojler, klima
- AI koristi pun kontekst (profil kuće, alati, magacin, troškovi)
- OpenAI API UX u Podešavanjima + link na platform.openai.com
- Supabase sekcija: 3 koraka inline + Facebook napomena
- „Štampaj izveštaj" istaknut na Finansijama
- Lazy loading i dimenzije logotipa

### Tehnički
- Service Worker v6.4.0
- `listLocalProfiles`, `switchLocalProfile`, `addLocalProfile`, `deleteLocalProfile`

## [6.3.0] — 2026-07-07

### Dodato
- **AI kontekst** — profil kuće, magacin, alati, baza znanja u OpenAI promptu
- **Predložena pitanja** po modulu (`MODULE_SUGGESTED_QUESTIONS`)
- **AI Majstor** — direktno čuvanje rešenja u bazu znanja jednim klikom
- **Bašta** — raspored zalivanja, badge-ovi „Zaliti!"/„Uskoro"
- **Bezbednost** — alert baner za istekle stavke
- **Projekti** — upload fotografije (base64, max 500 KB)

### Poboljšano
- Popravljen AI HTML (srpski tekst, emoji, aria labele)
- Lokalni AI odgovori za magacin i ostavu
- Onboarding slide animacije, auth logo fade-in
- Lazy loading logotipa na auth stranici

### Tehnički
- Service Worker v6.3.0
- `getSuggestedQuestions`, prošireni `getAdvisorContext`

## [6.2.0] — 2026-07-07

### Dodato
- **`js/ui-helpers.js`** — deljeni UI: toast tipovi, skeleton loaderi, offline baner, pull-to-refresh, pristupačnost
- **Početna v2** — hero jutarnji brifing, brza statistika (danas/kupovina/održavanje), personalizovani saveti
- **Finansije** — nedeljni pregled potrošnje, trend grafikon (6 meseci), PDF izvoz
- **Profil stranica** (`profile.html`) — uređivanje profila, brisanje naloga
- **Kupovina** — kategorije sa bojama, omiljeni proizvici, upozorenja niske zalihe ostave
- **Plan obroka** — srpska jela presets (pasulj, sarma, musaka...)
- **Dnevnik** — upload fotografija (base64, limit 500 KB)
- **Majstori** — lokalno čuvanje kontakata sa telefonom
- **Vizuelni asistent** — nova pravila za curenje, plavina, bolest biljaka
- **PWA** — manifest prečice (Dodaj trošak, Kupovina), poboljšan SW keš

### Poboljšano
- Page headeri sa 44px touch targetima i aria labelima
- Toast notifikacije sa tipovima (success/error/warning/info)
- Finansijski trener sa trendom i dnevnim prosekom
- Podešavanja: veći tekst, visok kontrast
- Page transitions, focus states, print stylesheet
- README.md za GitHub

### Tehnički
- Service Worker v6.2.0
- `getWeeklySpending`, `getSpendingTrend`, `getPersonalizedTips`, `getTodaySpending`
- `SHOPPING_CATEGORIES`, `SERBIAN_MEAL_PRESETS`, `favoriteProducts`

## [6.1.0] — 2026-07-07

### Dodato
- **Supabase bez config.js** — sekcija „Poveži nalog" u Podešavanjima, čuvanje u localStorage
- **Zaboravljena lozinka** — reset putem emaila na stranici prijave
- **Sačuvaj rešenje** — AI Majstor → Baza znanja (kao vizuelni asistent)
- **Rođendan članova porodice** — polje u Domaćinstvu, prognoza troškova
- **PWA install hint** — baner na početnoj pri prvoj poseti
- **Pristup Podešavanjima pre prijave** — za unos Supabase ključeva na telefonu

### Poboljšano
- Jutarnji brifing koristi ime iz profila kada ste prijavljeni
- Veći touch targeti na auth stranici (48px)
- `docs/supabase-setup.md` — Facebook vodič, login na telefonu
- Prioritet konfiguracije: config.js → localStorage → forma

### Tehnički
- `saveSupabaseConfig`, `resetSupabaseClient`, `getSupabaseConfigSource`
- Service Worker v6.1.0

## [6.0.0] — 2026-07-07

### Dodato — Faza A (jezgro)
- **Profil kuće** (`house-profile.html`) — m², grejanje, tip doma, aparati
- **Jutarnji brifing** — kartica na početnoj, `js/modules/briefing.js`
- **Finansijski trener** — kategorijski uvid i godišnja projekcija uštede
- **Kućni magacin** — sijalice, boja, šrafovi sa pretragom u inventaru

### Dodato — Faza B (AI napredno)
- **Vizuelni asistent** — upload/slikanje, rule-based + OpenAI Vision
- **Prognoza troškova** — kalendar predstojećih rashoda
- **Baza znanja** — čuvanje i pretraga rešenja
- **Inventar alata** — provera dostupnosti za DIY

### Dodato — Faza C (moduli)
- **Dnevnik kuće**, **Sezonski plan**, **Projekti** (materijal + radni nalog)
- **Bezbednost** — detektori, prva pomoć, lekovi
- **Bašta** — biljke, zalivanje, saveti
- **Glasovni režim** — Web Speech API, plutajući mikrofon
- **Pametna kupovina** — prepoznavanje navika, lista praćenja cena
- **Mreža majstora** — placeholder sa orientacionim cenama

### Tehnički
- Prošireni `storage.js`, `registry.js`, `ai-context.js`
- Hub „Svi moduli" u podešavanjima
- Service Worker v6.0.0
- `docs/vision.md` — kompletna vizija na srpskom

## [5.0.0] — 2026-07-07

### Dodato
- **Supabase autentifikacija**: email/lozinka, Google OAuth, Facebook OAuth
- **`pages/auth.html`**: prijava, registracija, društvene mreže, gost režim
- **`js/auth.js`** i **`js/supabase-client.js`**: sesija, profil, OAuth
- **`config.example.js`**: šablon za Supabase URL i anon ključ
- **`docs/supabase-setup.md`**: kompletno uputstvo na srpskom sa SQL šemom
- **Prošireni onboarding (5 koraka)**:
  1. O tebi (ime, primanja, štednja, budžet, cilj) — obavezno
  2. Frižider (namirnice) — opciono, „Preskoči za sada"
  3. Računi — opciono
  4. Automobil — opciono
  5. Gotovo → početna
- **Sinhronizacija**: `profiles` + `user_data` JSONB u Supabase, localStorage keš
- **Podešavanja**: nalog (ime, email), odjava, mesečna primanja, ušteđeno
- Uvoz gost podataka pri prvoj prijavi

### Poboljšano
- Rutiranje: splash → auth → onboarding → početna
- Zaštićene stranice proveravaju auth/gost status
- Service worker v5.0.0

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
