import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseRupiah, toISODate } from "@/lib/format";

interface Props {
  saldo: number;
  komisi: number;
  laba: number;
  tanggal?: string;
  onSimpan: (v: { tanggal: string; saldo: number; komisi: number; laba: number }) => Promise<void>;
}

const FormSaldo = ({ saldo, komisi, laba, tanggal, onSimpan }: Props) => {
  const [form, setForm] = useState({
    tanggal: tanggal ?? toISODate(new Date()),
    saldo: String(Math.round(saldo)),
    komisi: String(Math.round(komisi)),
    laba: String(Math.round(laba)),
  });

  useEffect(() => {
    setForm({ tanggal: tanggal ?? toISODate(new Date()), saldo: String(Math.round(saldo)), komisi: String(Math.round(komisi)), laba: String(Math.round(laba)) });
  }, [saldo, komisi, laba, tanggal]);

  // Keep pasted text intact until it is parsed, rather than letting number inputs
  // interpret Indonesian thousands separators as decimal points.
  const nominal = {
    saldo: form.saldo.trim() === "" ? 0 : parseRupiah(form.saldo),
    komisi: form.komisi.trim() === "" ? 0 : parseRupiah(form.komisi),
    laba: form.laba.trim() === "" ? 0 : parseRupiah(form.laba),
  };
  const valid = Object.values(nominal).every((v) => v !== null && Number.isSafeInteger(v));

  const simpan = () => {
    const { saldo, komisi, laba } = nominal;
    if (!form.tanggal || !valid || saldo === null || komisi === null || laba === null) return;
    return onSimpan({ tanggal: form.tanggal, saldo, komisi, laba });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Input Saldo &amp; Komisi Reseller</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label>Tanggal</Label>
            <Input
              type="date"
              value={form.tanggal}
              onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="saldo-reseller">Total Saldo Reseller</Label>
            <Input
              id="saldo-reseller"
              type="text"
              inputMode="decimal"
              aria-invalid={nominal.saldo === null || !Number.isSafeInteger(nominal.saldo)}
              value={form.saldo}
              onChange={(e) => setForm({ ...form, saldo: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="komisi-reseller">Komisi Reseller</Label>
            <Input
              id="komisi-reseller"
              type="text"
              inputMode="decimal"
              aria-invalid={nominal.komisi === null || !Number.isSafeInteger(nominal.komisi)}
              value={form.komisi}
              onChange={(e) => setForm({ ...form, komisi: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="laba-rugi">Laba/Rugi</Label>
            <Input
              id="laba-rugi"
              type="text"
              inputMode="decimal"
              aria-invalid={nominal.laba === null || !Number.isSafeInteger(nominal.laba)}
              value={form.laba}
              onChange={(e) => setForm({ ...form, laba: e.target.value })}
            />
          </div>
        </div>
        <Button className="mt-4" disabled={!valid || !form.tanggal} onClick={simpan}>
          Simpan Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormSaldo;
