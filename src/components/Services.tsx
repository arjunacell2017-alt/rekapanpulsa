import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Wifi, Gamepad2, CreditCard } from "lucide-react";

const services = [
  {
    icon: Smartphone,
    title: "Pulsa Reguler",
    description: "Isi pulsa untuk semua operator dengan harga terbaik",
    features: ["Telkomsel", "Indosat", "XL", "Tri", "Smartfren"],
    price: "Mulai 5rb"
  },
  {
    icon: Wifi,
    title: "Paket Data",
    description: "Paket internet dengan kuota berlimpah untuk kebutuhan digital",
    features: ["Paket Harian", "Paket Bulanan", "Paket Unlimited", "Paket Chat"],
    price: "Mulai 10rb"
  },
  {
    icon: Gamepad2,
    title: "Voucher Game",
    description: "Top up game favorit dengan mudah dan cepat",
    features: ["Mobile Legends", "Free Fire", "PUBG", "Genshin Impact"],
    price: "Mulai 15rb"
  },
  {
    icon: CreditCard,
    title: "E-Wallet",
    description: "Isi saldo dompet digital untuk kemudahan transaksi",
    features: ["GoPay", "OVO", "DANA", "ShopeePay"],
    price: "Mulai 10rb"
  }
];

const Services = () => {
  return (
    <section className="py-20 bg-light-blue">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
            Layanan Kami
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Berbagai pilihan layanan digital untuk memenuhi kebutuhan komunikasi dan hiburan Anda
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="group hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-2 border-0 bg-white">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-xl text-primary">{service.title}</CardTitle>
                  <CardDescription className="text-sm">{service.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-accent mb-3">{service.price}</p>
                    <Button variant="electric" className="w-full">
                      Pilih Layanan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;