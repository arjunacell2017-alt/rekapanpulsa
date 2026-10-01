import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatRupiah, formatTanggal, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trash2 } from "lucide-react";

type Jenis = "supplier" | "harta";
interface Row {
  id: string;
  tanggal: string;
  jenis: Jenis;
  saldo_kemarin: number;
  penambahan: number;
  pemakaian: number;
  saldo_aktual: number;
}

const NAMA_JENIS: Record<Jenis, string> = { supplier: "Saldo Supplier", harta: "Total Harta" };

const hitung = (r: { saldo_kemarin: number; penambahan: number; pemakaian: number; saldo_aktual: number }) => {
  const seharusnya = r.saldo_kemarin + r.penambahan - r.pemakaian;
  const selisih = Math.round(r.saldo_aktual - seharusnya);
  const status = selisih > 0 ? "LEBIH" : selisih < 0 ? "KURANG" : "SEIMBANG";
  return { seharusnya, selisih, status, negatif: selisih < 0 };
};

const fmtSelisih = (n: number) => (n > 0 ? "+" : "") + formatRupiah(n);
const keAngka = (s: string) => Number(s.replace(/\D/g, "") || 0);
const tampil = (s: string) => (s === "" ? "" : Number(s).toLocaleString("id-ID"));

const InputRp = ({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) => (
  <div className="space-y-1">
    <Label className="text-xs">{label}</Label>
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
      <Input
        inputMode="numeric"
        className="h-9 pl-8 tabular-nums"
        value={tampil(value)}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        placeholder="0"
      />
    </div>
    {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
  </div>
);

const KartuRekon = ({ jenis, riwayat, onSimpan }: { jenis: Jenis; riwayat: Row[]; onSimpan: () => void }) => {
  const [tanggal, setTanggal] = useState(toISODate(new Date()));
  const [kemarin, setKemarin] = useState("");
  const [tambah, setTambah] = useState("");
  const [pakai, setPakai] = useState("");
  const [aktual, setAktual] = useState("");
  const [menyimpan, setMenyimpan] = useState(false);

  const sebelumnya = useMemo(
    () => riwayat.filter((r) => r.jenis === jenis && r.tanggal < tanggal).sort((a, b) => b.tanggal.localeCompare(a.tanggal))[0],
    [riwayat, jenis, tanggal]
  );

  useEffect(() => {
    if (sebelumnya) setKemarin(String(Math.round(Number(sebelumnya.saldo_aktual))));
  }, [sebelumnya]);

  const h = hitung({ saldo_kemarin: keAngka(kemarin), penambahan: keAngka(tambah), pemakaian: keAngka(pakai), saldo_aktual: keAngka(aktual) });

  const simpan = async () => {
    if (!tanggal) return toast({ title: "Tanggal wajib diisi", variant: "destructive" });
    if (aktual === "") return toast({ title: "Saldo Aktual wajib diisi", variant: "destructive" });
    if (riwayat.some((r) => r.jenis === jenis && r.tanggal === tanggal))
      return toast({ title: "Rekonsiliasi untuk tanggal ini sudah ada.", variant: "destructive" });
    setMenyimpan(true);
    // client_id tidak dikirim: diisi otomatis oleh database dari sesi login
    const { error } = await supabase.from("rekonsiliasi_saldo").insert({
      tanggal,
      jenis,
      saldo_kemarin: keAngka(kemarin),
      penambahan: keAngka(tambah),
      pemakaian: keAngka(pakai),
      saldo_aktual: keAngka(aktual),
    } as never);
    setMenyimpan(false);
    if (error) {
      const dup = error.code === "23505";
      return toast({ title: dup ? "Rekonsiliasi untuk tanggal ini sudah ada." : "Gagal menyimpan", description: dup ? undefined : error.message, variant: "destructive" });
    }
    toast({ title: "Rekonsiliasi tersimpan" });
    setTambah(""); setPakai(""); setAktual("");
    onSimpan();
  };

  const baris = (l: string, v: string, tebal = false) => (
    <div className={cn("flex justify-between py-0.5 text-sm", tebal && "font-semibold")}>
      <span className="text-muted-foreground">{l}</span>
      <span className="tabular-nums">{v}</span>
    </div>
  );

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3">
        <CardTitle className={cn("text-sm font-semibold", jenis === "supplier" ? "text-primary" : "text-success")}>
          Rekonsiliasi {NAMA_JENIS[jenis]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Tanggal</Label>
            <Input type="date" className="h-9" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </div>
          <InputRp
            label="Saldo Kemarin"
            value={kemarin}
            onChange={setKemarin}
            hint={sebelumnya ? `Otomatis dari saldo aktual ${formatTanggal(sebelumnya.tanggal)}` : "Belum ada data sebelumnya, isi manual"}
          />
          <InputRp label="Penambahan Hari Ini" value={tambah} onChange={setTambah} />
          <InputRp label="Pemakaian Hari Ini" value={pakai} onChange={setPakai} />
          <div className="col-span-2">
            <InputRp label="Saldo Aktual Hari Ini" value={aktual} onChange={setAktual} />
          </div>
        </div>

        <div className="rounded-lg border bg-muted/40 p-3">
          {baris("Saldo Kemarin", formatRupiah(keAngka(kemarin)))}
          {baris("Penambahan Hari Ini", formatRupiah(keAngka(tambah)))}
          {baris("Pemakaian Hari Ini", formatRupiah(keAngka(pakai)))}
          <div className="my-1.5 border-t" />
          {baris("Saldo Seharusnya", formatRupiah(h.seharusnya), true)}
          {baris("Saldo Aktual", formatRupiah(keAngka(aktual)), true)}
          <div
            className={cn(
              "mt-2 flex items-center justify-between rounded-md border p-2.5",
              h.negatif ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-success/40 bg-success-soft/60 text-success"
            )}
          >
            <div>
              <p className="text-[11px] font-medium opacity-80">SELISIH</p>
              <p className="text-lg font-bold tabular-nums">{fmtSelisih(h.selisih)}</p>
            </div>
            <span className="text-base font-bold">{h.status}</span>
          </div>
        </div>

        <Button className="w-full" size="sm" onClick={simpan} disabled={menyimpan}>
          {menyimpan ? "Menyimpan..." : "Simpan Rekonsiliasi"}
        </Button>
      </CardContent>
    </Card>
  );
};

const RekonsiliasiSaldo = () => {
  const { clientId, clientNama } = useAuth();
  const [riwayat, setRiwayat] = useState<Row[]>([]);

  const muat = useCallback(async () => {
    if (!clientId) return;
    const { data } = await supabase
      .from("rekonsiliasi_saldo" as never)
      .select("*")
      .eq("client_id", clientId)
      .order("tanggal", { ascending: false })
      .order("jenis");
    setRiwayat(((data as unknown as Row[]) ?? []).map((r) => ({
      ...r,
      saldo_kemarin: Number(r.saldo_kemarin),
      penambahan: Number(r.penambahan),
      pemakaian: Number(r.pemakaian),
      saldo_aktual: Number(r.saldo_aktual),
    })));
  }, [clientId]);

  useEffect(() => { muat(); }, [muat]);

  const hapus = async (id: string) => {
    if (!confirm("Hapus rekonsiliasi ini?")) return;
    const { error } = await supabase.from("rekonsiliasi_saldo" as never).delete().eq("id", id);
    if (error) return toast({ title: "Gagal menghapus", description: error.message, variant: "destructive" });
    toast({ title: "Data dihapus" });
    muat();
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center gap-3 border-b bg-card px-4 py-3">
        <Button asChild size="icon" variant="ghost">
          <Link to="/dashboard" aria-label="Kembali ke Dashboard"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-base font-bold text-primary md:text-lg">Rekonsiliasi Saldo</h1>
          {clientNama && <p className="text-xs text-muted-foreground">{clientNama}</p>}
        </div>
      </header>

      <div className="space-y-3 p-3 md:p-4">
        <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-2">
          <KartuRekon jenis="supplier" riwayat={riwayat} onSimpan={muat} />
          <KartuRekon jenis="harta" riwayat={riwayat} onSimpan={muat} />
        </div>

        <Card className="shadow-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-semibold">Riwayat Rekonsiliasi</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto pb-4 pt-0">
            <Table className="text-xs">
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead className="text-right">Saldo Kemarin</TableHead>
                  <TableHead className="text-right">Penambahan</TableHead>
                  <TableHead className="text-right">Pemakaian</TableHead>
                  <TableHead className="text-right">Saldo Seharusnya</TableHead>
                  <TableHead className="text-right">Saldo Aktual</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {riwayat.length === 0 && (
                  <TableRow><TableCell colSpan={11} className="py-6 text-center text-muted-foreground">Belum ada data rekonsiliasi.</TableCell></TableRow>
                )}
                {riwayat.map((r, i) => {
                  const h = hitung(r);
                  return (
                    <TableRow key={r.id}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell className="whitespace-nowrap">{formatTanggal(r.tanggal)}</TableCell>
                      <TableCell className="whitespace-nowrap">{NAMA_JENIS[r.jenis]}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRupiah(r.saldo_kemarin)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRupiah(r.penambahan)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRupiah(r.pemakaian)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRupiah(h.seharusnya)}</TableCell>
                      <TableCell className="text-right tabular-nums">{formatRupiah(r.saldo_aktual)}</TableCell>
                      <TableCell className={cn("text-right font-semibold tabular-nums", h.negatif ? "text-destructive" : "text-success")}>
                        {fmtSelisih(h.selisih)}
                      </TableCell>
                      <TableCell>
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold", h.negatif ? "bg-destructive/15 text-destructive" : "bg-success-soft text-success")}>
                          {h.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => hapus(r.id)} aria-label="Hapus">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RekonsiliasiSaldo;
