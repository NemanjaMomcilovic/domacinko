# Domaćinko — Beta launch: korak po korak

Vodič za pokretanje **friend beta** verzije Domaćinka. Podeljen je na ono što je već urađeno u kodu i ono što **ti ručno** radiš u Supabase-u i na telefonu.

**Aplikacija:** https://nemanjamomcilovic.github.io/domacinko/

---

## VEĆ GOTOWO (u repozitorijumu)

Ovo je već implementirano — ne moraš da pišeš kod:

| Šta | Gde |
|-----|-----|
| Supabase URL i anon ključ | `config.js` (javno, bezbedno za SPA) |
| Beta feedback stranica | `pages/feedback.html` — ocena, komentari, Supabase + lokalno |
| Baner na početnoj | „Beta tester? Ostavite feedback" sa CTA i dismiss |
| Porodična sinhronizacija | `household-share.html`, pozivni kod |
| Politika privatnosti | `pages/privacy.html` (za Meta/Facebook) |
| Kombinovani SQL | `docs/supabase-ALL-IN-ONE.sql` — jedan Run u SQL Editoru |
| Email za feedback | Podrazumevano `feedback@10key.app`; menja se u **Podešavanja → Beta testiranje** |
| Footer linkovi | `landing.html` — Privatnost, Feedback, GitHub |
| Service Worker | Offline keš, verzija u `sw.js` |

---

## TI RADIŠ

### 1. Supabase SQL — pokreni kombinovani skript

1. Otvori [Supabase Dashboard](https://supabase.com/dashboard) → tvoj projekat **domacinko**
2. Levi meni: **SQL Editor** → **New query**
3. Otvori fajl `docs/supabase-ALL-IN-ONE.sql` iz repozitorijuma
4. Kopiraj **ceo** sadržaj i nalepi u editor
5. Klikni **Run** (ili Ctrl+Enter)
6. Proveri: **Table Editor** → treba da vidiš tabele: `profiles`, `user_data`, `households`, `household_members`, `household_data`, `feedback`

> **Screenshot hint:** Snimi ekran sa zelenim „Success" i listom tabela u Table Editoru — korisno za proveru kasnije.

Ako si ranije pokretao pojedinačne skripte, ovaj fajl je bezbedan za ponovno pokretanje (`IF NOT EXISTS`, `DROP POLICY IF EXISTS`).

---

### 2. Supabase Email — isključi potvrdu za beta

Da prijatelji odmah mogu da se registruju bez čekanja emaila:

1. Supabase → **Authentication** → **Providers** → **Email**
2. Uključi **Enable Email Signup**
3. **Isključi** opciju **Confirm email** (samo za beta period!)
4. Sačuvaj

> **Screenshot hint:** Snimi Email provider sa „Confirm email" isključenim.

Za produkciju posle bete ponovo uključi potvrdu emaila.

**Redirect URLs** (ako već nisu):

- **Authentication** → **URL Configuration**
- **Site URL:** `https://nemanjamomcilovic.github.io/domacinko/`
- **Redirect URLs:** dodaj  
  `https://nemanjamomcilovic.github.io/domacinko/pages/auth.html`

---

### 3. Facebook OAuth (opciono)

Potrebno samo ako želiš „Nastavi sa Facebook" na prijavi. Detaljno uputstvo:

→ [docs/supabase-setup.md — Facebook OAuth](supabase-setup.md#facebook-oauth-kompletno-uputstvo)

**Minimum za Meta Live mod:**

- **Privacy Policy URL:**  
  `https://nemanjamomcilovic.github.io/domacinko/pages/privacy.html`
- **Site URL** u Meta konzoli: GitHub Pages adresa iznad
- **Valid OAuth Redirect URI:**  
  `https://rymphibbelkzdxchhfsm.supabase.co/auth/v1/callback`  
  (proveri tačan URL u Supabase → Authentication → Facebook)

---

### 4. Test na telefonu — checklist

Otvori na telefonu: https://nemanjamomcilovic.github.io/domacinko/

- [ ] Stranica se učitava (zeleni „Supabase povezan" na prijavi)
- [ ] Registracija emailom radi **bez** potvrde inboxa
- [ ] Onboarding (5 koraka) → početna
- [ ] Dodaj jedan trošak → vidi se na Finansijama
- [ ] Beta baner na početnoj → **Ostavi feedback** → pošalji ocenu
- [ ] Podešavanja → **Beta feedback** radi
- [ ] (Opciono) Podešavanja → Pozovi porodicu → kopiraj kod
- [ ] Chrome: ⋮ → **Dodaj na početni ekran** (PWA)
- [ ] Safari iOS: Share → **Add to Home Screen**

Ako nešto ne radi: osveži stranicu, proveri da li je SQL pokrenut, pogledaj [docs/supabase-setup.md](supabase-setup.md) sekciju 10.

---

### 5. Poruka za prijatelje (kopiraj i pošalji)

```
Ćao! Testiram Domaćinko — besplatnu app za domaćinstvo (budžet, kupovina, AI saveti).

🔗 https://nemanjamomcilovic.github.io/domacinko/

1. Otvori link na telefonu
2. Registruj se (email + lozinka)
3. Prođi kratak uvod
4. Probaj 2–3 dana — dodaj trošak, listu za kupovinu
5. Ostavi feedback u appu (Početna → baner ili Podešavanja → Beta feedback)

Hvala! 🏡
```

---

### 6. Kako čitati feedback u Supabase

1. Supabase Dashboard → **Table Editor**
2. Izaberi tabelu **`feedback`**
3. Sortiraj po **`created_at`** (najnovije gore)
4. Kolone: `rating`, `likes`, `improvements`, `would_use_daily`, `name`, `email`

**SQL upit** (opciono, u SQL Editoru):

```sql
SELECT created_at, rating, would_use_daily, likes, improvements, name, email
FROM feedback
ORDER BY created_at DESC
LIMIT 50;
```

Feedback se čuva i **lokalno** na uređaju korisnika (`domacinko_feedback` u localStorage) — Supabase je glavni izvor za beta pregled.

**Email fallback:** ako Supabase insert ne uspe, korisnik može **Pošalji emailom** — stiže na adresu iz Podešavanja (`contactEmail`, podrazumevano `feedback@10key.app`).

---

## Podešavanje emaila za feedback (opciono)

U aplikaciji: **Podešavanja → Beta testiranje → Email za feedback**

Ili u `config.js`:

```javascript
window.DOMACINKO_CONFIG = {
  SUPABASE_URL: '...',
  SUPABASE_ANON_KEY: '...',
  CONTACT_EMAIL: 'tvoj@email.com'
};
```

Prioritet: `settings.contactEmail` → `config.js CONTACT_EMAIL` → `feedback@10key.app`

---

## Brza referenca

| Dokument | Svrha |
|----------|--------|
| [SETUP-KORAK-PO-KORAK.md](SETUP-KORAK-PO-KORAK.md) | Ovaj vodič (beta launch) |
| [supabase-ALL-IN-ONE.sql](supabase-ALL-IN-ONE.sql) | Jedan SQL za celu bazu |
| [supabase-setup.md](supabase-setup.md) | Detaljno Supabase + OAuth |
| [user-quickstart.md](user-quickstart.md) | Za krajnje korisnike |

---

**Domaćinko v7.0.3** — Powered by [10KEY](https://github.com/NemanjaMomcilovic/domacinko)
