import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Link2, Package, Smartphone } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Package,
    title: "Track Orders",
    description:
      "Keep your customers informed with real-time shipping updates and beautiful tracking pages.",
  },
  {
    icon: Link2,
    title: "Shareable Links",
    description:
      "Generate unique tracking links for each order and share them directly with your customers.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description:
      "Every tracking page is optimized for mobile — exactly where your customers will view it.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(to bottom, #E9DDCB, #E3D3BE)",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-beige/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
            gift<span className="text-gold">Naura</span>
          </h1>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a
              href="#features"
              className="hover:text-foreground transition-colors"
            >
              Features
            </a>
            <a
              href="#track"
              className="hover:text-foreground transition-colors"
            >
              Track Order
            </a>
          </nav>
          <button
            type="button"
            data-ocid="landing.primary_button"
            onClick={() => navigate({ to: "/login" })}
            className="bg-gold hover:bg-gold-hover text-white font-medium px-5 py-2 rounded-full text-sm transition-colors shadow-gold"
          >
            Admin Login
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        {/* Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-card p-8 md:p-16 mb-12 md:mb-16"
        >
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="inline-block text-xs font-medium text-gold uppercase tracking-widest mb-4 px-3 py-1 rounded-full bg-gold/10">
                Shipping Made Beautiful
              </span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                Track every order with{" "}
                <span className="text-gold">elegance</span>
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed mb-8">
                giftNaura helps you manage your orders and delight customers
                with premium tracking pages — simple, fast, and beautiful.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  data-ocid="hero.primary_button"
                  onClick={() => navigate({ to: "/login" })}
                  className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-white font-medium px-6 py-3 rounded-full transition-colors shadow-gold"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  data-ocid="hero.secondary_button"
                  onClick={() =>
                    navigate({
                      to: "/track/$orderId",
                      params: { orderId: "demo" },
                    })
                  }
                  className="flex items-center gap-2 bg-white border-2 border-gold text-gold hover:bg-gold-muted font-medium px-6 py-3 rounded-full transition-colors"
                >
                  See Example
                </button>
              </div>
            </div>

            {/* Phone mockup */}
            <div id="track" className="flex justify-center md:justify-end">
              <div
                className="rounded-3xl p-6 text-center"
                style={{ background: "#E9DDCB", maxWidth: 280 }}
              >
                <div className="bg-white rounded-2xl p-6 shadow-card">
                  <p className="font-display text-xl font-bold text-foreground mb-1">
                    gift<span className="text-gold">Naura</span>
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Track Your Order
                  </p>
                  <div className="bg-beige rounded-xl p-4 mb-4 text-left">
                    <p className="text-sm font-medium text-foreground">
                      Hello, Sarah!
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Order #ORD-2024-001
                    </p>
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-gold/15 text-gold">
                      Shipped
                    </span>
                  </div>
                  <div className="bg-gold rounded-full py-2 px-4 text-white text-sm font-medium">
                    Track Shipment →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div id="features" className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="relative bg-white rounded-2xl p-8 shadow-card overflow-hidden group hover:shadow-card-hover transition-shadow"
              >
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-gold" />
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
                {/* Gold corner accent */}
                <div
                  className="absolute bottom-0 right-0 w-12 h-12"
                  style={{
                    background:
                      "linear-gradient(135deg, transparent 60%, #B89545 60%)",
                  }}
                />
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-border">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} gift
          <span className="text-gold">Naura</span>. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
