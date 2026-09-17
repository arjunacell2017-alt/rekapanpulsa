import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SupplierRow {
  id: string;
  tanggal: string;
  nama: string;
  qty: number;
  jumlah: number;
}

export interface Harta2Row {
  id: string;
  tanggal: string;
  keterangan: string;
  qty: number;
  jumlah: number;
}

export interface RekapRow {
  id: string;
  tanggal: string;
  saldo_reseller: number;
  komisi_reseller: number;
  laba_rugi: number;
}

export function useRekap() {
  const [supplier, setSupplier] = useState<SupplierRow[]>([]);
  const [harta2, setHarta2] = useState<Harta2Row[]>([]);
  const [rekap, setRekap] = useState<RekapRow | null>(null);
  const [loading, setLoading] = useState(true);

  const muat = useCallback(async () => {
    setLoading(true);
    const [s, h, r] = await Promise.all([
      supabase.from("supplier").select("*").order("created_at"),
      supabase.from("harta2").select("*").order("created_at"),
      supabase.from("rekap_harian").select("*").order("tanggal", { ascending: false }).limit(1),
    ]);
    setSupplier((s.data as SupplierRow[]) ?? []);
    setHarta2((h.data as Harta2Row[]) ?? []);
    setRekap(((r.data as RekapRow[]) ?? [])[0] ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  return { supplier, harta2, rekap, loading, muat };
}
