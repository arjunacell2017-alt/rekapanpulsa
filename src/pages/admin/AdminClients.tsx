import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatTanggal } from "@/lib/format";
import { Eye, KeyRound, Pencil, Plus, Power, Trash2, Loader2, UserPlus } from "lucide-react";

interface ClientUser {
  id: string;
  nama: string | null;
  email: string | null;
}

interface ClientRow {
  id: string;
  kode: string;
  nama: string;
  email: string | null;
  status: string;
  created_at: string;
  users: ClientUser[];
}

const AdminClients = () => {
  const [data, setData] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [akunOpen, setAkunOpen] = useState(false);
  const [proses, setProses] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [terpilih, setTerpilih] = useState<ClientRow | null>(null);
  const [form, setForm] = useState({ nama: "", email: "", password: "", status: "active" });
  const [sandiBaru, setSandiBaru] = useState("");

  const panggil = async (action: string, payload?: unknown) => {
    const { data: res, error } = await supabase.functions.invoke("admin-api", { body: { action, payload } });
    if (error) throw new Error(error.message);
    if ((res as { error?: string })?.error) throw new Error((res as { error: string }).error);
    return res;
  };

  const muat = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await panggil("list")) as { clients: ClientRow[] };
      setData(res.clients ?? []);
    } catch (e) {
      toast({ title: "Gagal memuat client", description: (e as Error).message, variant: "destructive" });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ nama: "", email: "", password: "", status: "active" });
    setFormOpen(true);
  };

  const bukaEdit = (c: ClientRow) => {
    setEditId(c.id);
    setForm({ nama: c.nama, email: c.email ?? "", password: "", status: c.status });
    setFormOpen(true);
  };

  const simpan = async () => {
    setProses(true);
    try {
      if (editId) {
        await panggil("update", { id: editId, nama: form.nama, email: form.email, status: form.status });
        toast({ title: "Data client diperbarui" });
      } else {
        await panggil("create", form);
        toast({ title: "Client baru dibuat" });
      }
      setFormOpen(false);
      muat();
    } catch (e) {
      toast({ title: "Gagal menyimpan", description: (e as Error).message, variant: "destructive" });
    }
    setProses(false);
  };

  const ubahStatus = async (c: ClientRow) => {
    try {
      await panggil("toggle_status", { id: c.id, status: c.status === "active" ? "inactive" : "active" });
      toast({ title: c.status === "active" ? "Client dinonaktifkan" : "Client diaktifkan" });
      muat();
    } catch (e) {
      toast({ title: "Gagal mengubah status", description: (e as Error).message, variant: "destructive" });
    }
  };

  const resetSandi = async () => {
    const uid = terpilih?.users?.[0]?.id;
    if (!uid) return;
    setProses(true);
    try {
      await panggil("reset_password", { user_id: uid, password: sandiBaru });
      toast({ title: "Kata sandi client direset" });
      setResetOpen(false);
      setSandiBaru("");
    } catch (e) {
      toast({ title: "Gagal reset kata sandi", description: (e as Error).message, variant: "destructive" });
    }
    setProses(false);
  };

  const buatAkun = async () => {
    if (!terpilih) return;
    setProses(true);
    try {
      await panggil("create_user", {
        client_id: terpilih.id,
        nama: form.nama || terpilih.nama,
        email: form.email,
        password: form.password,
      });
      toast({ title: "Akun login client dibuat" });
      setAkunOpen(false);
      muat();
    } catch (e) {
      toast({ title: "Gagal membuat akun", description: (e as Error).message, variant: "destructive" });
    }
    setProses(false);
  };

  const hapus = async (c: ClientRow) => {
    if (!confirm(`Hapus client ${c.nama} beserta akun loginnya? Data keuangannya juga ikut terhapus.`)) return;
    try {
      await panggil("delete", { id: c.id });
      toast({ title: "Client dihapus" });
      muat();
    } catch (e) {
      toast({ title: "Gagal menghapus", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout judul="Manajemen Client">
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
            <p className="text-sm font-semibold">Daftar Client</p>
            <Button size="sm" onClick={bukaTambah}>
              <Plus className="mr-1 h-4 w-4" /> Tambah Client
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-info-soft">
                  <TableHead className="h-9 w-8 px-2 text-xs">No</TableHead>
                  <TableHead className="h-9 px-2 text-xs">Nama Client</TableHead>
                  <TableHead className="h-9 px-2 text-xs">Email / Username</TableHead>
                  <TableHead className="h-9 px-2 text-xs">Status</TableHead>
                  <TableHead className="h-9 px-2 text-xs">Tanggal Dibuat</TableHead>
                  <TableHead className="h-9 px-2 text-right text-xs">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                )}
                {!loading && data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Belum ada client.
                    </TableCell>
                  </TableRow>
                )}
                {data.map((c, i) => (
                  <TableRow key={c.id}>
                    <TableCell className="px-2 py-2 text-sm">{i + 1}</TableCell>
                    <TableCell className="px-2 py-2 text-sm font-medium">
                      {c.nama}
                      <span className="ml-2 text-xs text-muted-foreground">{c.kode}</span>
                    </TableCell>
                    <TableCell className="px-2 py-2 text-sm">
                      {c.users?.[0]?.email ?? c.email ?? <span className="text-muted-foreground">belum ada akun</span>}
                    </TableCell>
                    <TableCell className="px-2 py-2">
                      <Badge variant={c.status === "active" ? "default" : "secondary"}>
                        {c.status === "active" ? "AKTIF" : "NONAKTIF"}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-2 py-2 text-sm">{formatTanggal(c.created_at.slice(0, 10))}</TableCell>
                    <TableCell className="px-2 py-2">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button asChild size="icon" variant="ghost" className="h-7 w-7" title="Lihat dashboard">
                          <Link to={`/dashboard?client=${c.id}`}>
                            <Eye className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="Edit"
                          onClick={() => bukaEdit(c)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title={c.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                          onClick={() => ubahStatus(c)}
                        >
                          <Power className={c.status === "active" ? "h-3.5 w-3.5 text-warning" : "h-3.5 w-3.5 text-success"} />
                        </Button>
                        {c.users?.length ? (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Reset kata sandi"
                            onClick={() => {
                              setTerpilih(c);
                              setSandiBaru("");
                              setResetOpen(true);
                            }}
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            title="Buat akun login"
                            onClick={() => {
                              setTerpilih(c);
                              setForm({ nama: c.nama, email: "", password: "", status: c.status });
                              setAkunOpen(true);
                            }}
                          >
                            <UserPlus className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          title="Hapus"
                          onClick={() => hapus(c)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Client" : "Tambah Client"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Nama Client</Label>
              <Input value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email / Username</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={!!editId}
              />
            </div>
            {!editId && (
              <div className="space-y-1.5">
                <Label>Password Awal</Label>
                <Input
                  type="text"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            <p className="text-xs text-muted-foreground">Kode client dibuat otomatis oleh sistem.</p>
          </div>
          <DialogFooter>
            <Button onClick={simpan} disabled={proses}>
              {proses && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Kata Sandi</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Kata Sandi Baru untuk {terpilih?.nama}</Label>
            <Input value={sandiBaru} onChange={(e) => setSandiBaru(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={resetSandi} disabled={proses || sandiBaru.length < 6}>
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={akunOpen} onOpenChange={setAkunOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Buat Akun Login — {terpilih?.nama}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email / Username</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Password Awal</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={buatAkun} disabled={proses || form.password.length < 6}>
              Buat Akun
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminClients;
