import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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

  const muatProfil = async (uid: string) => {
    const [{ data: roles }, { data: profil }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("client_id, clients(id, nama, status)").eq("id", uid).maybeSingle(),
    ]);
    if (uidTermuat.current !== uid) return; // akun sudah berganti selama memuat
    const r = roles?.[0]?.role as Peran | undefined;
    setPeran(r ?? null);
    const c = (profil as { clients?: { id: string; nama: string; status: string } | null } | null)?.clients ?? null;
    setClientId(c?.id ?? null);
    setClientNama(c?.nama ?? null);
    setClientAktif(c?.status === "active");
    setLoading(false);
  };

  const terapkanSesi = (s: Session | null) => {
    setSession(s);
    const uid = s?.user?.id ?? null;

    if (uid && uid === uidTermuat.current) {
      // User yang sama (misal token diperbarui saat kembali ke tab):
      // perbarui sesi secara diam-diam, jangan tampilkan loading penuh.
      setUser((prev) => (prev?.id === uid ? prev : s!.user));
      return;
    }

    if (uid) {
      // Login pertama kali atau benar-benar ganti akun.
      uidTermuat.current = uid;
      setUser(s!.user);
      setLoading(true);
      setTimeout(() => muatProfil(uid), 0);
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
    supabase.auth.getSession().then(({ data }) => terapkanSesi(data.session));
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keluar = async () => {
    await supabase.auth.signOut();
    uidTermuat.current = null;
    setPeran(null);
    setClientId(null);
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
