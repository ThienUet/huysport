import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketingService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
import {
  Ticket,
  Plus,
  Search,
  Copy,
  Check,
  Edit2,
  Trash2,
} from "lucide-react";

export type CampaignStatus = "all" | "active" | "upcoming" | "expired";

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minSpend?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate?: string;
  expiryDate?: string;
  status: "Active" | "Inactive" | "Expired" | "Upcoming" | "Disabled";
}

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "c-1",
    code: "SPORTX100K",
    description: "Get 15% off on all football boots and goalkeeper gloves",
    discountType: "percentage",
    discountValue: 15,
    minSpend: 50.0,
    usageLimit: 100,
    usedCount: 85,
    startDate: "01 Sep 2026",
    expiryDate: "30 Sep 2026",
    status: "Active",
  },
  {
    id: "c-2",
    code: "SUMMER20",
    description: "Flat $20 discount on all running and training footwear orders",
    discountType: "fixed",
    discountValue: 20,
    minSpend: 100.0,
    usageLimit: 150,
    usedCount: 60,
    startDate: "15 Aug 2026",
    expiryDate: "28 Sep 2026",
    status: "Active",
  },
  {
    id: "c-3",
    code: "NIKEVIP50",
    description: "Exclusive 50% discount for VIP sports club partners",
    discountType: "percentage",
    discountValue: 50,
    minSpend: 200.0,
    usageLimit: 50,
    usedCount: 12,
    startDate: "01 Sep 2026",
    expiryDate: "15 Oct 2026",
    status: "Active",
  },
  {
    id: "c-4",
    code: "FREESHIP",
    description: "Free nationwide door-to-door express delivery for all carts",
    discountType: "free_shipping",
    discountValue: 100,
    minSpend: 0.0,
    usageLimit: 200,
    usedCount: 110,
    startDate: "01 Jan 2026",
    expiryDate: "31 Dec 2026",
    status: "Active",
  },
  {
    id: "c-5",
    code: "AUTUMN25",
    description: "Upcoming Autumn launch coupon for gym compression apparel",
    discountType: "percentage",
    discountValue: 25,
    minSpend: 75.0,
    usageLimit: 300,
    usedCount: 0,
    startDate: "01 Oct 2026",
    expiryDate: "31 Oct 2026",
    status: "Upcoming",
  },
  {
    id: "c-6",
    code: "FLASH30",
    description: "Flash midnight clearance discount on badminton racquets",
    discountType: "percentage",
    discountValue: 30,
    minSpend: 80.0,
    usageLimit: 80,
    usedCount: 80,
    startDate: "01 Aug 2026",
    expiryDate: "15 Aug 2026",
    status: "Expired",
  },
];

