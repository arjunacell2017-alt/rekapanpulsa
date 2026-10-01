CREATE TABLE public.rekonsiliasi_saldo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL DEFAULT public.current_client_id() REFERENCES public.clients(id) ON DELETE CASCADE,
  tanggal date NOT NULL DEFAULT CURRENT_DATE,
  jenis text NOT NULL CHECK (jenis IN ('supplier','harta')),
  saldo_kemarin numeric NOT NULL DEFAULT 0,
  penambahan numeric NOT NULL DEFAULT 0 CHECK (penambahan >= 0),
  pemakaian numeric NOT NULL DEFAULT 0 CHECK (pemakaian >= 0),
  saldo_aktual numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, tanggal, jenis)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rekonsiliasi_saldo TO authenticated;
GRANT ALL ON public.rekonsiliasi_saldo TO service_role;
ALTER TABLE public.rekonsiliasi_saldo ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Client kelola rekonsiliasi miliknya" ON public.rekonsiliasi_saldo FOR ALL TO authenticated
  USING (client_id = public.current_client_id()) WITH CHECK (client_id = public.current_client_id());
CREATE POLICY "Admin baca rekonsiliasi" ON public.rekonsiliasi_saldo FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX idx_rekonsiliasi_client ON public.rekonsiliasi_saldo(client_id, jenis, tanggal DESC);

CREATE OR REPLACE FUNCTION public.set_client_id_from_session()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    NEW.client_id := public.current_client_id();
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.set_client_id_from_session() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER trg_rekonsiliasi_client BEFORE INSERT OR UPDATE ON public.rekonsiliasi_saldo
  FOR EACH ROW EXECUTE FUNCTION public.set_client_id_from_session();
CREATE TRIGGER trg_rekonsiliasi_updated BEFORE UPDATE ON public.rekonsiliasi_saldo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();