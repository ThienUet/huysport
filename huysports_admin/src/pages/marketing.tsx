import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useToastStore } from "@/store/useToastStore";
import { useCoupons, useCreateCoupon, useUpdateCoupon, useDeleteCoupon } from "@/hooks";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { formatDateTime } from "@/utils/formatUtils";
import { TableSkeletonRows } from "@/components/ui/LoadingSkeletons";
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

const formatCurrency = (val: number | string) => {
  let num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return "0đ";
  if (num < 1000 && num > 0) num = num * 1000;
  return `${Math.round(num).toLocaleString("vi-VN")}đ`;
};

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "c-1",
    code: "SPORTX100K",
    description: "Giảm 15% cho tất cả giày bóng đá và găng tay thủ môn",
    discountType: "percentage",
    discountValue: 15,
    minSpend: 500000,
    usageLimit: 100,
    usedCount: 85,
    startDate: "01/09/2026",
    expiryDate: "30/09/2026",
    status: "Active",
  },
  {
    id: "c-2",
    code: "SUMMER50K",
    description: "Giảm ngay 50.000đ cho đơn giày chạy bộ và tập gym",
    discountType: "fixed",
    discountValue: 50000,
    minSpend: 500000,
    usageLimit: 150,
    usedCount: 60,
    startDate: "15/08/2026",
    expiryDate: "28/09/2026",
    status: "Active",
  },
  {
    id: "c-3",
    code: "NIKEVIP50",
    description: "Ưu đãi độc quyền 50% cho đối tác và CLB thể thao VIP",
    discountType: "percentage",
    discountValue: 50,
    minSpend: 2000000,
    usageLimit: 50,
    usedCount: 12,
    startDate: "01/09/2026",
    expiryDate: "15/10/2026",
    status: "Active",
  },
  {
    id: "c-4",
    code: "FREESHIP",
    description: "Miễn phí vận chuyển toàn quốc cho mọi giỏ hàng",
    discountType: "free_shipping",
    discountValue: 100,
    minSpend: 0,
    usageLimit: 200,
    usedCount: 110,
    startDate: "01/01/2026",
    expiryDate: "31/12/2026",
    status: "Active",
  },
  {
    id: "c-5",
    code: "AUTUMN25",
    description: "Ưu đãi ra mắt BST Thu Đông trang phục thể thao",
    discountType: "percentage",
    discountValue: 25,
    minSpend: 300000,
    usageLimit: 300,
    usedCount: 0,
    startDate: "01/10/2026",
    expiryDate: "31/10/2026",
    status: "Upcoming",
  },
  {
    id: "c-6",
    code: "FLASH30",
    description: "Xả kho chớp nhoáng vợt cầu lông chính hãng",
    discountType: "percentage",
    discountValue: 30,
    minSpend: 400000,
    usageLimit: 80,
    usedCount: 80,
    startDate: "01/08/2026",
    expiryDate: "15/08/2026",
    status: "Expired",
  },
];

