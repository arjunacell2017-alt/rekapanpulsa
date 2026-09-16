import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import KartuRingkasan from "@/components/dashboard/KartuRingkasan";
import TabelData from "@/components/dashboard/TabelData";
import FormSaldo from "@/components/dashboard/FormSaldo";
import Rekonsiliasi from "@/components/dashboard/Rekonsiliasi";
import PeriodeFilter, { hitungPeriode, PeriodeKey } from "@/components/dashboard/PeriodeFilter";
import { useRekap } from "@/hooks/useRekap";
import { formatTanggal } from "@/lib/format";
import { exportExcel, exportPDF, LaporanData } from "@/lib/exportUtils";

const Index = () => {
  const awal = hitungPeriode("bulan");
  const [periode, setPeriode] = useState<PeriodeKey>("bulan");
  const [dari, setDari] = useState(awal.dari);
  const [sampai, setSampai] = useState(awal.sampai);

  const { supplier, harta2, rekap, muat } = useRekap(dari, sampai);

  const totalHarta1 = supplier.reduce((a, b) => a + b.qty * b.jumlah, 0);
  const totalHarta2 = harta2.reduce((a, b) => a + b.qty * b.jumlah, 0);
  const saldo = rekap?.saldo_reseller ?? 0;
  const komisi = rekap?.komisi_reseller ?? 0;
  const laba = rekap?.laba_rugi ?? 0;
  const splBankMember = totalHarta1 + totalHarta2 - saldo - komisi;
  const selisih = splBankMember - laba;

  const ringkasan = useMemo(
    () => [
      { label: "Total Saldo Reseller", nilai: saldo, tone: "biru" as const },
      { label: "Komisi Reseller", nilai: komisi, tone: "biru" as const },
      { label: "Total Harta 1", nilai: totalHarta1, tone: "kuning" as const },
      { label: "Total Harta 2", nilai: totalHarta2, tone: "hijau" as const },
      { label: "Laba/Rugi", nilai: laba, tone: "hijau" as const },
      { label: "SPL + BANK - MEMBER", nilai: splBankMember, tone: "biru" as const },
      { label: "Selisih", nilai: selisih, tone: "kuning" as const },
    ],
    [saldo, komisi, totalHarta1, totalHarta2, laba, splBankMember, selisih]
  );

  const gantiPeriode = (key: PeriodeKey, d: string, s: string) => {
    setPeriode(key);
    setDari(d);
    setSampai(s);
  };

  const simpanSupplier = async (i: { id?: string; tanggal: string; nama: string; qty: number; jumlah: number }) => {
    const payload = { tanggal: i.tanggal, nama: i.nama, qty: i.qty, jumlah: i.jumlah };
    const { error } = i.id
      ? await supabase.from("supplier").update(payload).eq("id", i.id)
      : await supabase.from("supplier").insert(payload);
    if (error) return toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    toast({ title: "Data supplier tersimpan" });
    muat();
  };

  const simpanHarta2 = async (i: { id?: string; tanggal: string; nama: string; qty: number; jumlah: number }) => {
    const payload = { tanggal: i.tanggal, keterangan: i.nama, qty: i.qty, jumlah: i.jumlah };
    const { error } = i.id
      ? await supabase.from("harta2").update(payload).eq("id", i.id)
      : await supabase.from("harta2").insert(payload);
    if (error) return toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    toast({ title: "Data Harta 2 tersimpan" });
    muat();
  };

  const hapus = async (tabel: "supplier" | "harta2", id: string) => {
    const { error } = await supabase.from(tabel).delete().eq("id", id);
    if (error) return toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    toast({ title: "Data dihapus" });
    muat();
  };

  const simpanSaldo = async (v: { tanggal: string; saldo: number; komisi: number; laba: number }) => {
    const { error } = await supabase.from("rekap_harian").upsert(
      {
        tanggal: v.tanggal,
        saldo_reseller: v.saldo,
        komisi_reseller: v.komisi,
        laba_rugi: v.laba,
      },
      { onConflict: "tanggal" }
    );
    if (error) return toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    toast({ title: "Saldo & komisi tersimpan" });
    muat();
  };

  const laporan = (): LaporanData => ({
    periode: `${formatTanggal(dari)} - ${formatTanggal(sampai)}`,
    ringkasan: ringkasan.map((r) => ({ label: r.label, nilai: r.nilai })),
    supplier: supplier.map((s) => ({ label: s.nama, qty: s.qty, jumlah: s.jumlah, total: s.qty * s.jumlah })),
    harta2: harta2.map((h) => ({ label: h.keterangan, qty: h.qty, jumlah: h.jumlah, total: h.qty * h.jumlah })),
    status: Math.round(selisih) === 0 ? "SEIMBANG" : "ADA SELISIH",
  });

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar onExportExcel={() => exportExcel(laporan())} onExportPDF={() => exportPDF(laporan())} />
      <main className="flex-1 overflow-x-hidden">
        <header className="border-b bg-card px-4 py-4 pl-16 md:px-6 md:pl-6">
          <h1 className="text-lg font-bold text-primary md:text-xl">Dashboard Rekap Keuangan</h1>
          <p className="text-sm text-muted-foreground">
            Periode {formatTanggal(dari)} – {formatTanggal(sampai)}
          </p>
        </header>

        <div className="space-y-6 p-4 md:p-6">
          <PeriodeFilter aktif={periode} dari={dari} sampai={sampai} onChange={gantiPeriode} />

          <section id="ringkasan" className="scroll-mt-4">
            <KartuRingkasan items={ringkasan} />
          </section>

          <FormSaldo
            saldo={saldo}
            komisi={komisi}
            laba={laba}
            tanggal={rekap?.tanggal}
            onSimpan={simpanSaldo}
          />

          <section id="supplier" className="scroll-mt-4">
            <TabelData
              judul="Tabel Supplier (Harta 1)"
              labelKolom="Nama Supplier"
              warna="biru"
              totalLabel="TOTAL HARTA 1"
              data={supplier.map((s) => ({ id: s.id, tanggal: s.tanggal, nama: s.nama, qty: s.qty, jumlah: s.jumlah }))}
              onSimpan={simpanSupplier}
              onHapus={(id) => hapus("supplier", id)}
            />
          </section>

          <section id="harta2" className="scroll-mt-4">
            <TabelData
              judul="Tabel Harta 2"
              labelKolom="Keterangan"
              warna="hijau"
              totalLabel="TOTAL HARTA 2"
              data={harta2.map((h) => ({
                id: h.id,
                tanggal: h.tanggal,
                nama: h.keterangan,
                qty: h.qty,
                jumlah: h.jumlah,
              }))}
              onSimpan={simpanHarta2}
              onHapus={(id) => hapus("harta2", id)}
            />
          </section>

          <section id="rekonsiliasi" className="scroll-mt-4 pb-6">
            <Rekonsiliasi splBankMember={splBankMember} labaRugi={laba} selisih={selisih} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default Index;
