import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Peran = "admin" | "client" | null;

interface AuthState {
  user: User | null;
  session: Session | null;
  peran: Peran;
  clientId: string | null;
  clientNama: string | null;
  clientAktif: boolean;
  loading: boolean;
  keluar: () => Promise<void>;
}

const Ctx = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [peran, setPeran] = useState<Peran>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [clientNama, setClientNama] = useState<string | null>(null);
  const [clientAktif, setClientAktif] = useState(false);
  const [loading, setLoading] = useState(true);
  // ID user yang profilnya sudah (atau sedang) dimuat. Dipakai untuk membedakan
  // "refresh sesi user yang sama" (diam-diam) dari "ganti akun" (loading penuh).
  const uidTermuat = useRef<string | null>(null);
  const pemeriksaan = useRef(0);

  const muatProfil = async (uid: string, versi: number) => {
    try {
    // Validasi ke layanan Auth; jangan mempercayai sesi tersimpan saja.
    const { data: identitas, error: authError } = await supabase.auth.getUser();
    if (uidTermuat.current !== uid || pemeriksaan.current !== versi) return;
    if (authError || !identitas.user) {
      // Gangguan jaringan sementara bukan logout. Sesi invalid ditangani SDK.
      if (!authError || [401, 403].includes(authError.status ?? 0)) {
        await supabase.auth.signOut({ scope: "local" });
        if (pemeriksaan.current === versi) terapkanSesi(null);
      }
      return;
    }
    if (identitas.user.id !== uid) return;
    const [{ data: roles, error: roleError }, { data: profil, error: profileError }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("client_id, clients(id, nama, status)").eq("id", uid).maybeSingle(),
    ]);
    if (uidTermuat.current !== uid || pemeriksaan.current !== versi) return;
    if (roleError || profileError) return;
    const role = roles?.[0]?.role;
    const r: Peran = role === "admin" || role === "client" ? role : null;
    const c = (profil as { clients?: { id: string; nama: string; status: string } | null } | null)?.clients ?? null;
    if (!r || (r === "client" && c?.status !== "active")) {
      await supabase.auth.signOut({ scope: "local" });
      if (pemeriksaan.current === versi) terapkanSesi(null);
      return;
    }
    setPeran(r ?? null);
    setClientId(c?.id ?? null);
    setClientNama(c?.nama ?? null);
    setClientAktif(c?.status === "active");
    } catch {
      // Jangan membongkar dashboard user yang sama karena koneksi terputus.
    } finally {
      if (uidTermuat.current === uid && pemeriksaan.current === versi) setLoading(false);
    }
  };

  const terapkanSesi = (s: Session | null) => {
    setSession(s);
    const pengguna = s?.user ?? null;
    const uid = pengguna?.id ?? null;
    const versi = ++pemeriksaan.current;

    if (uid && pengguna && uid === uidTermuat.current) {
      // User yang sama (misal token diperbarui saat kembali ke tab):
      // perbarui sesi secara diam-diam, jangan tampilkan loading penuh.
      setUser((prev) => (prev?.id === uid ? prev : pengguna));
      setTimeout(() => muatProfil(uid, versi), 0);
      return;
    }

    if (uid && pengguna) {
      // Login pertama kali atau benar-benar ganti akun.
      uidTermuat.current = uid;
      setUser(pengguna);
      setPeran(null);
      setClientId(null);
      setClientNama(null);
      setClientAktif(false);
      setLoading(true);
      setTimeout(() => muatProfil(uid, versi), 0);
      return;
    }

    // Sesi berakhir / logout.
    uidTermuat.current = null;
    setUser(null);
    setPeran(null);
    setClientId(null);
    setClientNama(null);
    setClientAktif(false);
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => terapkanSesi(s));
    // SDK mengirim INITIAL_SESSION setelah memulihkan penyimpanan resminya.
    return () => {
      pemeriksaan.current += 1;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keluar = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal keluar. Periksa koneksi lalu coba lagi.");
      throw error;
    }
    terapkanSesi(null);
  };

  return (
    <Ctx.Provider value={{ user, session, peran, clientId, clientNama, clientAktif, loading, keluar }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return c;
};
