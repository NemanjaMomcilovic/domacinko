# Domaćinko — Supabase podešavanje

Ovaj vodič objašnjava kako da podesite Supabase backend za autentifikaciju i sinhronizaciju podataka u Domaćinku. Aplikacija radi i bez Supabase-a u **gost režimu** (samo localStorage).

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

> **Napomena:** `config.js` je u `.gitignore` i neće biti na GitHub-u. Za GitHub Pages deploy, možete ručno dodati `config.js` na server ili koristiti GitHub Actions secret.

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

### Facebook OAuth

1. Idite na [Meta for Developers](https://developers.facebook.com/)
2. Kreirajte aplikaciju → dodajte **Facebook Login**
3. U **Valid OAuth Redirect URIs** dodajte isti Supabase callback URL:
   `https://VAS-PROJECT-ID.supabase.co/auth/v1/callback`
4. Kopirajte **App ID** i **App Secret** u Supabase Facebook provider
5. Uključite Facebook provider u Supabase

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

## 6. Testiranje lokalno

```powershell
cd C:\Users\pc\10KEY\domacinko
python -m http.server 8080
```

Otvorite: http://localhost:8080/pages/auth.html

1. Registrujte se emailom ili kliknite **Nastavi sa Google**
2. Prođite onboarding (5 koraka)
3. Proverite u Supabase **Table Editor** → `profiles` i `user_data`

---

## 7. Gost režim (bez Supabase)

Ako `config.js` nije podešen, aplikacija prikazuje upozorenje i nudi **Nastavi kao gost**. Podaci ostaju samo u localStorage na tom uređaju.

---

## 8. Sinhronizacija podataka

| Podatak | Gde se čuva |
|---------|-------------|
| Ime, primanja, štednja, ciljevi | `profiles` tabela |
| Frižider, računi, auto (onboarding) | `household_items` + lokalno u `household` |
| Troškovi, kupovina, održavanje, inventar | `user_data.data` JSONB + localStorage keš |

Pri prijavi, ako postoje gost podaci na uređaju, aplikacija nudi uvoz u nalog.

---

## 9. Rešavanje problema

| Problem | Rešenje |
|---------|---------|
| „Supabase nije podešen" | Proverite `config.js` i osvežite stranicu |
| Google/Facebook ne radi | Proverite Redirect URLs u Supabase i provider dashboardu |
| „Profil nije učitan" | Pokrenite SQL šemu iz koraka 3 |
| Podaci se ne sinhronizuju | Proverite RLS politike i da ste prijavljeni (ne gost) |
| Email potvrda | Proverite inbox ili isključite confirm u Supabase za dev |

---

**Domaćinko v5.0** — Powered by [10KEY](https://github.com/NemanjaMomcilovic/domacinko)