export default function MarketingPage() {
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<CampaignStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Fetch coupons from backend with custom hook
  const { data: serverCoupons = [], isLoading } = useCoupons();

  const coupons: Coupon[] = serverCoupons.length > 0 ? serverCoupons : INITIAL_COUPONS;

  // Create Coupon Mutation
  const baseCreateCoupon = useCreateCoupon();
  const createCouponMutation = {
    ...baseCreateCoupon,
    mutate: (payload: any) =>
      baseCreateCoupon.mutate(payload, {
        onSuccess: () => {
          toast.success("Thành công", "Đã tạo mã giảm giá mới");
          setIsModalOpen(false);
        },
        onError: (err: any) => toast.error("Lỗi", err.message),
      }),
  };

  // Update Coupon Mutation
  const baseUpdateCoupon = useUpdateCoupon();
  const updateCouponMutation = {
    ...baseUpdateCoupon,
    mutate: ({ id, data }: { id: string; data: any }) =>
      baseUpdateCoupon.mutate(
        { id, data },
        {
          onSuccess: () => {
            toast.success("Thành công", "Đã cập nhật mã giảm giá");
            setIsModalOpen(false);
          },
          onError: (err: any) => toast.error("Lỗi", err.message),
        }
      ),
  };

  // Delete Coupon Mutation
  const baseDeleteCoupon = useDeleteCoupon();
  const deleteCouponMutation = {
    ...baseDeleteCoupon,
    mutate: (id: string) =>
      baseDeleteCoupon.mutate(id, {
        onSuccess: () => {
          toast.success("Thành công", "Đã xóa mã giảm giá");
        },
        onError: (err: any) => toast.error("Lỗi", err.message),
      }),
  };

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
    setFormDiscountValue(10);
    setFormMinSpend(200000);
    setFormUsageLimit(100);
    setFormExpiryDate("31/12/2026");
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (coupon: Coupon) => {
    setEditingCouponId(coupon.id);
    setFormCode(coupon.code);
    setFormDescription(coupon.description);
    setFormDiscountType(coupon.discountType as any);
    setFormDiscountValue(coupon.discountValue);
    setFormMinSpend(coupon.minSpend || coupon.minOrderValue || 200000);
    setFormUsageLimit(coupon.usageLimit);
    setFormExpiryDate(coupon.expiryDate || coupon.endDate || "31/12/2026");
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
                Khuyến mãi & Mã giảm giá
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                {coupons.length} Chiến dịch
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Tạo và theo dõi các chương trình ưu đãi, số lượt sử dụng voucher và điều kiện áp dụng đơn hàng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCreateModal}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tạo mã giảm giá mới
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
              <span>Tất cả</span>
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
              <span>Đang áp dụng</span>
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
              <span>Sắp diễn ra</span>
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
              <span>Đã hết hạn</span>
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
              placeholder="Tìm kiếm mã hoặc từ khóa..."
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
                  <th className="py-3.5 px-5 whitespace-nowrap min-w-[200px]">Mã giảm giá</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Mức giảm</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Lượt đã dùng</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Đơn tối thiểu</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Thời hạn áp dụng</th>
                  <th className="py-3.5 px-5 text-center whitespace-nowrap">Trạng thái</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {isLoading ? (
                  <TableSkeletonRows cols={7} rows={4} />
                ) : filteredCoupons.length > 0 ? (
                  filteredCoupons.map((coupon) => {
                    const usagePercent = Math.min(
                      100,
                      Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                    );
                    const isCopied = copiedCodeId === coupon.id;

                    return (
                      <tr key={coupon.id} className="hover:bg-slate-50/70 transition group">
                        {/* Coupon Code Badge */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div
                              className="px-3 py-1.5 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/60 font-mono font-black text-xs text-blue-700 tracking-wider shadow-xs cursor-pointer"
                              title={`Mã ưu đãi: ${coupon.code} (Bấm để copy)`}
                              onClick={() => handleCopyCode(coupon.id, coupon.code)}
                            >
                              {coupon.code}
                            </div>
                            <button
                              onClick={() => handleCopyCode(coupon.id, coupon.code)}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition cursor-pointer"
                              title="Sao chép mã"
                            >
                              {isCopied ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <p
                            className="text-[11px] text-slate-400 truncate max-w-xs mt-1 font-normal cursor-help"
                            title={coupon.description}
                          >
                            {coupon.description}
                          </p>
                        </td>

                        {/* Discount Value */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          {coupon.discountType === "percentage" && (
                            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                              Giảm {coupon.discountValue}%
                            </span>
                          )}
                          {coupon.discountType === "fixed" && (
                            <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1">
                              Giảm {formatCurrency(coupon.discountValue)}
                            </span>
                          )}
                          {coupon.discountType === "free_shipping" && (
                            <span className="font-extrabold text-sm text-emerald-600 flex items-center gap-1">
                              🚚 Miễn phí vận chuyển
                            </span>
                          )}
                        </td>

                        {/* Usage Progress */}
                        <td className="py-4 px-5 whitespace-nowrap">
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
                        <td className="py-4 px-5 whitespace-nowrap">
                          <span className="font-bold text-slate-800">
                            {(coupon.minSpend ?? coupon.minOrderValue ?? 0) > 0
                              ? formatCurrency(coupon.minSpend ?? coupon.minOrderValue ?? 0)
                              : "Không giới hạn"}
                          </span>
                        </td>

                        {/* Validity Period */}
                        <td className="py-4 px-5 text-slate-500 text-xs whitespace-nowrap">
                          <div className="font-medium text-slate-700">
                            {formatDateTime(coupon.expiryDate || coupon.endDate || "31-12-2026 23:59")}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal">
                            Bắt đầu: {formatDateTime(coupon.startDate || "01-01-2026 00:00")}
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
                            {coupon.status === "Active"
                              ? "Hoạt động"
                              : coupon.status === "Upcoming"
                              ? "Sắp diễn ra"
                              : coupon.status === "Expired"
                              ? "Đã hết hạn"
                              : "Tạm dừng"}
                          </button>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => handleOpenEditModal(coupon)}
                              title="Chỉnh sửa mã"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCoupon(coupon.id)}
                              title="Xóa mã giảm giá"
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
                      Không tìm thấy chương trình khuyến mãi nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Hiển thị {filteredCoupons.length} trên {coupons.length} mã ưu đãi
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
                    {editingCouponId ? "Chỉnh sửa mã giảm giá" : "Tạo mã giảm giá mới"}
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
                    <label className="font-bold text-slate-700">Mã giảm giá *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const random = `SPORTX${Math.floor(10 + Math.random() * 90)}K`;
                        setFormCode(random);
                      }}
                      className="text-[10px] text-blue-600 font-bold hover:underline"
                    >
                      🎲 Tạo mã ngẫu nhiên
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: AUTUMN25, SPORTX100K"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-50 font-mono font-bold text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 uppercase text-blue-700 tracking-wider"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mô tả ưu đãi</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: Giảm 25% cho toàn bộ trang phục thể thao thu đông"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                  />
                </div>

                {/* Discount Type & Value */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Loại giảm giá</label>
                    <HeroSelect
                      value={formDiscountType}
                      onChange={(val) => setFormDiscountType(val as any)}
                      options={[
                        { key: "percentage", label: "% Phần trăm giảm" },
                        { key: "fixed", label: "Số tiền cố định (đ)" },
                        { key: "free_shipping", label: "Miễn phí vận chuyển" },
                      ]}
                      className="w-full"
                      triggerClassName="w-full bg-slate-50 py-2.5"
                      aria-label="Chọn loại giảm giá"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {formDiscountType === "percentage" ? "Mức giảm (%) *" : "Số tiền giảm (đ) *"}
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={formDiscountType === "percentage" ? 100 : 10000000}
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
                      Đơn tối thiểu (đ)
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
                    <label className="block font-bold text-slate-700 mb-1">Giới hạn lượt dùng</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Ngày hết hạn</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: 30/10/2026"
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
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
                  >
                    {editingCouponId ? "Cập nhật mã" : "Tạo mã ngay"}
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
