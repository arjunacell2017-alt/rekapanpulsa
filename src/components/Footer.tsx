import { Card } from "@/components/ui/card";
import { Smartphone, Mail, MapPin, Clock } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-accent-foreground" />
              Arjuna Tronik
            </h3>
            <p className="text-primary-foreground/80 mb-4 leading-relaxed">
              Solusi terpercaya untuk kebutuhan pulsa, paket data, dan layanan digital Anda. 
              Melayani dengan profesional sejak 2020.
            </p>
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Layanan 24/7</span>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Layanan</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Pulsa Reguler</li>
              <li>Paket Data</li>
              <li>Voucher Game</li>
              <li>E-Wallet</li>
              <li>Token PLN</li>
            </ul>
          </div>

          {/* Operators */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Operator</h4>
            <ul className="space-y-2 text-primary-foreground/80">
              <li>Telkomsel</li>
              <li>Indosat Ooredoo</li>
              <li>XL Axiata</li>
              <li>Tri (3)</li>
              <li>Smartfren</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Kontak</h4>
            <div className="space-y-3 text-primary-foreground/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span className="text-sm">
                  Jl. Teknologi No. 123<br />
                  Jakarta Selatan, DKI Jakarta
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                <span className="text-sm">+62 812-3456-7890</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span className="text-sm">info@arjunatronik.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-primary-foreground/80 text-sm">
                © 2024 Arjuna Tronik. Semua hak cipta dilindungi.
              </p>
              <div className="flex gap-6 text-sm text-primary-foreground/80">
                <span>Kebijakan Privasi</span>
                <span>Syarat & Ketentuan</span>
                <span>FAQ</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </footer>
  );
};

export default Footer;