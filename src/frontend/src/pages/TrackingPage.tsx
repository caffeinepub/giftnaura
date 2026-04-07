import { useParams } from "@tanstack/react-router";
import { ExternalLink, Loader2, PackageSearch } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus, useGetOrder } from "../hooks/useQueries";

function StatusBadge({ status }: { status: OrderStatus }) {
  const isDelivered = status === OrderStatus.delivered;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
        isDelivered ? "bg-green-100 text-green-700" : "bg-gold/15 text-gold"
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isDelivered ? "bg-green-500" : "bg-gold"
        }`}
      />
      {isDelivered ? "Delivered" : "Shipped"}
    </span>
  );
}

export default function TrackingPage() {
  const { orderId } = useParams({ strict: false }) as { orderId?: string };
  const { data: order, isLoading, isError } = useGetOrder(orderId ?? "");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(to bottom, #E9DDCB, #E3D3BE)" }}
    >
      {/* Brand header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
          gift<span className="text-gold">Naura</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-2 uppercase tracking-widest">
          Track Your Order
        </p>
      </motion.div>

      {/* Main card */}
      <div className="w-full max-w-sm">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            data-ocid="tracking.loading_state"
            className="bg-white rounded-3xl shadow-card p-10 flex flex-col items-center gap-4"
          >
            <Loader2 className="w-8 h-8 text-gold animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading your order...
            </p>
          </motion.div>
        ) : isError || !order ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            data-ocid="tracking.error_state"
            className="bg-white rounded-3xl shadow-card p-10 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-beige flex items-center justify-center">
              <PackageSearch className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground">
                Order Not Found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                We couldn't find an order with this ID. Please check the link
                and try again.
              </p>
            </div>
            <a
              href="/"
              className="text-sm font-medium text-gold hover:text-gold-hover transition-colors"
            >
              ← Return home
            </a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            data-ocid="tracking.card"
            className="bg-white rounded-3xl shadow-card overflow-hidden"
          >
            {/* Top gold accent bar */}
            <div className="h-1.5 bg-gold" />

            <div className="p-7">
              {/* Greeting */}
              <div className="mb-5">
                <p className="text-muted-foreground text-sm mb-1">Hello,</p>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {order.customerName}
                </h2>
              </div>

              {/* Order info */}
              <div className="bg-beige rounded-2xl p-4 mb-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Order ID
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {order.orderId}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">
                    Status
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* CTA Button */}
              <a
                data-ocid="tracking.primary_button"
                href={order.trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold-hover text-white font-semibold py-3.5 px-6 rounded-full transition-colors shadow-gold text-base"
              >
                Track Shipment
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 text-xs text-muted-foreground"
      >
        Powered by{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          giftNaura
        </a>
      </motion.p>
    </div>
  );
}
