import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toISODate } from "@/lib/format";

export type PeriodeKey = "hari" | "minggu" | "bulan" | "custom";

interface Props {
  aktif: PeriodeKey;
  dari: string;
  sampai: string;
  onChange: (key: PeriodeKey, dari: string, sampai: string) => void;
}

export function hitungPeriode(key: PeriodeKey): { dari: string; sampai: string } {
  const now = new Date();
  if (key === "hari") return { dari: toISODate(now), sampai: toISODate(now) };
  if (key === "minggu") {
    const d = new Date(now);
    const hari = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - hari);
    return { dari: toISODate(d), sampai: toISODate(now) };
  }
  const awal = new Date(now.getFullYear(), now.getMonth(), 1);
  return { dari: toISODate(awal), sampai: toISODate(now) };
}

const opsi: { key: PeriodeKey; label: string }[] = [
  { key: "hari", label: "Hari ini" },
  { key: "minggu", label: "Minggu ini" },
  { key: "bulan", label: "Bulan ini" },
  { key: "custom", label: "Custom" },
];

const PeriodeFilter = ({ aktif, dari, sampai, onChange }: Props) => (
  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex flex-wrap gap-2">
      {opsi.map((o) => (
        <Button
          key={o.key}
          size="sm"
          variant={aktif === o.key ? "default" : "outline"}
          onClick={() => {
            if (o.key === "custom") onChange("custom", dari, sampai);
            else {
              const p = hitungPeriode(o.key);
              onChange(o.key, p.dari, p.sampai);
            }
          }}
        >
          {o.label}
        </Button>
      ))}
    </div>
    {aktif === "custom" && (
      <div className="flex items-center gap-2">
        <Input
          type="date"
          value={dari}
          className="w-auto"
          onChange={(e) => onChange("custom", e.target.value, sampai)}
        />
        <span className="text-muted-foreground text-sm">s/d</span>
        <Input
          type="date"
          value={sampai}
          className="w-auto"
          onChange={(e) => onChange("custom", dari, e.target.value)}
        />
      </div>
    )}
  </div>
);

export default PeriodeFilter;
