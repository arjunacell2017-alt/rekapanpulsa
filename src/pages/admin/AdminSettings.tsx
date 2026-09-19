import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

const AdminSettings = () => {
  const { user } = useAuth();
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [proses, setProses] = useState(false);

  const simpan = async () => {
    if (baru.length < 6) {
      toast({ title: "Kata sandi minimal 6 karakter", variant: "destructive" });
      return;
    }
    setProses(true);
    const { error } = await supabase.auth.updateUser({ password: baru, current_password: lama } as never);
    setProses(false);
    if (error) {
      toast({ title: "Gagal mengubah kata sandi", description: error.message, variant: "destructive" });
      return;
    }
    setLama("");
    setBaru("");
    toast({ title: "Kata sandi berhasil diubah" });
  };

  return (
    <AdminLayout judul="Pengaturan">
      <Card className="max-w-lg shadow-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-semibold">Akun Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pb-4 pt-0">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div className="space-y-1.5">
            <Label>Kata Sandi Saat Ini</Label>
            <Input type="password" value={lama} onChange={(e) => setLama(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Kata Sandi Baru</Label>
            <Input type="password" value={baru} onChange={(e) => setBaru(e.target.value)} />
          </div>
          <Button onClick={simpan} disabled={proses}>
            Simpan Kata Sandi
          </Button>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminSettings;
