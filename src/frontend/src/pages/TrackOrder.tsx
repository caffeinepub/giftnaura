import { useParams } from "@tanstack/react-router";
import { ExternalLink, Gift, Loader2, PackageSearch } from "lucide-react";
import { motion } from "motion/react";
import { OrderStatus, useGetOrder } from "../hooks/useQueries";

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; dot: string; badge: string }
> = {
  [OrderStatus.shipped]: {
    label: "Shipped",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
  },
  [OrderStatus.delivered]: {
    label: "Delivered",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 border-green-200",
  },
  [OrderStatus.processing]: {
    label: "In Transit",
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
  },
  [OrderStatus.cancelled]: {
    label: "Cancelled",
    dot: "bg-gray-400",
    badge: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG[OrderStatus.shipped];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${
        config.badge
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function TrackOrder() {
  const { orderId } = useParams({ strict: false }) as { orderId?: string };
  const { data: order, isLoading, isError } = useGetOrder(orderId ?? "");

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{
        background: "linear-gradient(160deg, #F5F0E8 0%, #EDE4D3 100%)",
      }}
    >
      {/* Brand header */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gift className="w-6 h-6 text-gold" />
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            gift<span className="text-gold">Naura</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-xs uppercase tracking-[0.18em] mt-1">
          Track Your Order
        </p>
      </motion.div>

      {/* Main card */}
      <div className="w-full max-w-sm">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
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
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            data-ocid="tracking.error_state"
            className="bg-white rounded-3xl shadow-card p-10 flex flex-col items-center gap-4 text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
              <PackageSearch className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-display font-bold text-lg text-foreground">
                Order Not Found
              </p>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                We couldn&apos;t find an order with this ID. Please check the
                link and try again.
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
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            data-ocid="tracking.card"
            className="bg-white rounded-3xl shadow-card overflow-hidden"
          >
            {/* Gold accent bar */}
            <div
              className="h-1.5"
              style={{
                background:
                  "linear-gradient(90deg, #C9A84C 0%, #E8CC85 50%, #C9A84C 100%)",
              }}
            />

            <div className="p-7">
              {/* Greeting */}
              <div className="mb-6">
                <p className="text-muted-foreground text-xs uppercase tracking-widest mb-1">
                  Hello,
                </p>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {order.customerName}
                </h2>
              </div>

              {/* Order details card */}
              <div
                className="rounded-2xl p-4 mb-6 space-y-3"
                style={{ background: "#F5F0E8" }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium">
                    Order ID
                  </span>
                  <span className="font-mono text-sm font-semibold text-foreground">
                    {order.orderId}
                  </span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground uppercase tracking-[0.15em] font-medium">
                    Status
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {/* CTA */}
              <a
                data-ocid="tracking.primary_button"
                href={order.trackingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-gold hover:bg-gold-hover text-white font-semibold py-4 px-6 rounded-full transition-colors shadow-gold text-base"
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
        className="mt-10 text-xs text-muted-foreground text-center"
      >
        Powered by{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          caffeine.ai
        </a>
      </motion.p>
    </div>
  );
}
