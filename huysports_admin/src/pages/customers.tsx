import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
import {
  Users,
  UserCheck,
  UserPlus,
  Search,
  Eye,
  Edit2,
  Ban,
  MapPin,
  ShoppingBag,
  RotateCcw,
  X,
  Crown,
  Sparkles,
} from "lucide-react";

export interface CustomerOrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  itemsSummary: string;
  totalAmount: number;
  status: "Delivered" | "Shipping" | "Processing" | "Canceled";
}

export interface ShippingAddressItem {
  id: string;
  label: "Home" | "Office" | "Other";
  recipientName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  avatarBg: string;
  primaryAddress: string;
  joinedDate: string;
  totalOrders: number;
  lifetimeSpent: number;
  tier: "VIP" | "Loyal" | "New";
  status: "Active" | "Blocked";
  addresses: ShippingAddressItem[];
  orderHistory: CustomerOrderHistory[];
}

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("all");
  const [selectedCustomerIds, setSelectedCustomerIds] = useState<string[]>([]);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [drawerTab, setDrawerTab] = useState<"orders" | "addresses">("orders");

  // Fetch customers with React Query
  const { data: customers = [] } = useQuery<Customer[]>({
    queryKey: ["customers", statusFilter, tierFilter],
    queryFn: () =>
      customerService.getAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        tier: tierFilter !== "all" ? tierFilter : undefined,
      }),
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Active" | "Blocked" }) =>
      customerService.updateStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (detailCustomer && detailCustomer.id === updated.id) {
        setDetailCustomer(updated);
      }
      toast.success(
        "Cập nhật thành công",
        `Đã chuyển trạng thái ${updated.fullName} sang ${updated.status === "Active" ? "Hoạt động" : "Bị khóa"}`
      );
    },
    onError: (err: any) => {
      toast.error("Lỗi", err.message || "Không thể cập nhật trạng thái khách hàng");
    },
  });

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((cust: Customer) => {
      const matchSearch =
        cust.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cust.phone.includes(searchQuery);

      const matchStatus = statusFilter === "all" || cust.status.toLowerCase() === statusFilter.toLowerCase();
      const matchTier = tierFilter === "all" || cust.tier.toLowerCase() === tierFilter.toLowerCase();

      return matchSearch && matchStatus && matchTier;
    });
  }, [customers, searchQuery, statusFilter, tierFilter]);

  // Select all checkboxes
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCustomerIds(filteredCustomers.map((c: Customer) => c.id));
    } else {
      setSelectedCustomerIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedCustomerIds((prev) => [...prev, id]);
    } else {
      setSelectedCustomerIds((prev) => prev.filter((item) => item !== id));
    }
  };

  // Toggle Block / Unblock customer
  const handleToggleBlockStatus = (id: string) => {
    const cust = customers.find((c: Customer) => c.id === id);
    if (!cust) return;
    const nextStatus: "Active" | "Blocked" = cust.status === "Active" ? "Blocked" : "Active";
    toggleStatusMutation.mutate({ id, status: nextStatus });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Top Header & Stats Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Customer Directory & Profiles
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                3,850 Registered
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Manage verified customer records, spending tier tiers, addresses, and order histories.
            </p>
          </div>
        </div>

        {/* 3 Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Customers
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">3,850</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 5.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">All registered SportX accounts</p>
          </div>

          {/* Card 2: Active Buying Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Buying Users
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">2,100</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 8.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">54.5% conversion repeat rate</p>
          </div>

          {/* Card 3: New Users This Month */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                New Users This Month
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">420</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 14.1%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">+35 signups this week</p>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Account Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="blocked">Blocked / Suspended</option>
              </select>
            </div>

            {/* Spending Tier Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Spending Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="vip">👑 VIP Tier ($1,000+)</option>
                <option value="loyal">💎 Loyal Tier ($500+)</option>
                <option value="new">🌱 New Tier (&lt;$500)</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || statusFilter !== "all" || tierFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setTierFilter("all");
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                title="Reset Filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Customer Data Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredCustomers.length > 0 &&
                        selectedCustomerIds.length === filteredCustomers.length
                      }
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Customer Info</th>
                  <th className="py-3.5 px-4">Phone & Shipping Address</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-center">Total Orders</th>
                  <th className="py-3.5 px-4">Lifetime Value</th>
                  <th className="py-3.5 px-4">Spending Tier</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map((cust: Customer) => {
                    const isSelected = selectedCustomerIds.includes(cust.id);
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => setDetailCustomer(cust)}
                        className={`hover:bg-slate-50/70 transition group cursor-pointer ${
                          isSelected ? "bg-blue-50/40" : ""
                        }`}
                      >
                        {/* Checkbox */}
                        <td
                          className="py-4 px-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(cust.id, e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Customer Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${cust.avatarBg}`}
                            >
                              {cust.avatar}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 text-sm">
                                {cust.fullName}
                              </div>
                              <div className="text-[11px] text-slate-400">{cust.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Phone & Primary Shipping Address */}
                        <td className="py-4 px-4">
                          <div className="max-w-xs">
                            <div className="font-mono font-bold text-slate-800 text-[11px]">
                              {cust.phone}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate mt-0.5">
                              {cust.primaryAddress}
                            </div>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                          {cust.joinedDate}
                        </td>

                        {/* Total Orders */}
                        <td className="py-4 px-4 text-center">
                          <span className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {cust.totalOrders} orders
                          </span>
                        </td>

                        {/* Total Lifetime Value */}
                        <td className="py-4 px-4">
                          <span className="font-extrabold text-sm text-emerald-600">
                            ${cust.lifetimeSpent.toFixed(2)}
                          </span>
                        </td>

                        {/* Spending Tier */}
                        <td className="py-4 px-4">
                          {cust.tier === "VIP" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 shadow-xs">
                              <Crown className="w-3 h-3 text-amber-600" />
                              VIP
                            </span>
                          )}
                          {cust.tier === "Loyal" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60">
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              Loyal
                            </span>
                          )}
                          {cust.tier === "New" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                              New
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                              cust.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50"
                                : "bg-rose-50 text-rose-700 border border-rose-200/50"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                cust.status === "Active" ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {cust.status}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setDetailCustomer(cust)}
                              title="View Profile"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                alert(`Editing customer: ${cust.fullName}`);
                              }}
                              title="Edit Customer"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBlockStatus(cust.id)}
                              title={cust.status === "Active" ? "Block Customer" : "Unblock Customer"}
                              className={`p-1.5 rounded-lg transition ${
                                cust.status === "Active"
                                  ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                  : "text-rose-600 hover:text-emerald-600 hover:bg-emerald-50"
                              }`}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      No customers match your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredCustomers.length} of {customers.length} customers
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

        {/* 4. Slide-Over Panel ("Customer Detail View") */}
        {detailCustomer && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              onClick={() => setDetailCustomer(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full font-bold text-sm flex items-center justify-center shadow-xs ${detailCustomer.avatarBg}`}
                    >
                      {detailCustomer.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          {detailCustomer.fullName}
                        </h2>
                        {detailCustomer.tier === "VIP" && (
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            👑 VIP
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            detailCustomer.status === "Active"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-rose-100 text-rose-800"
                          }`}
                        >
                          {detailCustomer.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">{detailCustomer.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDetailCustomer(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Profile Key Stats */}
                <div className="p-6 bg-slate-50 border-b border-slate-100 grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Lifetime Value</div>
                    <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                      ${detailCustomer.lifetimeSpent.toFixed(2)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Total Orders</div>
                    <div className="text-base font-extrabold text-slate-900 mt-0.5">
                      {detailCustomer.totalOrders}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Joined Since</div>
                    <div className="text-xs font-bold text-slate-700 mt-1">
                      {detailCustomer.joinedDate}
                    </div>
                  </div>
                </div>

                {/* Drawer Tabs */}
                <div className="px-6 border-b border-slate-100 flex items-center gap-4 bg-white">
                  <button
                    onClick={() => setDrawerTab("orders")}
                    className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                      drawerTab === "orders"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Order History ({detailCustomer.orderHistory.length})
                  </button>
                  <button
                    onClick={() => setDrawerTab("addresses")}
                    className={`py-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
                      drawerTab === "addresses"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    Shipping Addresses ({detailCustomer.addresses.length})
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
                  {drawerTab === "orders" && (
                    <div className="space-y-3">
                      {detailCustomer.orderHistory.map((order) => (
                        <div
                          key={order.id}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-300 transition"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-mono font-bold text-blue-600">
                              #{order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                order.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : order.status === "Shipping"
                                  ? "bg-blue-50 text-blue-700"
                                  : order.status === "Processing"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p className="text-slate-700 font-medium">{order.itemsSummary}</p>
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                            <span className="text-slate-400">{order.date}</span>
                            <span className="font-extrabold text-slate-900">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {drawerTab === "addresses" && (
                    <div className="space-y-3">
                      {detailCustomer.addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              🏷️ {addr.label}
                              {addr.isDefault && (
                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                  Default
                                </span>
                              )}
                            </span>
                          </div>
                          <div className="text-slate-800 font-bold">{addr.recipientName}</div>
                          <div className="text-slate-500 font-mono text-[11px]">{addr.phone}</div>
                          <div className="text-slate-600 leading-relaxed">{addr.addressLine}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between sticky bottom-0">
                  <button
                    onClick={() => handleToggleBlockStatus(detailCustomer.id)}
                    className={`px-4 py-2 font-bold rounded-xl text-xs transition ${
                      detailCustomer.status === "Active"
                        ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                        : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                    }`}
                  >
                    {detailCustomer.status === "Active" ? "Block Account" : "Unblock Account"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailCustomer(null)}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${detailCustomer.email}`;
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20"
                    >
                      Contact Customer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
