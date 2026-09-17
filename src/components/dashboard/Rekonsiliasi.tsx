import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";

interface Props {
  splBankMember: number;
  labaRugi: number;
  selisih: number;
}

const Rekonsiliasi = ({ splBankMember, labaRugi, selisih }: Props) => {
  const nilai = Math.round(selisih);
  const status = nilai > 0 ? "LEBIH" : nilai < 0 ? "KURANG" : "SEIMBANG";
  const negatif = nilai < 0;
  const Ikon = nilai > 0 ? TrendingUp : nilai < 0 ? TrendingDown : CheckCircle2;

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-semibold">Rekonsiliasi</CardTitle>
      </CardHeader>
      <CardContent className="pb-4 pt-0">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-info-soft/50 p-3">
            <p className="text-xs text-muted-foreground">SPL + BANK - MEMBER</p>
            <p className="mt-1 font-semibold tabular-nums">{formatRupiah(splBankMember)}</p>
          </div>
          <div className="rounded-lg border bg-success-soft/50 p-3">
            <p className="text-xs text-muted-foreground">Laba/Rugi</p>
            <p className="mt-1 font-semibold tabular-nums">{formatRupiah(labaRugi)}</p>
          </div>
          <div
            className={cn(
              "rounded-lg border p-3",
              negatif ? "border-destructive/40 bg-destructive/10" : "border-success/40 bg-success-soft/60"
            )}
          >
            <p className="text-xs text-muted-foreground">Selisih</p>
            <div className="mt-1 flex items-center gap-2">
              <Ikon className={cn("h-4 w-4", negatif ? "text-destructive" : "text-success")} />
              <span
                className={cn(
                  "text-lg font-bold tabular-nums",
                  negatif ? "text-destructive" : "text-success"
                )}
              >
                {nilai > 0 ? "+" : ""}
                {formatRupiah(nilai)}
              </span>
            </div>
            <p className={cn("mt-0.5 text-xs font-semibold", negatif ? "text-destructive" : "text-success")}>
              {status}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Rekonsiliasi;
