# Domaćinko — Brzi vodič za korisnike

**Verzija 6.5.0** · Srpski · PWA aplikacija za domaćinstvo

---

## Šta je Domaćinko?

Domaćinko je besplatan AI pomoćnik za vaše domaćinstvo — prati troškove, kupovinu, održavanje, popravke i više. Radi u pregledaču i može se instalirati na telefon kao aplikacija (PWA).

Podaci se čuvaju na vašem uređaju. Opciono možete povezati nalog preko Supabase da sinhronizujete podatke između telefona i računara.

---

## Prvi koraci

1. **Otvorite aplikaciju** — `index.html` ili GitHub Pages link
2. **Prođite uvod** — onboarding (5 koraka, možete preskočiti opcione delove)
3. **Postavite budžet** — Podešavanja → Mesečni budžet i cilj štednje
4. **Dodajte prvi trošak** — Početna → Dodaj trošak
5. **Instalirajte PWA** — baner na početnoj ili „Dodaj na početni ekran" u browseru

---

## Glavni moduli

| Modul | Gde | Šta radi |
|-------|-----|----------|
| 🏠 Početna | Donja navigacija | Jutarnji brifing, finansijsko zdravlje, brze akcije |
| 💰 Finansije | Donja navigacija | Troškovi, grafikoni, finansijski trener |
| 🤖 AI | Donja navigacija | Savetnik, Majstor, Učitelj |
| 🛒 Kupovina | Donja navigacija | Lista, kategorije, omiljeni proizvodi |
| ⚙️ Više | Donja navigacija | Svi moduli, podešavanja, backup |

### Dodatni moduli (Više → Svi moduli)

- **Plan obroka** — prevucite srpska jela na dane, generišite listu za kupovinu
- **Kućni magacin** — sijalice, boja, šrafovi sa upozorenjem niske zalihe
- **Dnevnik kuće** — popravke i servisi sa fotografijom i filterima
- **Sezonski plan** — checklist za svih 12 meseci
- **Projekti** — DIY sa listom materijala i procenom troška
- **Baza znanja** — sačuvana rešenja sa tagovima i omiljenim
- **Vizuelni asistent** — slikajte problem, dobijte savet
- **Bašta, Bezbednost, Majstori** — sezonski i hitni podsetnici

---

## Jutarnji brifing

Svakog jutra na početnoj vidite personalizovan pregled:

- Budžet i potrošnja
- Računi koji čekaju plaćanje
- Održavanje na redu
- Niska zaliha u ostavi i magacinu
- Rođendani i projekti
- Sezonski saveti za tekući mesec

---

## AI — sa i bez OpenAI ključa

| Funkcija | Bez ključa | Sa OpenAI ključem |
|----------|------------|-------------------|
| AI Savetnik | ✅ Lokalni odgovori | ✅ Pametniji odgovori |
| AI Majstor | ✅ Korak-po-korak pravila | ✅ Detaljniji saveti |
| Vizuelni asistent | ✅ Pravila po tipu problema | ✅ Analiza slike |
| Glasovni režim | ✅ Osnovne komande | — |

**OpenAI ključ** unesite u: Podešavanja → AI asistent. Ključ ostaje samo na vašem uređaju.

---

## Sinhronizacija naloga (opciono)

1. Napravite projekat na [supabase.com](https://supabase.com)
2. Podešavanja → Poveži nalog → unesite URL i anon ključ
3. Prijavite se emailom ili Google/Facebook nalogom

Detaljno uputstvo: [docs/supabase-setup.md](supabase-setup.md)

---

## Backup i sigurnost podataka

- **Izvezi podatke** — Podešavanja → Podaci → JSON backup
- **Uvezi podatke** — vraćanje sa drugog uređaja ili nakon greške
- **Reset** — briše sve lokalne podatke (neopozivo!)

Preporuka: izvezite backup jednom mesečno.

---

## PWA — instalacija na telefon

**Android (Chrome):** Baner „Instaliraj" na početnoj ili meni → Instaliraj aplikaciju

**iPhone (Safari):** Podeli → Dodaj na početni ekran

Prečice sa početnog ekrana: Dodaj trošak, Kupovina, AI Savetnik

---

## Glasovne komande

Dodirnite plutajući mikrofon 🎤 i recite:

- „Domaćinko, koliko sam potrošio?"
- „Dodaj mleko" (na listu za kupovinu)
- „Jutarnji brifing"
- „Koliko imam na budžetu?"
- „Imam li sijalice?" (pretraga magacina)
- „Podseti me da platim struju"

---

## Pomoć (?)

Na većini stranica videćete **?** pored naslova — dodirnite za objašnjenje funkcije.

---

## Podrška i predlozi

- **Podešavanja → Pošalji predlog** — vaš komentar se čuva lokalno i kopira u clipboard
- **GitHub:** [github.com/NemanjaMomcilovic/domacinko](https://github.com/NemanjaMomcilovic/domacinko)

---

*Powered by [10KEY](https://github.com/NemanjaMomcilovic/domacinko) — pametni alati za svakodnevni život.*
