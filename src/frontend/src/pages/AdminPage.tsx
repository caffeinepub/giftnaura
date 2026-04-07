import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "@tanstack/react-router";
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  ExternalLink,
  Loader2,
  LogOut,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  OrderStatus,
  useCreateOrder,
  useDeleteOrder,
  useGetAllOrders,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

function formatDate(createdAt: bigint): string {
  return new Date(Number(createdAt / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === OrderStatus.delivered
          ? "bg-green-100 text-green-700"
          : "bg-gold/15 text-gold"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          status === OrderStatus.delivered ? "bg-green-500" : "bg-gold"
        }`}
      />
      {status === OrderStatus.delivered ? "Delivered" : "Shipped"}
    </span>
  );
}

function OrderCard({
  order,
  onDelete,
  onStatusChange,
}: {
  order: Order;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  const trackingUrl = `${window.location.origin}/track/${order.orderId}`;

  function copyLink() {
    navigator.clipboard.writeText(trackingUrl);
    toast.success("Link copied to clipboard!");
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {order.customerName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Order ID:{" "}
            <span className="font-mono font-medium text-foreground">
              {order.orderId}
            </span>
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Created {formatDate(order.createdAt)}
      </p>

      {/* Status toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-muted-foreground">Status:</span>
        <Select
          value={order.status}
          onValueChange={(val) =>
            onStatusChange(order.orderId, val as OrderStatus)
          }
        >
          <SelectTrigger
            data-ocid="order.select"
            className="h-7 text-xs w-[120px] rounded-full border-border"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
            <SelectItem value={OrderStatus.delivered}>Delivered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <a
          data-ocid="order.button"
          href={`/track/${order.orderId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-beige hover:bg-beige-dark text-foreground transition-colors"
        >
          <ExternalLink className="w-3 h-3" />
          View
        </a>
        <button
          type="button"
          data-ocid="order.secondary_button"
          onClick={copyLink}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 text-gold transition-colors"
        >
          <Copy className="w-3 h-3" />
          Copy Link
        </button>
        <button
          type="button"
          data-ocid="order.delete_button"
          onClick={() => onDelete(order.orderId)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors ml-auto"
        >
          <Trash2 className="w-3 h-3" />
          Delete
        </button>
      </div>
    </motion.div>
  );
}

export default function AdminPage() {
  const navigate = useNavigate();
  const { clear, identity, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorLoading } = useActor();
  const isAuthenticated = !!identity;

  // Admin guard
  const [adminVerified, setAdminVerified] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);

  useEffect(() => {
    if (!isInitializing && !isAuthenticated) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuthenticated, isInitializing, navigate]);

  useEffect(() => {
    if (!actor || actorLoading || adminCheckDone) return;
    actor
      .isCallerAdmin()
      .then((isAdmin) => {
        setAdminCheckDone(true);
        if (!isAdmin) {
          navigate({ to: "/login", replace: true });
        } else {
          setAdminVerified(true);
        }
      })
      .catch(() => {
        setAdminCheckDone(true);
        navigate({ to: "/login", replace: true });
      });
  }, [actor, actorLoading, adminCheckDone, navigate]);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.shipped);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Search
  const [search, setSearch] = useState("");

  // Queries
  const { data: orders = [], isLoading: ordersLoading } = useGetAllOrders();
  const createOrder = useCreateOrder();
  const deleteOrder = useDeleteOrder();
  const updateStatus = useUpdateOrderStatus();

  const filteredOrders = orders.filter(
    (o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderId.toLowerCase().includes(search.toLowerCase()),
  );

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !orderId.trim() || !trackingLink.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const newOrder = {
      customerName: customerName.trim(),
      orderId: orderId.trim(),
      trackingLink: trackingLink.trim(),
      status,
      createdAt: BigInt(Date.now()) * 1_000_000n,
    };
    createOrder.mutate(newOrder, {
      onSuccess: () => {
        setCreatedOrderId(orderId.trim());
        setCustomerName("");
        setOrderId("");
        setTrackingLink("");
        setStatus(OrderStatus.shipped);
        toast.success("Tracking page created!");
      },
      onError: (err) => {
        toast.error(
          err instanceof Error ? err.message : "Failed to create order",
        );
      },
    });
  }

  function handleDelete(id: string) {
    deleteOrder.mutate(id, {
      onSuccess: () => toast.success("Order deleted"),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to delete order",
        ),
    });
  }

  function handleStatusChange(id: string, newStatus: OrderStatus) {
    updateStatus.mutate(
      { orderId: id, status: newStatus },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to update status",
          ),
      },
    );
  }

  function handleLogout() {
    clear();
    navigate({ to: "/login", replace: true });
  }

  function copyCreatedLink() {
    if (!createdOrderId) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/track/${createdOrderId}`,
    );
    toast.success("Link copied to clipboard!");
  }

  if (!adminVerified || isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, #E9DDCB, #E3D3BE)" }}
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, #E9DDCB, #E3D3BE)" }}
    >
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <h1 className="font-display text-xl md:text-2xl font-bold text-foreground">
            gift<span className="text-gold">Naura</span>
          </h1>
          <button
            type="button"
            data-ocid="admin.secondary_button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Add Order Form */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-3xl shadow-card p-6 md:p-8"
          data-ocid="admin.panel"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gold/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-gold" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">
                Add New Order
              </h2>
              <p className="text-xs text-muted-foreground">
                Create a tracking page for a customer
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateOrder} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="customerName"
                  className="text-sm font-medium text-foreground"
                >
                  Customer Name
                </Label>
                <Input
                  data-ocid="order.input"
                  id="customerName"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sarah Al-Rashid"
                  className="rounded-xl border-border focus:ring-gold/30"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="orderId"
                  className="text-sm font-medium text-foreground"
                >
                  Order ID
                </Label>
                <Input
                  data-ocid="order.input"
                  id="orderId"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="e.g. ORD-2024-001"
                  className="rounded-xl border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="trackingLink"
                className="text-sm font-medium text-foreground"
              >
                Tracking Link (URL)
              </Label>
              <Input
                data-ocid="order.input"
                id="trackingLink"
                type="url"
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                placeholder="https://tracking.dhl.com/..."
                className="rounded-xl border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Initial Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as OrderStatus)}
              >
                <SelectTrigger
                  data-ocid="order.select"
                  className="rounded-xl border-border w-full md:w-[200px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                  <SelectItem value={OrderStatus.delivered}>
                    Delivered
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                data-ocid="order.submit_button"
                type="submit"
                disabled={createOrder.isPending}
                className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-white font-medium py-2.5 px-6 rounded-full transition-colors shadow-gold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {createOrder.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {createOrder.isPending
                  ? "Generating..."
                  : "Generate Tracking Page"}
              </button>
            </div>
          </form>

          {/* Success message */}
          <AnimatePresence>
            {createdOrderId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                data-ocid="order.success_state"
                className="mt-4 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-green-800">
                    Tracking page created!
                  </p>
                  <p className="text-xs text-green-700 mt-1 font-mono break-all">
                    {window.location.origin}/track/{createdOrderId}
                  </p>
                </div>
                <button
                  type="button"
                  data-ocid="order.secondary_button"
                  onClick={copyCreatedLink}
                  className="flex-shrink-0 flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-full bg-white border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>

        {/* Orders List */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl text-foreground">
              All Orders
              <span className="ml-2 text-sm font-body font-normal text-muted-foreground">
                ({filteredOrders.length})
              </span>
            </h2>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-ocid="admin.search_input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or order ID..."
              className="pl-11 rounded-full border-border bg-white shadow-xs"
            />
          </div>

          {/* Orders grid */}
          {ordersLoading ? (
            <div
              data-ocid="orders.loading_state"
              className="flex items-center justify-center py-16"
            >
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              data-ocid="orders.empty_state"
              className="bg-white rounded-3xl shadow-card p-12 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center mx-auto mb-4">
                <ChevronDown className="w-6 h-6 text-gold" />
              </div>
              <p className="font-display font-bold text-lg text-foreground mb-1">
                {search ? "No orders found" : "No orders yet"}
              </p>
              <p className="text-sm text-muted-foreground">
                {search
                  ? "Try a different search term"
                  : "Add your first order above to get started"}
              </p>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4" data-ocid="orders.list">
              <AnimatePresence>
                {filteredOrders.map((order, index) => (
                  <div
                    key={order.orderId}
                    data-ocid={`orders.item.${index + 1}`}
                  >
                    <OrderCard
                      order={order}
                      onDelete={handleDelete}
                      onStatusChange={handleStatusChange}
                    />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-border">
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
