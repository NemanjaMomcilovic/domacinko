# Domaćinko — Supabase podešavanje

Ovaj vodič objašnjava kako da podesite Supabase backend za autentifikaciju i sinhronizaciju podataka u Domaćinku. Aplikacija radi i bez Supabase-a u **gost režimu** (samo localStorage).

---

## Brzi pregled — tri načina konfiguracije

| Način | Kada koristiti | Prioritet |
|-------|----------------|-----------|
| **`config.js`** | Lokalni razvoj na računaru | 1 (najviši) |
| **Podešavanja → Poveži nalog** | GitHub Pages, telefon, tablet | 2 |
| **Gost režim** | Bez naloga, samo na jednom uređaju | — |

Ključevi se **nikada ne šalju na GitHub** — `config.js` je u `.gitignore`, a localStorage ostaje na vašem uređaju.

---

## 1. Kreirajte Supabase projekat

1. Idite na [supabase.com](https://supabase.com) i napravite besplatan nalog.
2. Kliknite **New project**.
3. Izaberite organizaciju, unesite ime (npr. `domacinko`), lozinku baze i region (npr. Frankfurt).
4. Sačekajte da se projekat kreira (~2 min).

---

## 2. Uzmite API ključeve

1. U Supabase dashboardu: **Project Settings** → **API**.
2. Kopirajte:
   - **Project URL** (npr. `https://abcdefgh.supabase.co`)
   - **anon public** ključ (počinje sa `eyJ...`)

3. U folderu Domaćinko kopirajte primer konfiguracije:

```powershell
copy config.example.js config.js
```

4. Otvorite `config.js` i zamenite vrednosti:

```javascript
window.DOMACINKO_CONFIG = {
  SUPABASE_URL: 'https://VAS-PROJECT-ID.supabase.co',
  SUPABASE_ANON_KEY: 'vas-anon-kljuc'
};
```

> **Napomena:** `config.js` je u `.gitignore` i neće biti na GitHub-u.

### Način B — Podešavanja u aplikaciji (preporučeno za telefon)

Idealno za **GitHub Pages** i mobilne uređaje gde ne možete dodati `config.js`:

1. Otvorite Domaćinko u pregledaču
2. Idite na **Podešavanja** (⚙️ Više) — dostupno i pre prijave ako Supabase nije podešen
3. Sekcija **„Poveži nalog (Supabase)"**
4. Nalepite **Project URL** i **anon public** ključ
5. Kliknite **Sačuvaj ključeve**
6. Vratite se na **Prijava** i registrujte se ili se prijavite

Ključevi se čuvaju u `localStorage` (`domacinko_supabase_config`) samo na tom uređaju.

---

## 3. Pokrenite SQL šemu

U Supabase dashboardu idite na **SQL Editor** → **New query**, nalepite sledeći SQL i kliknite **Run**:

```sql
-- =============================================
-- Domaćinko v5.0 — Supabase šema
-- =============================================

-- Profil korisnika
CREATE TABLE IF NOT EXISTS profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT DEFAULT '',
  last_name TEXT DEFAULT '',
  email TEXT DEFAULT '',
  monthly_income NUMERIC DEFAULT 0,
  current_savings NUMERIC DEFAULT 0,
  savings_goal NUMERIC DEFAULT 10000,
  savings_goal_name TEXT DEFAULT '',
  monthly_budget NUMERIC DEFAULT 80000,
  currency TEXT DEFAULT 'RSD',
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stavke domaćinstva (frižider, računi, auto, ljubimci...)
CREATE TABLE IF NOT EXISTS household_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_household_items_user ON household_items(user_id);
CREATE INDEX IF NOT EXISTS idx_household_items_type ON household_items(user_id, type);

-- Puna stanja aplikacije (troškovi, kupovina, održavanje...)
CREATE TABLE IF NOT EXISTS user_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatsko kreiranje profila pri registraciji
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Korisnik vidi svoj profil"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Korisnik menja svoj profil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Korisnik ažurira svoj profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Household items
CREATE POLICY "Korisnik vidi svoje stavke"
  ON household_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Korisnik dodaje stavke"
  ON household_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Korisnik briše svoje stavke"
  ON household_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Korisnik menja svoje stavke"
  ON household_items FOR UPDATE
  USING (auth.uid() = user_id);

-- User data
CREATE POLICY "Korisnik vidi svoje podatke"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Korisnik čuva svoje podatke"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Korisnik ažurira svoje podatke"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);
```

---

## 4. Podesite autentifikaciju

### Email + lozinka

Podrazumevano je uključeno u Supabase.

1. **Authentication** → **Providers** → **Email**
2. Uključite **Enable Email Signup**
3. Za razvoj možete isključiti **Confirm email** (za produkciju ostavite uključeno)

### Google OAuth

1. Idite na [Google Cloud Console](https://console.cloud.google.com/)
2. Kreirajte projekat → **APIs & Services** → **Credentials**
3. **Create Credentials** → **OAuth client ID** → tip **Web application**
4. **Authorized redirect URIs** — dodajte URL iz Supabase-a:
   - U Supabase: **Authentication** → **Providers** → **Google** → kopirajte **Callback URL**
   - Tipično: `https://VAS-PROJECT-ID.supabase.co/auth/v1/callback`
5. Kopirajte **Client ID** i **Client Secret** u Supabase Google provider
6. Uključite Google provider u Supabase

### Facebook OAuth (kompletno uputstvo)

Facebook prijava zahteva Meta Developer nalog i podešavanje u dva mesta: Meta i Supabase.

#### Korak 1 — Meta for Developers

1. Idite na [developers.facebook.com](https://developers.facebook.com/) i prijavite se
2. **My Apps** → **Create App**
3. Tip aplikacije: **Consumer** ili **None** (zavisi od verzije Meta konzole)
4. Unesite ime aplikacije (npr. `Domaćinko`) i kontakt email
5. Na dashboardu aplikacije kliknite **Add Product** → **Facebook Login** → **Set Up**
6. Izaberite platformu **Web**
7. U **Site URL** unesite URL vaše aplikacije:
   - Lokalno: `http://localhost:8080`
   - GitHub Pages: `https://VASE-KORISNICKO-IME.github.io`

#### Korak 2 — Valid OAuth Redirect URI

1. U Meta konzoli: **Facebook Login** → **Settings**
2. U polje **Valid OAuth Redirect URIs** dodajte **Supabase callback URL**:
   ```
   https://VAS-PROJECT-ID.supabase.co/auth/v1/callback
   ```
   (Kopirajte tačan URL iz Supabase: **Authentication** → **Providers** → **Facebook**)
3. Sačuvajte promene

#### Korak 3 — Supabase Facebook provider

1. U Supabase: **Authentication** → **Providers** → **Facebook**
2. Uključite provider (**Enable Sign in with Facebook**)
3. Unesite **Facebook App ID** i **App Secret** iz Meta konzole:
   - Meta: **App Settings** → **Basic** → App ID i App Secret
4. Sačuvajte

#### Korak 4 — App Mode (važno!)

- Dok testirate, Meta aplikacija može biti u **Development** modu — samo **test korisnici** mogu da se prijave
- Da bi svi korisnici mogli: prebacite aplikaciju u **Live** mod u Meta konzoli
- Za Live mod često treba **Privacy Policy URL** i **App Icon**

#### Korak 5 — Testiranje

1. Otvorite `pages/auth.html`
2. Kliknite **Nastavi sa Facebook**
3. Dozvolite pristup u Facebook prozoru
4. Trebalo bi da budete preusmereni nazad u Domaćinko, prijavljeni

**Česte greške:**
- `URL Blocked` — redirect URI nije dodat u Meta konzoli
- `App Not Setup` — Facebook Login produkt nije dodat
- Samo vi možete da se prijavite — aplikacija je u Development modu

---

## 5. Redirect URL za GitHub Pages

U Supabase: **Authentication** → **URL Configuration**

Dodajte u **Redirect URLs**:

```
https://VASE-KORISNICKO-IME.github.io/domacinko/pages/auth.html
http://localhost:8080/pages/auth.html
```

Zamenite `VASE-KORISNICKO-IME` sa vašim GitHub korisničkim imenom.

**Site URL** postavite na:
```
https://VASE-KORISNICKO-IME.github.io/domacinko/
```

---

## 6. Login na telefonu (GitHub Pages)

Kada koristite Domaćinko sa telefona preko GitHub Pages-a, **ne možete** dodati `config.js` u repozitorijum (bezbednosni rizik). Umesto toga:

### Opcija A — Ključevi u Podešavanjima (preporučeno)

1. Otvorite aplikaciju u Chrome/Safari na telefonu
2. **Podešavanja** → **Poveži nalog (Supabase)**
3. Nalepite URL i anon ključ iz Supabase dashboarda
4. **Sačuvaj ključeve**
5. **Prijava** → email ili Google/Facebook

### Opcija B — `config.js` lokalno

Samo za razvoj na računaru (`python -m http.server`). Ne commitujte `config.js`!

### Instalacija na početni ekran (PWA)

1. U Chrome: meni ⋮ → **Dodaj na početni ekran**
2. U Safari: Share → **Add to Home Screen**
3. Domaćinko će raditi kao aplikacija sa podsetnicima

### Reset lozinke

Na stranici prijave kliknite **Zaboravili ste lozinku?** — stiže email sa linkom za novu lozinku.

---

## 7. Testiranje lokalno

```powershell
cd C:\Users\pc\10KEY\domacinko
python -m http.server 8080
```

Otvorite: http://localhost:8080/pages/auth.html

1. Registrujte se emailom ili kliknite **Nastavi sa Google**
2. Prođite onboarding (5 koraka)
3. Proverite u Supabase **Table Editor** → `profiles` i `user_data`

---

## 8. Gost režim (bez Supabase)

Ako Supabase nije podešen (nema `config.js` ni ključeva u podešavanjima), aplikacija prikazuje upozorenje i nudi **Nastavi kao gost**. Podaci ostaju samo u localStorage na tom uređaju.

---

## 9. Sinhronizacija podataka

| Podatak | Gde se čuva |
|---------|-------------|
| Ime, primanja, štednja, ciljevi | `profiles` tabela |
| Frižider, računi, auto (onboarding) | `household_items` + lokalno u `household` |
| Troškovi, kupovina, održavanje, inventar | `user_data.data` JSONB + localStorage keš |

Pri prijavi, ako postoje gost podaci na uređaju, aplikacija nudi uvoz u nalog.

---

## 10. Rešavanje problema

| Problem | Rešenje |
|---------|---------|
| „Supabase nije podešen" | Unesite ključeve u Podešavanjima ili proverite `config.js` |
| Google/Facebook ne radi | Proverite Redirect URLs u Supabase i provider dashboardu |
| Facebook — samo ja mogu da se prijavim | Meta app je u Development modu — dodajte test korisnike ili prebacite u Live |
| „Profil nije učitan" | Pokrenite SQL šemu iz koraka 3 |
| Podaci se ne sinhronizuju | Proverite RLS politike i da ste prijavljeni (ne gost) |
| Email potvrda | Proverite inbox ili isključite confirm u Supabase za dev |
| Reset lozinke ne stiže | Proverite spam; u Supabase: Authentication → Email Templates |

---

**Domaćinko v6.1.0** — Powered by [10KEY](https://github.com/NemanjaMomcilovic/domacinko)
