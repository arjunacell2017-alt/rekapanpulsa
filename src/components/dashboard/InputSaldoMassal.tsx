import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList } from "lucide-react";
import { formatRupiah, parseRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface SupplierRingkas {
  id: string;
  nama: string;
  jumlah: number;
}

interface Props {
  supplier: SupplierRingkas[];
  onSimpan: (update: { id: string; jumlah: number }[], baru: { nama: string; jumlah: number }[]) => Promise<boolean>;
}

const normal = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
const tanpaPrefix = (s: string) => {
  const i = s.indexOf(":");
  return i >= 0 ? normal(s.slice(i + 1)) : normal(s);
};

const parseSaldo = parseRupiah;

interface BarisParse {
  nama: string;
  saldo: number | null;
  mentah: string;
}

const parseTeks = (teks: string): BarisParse[] =>
  teks
    .split(/\r?\n/)
    .map((l) => l.replace(/\u00a0/g, " "))
    .filter((l) => l.trim())
    .map((l) => {
      let sel = l.includes("\t") ? l.split("\t") : l.includes("|") ? l.split("|") : l.split(/\s{2,}/);
      sel = sel.map((c) => c.trim());
      if (sel.length === 1) {
        const m = l.trim().match(/^(.*?)\s+((?:Rp\s?)?-?[\d.,]+)$/i);
        sel = m ? [m[1], m[2]] : sel;
      }
      const nama = sel.find((c) => c && parseSaldo(c) === null) ?? "";
      let saldo: number | null = null;
      for (let i = sel.length - 1; i >= 0; i--) {
        const v = parseSaldo(sel[i]);
        if (v !== null && sel[i] !== nama) {
          saldo = v;
          break;
        }
      }
      return { nama, saldo, mentah: l.trim() };
    })
    .filter((b) => !/^modul$/i.test(b.nama.trim()));

const InputSaldoMassal = ({ supplier, onSimpan }: Props) => {
  const [open, setOpen] = useState(false);
  const [teks, setTeks] = useState("");
  const [tambahBaru, setTambahBaru] = useState<Record<number, boolean>>({});
  const [menyimpan, setMenyimpan] = useState(false);

  const hasil = useMemo(() => {
    const baris = parseTeks(teks);
    const cocok = new Map<string, { s: SupplierRingkas; saldo: number }>();
    const tidakDitemukan: { idx: number; nama: string; saldo: number }[] = [];
    const bermasalah: BarisParse[] = [];
    baris.forEach((b, idx) => {
      if (!b.nama || b.saldo === null) return bermasalah.push(b);
      const n = normal(b.nama);
      const p = tanpaPrefix(b.nama);
      const s =
        supplier.find((x) => normal(x.nama) === n) ??
        supplier.find((x) => normal(x.nama) === p) ??
        supplier.find((x) => tanpaPrefix(x.nama) === p);
      if (s) cocok.set(s.id, { s, saldo: b.saldo });
      else tidakDitemukan.push({ idx, nama: b.nama.trim(), saldo: b.saldo });
    });
    const tidakAda = supplier.filter((s) => !cocok.has(s.id));
    return { total: baris.length, cocok: [...cocok.values()], tidakDitemukan, bermasalah, tidakAda };
  }, [teks, supplier]);

  const tutup = (v: boolean) => {
    setOpen(v);
    if (!v) {
      setTeks("");
      setTambahBaru({});
    }
  };

  const simpan = async () => {
    setMenyimpan(true);
    const ok = await onSimpan(
      hasil.cocok.map((c) => ({ id: c.s.id, jumlah: c.saldo })),
      hasil.tidakDitemukan.filter((t) => tambahBaru[t.idx]).map((t) => ({ nama: t.nama, jumlah: t.saldo }))
    );
    setMenyimpan(false);
    if (ok) tutup(false);
  };

  const jumlahBaru = hasil.tidakDitemukan.filter((t) => tambahBaru[t.idx]).length;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <ClipboardList className="mr-1 h-4 w-4" /> Input Saldo Massal
      </Button>
      <Dialog open={open} onOpenChange={tutup}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Input Saldo Supplier Massal</DialogTitle>
            <DialogDescription>Salin data Modul dan Saldo dari Otomax, lalu paste di sini.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={teks}
            onChange={(e) => setTeks(e.target.value)}
            placeholder={"ARJUNA\t\t2.745.434\nXML\t\t3.104.841"}
            className="min-h-[140px] font-mono text-xs"
          />

          {teks.trim() && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded bg-muted px-2 py-1">{hasil.total} data ditemukan</span>
                <span className="rounded bg-success-soft px-2 py-1 text-success">{hasil.cocok.length} supplier cocok</span>
                <span className="rounded bg-warning/20 px-2 py-1">{hasil.tidakDitemukan.length} tidak ditemukan</span>
                {hasil.bermasalah.length > 0 && (
                  <span className="rounded bg-destructive/10 px-2 py-1 text-destructive">
                    {hasil.bermasalah.length} baris bermasalah
                  </span>
                )}
              </div>

              {hasil.cocok.length > 0 && (
                <div className="overflow-x-auto rounded border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-info-soft">
                        <TableHead className="h-8 px-2 text-xs">No</TableHead>
                        <TableHead className="h-8 px-2 text-xs">Supplier</TableHead>
                        <TableHead className="h-8 px-2 text-right text-xs">Saldo Lama</TableHead>
                        <TableHead className="h-8 px-2 text-right text-xs">Saldo Baru</TableHead>
                        <TableHead className="h-8 px-2 text-xs">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {hasil.cocok.map((c, i) => (
                        <TableRow key={c.s.id}>
                          <TableCell className="px-2 py-1 text-xs">{i + 1}</TableCell>
                          <TableCell className="px-2 py-1 text-xs font-medium">{c.s.nama}</TableCell>
                          <TableCell className="px-2 py-1 text-right text-xs tabular-nums">{formatRupiah(c.s.jumlah)}</TableCell>
                          <TableCell className="px-2 py-1 text-right text-xs font-semibold tabular-nums">{formatRupiah(c.saldo)}</TableCell>
                          <TableCell className="px-2 py-1 text-xs">
                            <span className="rounded bg-success-soft px-1.5 py-0.5 font-semibold text-success">Cocok</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {hasil.tidakDitemukan.length > 0 && (
                <div className="rounded border border-warning/50 p-2">
                  <p className="mb-1 text-xs font-semibold">Supplier Tidak Ditemukan</p>
                  {hasil.tidakDitemukan.map((t) => (
                    <div key={t.idx} className="flex items-center justify-between gap-2 py-1 text-xs">
                      <span>
                        <b>{t.nama}</b> — {formatRupiah(t.saldo)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={!tambahBaru[t.idx] ? "secondary" : "ghost"}
                          className="h-6 px-2 text-xs"
                          onClick={() => setTambahBaru({ ...tambahBaru, [t.idx]: false })}
                        >
                          Abaikan
                        </Button>
                        <Button
                          size="sm"
                          variant={tambahBaru[t.idx] ? "default" : "ghost"}
                          className="h-6 px-2 text-xs"
                          onClick={() => setTambahBaru({ ...tambahBaru, [t.idx]: true })}
                        >
                          Tambahkan sebagai supplier baru
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {hasil.tidakAda.length > 0 && (
                <div className="rounded border p-2 text-xs">
                  <p className="mb-1 font-semibold">Tidak ada pada data Otomax (saldo tidak diubah)</p>
                  <p className="text-muted-foreground">{hasil.tidakAda.map((s) => s.nama).join(", ")}</p>
                </div>
              )}

              {hasil.bermasalah.length > 0 && (
                <div className="rounded border border-destructive/40 p-2 text-xs">
                  <p className="mb-1 font-semibold text-destructive">Baris bermasalah (saldo bukan angka, dilewati)</p>
                  {hasil.bermasalah.map((b, i) => (
                    <p key={i} className="truncate font-mono text-muted-foreground">{b.mentah}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={simpan}
              disabled={menyimpan || (hasil.cocok.length === 0 && jumlahBaru === 0)}
              className={cn(menyimpan && "opacity-70")}
            >
              {menyimpan ? "Menyimpan..." : "Simpan Semua"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default InputSaldoMassal;
