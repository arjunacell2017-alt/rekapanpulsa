import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, Settings, LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const menu = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/clients", label: "Manajemen Client", icon: Users, end: false },
  { to: "/admin/pengaturan", label: "Pengaturan", icon: Settings, end: false },
];

const Isi = ({ tutup }: { tutup?: () => void }) => {
  const { keluar, user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex h-full flex-col gap-1 p-4">
      <div className="mb-5 px-2">
        <p className="text-sm font-bold text-primary">ARJUNA TRONIK</p>
        <p className="text-xs text-muted-foreground">Area Admin</p>
      </div>
      {menu.map((m) => (
        <NavLink
          key={m.to}
          to={m.to}
          end={m.end}
          onClick={tutup}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-info-soft text-primary" : "text-muted-foreground hover:bg-info-soft hover:text-primary"
            )
          }
        >
          <m.icon className="h-4 w-4" />
          {m.label}
        </NavLink>
      ))}
      <div className="mt-auto space-y-2 pt-6">
        <p className="truncate px-3 text-xs text-muted-foreground">{user?.email}</p>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={async () => {
            await keluar();
            navigate("/login", { replace: true });
          }}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
    </div>
  );
};

const AdminLayout = ({ judul, children }: { judul: string; children: React.ReactNode }) => (
  <div className="flex min-h-screen bg-muted/30">
    <aside className="hidden w-56 shrink-0 border-r bg-card md:block">
      <div className="sticky top-0 h-screen">
        <Isi />
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
          <Isi />
        </SheetContent>
      </Sheet>
    </div>
    <main className="flex-1 overflow-x-hidden">
      <header className="border-b bg-card px-4 py-3 pl-16 md:px-5 md:pl-5">
        <h1 className="text-base font-bold text-primary md:text-lg">{judul}</h1>
      </header>
      <div className="space-y-3 p-3 md:p-4">{children}</div>
    </main>
  </div>
);

export default AdminLayout;
