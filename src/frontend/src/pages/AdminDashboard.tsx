import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Copy,
  Loader2,
  LogOut,
  Package2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Order } from "../backend";
import { useActor } from "../hooks/useActor";
import {
  OrderStatus,
  useCreateOrder,
  useDeleteOrder,
  useGetAllOrders,
  useIsAdmin,
  useUpdateOrderStatus,
} from "../hooks/useQueries";

const SESSION_KEY = "giftnAura_admin_session";

function formatDate(createdAt: bigint): string {
  return new Date(Number(createdAt / 1_000_000n)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        config.badge
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function OrderCard({
  order,
  index,
  onDelete,
  onEdit,
}: {
  order: Order;
  index: number;
  onDelete: (id: string) => void;
  onEdit: (order: Order) => void;
}) {
  const trackingUrl = `${window.location.origin}/track/${order.orderId}`;

  function copyLink() {
    navigator.clipboard.writeText(trackingUrl);
    toast.success("Tracking link copied!");
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -8 }}
      transition={{ duration: 0.25 }}
      data-ocid={`orders.item.${index}`}
      className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate text-sm">
            {order.customerName}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            <span className="font-mono font-medium text-foreground/70">
              {order.orderId}
            </span>
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        {formatDate(order.createdAt)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          data-ocid={`orders.edit_button.${index}`}
          onClick={() => onEdit(order)}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-muted hover:bg-border text-foreground transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
        <button
          type="button"
          data-ocid={`orders.secondary_button.${index}`}
          onClick={copyLink}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-gold/10 hover:bg-gold/20 text-gold transition-colors"
        >
          <Copy className="w-3 h-3" />
          Copy Link
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              data-ocid={`orders.delete_button.${index}`}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full bg-destructive/10 hover:bg-destructive/20 text-destructive transition-colors ml-auto"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="orders.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this order?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove the tracking page for{" "}
                <strong>{order.customerName}</strong> (Order{" "}
                <code>{order.orderId}</code>). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="orders.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="orders.confirm_button"
                onClick={() => onDelete(order.orderId)}
                className="bg-destructive text-white hover:bg-destructive/90"
              >
                Delete Order
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </motion.div>
  );
}

type EditOrderState = {
  order: Order;
  open: boolean;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { isFetching: actorLoading } = useActor();

  // Session-based auth guard
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(SESSION_KEY) !== "true") {
      navigate({ to: "/admin", replace: true });
    } else {
      setSessionChecked(true);
    }
  }, [navigate]);

  // Backend admin verification
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  // Redirect if backend does not recognize this session as admin
  useEffect(() => {
    if (sessionChecked && !isAdminLoading && isAdmin === false) {
      localStorage.removeItem(SESSION_KEY);
      navigate({ to: "/admin", replace: true });
    }
  }, [sessionChecked, isAdmin, isAdminLoading, navigate]);

  // Add Order form state
  const [customerName, setCustomerName] = useState("");
  const [orderId, setOrderId] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.shipped);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Edit dialog state
  const [editState, setEditState] = useState<EditOrderState>({
    order: {
      customerName: "",
      orderId: "",
      trackingLink: "",
      status: OrderStatus.shipped,
      createdAt: 0n,
    },
    open: false,
  });
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editTrackingLink, setEditTrackingLink] = useState("");
  const [editStatus, setEditStatus] = useState<OrderStatus>(
    OrderStatus.shipped,
  );

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

  function openEdit(order: Order) {
    setEditState({ order, open: true });
    setEditCustomerName(order.customerName);
    setEditTrackingLink(order.trackingLink);
    setEditStatus(order.status);
  }

  function closeEdit() {
    setEditState((prev) => ({ ...prev, open: false }));
  }

  async function handleSaveEdit() {
    if (!editCustomerName.trim() || !editTrackingLink.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    updateStatus.mutate(
      { orderId: editState.order.orderId, status: editStatus },
      {
        onSuccess: () => {
          if (
            editCustomerName.trim() !== editState.order.customerName ||
            editTrackingLink.trim() !== editState.order.trackingLink
          ) {
            deleteOrder.mutate(editState.order.orderId, {
              onSuccess: () => {
                createOrder.mutate(
                  {
                    customerName: editCustomerName.trim(),
                    orderId: editState.order.orderId,
                    trackingLink: editTrackingLink.trim(),
                    status: editStatus,
                    createdAt: editState.order.createdAt,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Order updated!");
                      closeEdit();
                    },
                    onError: (err) =>
                      toast.error(
                        err instanceof Error
                          ? err.message
                          : "Failed to update order",
                      ),
                  },
                );
              },
              onError: (err) =>
                toast.error(
                  err instanceof Error ? err.message : "Failed to update order",
                ),
            });
          } else {
            toast.success("Status updated!");
            closeEdit();
          }
        },
        onError: (err) =>
          toast.error(
            err instanceof Error ? err.message : "Failed to update status",
          ),
      },
    );
  }

  async function handleCreateOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!customerName.trim() || !orderId.trim() || !trackingLink.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    const newOrder: Order = {
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

  function handleLogout() {
    localStorage.removeItem(SESSION_KEY);
    navigate({ to: "/admin", replace: true });
  }

  function copyCreatedLink() {
    if (!createdOrderId) return;
    navigator.clipboard.writeText(
      `${window.location.origin}/track/${createdOrderId}`,
    );
    toast.success("Link copied!");
  }

  if (!sessionChecked || actorLoading || (sessionChecked && isAdminLoading)) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(160deg, #F5F0E8 0%, #EDE4D3 100%)",
        }}
        data-ocid="admin.loading_state"
      >
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  const isSavingEdit =
    updateStatus.isPending || deleteOrder.isPending || createOrder.isPending;

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(160deg, #F5F0E8 0%, #EDE4D3 100%)",
      }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/giftnAura-logo-cropped.dim_440x200.png"
              alt="giftNaura"
              className="h-10 w-auto object-contain"
              style={{ maxWidth: "140px" }}
            />
          </div>
          <button
            type="button"
            data-ocid="admin.secondary_button"
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-8">
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
                  placeholder="e.g. Layla Al-Rashid"
                  className="rounded-xl border-border"
                  autoComplete="off"
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
                  placeholder="e.g. GN-2025-047"
                  className="rounded-xl border-border"
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="trackingLink"
                className="text-sm font-medium text-foreground"
              >
                Tracking URL (shipping partner link)
              </Label>
              <Input
                data-ocid="order.input"
                id="trackingLink"
                type="url"
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                placeholder="https://tracking.aramex.com/..."
                className="rounded-xl border-border"
                autoComplete="off"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="status-select"
                className="text-sm font-medium text-foreground"
              >
                Initial Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => setStatus(val as OrderStatus)}
              >
                <SelectTrigger
                  id="status-select"
                  data-ocid="order.select"
                  className="rounded-xl border-border w-full md:w-[200px]"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.processing}>
                    In Transit
                  </SelectItem>
                  <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                  <SelectItem value={OrderStatus.delivered}>
                    Delivered
                  </SelectItem>
                  <SelectItem value={OrderStatus.cancelled}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                data-ocid="order.submit_button"
                type="submit"
                disabled={createOrder.isPending}
                className="flex items-center gap-2 bg-gold hover:bg-gold-hover text-white font-semibold py-2.5 px-6 rounded-full transition-colors shadow-gold disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              >
                {createOrder.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {createOrder.isPending ? "Saving..." : "Save Order"}
              </button>
            </div>
          </form>

          {/* Success state */}
          <AnimatePresence>
            {createdOrderId && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                data-ocid="order.success_state"
                className="mt-5 p-4 rounded-2xl bg-green-50 border border-green-200 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-green-800">
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
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-white border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
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
              {orders.length > 0 && (
                <span className="ml-2 text-sm font-body font-normal text-muted-foreground">
                  ({filteredOrders.length})
                </span>
              )}
            </h2>
          </div>

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
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
                <Package2 className="w-6 h-6 text-gold" />
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
                  <OrderCard
                    key={order.orderId}
                    order={order}
                    index={index + 1}
                    onDelete={handleDelete}
                    onEdit={openEdit}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.section>
      </main>

      {/* Edit Dialog */}
      <Dialog
        open={editState.open}
        onOpenChange={(open) => {
          if (!open) closeEdit();
        }}
      >
        <DialogContent
          data-ocid="orders.dialog"
          className="rounded-3xl max-w-md"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-lg">
              Edit Order
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Customer Name
              </Label>
              <Input
                data-ocid="edit.input"
                value={editCustomerName}
                onChange={(e) => setEditCustomerName(e.target.value)}
                className="rounded-xl border-border"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Order ID
              </Label>
              <Input
                value={editState.order.orderId}
                disabled
                className="rounded-xl border-border bg-muted/50 text-muted-foreground"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Tracking URL
              </Label>
              <Input
                data-ocid="edit.input"
                type="url"
                value={editTrackingLink}
                onChange={(e) => setEditTrackingLink(e.target.value)}
                className="rounded-xl border-border"
                autoComplete="off"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-foreground">
                Status
              </Label>
              <Select
                value={editStatus}
                onValueChange={(val) => setEditStatus(val as OrderStatus)}
              >
                <SelectTrigger
                  data-ocid="edit.select"
                  className="rounded-xl border-border w-full"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={OrderStatus.processing}>
                    In Transit
                  </SelectItem>
                  <SelectItem value={OrderStatus.shipped}>Shipped</SelectItem>
                  <SelectItem value={OrderStatus.delivered}>
                    Delivered
                  </SelectItem>
                  <SelectItem value={OrderStatus.cancelled}>
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                data-ocid="edit.cancel_button"
                onClick={closeEdit}
                className="flex-1 py-2.5 px-4 rounded-full border-2 border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                data-ocid="edit.save_button"
                onClick={handleSaveEdit}
                disabled={isSavingEdit}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-gold hover:bg-gold-hover text-white text-sm font-semibold shadow-gold disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSavingEdit ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : null}
                {isSavingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
