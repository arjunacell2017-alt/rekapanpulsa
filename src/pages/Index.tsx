import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import Sidebar from "@/components/dashboard/Sidebar";
import KartuRingkasan from "@/components/dashboard/KartuRingkasan";
import TabelData from "@/components/dashboard/TabelData";
import FormSaldo from "@/components/dashboard/FormSaldo";
import Rekonsiliasi from "@/components/dashboard/Rekonsiliasi";
import { useRekap } from "@/hooks/useRekap";
import InputSaldoMassal from "@/components/dashboard/InputSaldoMassal";
import { useAuth } from "@/hooks/useAuth";
import { exportExcel, exportPDF, LaporanData } from "@/lib/exportUtils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye } from "lucide-react";

const Index = () => {
  const { peran, clientId: clientSaya, clientNama } = useAuth();
  const [params] = useSearchParams();
  const clientDilihat = peran === "admin" ? params.get("client") : null;
  const clientId = peran === "admin" ? clientDilihat : clientSaya;
  const hanyaLihat = peran === "admin";

  const { supplier, harta2, rekap, muat, urutkan } = useRekap(clientId);

  const ubahUrutan = async (tabel: "supplier" | "harta2", ids: string[]) => {
    try {
      await urutkan(tabel, ids);
    } catch (e) {
      toast({ title: "Gagal menyimpan urutan", description: (e as Error).message, variant: "destructive" });
    }
  };

  const totalSaldoSupplier = supplier.reduce((a, b) => a + b.qty * b.jumlah, 0);
  const totalHarta = harta2.reduce((a, b) => a + b.qty * b.jumlah, 0);
  const saldo = rekap?.saldo_reseller ?? 0;
  const komisi = rekap?.komisi_reseller ?? 0;
  const laba = rekap?.laba_rugi ?? 0;
  const splBankMember = totalSaldoSupplier + totalHarta - saldo - komisi;
  const selisih = splBankMember - laba;

  const ringkasan = useMemo(
    () => [
      { label: "Total Saldo Reseller", nilai: saldo, tone: "biru" as const },
      { label: "Komisi Reseller", nilai: komisi, tone: "kuning" as const },
      { label: "Total Saldo Supplier", nilai: totalSaldoSupplier, tone: "biru" as const },
      { label: "Total Harta", nilai: totalHarta, tone: "hijau" as const },
    ],
    [saldo, komisi, totalSaldoSupplier, totalHarta]
  );

  const simpanSupplier = async (i: { id?: string; tanggal: string; nama: string; qty: number; jumlah: number }) => {
    if (!clientId) return;
    const payload = { tanggal: i.tanggal, nama: i.nama, qty: i.qty, jumlah: i.jumlah, client_id: clientId };
    const { error } = i.id
      ? await supabase.from("supplier").update(payload).eq("id", i.id)
      : await supabase.from("supplier").insert(payload);
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Data supplier tersimpan" });
    muat();
  };

  const simpanHarta2 = async (i: { id?: string; tanggal: string; nama: string; qty: number; jumlah: number }) => {
    if (!clientId) return;
    const payload = { tanggal: i.tanggal, keterangan: i.nama, qty: i.qty, jumlah: i.jumlah, client_id: clientId };
    const { error } = i.id
      ? await supabase.from("harta2").update(payload).eq("id", i.id)
      : await supabase.from("harta2").insert(payload);
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Data harta tersimpan" });
    muat();
  };

  const simpanMassal = async (
    update: { id: string; jumlah: number }[],
    baru: { nama: string; jumlah: number }[]
  ): Promise<boolean> => {
    if (!clientId) return false;
    const hasil = await Promise.all(
      update.map((u) => supabase.from("supplier").update({ jumlah: u.jumlah }).eq("id", u.id).eq("client_id", clientId))
    );
    let err = hasil.find((r) => r.error)?.error;
    if (!err && baru.length) {
      const maxUrut = supplier.length;
      const { error } = await supabase.from("supplier").insert(
        baru.map((b, i) => ({ nama: b.nama, jumlah: b.jumlah, qty: 1, client_id: clientId, sort_order: maxUrut + i + 1 }))
      );
      err = error ?? undefined;
    }
    await muat();
    if (err) {
      toast({ title: "Gagal menyimpan", description: err.message, variant: "destructive" });
      return false;
    }
    toast({ title: "Saldo supplier berhasil diperbarui." });
    return true;
  };

  const hapus = async (tabel: "supplier" | "harta2", id: string) => {
    const { error } = await supabase.from(tabel).delete().eq("id", id);
    if (error) {
      toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Data dihapus" });
    muat();
  };

  const simpanSaldo = async (v: { tanggal: string; saldo: number; komisi: number; laba: number }) => {
    if (!clientId) return;
    const { error } = await supabase.from("rekap_harian").upsert(
      {
        tanggal: v.tanggal,
        saldo_reseller: v.saldo,
        komisi_reseller: v.komisi,
        laba_rugi: v.laba,
        client_id: clientId,
      },
      { onConflict: "client_id,tanggal" }
    );
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Saldo & komisi tersimpan" });
    muat();
  };

  const laporan = (): LaporanData => ({
    periode: "",
    ringkasan: [
      ...ringkasan.map((r) => ({ label: r.label, nilai: r.nilai })),
      { label: "Laba/Rugi", nilai: laba },
      { label: "SPL + BANK - MEMBER", nilai: splBankMember },
      { label: "Selisih", nilai: selisih },
    ],
    supplier: supplier.map((s) => ({ label: s.nama, qty: s.qty, jumlah: s.jumlah, total: s.qty * s.jumlah })),
    harta2: harta2.map((h) => ({ label: h.keterangan, qty: h.qty, jumlah: h.jumlah, total: h.qty * h.jumlah })),
    status: Math.round(selisih) > 0 ? "LEBIH" : Math.round(selisih) < 0 ? "KURANG" : "SEIMBANG",
  });

  if (peran === "admin" && !clientDilihat) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
        <Alert className="max-w-md">
          <AlertDescription className="space-y-3">
            <p>Pilih client terlebih dahulu untuk melihat dashboard keuangannya.</p>
            <Button asChild size="sm">
              <Link to="/admin/clients">Buka Manajemen Client</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar onExportExcel={() => exportExcel(laporan())} onExportPDF={() => exportPDF(laporan())} />
      <main className="flex-1 overflow-x-hidden">
        {hanyaLihat && (
          <div className="flex items-center gap-2 bg-warning px-4 py-2 text-xs font-semibold text-warning-foreground">
            <Eye className="h-4 w-4" />
            Mode Admin — melihat data client (hanya baca).
            <Link to="/admin/clients" className="ml-auto underline">
              Kembali ke Manajemen Client
            </Link>
          </div>
        )}
        <header className="border-b bg-card px-4 py-3 pl-16 md:px-5 md:pl-5">
          <h1 className="text-base font-bold text-primary md:text-lg">Dashboard Rekap Keuangan</h1>
          {clientNama && !hanyaLihat && <p className="text-xs text-muted-foreground">{clientNama}</p>}
        </header>

        <div className="space-y-3 p-3 md:p-4">
          <section id="ringkasan" className="scroll-mt-4">
            <KartuRingkasan items={ringkasan} />
          </section>

          <section id="rekonsiliasi" className="scroll-mt-4">
            <Rekonsiliasi splBankMember={splBankMember} labaRugi={laba} selisih={selisih} />
          </section>

          {!hanyaLihat && (
            <FormSaldo saldo={saldo} komisi={komisi} laba={laba} tanggal={rekap?.tanggal} onSimpan={simpanSaldo} />
          )}

          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
            <section id="supplier" className="scroll-mt-4">
              <TabelData
                judul="Supplier"
                labelKolom="Nama Supplier"
                warna="biru"
                totalLabel="TOTAL SALDO SUPPLIER"
                hanyaLihat={hanyaLihat}
                data={supplier.map((s) => ({ id: s.id, tanggal: s.tanggal, nama: s.nama, qty: s.qty, jumlah: s.jumlah }))}
                onSimpan={simpanSupplier}
                onHapus={(id) => hapus("supplier", id)}
                onUrutkan={(ids) => ubahUrutan("supplier", ids)}
                aksiTambahan={
                  <InputSaldoMassal
                    supplier={supplier.map((s) => ({ id: s.id, nama: s.nama, jumlah: s.jumlah }))}
                    onSimpan={simpanMassal}
                  />
                }
              />
            </section>

            <section id="harta2" className="scroll-mt-4">
              <TabelData
                judul="Total Harta"
                labelKolom="Keterangan"
                warna="hijau"
                totalLabel="TOTAL HARTA"
                hanyaLihat={hanyaLihat}
                data={harta2.map((h) => ({
                  id: h.id,
                  tanggal: h.tanggal,
                  nama: h.keterangan,
                  qty: h.qty,
                  jumlah: h.jumlah,
                }))}
                onSimpan={simpanHarta2}
                onHapus={(id) => hapus("harta2", id)}
                onUrutkan={(ids) => ubahUrutan("harta2", ids)}
              />
            </section>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Index;
