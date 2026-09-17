import { LayoutDashboard, Truck, Wallet, Scale, FileSpreadsheet, FileText, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const menu = [
  { id: "ringkasan", label: "Dashboard", icon: LayoutDashboard },
  { id: "supplier", label: "Supplier", icon: Truck },
  { id: "harta2", label: "Total Harta", icon: Wallet },
  { id: "rekonsiliasi", label: "Rekonsiliasi", icon: Scale },
];

interface Props {
  onExportExcel: () => void;
  onExportPDF: () => void;
}

const Isi = ({ onExportExcel, onExportPDF, tutup }: Props & { tutup?: () => void }) => (
  <div className="flex h-full flex-col gap-1 p-4">
    <div className="mb-5 px-2">
      <p className="text-sm font-bold text-primary">ARJUNA TRONIK</p>
      <p className="text-xs text-muted-foreground">Rekap Keuangan</p>
    </div>
    {menu.map((m) => (
      <a
        key={m.id}
        href={`#${m.id}`}
        onClick={tutup}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground",
          "transition-colors hover:bg-info-soft hover:text-primary"
        )}
      >
        <m.icon className="h-4 w-4" />
        {m.label}
      </a>
    ))}
    <div className="mt-auto space-y-2 pt-6">
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={onExportExcel}>
        <FileSpreadsheet className="mr-2 h-4 w-4 text-success" /> Export Excel
      </Button>
      <Button variant="outline" size="sm" className="w-full justify-start" onClick={onExportPDF}>
        <FileText className="mr-2 h-4 w-4 text-destructive" /> Export PDF
      </Button>
    </div>
  </div>
);

const Sidebar = (props: Props) => (
  <>
    <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
      <div className="sticky top-0 h-screen">
        <Isi {...props} />
      </div>
    </aside>
    <div className="fixed left-4 top-3 z-40 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Isi {...props} />
        </SheetContent>
      </Sheet>
    </div>
  </>
);

export default Sidebar;
