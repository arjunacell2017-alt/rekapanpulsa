import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface Ringkasan {
  label: string;
  nilai: number;
  tone?: "biru" | "hijau" | "kuning";
}

const toneClass = {
  biru: "border-l-4 border-l-electric-blue bg-info-soft/40",
  hijau: "border-l-4 border-l-success bg-success-soft/40",
  kuning: "border-l-4 border-l-warning bg-warning-soft/40",
};

const KartuRingkasan = ({ items }: { items: Ringkasan[] }) => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((i) => (
      <Card key={i.label} className={cn("shadow-sm", toneClass[i.tone ?? "biru"])}>
        <CardContent className="p-3">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{i.label}</p>
          <p
            className={cn(
              "mt-1 text-xl font-bold tabular-nums",
              i.nilai < 0 ? "text-destructive" : "text-foreground"
            )}
          >
            {formatRupiah(i.nilai)}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

export default KartuRingkasan;
