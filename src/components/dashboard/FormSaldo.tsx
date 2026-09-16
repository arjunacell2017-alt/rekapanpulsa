import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toISODate } from "@/lib/format";

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
    saldo,
    komisi,
    laba,
  });

  useEffect(() => {
    setForm({ tanggal: tanggal ?? toISODate(new Date()), saldo, komisi, laba });
  }, [saldo, komisi, laba, tanggal]);

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
            <Label>Total Saldo Reseller</Label>
            <Input
              type="number"
              value={form.saldo}
              onChange={(e) => setForm({ ...form, saldo: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Komisi Reseller</Label>
            <Input
              type="number"
              value={form.komisi}
              onChange={(e) => setForm({ ...form, komisi: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Laba/Rugi</Label>
            <Input
              type="number"
              value={form.laba}
              onChange={(e) => setForm({ ...form, laba: Number(e.target.value) })}
            />
          </div>
        </div>
        <Button className="mt-4" onClick={() => onSimpan(form)}>
          Simpan Data
        </Button>
      </CardContent>
    </Card>
  );
};

export default FormSaldo;
