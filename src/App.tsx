import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import RuteTerlindungi from "@/components/RuteTerlindungi";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminClients from "./pages/admin/AdminClients";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <RuteTerlindungi peranDiizinkan="client">
                  <Index />
                </RuteTerlindungi>
              }
            />
            <Route
              path="/admin"
              element={
                <RuteTerlindungi peranDiizinkan="admin">
                  <AdminDashboard />
                </RuteTerlindungi>
              }
            />
            <Route
              path="/admin/clients"
              element={
                <RuteTerlindungi peranDiizinkan="admin">
                  <AdminClients />
                </RuteTerlindungi>
              }
            />
            <Route
              path="/admin/pengaturan"
              element={
                <RuteTerlindungi peranDiizinkan="admin">
                  <AdminSettings />
                </RuteTerlindungi>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
