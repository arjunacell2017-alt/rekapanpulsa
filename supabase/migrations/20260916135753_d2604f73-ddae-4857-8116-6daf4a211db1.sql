CREATE TABLE public.supplier (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL DEFAULT current_date,
  nama text NOT NULL,
  qty numeric NOT NULL DEFAULT 1,
  jumlah numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.supplier TO anon, authenticated;
GRANT ALL ON public.supplier TO service_role;
ALTER TABLE public.supplier ENABLE ROW LEVEL SECURITY;
CREATE POLICY "supplier akses publik" ON public.supplier FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.harta2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL DEFAULT current_date,
  keterangan text NOT NULL,
  qty numeric NOT NULL DEFAULT 1,
  jumlah numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.harta2 TO anon, authenticated;
GRANT ALL ON public.harta2 TO service_role;
ALTER TABLE public.harta2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "harta2 akses publik" ON public.harta2 FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.rekap_harian (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tanggal date NOT NULL UNIQUE DEFAULT current_date,
  saldo_reseller numeric NOT NULL DEFAULT 0,
  komisi_reseller numeric NOT NULL DEFAULT 0,
  laba_rugi numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rekap_harian TO anon, authenticated;
GRANT ALL ON public.rekap_harian TO service_role;
ALTER TABLE public.rekap_harian ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rekap akses publik" ON public.rekap_harian FOR ALL USING (true) WITH CHECK (true);