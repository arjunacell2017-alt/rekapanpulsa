import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface Props {
  splBankMember: number;
  labaRugi: number;
  selisih: number;
}

const Rekonsiliasi = ({ splBankMember, labaRugi, selisih }: Props) => {
  const seimbang = Math.round(selisih) === 0;
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Rekonsiliasi</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-info-soft/50 p-3">
            <p className="text-xs text-muted-foreground">SPL + BANK - MEMBER</p>
            <p className="mt-1 font-semibold tabular-nums">{formatRupiah(splBankMember)}</p>
          </div>
          <div className="rounded-lg border bg-success-soft/50 p-3">
            <p className="text-xs text-muted-foreground">Laba/Rugi</p>
            <p className="mt-1 font-semibold tabular-nums">{formatRupiah(labaRugi)}</p>
          </div>
          <div className="rounded-lg border bg-warning-soft/50 p-3">
            <p className="text-xs text-muted-foreground">Selisih</p>
            <p className="mt-1 font-semibold tabular-nums">{formatRupiah(selisih)}</p>
          </div>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg p-3 text-sm font-semibold",
            seimbang ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"
          )}
        >
          {seimbang ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          {seimbang ? "SEIMBANG" : `ADA SELISIH ${formatRupiah(selisih)}`}
        </div>
      </CardContent>
    </Card>
  );
};

export default Rekonsiliasi;
