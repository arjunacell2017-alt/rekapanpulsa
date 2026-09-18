-- ROLES ENUM
CREATE TYPE public.app_role AS ENUM ('admin', 'client');

-- CLIENTS (TENANTS)
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kode text NOT NULL UNIQUE,
  nama text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama text,
  email text,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- SECURITY DEFINER HELPERS
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.client_id
  FROM public.profiles p
  JOIN public.clients c ON c.id = p.client_id
  WHERE p.id = auth.uid() AND c.status = 'active'
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_clients_updated BEFORE UPDATE ON public.clients
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- POLICIES: clients
CREATE POLICY "Admin kelola semua client" ON public.clients
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Client lihat datanya sendiri" ON public.clients
FOR SELECT TO authenticated
USING (id = public.current_client_id());

-- POLICIES: profiles
CREATE POLICY "Admin kelola semua profil" ON public.profiles
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Profil sendiri dapat dibaca" ON public.profiles
FOR SELECT TO authenticated
USING (id = auth.uid());

-- POLICIES: user_roles
CREATE POLICY "Role sendiri dapat dibaca" ON public.user_roles
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- MULTI TENANT COLUMNS ON EXISTING TABLES
ALTER TABLE public.supplier ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.harta2 ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;
ALTER TABLE public.rekap_harian ADD COLUMN client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE;

-- SEED FIRST CLIENT AND MIGRATE EXISTING DATA
INSERT INTO public.clients (kode, nama, status) VALUES ('CLIENT_001', 'Server Pulsa A', 'active');

UPDATE public.supplier SET client_id = (SELECT id FROM public.clients WHERE kode = 'CLIENT_001') WHERE client_id IS NULL;
UPDATE public.harta2 SET client_id = (SELECT id FROM public.clients WHERE kode = 'CLIENT_001') WHERE client_id IS NULL;
UPDATE public.rekap_harian SET client_id = (SELECT id FROM public.clients WHERE kode = 'CLIENT_001') WHERE client_id IS NULL;

ALTER TABLE public.supplier ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE public.harta2 ALTER COLUMN client_id SET NOT NULL;
ALTER TABLE public.rekap_harian ALTER COLUMN client_id SET NOT NULL;

CREATE INDEX idx_supplier_client ON public.supplier(client_id);
CREATE INDEX idx_harta2_client ON public.harta2(client_id);
CREATE INDEX idx_rekap_client ON public.rekap_harian(client_id);

-- REPLACE PUBLIC POLICIES WITH TENANT ISOLATION
DROP POLICY IF EXISTS "supplier akses publik" ON public.supplier;
DROP POLICY IF EXISTS "harta2 akses publik" ON public.harta2;
DROP POLICY IF EXISTS "rekap akses publik" ON public.rekap_harian;

REVOKE ALL ON public.supplier FROM anon;
REVOKE ALL ON public.harta2 FROM anon;
REVOKE ALL ON public.rekap_harian FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harta2 TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rekap_harian TO authenticated;
GRANT ALL ON public.supplier TO service_role;
GRANT ALL ON public.harta2 TO service_role;
GRANT ALL ON public.rekap_harian TO service_role;

CREATE POLICY "Client kelola supplier miliknya" ON public.supplier
FOR ALL TO authenticated
USING (client_id = public.current_client_id())
WITH CHECK (client_id = public.current_client_id());

CREATE POLICY "Admin baca supplier" ON public.supplier
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Client kelola harta miliknya" ON public.harta2
FOR ALL TO authenticated
USING (client_id = public.current_client_id())
WITH CHECK (client_id = public.current_client_id());

CREATE POLICY "Admin baca harta" ON public.harta2
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Client kelola rekap miliknya" ON public.rekap_harian
FOR ALL TO authenticated
USING (client_id = public.current_client_id())
WITH CHECK (client_id = public.current_client_id());

CREATE POLICY "Admin baca rekap" ON public.rekap_harian
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- UNIQUE REKAP PER CLIENT PER DATE
CREATE UNIQUE INDEX IF NOT EXISTS idx_rekap_client_tanggal ON public.rekap_harian(client_id, tanggal);