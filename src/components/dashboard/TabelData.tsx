import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { formatRupiah, toISODate } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface ItemBaris {
  id: string;
  tanggal: string;
  nama: string;
  qty: number;
  jumlah: number;
}

interface Props {
  judul: string;
  labelKolom: string;
  warna: "biru" | "hijau";
  data: ItemBaris[];
  totalLabel: string;
  onSimpan: (item: { id?: string; tanggal: string; nama: string; qty: number; jumlah: number }) => Promise<void>;
  onHapus: (id: string) => Promise<void>;
}

const kosong = { nama: "", qty: 1, jumlah: 0, tanggal: toISODate(new Date()) };

const TabelData = ({ judul, labelKolom, warna, data, totalLabel, onSimpan, onHapus }: Props) => {
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | undefined>();
  const [form, setForm] = useState(kosong);

  const total = data.reduce((a, b) => a + b.qty * b.jumlah, 0);

  const bukaTambah = () => {
    setEditId(undefined);
    setForm(kosong);
    setOpen(true);
  };

  const bukaEdit = (item: ItemBaris) => {
    setEditId(item.id);
    setForm({ nama: item.nama, qty: item.qty, jumlah: item.jumlah, tanggal: item.tanggal });
    setOpen(true);
  };

  const simpan = async () => {
    if (!form.nama.trim()) return;
    await onSimpan({ id: editId, ...form });
    setOpen(false);
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 px-4 py-3">
        <CardTitle className="text-sm font-semibold">{judul}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" onClick={bukaTambah}>
              <Plus className="mr-1 h-4 w-4" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editId ? `Ubah ${labelKolom}` : `Tambah ${labelKolom}`}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>{labelKolom}</Label>
                <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Qty</Label>
                  <Input
                    type="number"
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Jumlah (Rp)</Label>
                  <Input
                    type="number"
                    value={form.jumlah}
                    onChange={(e) => setForm({ ...form, jumlah: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Tanggal</Label>
                <Input
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-medium text-foreground">{formatRupiah(form.qty * form.jumlah)}</span>
              </p>
            </div>
            <DialogFooter>
              <Button onClick={simpan}>Simpan</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={warna === "biru" ? "bg-info-soft" : "bg-success-soft"}>
                <TableHead className="w-10">No</TableHead>
                <TableHead>{labelKolom}</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-6 text-center text-sm text-muted-foreground">
                    Belum ada data.
                  </TableCell>
                </TableRow>
              )}
              {data.map((item, i) => (
                <TableRow key={item.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell className="font-medium">{item.nama}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.qty}</TableCell>
                  <TableCell
                    className={cn("text-right tabular-nums", item.jumlah < 0 && "text-destructive")}
                  >
                    {formatRupiah(item.jumlah)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      "text-right font-medium tabular-nums",
                      item.qty * item.jumlah < 0 && "text-destructive"
                    )}
                  >
                    {formatRupiah(item.qty * item.jumlah)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => bukaEdit(item)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => onHapus(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/60">
                <TableCell colSpan={4} className="font-semibold">
                  {totalLabel}
                </TableCell>
                <TableCell
                  className={cn("text-right font-bold tabular-nums", total < 0 && "text-destructive")}
                >
                  {formatRupiah(total)}
                </TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TabelData;
