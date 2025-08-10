import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Clock, MessageCircle } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Hubungi Kami
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Butuh bantuan atau punya pertanyaan? Tim kami siap membantu Anda 24/7
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <Card className="bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Phone className="w-6 h-6" />
                  Informasi Kontak
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Hubungi kami melalui berbagai saluran komunikasi
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid gap-6">
              <Card className="hover:shadow-[var(--shadow-card)] transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Alamat</h3>
                      <p className="text-muted-foreground">
                        Jl. Teknologi No. 123<br />
                        Jakarta Selatan, DKI Jakarta 12345
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[var(--shadow-card)] transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Telepon & WhatsApp</h3>
                      <p className="text-muted-foreground">
                        +62 812-3456-7890<br />
                        +62 821-9876-5432
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-[var(--shadow-card)] transition-shadow duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-primary mb-1">Jam Operasional</h3>
                      <p className="text-muted-foreground">
                        Senin - Minggu<br />
                        24 Jam (Online)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Contact Form */}
          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardHeader>
              <CardTitle className="text-2xl text-primary flex items-center gap-3">
                <MessageCircle className="w-6 h-6" />
                Kirim Pesan
              </CardTitle>
              <CardDescription>
                Isi form di bawah ini untuk menghubungi kami
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium text-primary">Nama Lengkap</label>
                  <Input placeholder="Masukkan nama lengkap Anda" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Nomor WhatsApp</label>
                  <Input placeholder="Contoh: 081234567890" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Subjek</label>
                  <Input placeholder="Tentang apa pesan Anda?" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium text-primary">Pesan</label>
                  <Textarea 
                    placeholder="Tulis pesan Anda di sini..." 
                    className="mt-1 min-h-[120px]" 
                  />
                </div>
              </div>
              <Button variant="hero" className="w-full" size="lg">
                Kirim Pesan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Contact;