export default function MarketingPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<CampaignStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Fetch coupons from backend
  const { data: serverCoupons = [] } = useQuery({
    queryKey: ["coupons"],
    queryFn: marketingService.getCoupons,
  });

  const coupons: Coupon[] = serverCoupons.length > 0 ? serverCoupons : INITIAL_COUPONS;

  // Create Coupon Mutation
  const createCouponMutation = useMutation({
    mutationFn: marketingService.createCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Thành công", "Đã tạo mã giảm giá mới");
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  // Update Coupon Mutation
  const updateCouponMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Thành công", "Đã cập nhật mã giảm giá");
      setIsModalOpen(false);
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  // Delete Coupon Mutation
  const deleteCouponMutation = useMutation({
    mutationFn: marketingService.deleteCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Thành công", "Đã xóa mã giảm giá");
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formDiscountType, setFormDiscountType] = useState<"percentage" | "fixed" | "free_shipping">("percentage");
  const [formDiscountValue, setFormDiscountValue] = useState<number>(15);
  const [formMinSpend, setFormMinSpend] = useState<number>(50);
  const [formUsageLimit, setFormUsageLimit] = useState<number>(100);
  const [formExpiryDate, setFormExpiryDate] = useState("30 Oct 2026");

  // Tab counters
  const tabCounts = useMemo(() => {
    return {
      all: coupons.length,
      active: coupons.filter((c) => c.status === "Active").length,
      upcoming: coupons.filter((c) => c.status === "Upcoming").length,
      expired: coupons.filter((c) => c.status === "Expired").length,
    };
  }, [coupons]);

  // Filtered coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      // Tab filter
      if (activeTab === "active" && coupon.status !== "Active") return false;
      if (activeTab === "upcoming" && coupon.status !== "Upcoming") return false;
      if (activeTab === "expired" && coupon.status !== "Expired") return false;

      // Search query
      const matchSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchSearch;
    });
  }, [coupons, activeTab, searchQuery]);

  // Copy coupon code
  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  // Toggle status
  const handleToggleStatus = (id: string) => {
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) return;
    const nextStatus = coupon.status === "Active" ? "Inactive" : "Active";
    updateCouponMutation.mutate({ id, data: { status: nextStatus } });
  };

  // Delete coupon
  const handleDeleteCoupon = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa mã giảm giá này không?")) {
      deleteCouponMutation.mutate(id);
    }
  };

  // Open modal for Create New
  const handleOpenCreateModal = () => {
    setEditingCouponId(null);
    setFormCode("");
    setFormDescription("");
    setFormDiscountType("percentage");
    setFormDiscountValue(15);
    setFormMinSpend(50);
    setFormUsageLimit(100);
    setFormExpiryDate("30 Oct 2026");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setFormCode(coupon.code);
    setFormDescription(coupon.description);
    setFormDiscountType(coupon.discountType as any);
    setFormDiscountValue(coupon.discountValue);
    setFormMinSpend(coupon.minSpend || coupon.minOrderValue || 50);
    setFormUsageLimit(coupon.usageLimit);
    setFormExpiryDate(coupon.expiryDate || coupon.endDate || "30 Oct 2026");
    setIsModalOpen(true);
  };

  // Save Coupon
  const handleSaveCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim()) return;

    if (editingCouponId) {
      updateCouponMutation.mutate({
        id: editingCouponId,
        data: {
          code: formCode.toUpperCase(),
          description: formDescription,
          discountType: formDiscountType,
          discountValue: Number(formDiscountValue),
          minOrderValue: Number(formMinSpend),
          usageLimit: Number(formUsageLimit),
          endDate: formExpiryDate,
        },
      });
    } else {
      createCouponMutation.mutate({
        code: formCode.toUpperCase(),
        description: formDescription || "Special sports promotional discount voucher",
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        minOrderValue: Number(formMinSpend),
        usageLimit: Number(formUsageLimit),
        status: "Active",
        endDate: formExpiryDate,
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Top Header & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Ticket className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Promotions & Discount Coupons
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                {coupons.length} Campaigns
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Create and track promotional discount campaigns, voucher redemptions, and minimum spend rules.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create New Coupon
            </button>
          </div>
        </div>

        {/* 2. Promotion Status Tabs & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>All Campaigns</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {tabCounts.all}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("active")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "active"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Active</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {tabCounts.active}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "upcoming"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Upcoming</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {tabCounts.upcoming}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("expired")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "expired"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Expired</span>
              <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full">
                {tabCounts.expired}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search coupon code or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* 3. Coupon Cards Grid & Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-5">Coupon Code</th>
                  <th className="py-3.5 px-5">Discount Value</th>
                  <th className="py-3.5 px-5">Redemption Usage</th>
                  <th className="py-3.5 px-5">Min Spend</th>
                  <th className="py-3.5 px-5">Validity Period</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => {
                    const usagePercent = Math.min(
                      100,
                      Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                    );
                    const isCopied = copiedCodeId === coupon.id;

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50/70 transition group">
                        {/* Coupon Code Badge */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/60 font-mono font-black text-xs text-blue-700 tracking-wider shadow-xs">
                              {coupon.code}
                            </div>
                            <button
                              onClick={() => handleCopyCode(coupon.id, coupon.code)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition"
                              title="Copy Coupon Code"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs mt-1 font-normal">
                            {coupon.description}
                          </p>
                        </td>

                        {/* Discount Value */}
                        <td className="py-4 px-5">
                          {coupon.discountType === "percentage" && (
                            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                              {coupon.discountValue}% OFF
                            </span>
                          )}
                          {coupon.discountType === "fixed" && (
                            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                              ${coupon.discountValue.toFixed(2)} OFF
                            </span>
                          )}
                          {coupon.discountType === "free_shipping" && (
                            <span className="font-extrabold text-sm text-emerald-600 flex items-center gap-1">
                              🚚 Free Shipping
                            </span>
                          )}
                        </td>

                        {/* Usage Progress */}
                        <td className="py-4 px-5">
                          <div className="w-36 space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-slate-800">
                                {coupon.usedCount} / {coupon.usageLimit}
                              </span>
                              <span className="font-semibold text-slate-400">{usagePercent}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  usagePercent >= 90
                                    ? "bg-rose-500"
                                    : usagePercent >= 50
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Min Spend */}
                        <td className="py-4 px-5">
                          <span className="font-bold text-slate-800">
                            {(coupon.minSpend ?? 0) > 0 ? `$${(coupon.minSpend ?? 0).toFixed(2)}` : "No Minimum"}
                          </span>
                        </td>

                        {/* Validity Period */}
                        <td className="py-4 px-5 text-slate-500 text-xs">
                          <div className="font-medium text-slate-700">{coupon.expiryDate}</div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Valid from {coupon.startDate}
                          </div>
                        </td>

                        {/* Status Toggle Switch */}
                        <td className="py-4 px-5 text-center">
                          <button
                            onClick={() => handleToggleStatus(coupon.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                              coupon.status === "Active"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50 hover:bg-emerald-100"
                                : coupon.status === "Upcoming"
                                ? "bg-blue-50 text-blue-700 border border-blue-200/50"
                                : "bg-slate-100 text-slate-500 border border-slate-200"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                coupon.status === "Active"
                                  ? "bg-emerald-500"
                                  : coupon.status === "Upcoming"
                                  ? "bg-blue-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {coupon.status}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleOpenEditModal(coupon)}
                              title="Edit Coupon"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              title="Delete Coupon"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No coupon campaigns found matching this filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredCoupons.length} of {coupons.length} vouchers
            </span>
          </div>
        </div>

        {/* 4. Modal Overlay ("Create / Edit Coupon Form") */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-blue-600" />
                  <h3 className="font-black text-base text-slate-900">
                    {editingCouponId ? "Edit Promotion Coupon" : "Create New Coupon"}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
                {/* Coupon Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Coupon Code *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const random = `SPORTX${Math.floor(10 + Math.random() * 90)}K`;
                        setFormCode(random);
                      }}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      🎲 Generate Random
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUTUMN25, SPORTX100K"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 font-mono font-bold text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase text-blue-700 tracking-wider"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Get 25% off on all autumn sports apparel"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                    <select
                      value={formDiscountType}
                      onChange={(e: any) => setFormDiscountType(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                    >
                      <option value="percentage">% Percentage Off</option>
                      <option value="fixed">$ Fixed Amount Off</option>
                      <option value="free_shipping">Free Shipping</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {formDiscountType === "percentage" ? "Value (%)" : "Value ($)"} *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formDiscountType === "percentage" ? 100 : 1000}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Minimum Order Amount & Usage Limit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Min Order Amount ($)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formMinSpend}
                      onChange={(e) => setFormMinSpend(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Usage Limit (Max)</label>
                    <input
                      type="number"
                      min={1}
                      value={formUsageLimit}
                      onChange={(e) => setFormUsageLimit(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-50 font-bold rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expiration Date</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Oct 2026"
                    value={formExpiryDate}
                    onChange={(e) => setFormExpiryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {editingCouponId ? "Update Coupon" : "Create Coupon"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
