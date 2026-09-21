import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [proses, setProses] = useState(false);
  const { user, peran, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && peran) {
      navigate(peran === "admin" ? "/admin" : "/dashboard", { replace: true });
    }
  }, [user, peran, loading, navigate]);

  const masuk = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setProses(true);
    const { data, error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (err) {
      setError(
        err.message.toLowerCase().includes("invalid")
          ? "Email atau kata sandi salah."
          : `Gagal masuk: ${err.message}`
      );
      setProses(false);
      return;
    }

    const uid = data.user.id;
    const [{ data: roles }, { data: profil }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("clients(status)").eq("id", uid).maybeSingle(),
    ]);
    const r = roles?.[0]?.role;
    const status = (profil as { clients?: { status: string } | null } | null)?.clients?.status;

    if (r === "client" && status !== "active") {
      await supabase.auth.signOut();
      setError("Akun Anda sedang dinonaktifkan. Hubungi admin.");
      setProses(false);
      return;
    }
    if (!r) {
      await supabase.auth.signOut();
      setError("Akun belum memiliki akses. Hubungi admin.");
      setProses(false);
      return;
    }

    navigate(r === "admin" ? "/admin" : "/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-info-soft">
            <ShieldCheck className="h-5 w-5 text-electric-blue" />
          </div>
          <CardTitle className="text-lg font-bold text-primary">SERVER PULSA</CardTitle>
          <p className="text-sm text-muted-foreground">Masuk ke dashboard rekap keuangan</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={masuk} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Kata Sandi</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={proses}>
              {proses && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Masuk
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
