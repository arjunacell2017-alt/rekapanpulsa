import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface Props {
  children: React.ReactNode;
  peranDiizinkan: "admin" | "client";
}

const RuteTerlindungi = ({ children, peranDiizinkan }: Props) => {
  const { user, peran, loading } = useAuth();
  const lokasi = useLocation();

  // Loading penuh hanya saat status login/peran belum diketahui.
  // Jika user & peran sudah ada (refresh sesi di latar belakang), halaman tetap tampil.
  if (loading && !(user && peran)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" state={{ from: lokasi.pathname }} replace />;
  if (peran !== peranDiizinkan) {
    return <Navigate to={peran === "admin" ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
};

export default RuteTerlindungi;
