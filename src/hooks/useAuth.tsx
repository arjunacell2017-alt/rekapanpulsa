import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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

  const muatProfil = async (uid: string) => {
    const [{ data: roles }, { data: profil }] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", uid),
      supabase.from("profiles").select("client_id, clients(id, nama, status)").eq("id", uid).maybeSingle(),
    ]);
    const r = roles?.[0]?.role as Peran | undefined;
    setPeran(r ?? null);
    const c = (profil as { clients?: { id: string; nama: string; status: string } | null } | null)?.clients ?? null;
    setClientId(c?.id ?? null);
    setClientNama(c?.nama ?? null);
    setClientAktif(c?.status === "active");
    setLoading(false);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setLoading(true);
        setTimeout(() => muatProfil(s.user.id), 0);
      } else {
        setPeran(null);
        setClientId(null);
        setClientNama(null);
        setClientAktif(false);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) muatProfil(data.session.user.id);
      else setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const keluar = async () => {
    await supabase.auth.signOut();
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
