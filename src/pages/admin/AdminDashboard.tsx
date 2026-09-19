import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Users, CheckCircle2, PauseCircle } from "lucide-react";

const AdminDashboard = () => {
  const [total, setTotal] = useState(0);
  const [aktif, setAktif] = useState(0);

  useEffect(() => {
    supabase
      .from("clients")
      .select("status")
      .then(({ data }) => {
        setTotal(data?.length ?? 0);
        setAktif((data ?? []).filter((c) => c.status === "active").length);
      });
  }, []);

  const kartu = [
    { label: "Total Client", nilai: total, icon: Users, kelas: "border-l-electric-blue bg-info-soft/40" },
    { label: "Client Aktif", nilai: aktif, icon: CheckCircle2, kelas: "border-l-success bg-success-soft/40" },
    {
      label: "Client Nonaktif",
      nilai: total - aktif,
      icon: PauseCircle,
      kelas: "border-l-warning bg-warning-soft/40",
    },
  ];

  return (
    <AdminLayout judul="Admin Dashboard">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {kartu.map((k) => (
          <Card key={k.label} className={`border-l-4 shadow-sm ${k.kelas}`}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
                <p className="mt-1 text-2xl font-bold tabular-nums">{k.nilai}</p>
              </div>
              <k.icon className="h-6 w-6 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Kelola akun client, status aktif, dan kata sandi pada halaman Manajemen Client.
          </p>
          <Button asChild size="sm">
            <Link to="/admin/clients">Buka Manajemen Client</Link>
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
