import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard, Truck, CalendarDays, ClipboardCheck, TrendingUp, Users,
  ShieldCheck, Menu, X, CheckCircle2, ArrowRight,
} from "lucide-react";

const fitur = [
  { icon: LayoutDashboard, judul: "Dashboard Terpusat", desc: "Pantau kondisi keuangan server pulsa dari satu dashboard." },
  { icon: Truck, judul: "Manajemen Supplier", desc: "Pantau saldo dan posisi supplier dengan lebih mudah." },
  { icon: CalendarDays, judul: "Rekap Harian", desc: "Catat dan pantau rekap harian secara terstruktur." },
  { icon: ClipboardCheck, judul: "Rekonsiliasi Saldo", desc: "Bandingkan saldo seharusnya dengan saldo aktual dan tampilkan selisih secara otomatis." },
  { icon: TrendingUp, judul: "Laba & Rugi", desc: "Pantau perhitungan laba/rugi berdasarkan data yang tersimpan." },
  { icon: Users, judul: "Multi Client", desc: "Setiap client memiliki akun dan data masing-masing yang terisolasi." },
];

const keamanan = [
  "Setiap client memiliki akun sendiri.",
  "Data antar client dipisahkan.",
  "Client hanya dapat mengakses data miliknya.",
  "Admin memiliki akses untuk mengelola akun client.",
  "Authentication menggunakan sistem login yang aman.",
];

const langkah = [
  { no: "01", judul: "Login", desc: "Masuk menggunakan akun yang diberikan oleh Admin." },
  { no: "02", judul: "Kelola Data", desc: "Masukkan dan kelola data server pulsa melalui dashboard." },
  { no: "03", judul: "Pantau & Rekonsiliasi", desc: "Pantau saldo, harta, laba/rugi, dan rekonsiliasi dengan lebih mudah." },
];

function Mockup() {
  const kpi = [
    { l: "Saldo Supplier", v: "Rp 98.420.000", c: "bg-primary" },
    { l: "Total Harta", v: "Rp 12.650.000", c: "bg-accent" },
    { l: "Laba/Rugi", v: "Rp 189.035", c: "bg-success" },
    { l: "Selisih", v: "Rp 0", c: "bg-warning" },
  ];
  return (
    <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
      <div className="flex items-center gap-1.5 border-b bg-muted px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-2 text-[10px] text-muted-foreground">Dashboard Server Pulsa</span>
      </div>
      <div className="flex">
        <div className="hidden sm:block w-24 bg-primary p-2 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-2 rounded ${i === 0 ? "bg-primary-foreground/80" : "bg-primary-foreground/30"}`} />
          ))}
        </div>
        <div className="flex-1 p-3 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {kpi.map((k) => (
              <div key={k.l} className="rounded-lg border p-2">
                <div className={`h-1 w-6 rounded ${k.c} mb-1.5`} />
                <p className="text-[9px] text-muted-foreground">{k.l}</p>
                <p className="text-xs font-bold text-foreground">{k.v}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {["Supplier", "Total Harta"].map((t) => (
              <div key={t} className="rounded-lg border p-2 space-y-1.5">
                <p className="text-[9px] font-semibold text-foreground">{t}</p>
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-1.5 w-10 rounded bg-muted" />
                    <div className="h-1.5 w-8 rounded bg-primary/30" />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-success/10 border border-success/30 p-2 flex justify-between items-center">
            <span className="text-[10px] font-semibold text-foreground">Rekonsiliasi</span>
            <span className="text-[9px] font-bold rounded bg-success px-2 py-0.5 text-success-foreground">SEIMBANG</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [buka, setBuka] = useState(false);
  const { user, peran } = useAuth();
  const sudahLogin = !!user && !!peran;
  const tujuan = sudahLogin ? (peran === "admin" ? "/admin" : "/dashboard") : "/login";
  const labelLogin = sudahLogin ? "BUKA DASHBOARD" : "LOGIN";
  const labelCta = sudahLogin ? "BUKA DASHBOARD" : "LOGIN KE DASHBOARD";

  const nav = [
    { href: "#beranda", l: "Beranda" },
    { href: "#fitur", l: "Fitur" },
    { href: "#tentang", l: "Tentang" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a href="#beranda" className="leading-tight">
            <p className="text-[11px] font-semibold tracking-widest text-muted-foreground">DASHBOARD</p>
            <p className="text-base font-extrabold text-primary">SERVER PULSA</p>
          </a>
          <nav className="hidden md:flex items-center gap-6">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-sm font-medium text-muted-foreground hover:text-primary">{n.l}</a>
            ))}
            <Button asChild size="sm"><Link to={tujuan}>{labelLogin}</Link></Button>
          </nav>
          <button className="md:hidden p-2" aria-label="Menu" onClick={() => setBuka(!buka)}>
            {buka ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {buka && (
          <div className="md:hidden border-t bg-background px-4 py-3 space-y-2">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setBuka(false)} className="block py-1.5 text-sm font-medium">{n.l}</a>
            ))}
            <Button asChild className="w-full"><Link to={tujuan}>{labelLogin}</Link></Button>
          </div>
        )}
      </header>

      <section id="beranda" className="bg-gradient-to-b from-primary/10 to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div>
            <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Aplikasi Rekap Keuangan Server Pulsa</span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
              Kelola Server Pulsa Lebih Mudah dan <span className="text-primary">Terstruktur</span>
            </h1>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Satu dashboard untuk memantau saldo supplier, saldo reseller, harta, laba rugi, dan rekonsiliasi secara lebih cepat dan rapi.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg"><Link to={tujuan}>{labelCta} <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              <Button asChild size="lg" variant="outline"><a href="#fitur">LIHAT FITUR</a></Button>
            </div>
          </div>
          <Mockup />
        </div>
      </section>

      <section id="fitur" className="scroll-mt-16 py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">Semua Kebutuhan Server Pulsa dalam Satu Dashboard</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fitur.map((f) => (
              <div key={f.judul} className="rounded-xl border bg-card p-6 transition hover:shadow-lg hover:border-primary/40">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{f.judul}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="tentang" className="scroll-mt-16 bg-muted/50 py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-2">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">Data Client Terpisah dan Terlindungi</h2>
            <ul className="mt-6 space-y-3">
              {keamanan.map((k) => (
                <li key={k} className="flex gap-2 text-sm sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" /> {k}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Cara Kerja</h2>
            <div className="mt-6 space-y-4">
              {langkah.map((s) => (
                <div key={s.no} className="flex gap-4 rounded-xl border bg-card p-5">
                  <span className="text-2xl font-extrabold text-primary">{s.no}</span>
                  <div>
                    <h3 className="font-semibold">{s.judul}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-2xl bg-primary px-6 py-12 text-center text-primary-foreground">
            <h2 className="text-2xl font-bold sm:text-3xl">Siap Mengelola Server Pulsa dengan Lebih Mudah?</h2>
            <p className="mt-3 opacity-90">Masuk ke dashboard Anda untuk mulai mengelola data server pulsa.</p>
            <Button asChild size="lg" variant="secondary" className="mt-6"><Link to={tujuan}>{labelCta}</Link></Button>
          </div>
        </div>
      </section>

      <footer className="border-t py-8 text-center">
        <p className="font-bold text-primary">DASHBOARD SERVER PULSA</p>
        <p className="mt-1 text-xs text-muted-foreground">© 2026 Server Pulsa. All rights reserved.</p>
      </footer>
    </div>
  );
}
