import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
import {
  Search,
  Calendar,
  Eye,
  X,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Copy,
  Printer,
  RotateCcw,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
} from "lucide-react";

export type StatusTab = "all" | "pending_approval" | "paid" | "shipping" | "completed" | "canceled";

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  size: string;
  color: string;
  colorHex: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  dateTime: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "VNPAY" | "MoMo" | "COD";
  paymentStatus: "Paid" | "Unpaid";
  fulfillmentStatus: "Pending Approval" | "Processing" | "Shipping" | "Completed" | "Canceled";
  transactionDetails?: {
    gateway: "VNPAY" | "MoMo" | "COD";
    transactionCode: string;
    timestamp: string;
    bankCode?: string;
    responseMessage?: string;
  };
  note?: string;
}

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 23 Sep 2026");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch orders with React Query
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["orders", activeTab, paymentMethodFilter],
    queryFn: () => orderService.getAll({
      status: activeTab !== "all" ? activeTab : undefined,
      paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
    }),
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, fulfillmentStatus, paymentStatus }: { id: string; fulfillmentStatus?: string; paymentStatus?: string }) =>
      orderService.updateStatus(id, { fulfillmentStatus, paymentStatus }),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
      setSelectedOrder(updatedOrder);
      toast.success("Thành công", `Đã cập nhật trạng thái đơn #${updatedOrder.orderNumber}`);
    },
    onError: (err: any) => {
      toast.error("Lỗi", err.message || "Không thể cập nhật đơn hàng");
    },
  });

  // Tab counters dynamically calculated
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      pending_approval: orders.filter((o: Order) => o.fulfillmentStatus === "Pending Approval").length,
      paid: orders.filter((o: Order) => o.paymentStatus === "Paid").length,
      shipping: orders.filter((o: Order) => o.fulfillmentStatus === "Shipping").length,
      completed: orders.filter((o: Order) => o.fulfillmentStatus === "Completed").length,
      canceled: orders.filter((o: Order) => o.fulfillmentStatus === "Canceled").length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      // Tab filter
      if (activeTab === "pending_approval" && order.fulfillmentStatus !== "Pending Approval") {
        return false;
      }
      if (activeTab === "paid" && order.paymentStatus !== "Paid") {
        return false;
      }
      if (activeTab === "shipping" && order.fulfillmentStatus !== "Shipping") {
        return false;
      }
      if (activeTab === "completed" && order.fulfillmentStatus !== "Completed") {
        return false;
      }
      if (activeTab === "canceled" && order.fulfillmentStatus !== "Canceled") {
        return false;
      }

      // Search query (Order ID or phone number or customer name)
      const matchesSearch =
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customer.phone.includes(searchQuery) ||
        order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Payment method filter
      if (paymentMethodFilter !== "all" && order.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery, paymentMethodFilter]);

  // Handle status update from side panel
  const handleUpdateFulfillmentStatus = (newStatus: Order["fulfillmentStatus"]) => {
    if (!selectedOrder) return;
    updateStatusMutation.mutate({
      id: selectedOrder.id,
      fulfillmentStatus: newStatus,
      paymentStatus: newStatus === "Completed" ? "Paid" : selectedOrder.paymentStatus,
    });
  };

  // Copy transaction code
  const handleCopyTransaction = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Order Management & Payments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Track customer sports orders, payment gateway transactions, and fulfillment pipeline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 shadow-xs">
              <Printer className="w-4 h-4 text-slate-400" />
              Batch Invoices
            </button>
          </div>
        </div>

        {/* 1. Top Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>All Orders</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending_approval")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "pending_approval"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Pending Approval</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "pending_approval"
                  ? "bg-amber-700 text-white"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {tabCounts.pending_approval}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("paid")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "paid"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Paid</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "paid"
                  ? "bg-emerald-700 text-white"
                  : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {tabCounts.paid}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "shipping"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Shipping</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "shipping" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              {tabCounts.shipping}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "completed"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Completed</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "completed" ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-800"
              }`}
            >
              {tabCounts.completed}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("canceled")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "canceled"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Canceled / Refunded</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "canceled" ? "bg-rose-700 text-white" : "bg-rose-100 text-rose-800"
              }`}
            >
              {tabCounts.canceled}
            </span>
          </button>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by Order ID (#SPX-...), Phone, Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Date Picker & Payment Method Filter */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer"
              >
                <option value="01 Sep 2026 - 23 Sep 2026">01 Sep 2026 - 23 Sep 2026</option>
                <option value="Today">Today (23 Sep 2026)</option>
                <option value="This Week">This Week</option>
                <option value="Last 30 Days">Last 30 Days</option>
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Payment:</span>
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Methods</option>
                <option value="VNPAY">🔹 VNPAY (QR / Card)</option>
                <option value="MoMo">🌸 MoMo E-Wallet</option>
                <option value="COD">💵 COD (Cash on Delivery)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || paymentMethodFilter !== "all" || activeTab !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPaymentMethodFilter("all");
                  setActiveTab("all");
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-5">Order ID</th>
                  <th className="py-3.5 px-5">Date & Time</th>
                  <th className="py-3.5 px-5">Customer Info</th>
                  <th className="py-3.5 px-5 text-center">Items</th>
                  <th className="py-3.5 px-5">Total Amount</th>
                  <th className="py-3.5 px-5">Payment Method</th>
                  <th className="py-3.5 px-5">Payment Status</th>
                  <th className="py-3.5 px-5">Fulfillment</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: Order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="py-4 px-5">
                        <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          #{order.orderNumber}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                        {order.dateTime}
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {order.customer.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {order.customer.name}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono">
                              {order.customer.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items Count */}
                      <td className="py-4 px-5 text-center">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]">
                          {order.items.reduce((sum: number, item: OrderItem) => sum + item.qty, 0)} items
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5">
                        <span className="font-extrabold text-sm text-slate-900">
                          ${order.totalAmount.toFixed(2)}
                        </span>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-4 px-5">
                        {order.paymentMethod === "VNPAY" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-50 text-blue-800 border border-blue-200/60">
                            <span className="w-2 h-2 rounded-sm bg-blue-600 rotate-45 inline-block"></span>
                            VNPAY
                          </span>
                        )}
                        {order.paymentMethod === "MoMo" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-pink-50 text-pink-700 border border-pink-200/60">
                            <span className="w-2 h-2 rounded-full bg-pink-600 inline-block"></span>
                            MoMo
                          </span>
                        )}
                        {order.paymentMethod === "COD" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
                            💵 COD
                          </span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-5">
                        {order.paymentStatus === "Paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <Check className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            <Clock className="w-3 h-3" />
                            Unpaid
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-4 px-5">
                        {order.fulfillmentStatus === "Pending Approval" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                            <Clock className="w-3 h-3 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {order.fulfillmentStatus === "Processing" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200/60">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></span>
                            Processing
                          </span>
                        )}
                        {order.fulfillmentStatus === "Shipping" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                            <Truck className="w-3 h-3" />
                            Shipping
                          </span>
                        )}
                        {order.fulfillmentStatus === "Completed" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                        {order.fulfillmentStatus === "Canceled" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            <XCircle className="w-3 h-3" />
                            Canceled
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(order);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Detail
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No orders found matching this filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredOrders.length} of {tabCounts[activeTab]} orders
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* 4. Side Panel / Modal ("Order Detail View") */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Panel Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono">
                      #{selectedOrder.orderNumber.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          Order #{selectedOrder.orderNumber}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedOrder.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        Placed on {selectedOrder.dateTime}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Panel Body Content */}
                <div className="p-6 space-y-6 flex-1 text-xs">
                  {/* Fulfillment Status Quick Updater */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Update Fulfillment Status:
                      </span>
                      <span className="font-extrabold text-sm text-slate-900 mt-0.5 block">
                        Current: {selectedOrder.fulfillmentStatus}
                      </span>
                    </div>

                    <select
                      value={selectedOrder.fulfillmentStatus}
                      onChange={(e: any) => handleUpdateFulfillmentStatus(e.target.value)}
                      className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 font-bold text-xs text-slate-800 focus:ring-2 focus:ring-blue-500/20 shadow-xs cursor-pointer"
                    >
                      <option value="Pending Approval">Pending Approval</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipping">Shipping</option>
                      <option value="Completed">Completed</option>
                      <option value="Canceled">Canceled</option>
                    </select>
                  </div>

                  {/* Customer & Shipping Address */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Customer & Shipping Address
                    </h3>
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          {selectedOrder.customer.name}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Standard Delivery
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800">
                          {selectedOrder.customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-slate-700 leading-relaxed font-medium">
                        {selectedOrder.customer.address}
                      </div>
                    </div>
                  </div>

                  {/* Product Items List Purchased */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Purchased Sports Items (
                      {selectedOrder.items.length})
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="p-3.5 flex items-center gap-3.5 hover:bg-slate-50">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-2xl shadow-xs">
                            {item.thumbnail}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                Size: {item.size}
                              </span>
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                                {item.color}
                              </span>
                              <span>• Qty: <strong className="text-slate-800">{item.qty}</strong></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-sm text-slate-900">
                              ${(item.unitPrice * item.qty).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              ${item.unitPrice.toFixed(2)} / each
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Transaction History Details */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Payment Gateway Transaction
                    </h3>
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Gateway:</span>
                        <span className="font-extrabold text-slate-900">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>

                      {selectedOrder.transactionDetails ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Transaction Code:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {selectedOrder.transactionDetails.transactionCode}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopyTransaction(
                                    selectedOrder.transactionDetails!.transactionCode
                                  )
                                }
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition"
                                title="Copy Transaction Code"
                              >
                                {copiedCode ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Gateway Timestamp:</span>
                            <span className="font-medium text-slate-700">
                              {selectedOrder.transactionDetails.timestamp}
                            </span>
                          </div>

                          {selectedOrder.transactionDetails.bankCode && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Bank / Channel:</span>
                              <span className="font-semibold text-slate-800">
                                {selectedOrder.transactionDetails.bankCode}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Gateway Status:</span>
                            <span className="font-bold text-emerald-600">
                              {selectedOrder.transactionDetails.responseMessage}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-amber-700 bg-amber-50 p-2.5 rounded-xl text-center font-medium">
                          Cash on Delivery (COD) — Payment to be collected upon shipment arrival.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Shipping Fee</span>
                      <span className="text-emerald-600 font-bold">Free (SportX Prime)</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Total Paid</span>
                      <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Panel Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      alert(`Printing Invoice for Order #${selectedOrder.orderNumber}`);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Print Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
