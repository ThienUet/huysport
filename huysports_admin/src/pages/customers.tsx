import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
import { useDebounce } from "@/hooks/useDebounce";
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
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { exportToCSV, exportToExcel, ReportSection } from "@/utils/exportUtils";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { HeroDropdown } from "@/components/ui/HeroDropdown";
import { formatDateTime } from "@/utils/formatUtils";

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

const formatCurrency = (val: number | string) => {
  let num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return "0đ";
  if (num < 1000 && num > 0) num = num * 1000;
  return `${Math.round(num).toLocaleString("vi-VN")}đ`;
};

const removeVietnameseTones = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore();
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const debouncedSearch = useDebounce(searchQuery, 250);

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
    const qNorm = removeVietnameseTones(debouncedSearch);
    const qRaw = debouncedSearch.toLowerCase().trim();
    const qDigits = debouncedSearch.replace(/\D/g, "");

    return customers.filter((cust: Customer) => {
      let matchSearch = true;
      if (qNorm) {
        const nameNorm = removeVietnameseTones(cust.fullName || "");
        const emailNorm = (cust.email || "").toLowerCase();
        const phoneDigits = (cust.phone || "").replace(/\D/g, "");
        const addrNorm = removeVietnameseTones(cust.primaryAddress || "");

        matchSearch =
          nameNorm.includes(qNorm) ||
          emailNorm.includes(qRaw) ||
          (qDigits.length >= 2 && phoneDigits.includes(qDigits)) ||
          addrNorm.includes(qNorm);
      }

      const matchStatus = statusFilter === "all" || cust.status.toLowerCase() === statusFilter.toLowerCase();
      const matchTier = tierFilter === "all" || cust.tier.toLowerCase() === tierFilter.toLowerCase();

      return matchSearch && matchStatus && matchTier;
    });
  }, [customers, debouncedSearch, statusFilter, tierFilter]);

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

  // Export Customers Handler
  const handleExportCustomers = (format: "excel" | "csv") => {
    if (filteredCustomers.length === 0) {
      toast.error("Không có khách hàng", "Không có dữ liệu khách hàng để xuất báo cáo.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Mã KH",
      "Họ và tên",
      "Email",
      "Số điện thoại",
      "Hạng thành viên",
      "Tổng chi tiêu (VNĐ)",
      "Số đơn hàng",
      "Trạng thái tài khoản",
      "Địa chỉ chính",
    ];

    const rows = filteredCustomers.map((c: Customer) => [
      c.id,
      c.fullName,
      c.email,
      c.phone || "Chưa cập nhật",
      c.tier || "Tiêu Chuẩn",
      `${(c.lifetimeSpent || 0).toLocaleString("vi-VN")}đ`,
      c.totalOrders || c.orderHistory?.length || 0,
      c.status === "Active" ? "Đang hoạt động" : "Đã khóa",
      c.primaryAddress || (c.addresses?.[0]?.addressLine) || "Chưa lưu",
    ]);

    if (format === "excel") {
      const sections: ReportSection[] = [
        {
          title: `Danh Sách Khách Hàng SportX (${filteredCustomers.length} khách hàng)`,
          description: `Trạng thái: ${statusFilter} | Hạng: ${tierFilter}`,
          headers,
          rows,
        },
      ];
      exportToExcel(`KhachHang_SportX_${todayStr}`, "BÁO CÁO DANH SÁCH KHÁCH HÀNG SPORTX", sections, todayStr);
      toast.success("Xuất file Excel thành công", `File KhachHang_SportX_${todayStr}.xls đã tải xuống.`);
    } else {
      exportToCSV(`KhachHang_SportX_${todayStr}`, headers, rows);
      toast.success("Xuất file CSV thành công", `File KhachHang_SportX_${todayStr}.csv đã tải xuống.`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Top Header & Stats Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Danh bạ & Hồ sơ khách hàng
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200/60">
                3.850 Đã đăng ký
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Quản lý hồ sơ khách hàng đã xác minh, phân hạng thành viên, sổ địa chỉ và lịch sử đơn hàng.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Export Dropdown (HeroUI) */}
            <HeroDropdown
              title="Chọn định dạng"
              trigger={
                <button
                  type="button"
                  className="h-9 px-3.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition inline-flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Xuất danh sách KH
                </button>
              }
              items={[
                {
                  key: "excel",
                  label: "Bảng tính Excel (.xls)",
                  icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
                },
                {
                  key: "csv",
                  label: "Dữ liệu thô CSV (.csv)",
                  icon: <Download className="w-4 h-4 text-blue-500" />,
                },
              ]}
              onAction={(key) => handleExportCustomers(key as "excel" | "csv")}
            />
          </div>
        </div>

        {/* 3 Quick Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Card 1: Total Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng khách hàng
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">3.850</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 5.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Tất cả tài khoản SportX đã đăng ký</p>
          </div>

          {/* Card 2: Active Buying Users */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Khách mua thường xuyên
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">2.100</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 8.2%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Tỷ lệ mua lại đạt 54.5%</p>
          </div>

          {/* Card 3: New Users This Month */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Khách mới tháng này
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
            <p className="text-[11px] text-slate-400 mt-2 font-medium">+35 đăng ký tuần này</p>
          </div>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm kiếm theo họ tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns (HeroUI) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Account Status Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Trạng thái:</span>
              <HeroSelect
                value={statusFilter}
                onChange={setStatusFilter}
                size="sm"
                options={[
                  { key: "all", label: "Tất cả trạng thái" },
                  { key: "active", label: "Đang hoạt động" },
                  { key: "blocked", label: "Đã khóa / Tạm dừng" },
                ]}
                aria-label="Lọc theo trạng thái tài khoản"
              />
            </div>

            {/* Spending Tier Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Hạng thành viên:</span>
              <HeroSelect
                value={tierFilter}
                onChange={setTierFilter}
                size="sm"
                options={[
                  { key: "all", label: "Tất cả phân hạng" },
                  { key: "vip", label: "👑 Hạng VIP" },
                  { key: "loyal", label: "💎 Hạng Thân thiết" },
                  { key: "new", label: "🌱 Hạng Mới" },
                ]}
                aria-label="Lọc theo phân hạng khách hàng"
              />
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
                title="Đặt lại bộ lọc"
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
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[200px]">Thông tin khách hàng</th>
                  <th className="py-3.5 px-4 whitespace-nowrap min-w-[220px]">SĐT & Địa chỉ giao hàng</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Ngày tham gia</th>
                  <th className="py-3.5 px-4 text-center whitespace-nowrap">Tổng đơn</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Tổng chi tiêu</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Hạng thành viên</th>
                  <th className="py-3.5 px-4 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3.5 px-4 text-right whitespace-nowrap">Thao tác</th>
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
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ${cust.avatarBg}`}
                            >
                              {cust.avatar}
                            </div>
                            <div className="min-w-0 max-w-[180px]">
                              <div
                                className="font-bold text-slate-900 text-sm truncate cursor-help"
                                title={cust.fullName}
                              >
                                {cust.fullName}
                              </div>
                              <div
                                className="text-[11px] text-slate-400 truncate"
                                title={cust.email}
                              >
                                {cust.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Phone & Primary Shipping Address */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="max-w-[240px]">
                            <div
                              className="font-mono font-bold text-slate-800 text-[11px] truncate"
                              title={`SĐT: ${cust.phone}`}
                            >
                              {cust.phone}
                            </div>
                            <div
                              className="text-[11px] text-slate-400 truncate mt-0.5 cursor-help"
                              title={cust.primaryAddress}
                            >
                              {cust.primaryAddress}
                            </div>
                          </div>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 text-slate-500 text-xs font-medium whitespace-nowrap">
                          {formatDateTime(cust.joinedDate)}
                        </td>

                        {/* Total Orders */}
                        <td className="py-4 px-4 text-center whitespace-nowrap">
                          <span
                            className="font-extrabold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg"
                            title={`Tổng số đơn đã đặt: ${cust.totalOrders} đơn`}
                          >
                            {cust.totalOrders} đơn
                          </span>
                        </td>

                        {/* Total Lifetime Value */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span
                            className="font-extrabold text-sm text-emerald-600"
                            title={`Tổng giá trị mua sắm tích lũy: ${formatCurrency(cust.lifetimeSpent)}`}
                          >
                            {formatCurrency(cust.lifetimeSpent)}
                          </span>
                        </td>

                        {/* Spending Tier */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {cust.tier === "VIP" && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 shadow-xs whitespace-nowrap"
                              title="Khách hàng hạng VIP - Ưu tiên hỗ trợ và khuyến mãi đặc quyền"
                            >
                              <Crown className="w-3 h-3 text-amber-600" />
                              VIP
                            </span>
                          )}
                          {cust.tier === "Loyal" && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200/60 whitespace-nowrap"
                              title="Khách hàng thân thiết"
                            >
                              <Sparkles className="w-3 h-3 text-blue-600" />
                              Thân thiết
                            </span>
                          )}
                          {cust.tier === "New" && (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap"
                              title="Khách hàng mới đăng ký"
                            >
                              Mới
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-4 px-4 whitespace-nowrap">
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
                            {cust.status === "Active" ? "Hoạt động" : "Bị khóa"}
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => setDetailCustomer(cust)}
                              title="Xem chi tiết hồ sơ"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                alert(`Chỉnh sửa khách hàng: ${cust.fullName}`);
                              }}
                              title="Chỉnh sửa thông tin"
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleBlockStatus(cust.id)}
                              title={cust.status === "Active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
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
                      Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Hiển thị {filteredCustomers.length} trên {customers.length} khách hàng
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition disabled:opacity-50"
                disabled
              >
                Trước
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition">
                Sau
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
                          {detailCustomer.status === "Active" ? "Hoạt động" : "Bị khóa"}
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
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Tổng chi tiêu</div>
                    <div className="text-base font-extrabold text-emerald-600 mt-0.5">
                      {formatCurrency(detailCustomer.lifetimeSpent)}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Tổng số đơn</div>
                    <div className="text-base font-extrabold text-slate-900 mt-0.5">
                      {detailCustomer.totalOrders}
                    </div>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Ngày gia nhập</div>
                    <div className="text-xs font-bold text-slate-700 mt-1">
                      {formatDateTime(detailCustomer.joinedDate)}
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
                    Lịch sử đơn hàng ({detailCustomer.orderHistory.length})
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
                    Sổ địa chỉ ({detailCustomer.addresses.length})
                  </button>
                </div>

                {/* Drawer Content */}
                <div className="p-6 space-y-4 flex-1 overflow-y-auto text-xs">
                  {drawerTab === "orders" && (
                    <div className="space-y-3">
                      {detailCustomer.orderHistory.map((order) => {
                        const statusLabel =
                          order.status === "Delivered"
                            ? "Đã giao"
                            : order.status === "Shipping"
                            ? "Đang giao"
                            : order.status === "Processing"
                            ? "Đang xử lý"
                            : "Đã hủy";
                        return (
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
                                {statusLabel}
                              </span>
                            </div>
                            <p className="text-slate-700 font-medium">{order.itemsSummary}</p>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                              <span className="text-slate-400">{formatDateTime(order.date)}</span>
                              <span className="font-extrabold text-slate-900">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {drawerTab === "addresses" && (
                    <div className="space-y-3">
                      {detailCustomer.addresses.map((addr) => {
                        const labelText =
                          addr.label === "Home"
                            ? "Nhà riêng"
                            : addr.label === "Office"
                            ? "Văn phòng"
                            : "Địa chỉ khác";
                        return (
                          <div
                            key={addr.id}
                            className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                                🏷️ {labelText}
                                {addr.isDefault && (
                                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">
                                    Mặc định
                                  </span>
                                )}
                              </span>
                            </div>
                            <div className="text-slate-800 font-bold">{addr.recipientName}</div>
                            <div className="text-slate-500 font-mono text-[11px]">{addr.phone}</div>
                            <div className="text-slate-600 leading-relaxed">{addr.addressLine}</div>
                          </div>
                        );
                      })}
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
                    {detailCustomer.status === "Active" ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDetailCustomer(null)}
                      className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => {
                        window.location.href = `mailto:${detailCustomer.email}`;
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-blue-500/20"
                    >
                      Gửi email liên hệ
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
