ALTER TABLE public.supplier ADD COLUMN IF NOT EXISTS sort_order integer;
ALTER TABLE public.harta2 ADD COLUMN IF NOT EXISTS sort_order integer;

UPDATE public.supplier s SET sort_order = x.rn FROM (
  SELECT id, row_number() OVER (PARTITION BY client_id ORDER BY created_at, id) rn FROM public.supplier) x
WHERE s.id = x.id AND s.sort_order IS NULL;
UPDATE public.harta2 s SET sort_order = x.rn FROM (
  SELECT id, row_number() OVER (PARTITION BY client_id ORDER BY created_at, id) rn FROM public.harta2) x
WHERE s.id = x.id AND s.sort_order IS NULL;

CREATE INDEX IF NOT EXISTS supplier_client_sort_idx ON public.supplier (client_id, sort_order);
CREATE INDEX IF NOT EXISTS harta2_client_sort_idx ON public.harta2 (client_id, sort_order);

CREATE OR REPLACE FUNCTION public.set_sort_order_default()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.sort_order IS NULL THEN
    EXECUTE format('SELECT COALESCE(MAX(sort_order),0)+1 FROM public.%I WHERE client_id = $1', TG_TABLE_NAME)
      INTO NEW.sort_order USING NEW.client_id;
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.set_sort_order_default() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS supplier_sort_default ON public.supplier;
CREATE TRIGGER supplier_sort_default BEFORE INSERT ON public.supplier FOR EACH ROW EXECUTE FUNCTION public.set_sort_order_default();
DROP TRIGGER IF EXISTS harta2_sort_default ON public.harta2;
CREATE TRIGGER harta2_sort_default BEFORE INSERT ON public.harta2 FOR EACH ROW EXECUTE FUNCTION public.set_sort_order_default();