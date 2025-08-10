import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Phone, Zap, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-primary via-primary to-accent overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-20">
        <div className="w-full h-full bg-white/5 bg-[radial-gradient(circle_at_25%_25%,white_1px,transparent_1px)] bg-[length:40px_40px]"></div>
      </div>
      
      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              <span className="block">Arjuna</span>
              <span className="text-accent-foreground">Tronik</span>
            </h1>
            <p className="text-xl lg:text-2xl text-primary-foreground/90 mb-8 leading-relaxed">
              Layanan pulsa & paket data terpercaya dengan harga terbaik. 
              Isi ulang mudah, cepat, dan aman untuk semua operator.
            </p>
            
            {/* Features */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Zap className="w-5 h-5 text-accent-foreground" />
                <span>Proses Instan</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Shield className="w-5 h-5 text-accent-foreground" />
                <span>100% Aman</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/90">
                <Phone className="w-5 h-5 text-accent-foreground" />
                <span>24/7 Support</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="hero" size="lg" className="shadow-[var(--shadow-hero)]">
                Mulai Isi Pulsa
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-primary-foreground hover:bg-white/20">
                Lihat Harga
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm shadow-[var(--shadow-card)]">
              <CardContent className="p-8">
                <img 
                  src={heroImage} 
                  alt="Arjuna Tronik Pulsa Service" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;