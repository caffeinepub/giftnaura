import { Gift, Link2, Package, Smartphone } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Package,
    title: "Track Orders",
    description:
      "Keep customers informed with beautiful, branded tracking pages sent directly to them.",
  },
  {
    icon: Link2,
    title: "Shareable Links",
    description:
      "Generate unique tracking links for each order and share them via WhatsApp, email, or DM.",
  },
  {
    icon: Smartphone,
    title: "Mobile-First",
    description:
      "Every page is designed for mobile — precisely where your customers will open it.",
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #F5F0E8 0%, #EDE4D3 100%)",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-gold" />
            <span className="font-display text-xl font-bold text-foreground tracking-tight">
              gift<span className="text-gold">Naura</span>
            </span>
          </div>
          <nav aria-label="Main navigation">
            {/* No admin links on the public page */}
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-12 md:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div>
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-block text-xs font-semibold text-gold uppercase tracking-[0.18em] mb-5 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/20"
              >
                Premium Gift Tracking
              </motion.span>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground leading-[1.1] mb-5">
                Delight every customer with{" "}
                <em className="not-italic text-gold">elegant</em> tracking
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8 text-base">
                giftNaura turns your shipments into a premium brand experience.
                Manage orders privately, share beautiful tracking pages, and
                impress your customers every time.
              </p>
            </div>

            {/* Phone preview */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="flex justify-center md:justify-end"
            >
              <div className="relative">
                {/* Outer glow */}
                <div
                  className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
                  style={{ background: "#C9A84C" }}
                />
                <div
                  className="relative rounded-3xl p-5 shadow-card"
                  style={{ background: "#EDE4D3", maxWidth: 260 }}
                >
                  <div className="bg-white rounded-2xl p-5 shadow-xs">
                    <p className="font-display text-lg font-bold text-foreground mb-0.5">
                      gift<span className="text-gold">Naura</span>
                    </p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                      Track Your Order
                    </p>
                    <div
                      className="rounded-xl p-4 mb-4 text-left"
                      style={{ background: "#F5F0E8" }}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        Hello, Layla!
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Order #GN-2025-047
                      </p>
                      <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium px-2.5 py-1 rounded-full bg-gold/15 text-gold border border-gold/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                        Shipped
                      </span>
                    </div>
                    <div className="bg-gold rounded-full py-2.5 px-4 text-white text-xs font-semibold text-center shadow-gold">
                      Track Shipment →
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-5 md:px-8 pb-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid md:grid-cols-3 gap-5"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + i * 0.1, duration: 0.4 }}
                  className="relative bg-white rounded-2xl p-7 shadow-card overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                  {/* Gold corner accent */}
                  <div
                    className="absolute bottom-0 right-0 w-10 h-10"
                    style={{
                      background:
                        "linear-gradient(135deg, transparent 60%, rgba(201,168,76,0.4) 60%)",
                    }}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-7">
        <p className="text-center text-xs text-muted-foreground">
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
