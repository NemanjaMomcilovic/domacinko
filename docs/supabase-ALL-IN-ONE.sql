-- =============================================
-- Domaćinko — SVE U JEDNOM SQL SKRIPTU
-- Pokrenite jednom u Supabase SQL Editoru (Run)
-- Verzija: 7.0.3 (beta launch)
-- =============================================

-- =============================================
-- SEKCIJA 1: Profili i korisnički podaci (v5.0)
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
-- SEKCIJA 2: Row Level Security — osnovne tabele
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "Korisnik vidi svoj profil" ON profiles;
CREATE POLICY "Korisnik vidi svoj profil"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik menja svoj profil" ON profiles;
CREATE POLICY "Korisnik menja svoj profil"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik ažurira svoj profil" ON profiles;
CREATE POLICY "Korisnik ažurira svoj profil"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Household items
DROP POLICY IF EXISTS "Korisnik vidi svoje stavke" ON household_items;
CREATE POLICY "Korisnik vidi svoje stavke"
  ON household_items FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik dodaje stavke" ON household_items;
CREATE POLICY "Korisnik dodaje stavke"
  ON household_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik briše svoje stavke" ON household_items;
CREATE POLICY "Korisnik briše svoje stavke"
  ON household_items FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik menja svoje stavke" ON household_items;
CREATE POLICY "Korisnik menja svoje stavke"
  ON household_items FOR UPDATE
  USING (auth.uid() = user_id);

-- User data
DROP POLICY IF EXISTS "Korisnik vidi svoje podatke" ON user_data;
CREATE POLICY "Korisnik vidi svoje podatke"
  ON user_data FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik čuva svoje podatke" ON user_data;
CREATE POLICY "Korisnik čuva svoje podatke"
  ON user_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Korisnik ažurira svoje podatke" ON user_data;
CREATE POLICY "Korisnik ažurira svoje podatke"
  ON user_data FOR UPDATE
  USING (auth.uid() = user_id);

-- =============================================
-- SEKCIJA 3: Porodična sinhronizacija (v7.0)
-- =============================================

CREATE TABLE IF NOT EXISTS households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Moje domaćinstvo',
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS household_members (
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (household_id, user_id)
);

CREATE TABLE IF NOT EXISTS household_data (
  household_id UUID PRIMARY KEY REFERENCES households(id) ON DELETE CASCADE,
  data JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_household_members_user ON household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_households_invite ON households(invite_code);

ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_data ENABLE ROW LEVEL SECURITY;

-- Households: članovi vide svoje domaćinstvo
DROP POLICY IF EXISTS "Član vidi domaćinstvo" ON households;
CREATE POLICY "Član vidi domaćinstvo"
  ON households FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
        AND household_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Korisnik kreira domaćinstvo" ON households;
CREATE POLICY "Korisnik kreira domaćinstvo"
  ON households FOR INSERT
  WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Vlasnik menja domaćinstvo" ON households;
CREATE POLICY "Vlasnik menja domaćinstvo"
  ON households FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
        AND household_members.user_id = auth.uid()
        AND household_members.role = 'owner'
    )
  );

DROP POLICY IF EXISTS "Vlasnik briše domaćinstvo" ON households;
CREATE POLICY "Vlasnik briše domaćinstvo"
  ON households FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = households.id
        AND household_members.user_id = auth.uid()
        AND household_members.role = 'owner'
    )
  );

-- Članovi: svi vide članove svog domaćinstva
DROP POLICY IF EXISTS "Član vidi članove" ON household_members;
CREATE POLICY "Član vidi članove"
  ON household_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
        AND hm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Korisnik se pridružuje" ON household_members;
CREATE POLICY "Korisnik se pridružuje"
  ON household_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Član napušta domaćinstvo" ON household_members;
CREATE POLICY "Član napušta domaćinstvo"
  ON household_members FOR DELETE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Vlasnik menja uloge" ON household_members;
CREATE POLICY "Vlasnik menja uloge"
  ON household_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM household_members hm
      WHERE hm.household_id = household_members.household_id
        AND hm.user_id = auth.uid()
        AND hm.role = 'owner'
    )
  );

-- Zajednički podaci domaćinstva
DROP POLICY IF EXISTS "Član čita podatke domaćinstva" ON household_data;
CREATE POLICY "Član čita podatke domaćinstva"
  ON household_data FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_data.household_id
        AND household_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Član čuva podatke domaćinstva" ON household_data;
CREATE POLICY "Član čuva podatke domaćinstva"
  ON household_data FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_data.household_id
        AND household_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Član ažurira podatke domaćinstva" ON household_data;
CREATE POLICY "Član ažurira podatke domaćinstva"
  ON household_data FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM household_members
      WHERE household_members.household_id = household_data.household_id
        AND household_members.user_id = auth.uid()
    )
  );

-- Profili: članovi vide imena drugih članova domaćinstva
DROP POLICY IF EXISTS "Član vidi profile članova domaćinstva" ON profiles;
CREATE POLICY "Član vidi profile članova domaćinstva"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM household_members hm1
      JOIN household_members hm2 ON hm1.household_id = hm2.household_id
      WHERE hm1.user_id = auth.uid() AND hm2.user_id = profiles.user_id
    )
  );

-- =============================================
-- SEKCIJA 4: Beta feedback (v7.0.2+)
-- =============================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  likes TEXT,
  improvements TEXT,
  would_use_daily TEXT,
  name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback(created_at DESC);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Prijavljeni korisnici mogu slati feedback
DROP POLICY IF EXISTS "Prijavljeni šalju feedback" ON feedback;
CREATE POLICY "Prijavljeni šalju feedback"
  ON feedback FOR INSERT
  TO authenticated
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Anonimni beta feedback (bez naloga)
DROP POLICY IF EXISTS "Anonimni beta feedback" ON feedback;
CREATE POLICY "Anonimni beta feedback"
  ON feedback FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

-- Napomena: nema SELECT politike za korisnike — feedback čitate u Table Editoru
-- ili preko service_role ključa (nikad u frontend kodu!)

-- =============================================
-- GOTOVO — proverite tabele u Table Editoru:
-- profiles, household_items, user_data,
-- households, household_members, household_data, feedback
-- =============================================
