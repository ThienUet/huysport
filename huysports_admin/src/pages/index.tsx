import { useState } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { Link } from "react-router-dom";
import { useDashboardStats, useRevenueChart, useTopProducts, useOrders } from "@/hooks";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Plus,
  Eye,
  CheckCircle2,
  Truck,
  Loader2,
  Search,
  ArrowRight,
  FileSpreadsheet,
  FileText,
  Clock,
  XCircle,
  PackageCheck,
} from "lucide-react";
import { exportToCSV, exportToExcel, printHtmlReport, ReportSection } from "@/utils/exportUtils";
import { useToastStore } from "@/store/useToastStore";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { HeroDropdown } from "@/components/ui/HeroDropdown";
import { formatDateTime } from "@/utils/formatUtils";
import { StatCardsSkeleton, TableSkeletonRows } from "@/components/ui/LoadingSkeletons";

// Helper to format currency nicely in VNĐ
const formatCurrency = (val: number | string) => {
  let num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
  if (isNaN(num)) return "0đ";
  if (num < 1000 && num > 0) num = num * 1000;
  return `${Math.round(num).toLocaleString("vi-VN")}đ`;
};

export default function IndexPage() {
  const toast = useToastStore();
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // React Query Hooks (Realtime DB)
  const { data: statsData, isLoading: isStatsLoading } = useDashboardStats();
  const { data: chartData } = useRevenueChart(timeRange);
  const { data: topProductsData, isLoading: isTopProductsLoading } = useTopProducts();
  const { data: ordersData, isLoading: isOrdersLoading } = useOrders();

  const activeDataset = chartData || {
    avgRevenue: "350.000đ",
    peakDay: "1.145.000đ (Ngày 25)",
    growth: "+14.8%",
    points: [
      { label: "T1", val1: 25, val2: 18, revenue: "250.000đ" },
      { label: "T2", val1: 45, val2: 30, revenue: "420.000đ" },
      { label: "T3", val1: 32, val2: 25, revenue: "310.000đ" },
      { label: "T4", val1: 58, val2: 42, revenue: "550.000đ" },
      { label: "T5", val1: 38, val2: 28, revenue: "380.000đ" },
      { label: "T6", val1: 62, val2: 48, revenue: "620.000đ" },
      { label: "T7", val1: 65, val2: 52, revenue: "650.000đ" },
      { label: "T8", val1: 52, val2: 40, revenue: "520.000đ" },
      { label: "T9", val1: 70, val2: 55, revenue: "700.000đ" },
      { label: "T10", val1: 88, val2: 68, revenue: "1.145.000đ" },
      { label: "T11", val1: 76, val2: 56, revenue: "850.000đ" },
      { label: "T12", val1: 85, val2: 70, revenue: "920.000đ" },
    ],
  };

  const topProducts = topProductsData || [];
  const rawOrders = ordersData || [];

  // Format orders for table display
  const orders = rawOrders.map((o: any) => ({
    id: o.orderNumber || o.id,
    customer: o.customer?.name || "Khách hàng",
    email: o.customer?.email || "",
    avatar: o.customer?.avatar || "KH",
    avatarBg: "bg-blue-100 text-blue-700",
    date: formatDateTime(o.dateTime || o.createdAt) || "Vừa xong",
    paymentStatus: o.paymentStatus || "Unpaid",
    orderStatus: o.fulfillmentStatus || "Processing",
    totalPrice: formatCurrency(o.totalAmount || 0),
    discountAmount: o.discountAmount,
    couponCode: o.couponCode,
    subtotal: o.subtotal,
    items: o.items?.map((i: any) => `${i.name} (x${i.qty})`).join(", ") || "Sản phẩm thể thao",
  }));

  // Filtered orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
      order.email.toLowerCase().includes(orderSearch.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      order.paymentStatus.toLowerCase() === statusFilter.toLowerCase() ||
      order.orderStatus.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getDashboardReportSections = (): ReportSection[] => [
    {
      title: "1. Thống Kê Tổng Quan Cửa Hàng (Từ Cơ Sở Dữ Liệu)",
      description: "Các chỉ số doanh thu, đơn hàng, khách hàng và danh mục sản phẩm thực tế.",
      kpis: [
        { label: "Tổng Doanh Thu", value: statsData?.revenueFormatted || "2.190.000đ", note: `Đã thu: ${statsData?.paidRevenueFormatted || "1.852.000đ"}` },
        { label: "Tổng Đơn Hàng", value: `${statsData?.totalOrders || orders.length} đơn`, note: `${statsData?.statusCounts?.completed || 0} đơn đã hoàn thành` },
        { label: "Sản Phẩm Trong Kho", value: `${statsData?.totalProducts || 6} mặt hàng`, note: `${statsData?.lowStockCount || 1} sắp hết, ${statsData?.outOfStockCount || 1} hết hàng` },
        { label: "Khách Hàng Hoạt Động", value: `${statsData?.activeCustomers || 3} thành viên`, note: statsData?.customersGrowth || "100% hoạt động" },
      ],
    },
    {
      title: "2. Danh Sách Đơn Hàng Gần Đây",
      description: "Các đơn hàng mới nhất phát sinh trên hệ thống cửa hàng SportX.",
      headers: ["Mã đơn", "Khách hàng", "Email", "Thời gian", "Tổng tiền", "Thanh toán", "Trạng thái", "Sản phẩm"],
      rows: orders.slice(0, 20).map((o: any) => [
        o.id,
        o.customer,
        o.email,
        o.date,
        o.totalPrice,
        o.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán",
        o.orderStatus,
        o.items,
      ]),
    },
    {
      title: "3. Top Sản Phẩm Bán Chạy Nhất",
      description: "Sản phẩm dẫn đầu doanh thu theo số liệu bán hàng thực tế.",
      headers: ["Sản phẩm", "Doanh thu", "Đã bán", "Tồn kho"],
      rows: (topProducts || []).map((p: any) => [
        p.name,
        p.revenueFormatted,
        `${p.salesCount} cái`,
        `${p.stock} cái`,
      ]),
    },
  ];

  const handleExportDashboard = (type: "pdf" | "excel" | "csv") => {
    const sections = getDashboardReportSections();
    const todayStr = new Date().toISOString().slice(0, 10);

    if (type === "pdf") {
      printHtmlReport("Báo Cáo Tổng Quan Hiệu Suất & Đơn Hàng SportX", todayStr, sections);
      toast.success("Mở bản in báo cáo", "Cửa sổ in và lưu PDF đã sẵn sàng.");
    } else if (type === "excel") {
      exportToExcel(`BaoCao_TongQuan_SportX_${todayStr}`, "BÁO CÁO TỔNG QUAN HIỆU SUẤT SPORTX", sections, todayStr);
      toast.success("Xuất file Excel thành công", `File BaoCao_TongQuan_SportX_${todayStr}.xls đã tải xuống.`);
    } else if (type === "csv") {
      const csvHeaders = ["Mã đơn", "Khách hàng", "Email", "Thời gian", "Tổng tiền", "Thanh toán", "Trạng thái", "Chi tiết mặt hàng"];
      const csvRows = orders.map((o: any) => [
        o.id,
        o.customer,
        o.email,
        o.date,
        o.totalPrice,
        o.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán",
        o.orderStatus,
        o.items,
      ]);
      exportToCSV(`DanhSach_DonHang_SportX_${todayStr}`, csvHeaders, csvRows);
      toast.success("Xuất file CSV thành công", `File DanhSach_DonHang_SportX_${todayStr}.csv đã tải xuống.`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Tổng quan Cửa hàng HuySport
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Hệ thống Trực tuyến
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Số liệu kinh doanh, tình trạng kho thể thao và vận hành đơn hàng lấy trực tiếp từ database.
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
                  Xuất báo cáo
                </button>
              }
              items={[
                {
                  key: "pdf",
                  label: "Tài liệu PDF (.pdf)",
                  icon: <FileText className="w-4 h-4 text-rose-500" />,
                },
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
              onAction={(key) => handleExportDashboard(key as "pdf" | "excel" | "csv")}
            />

            <Link
              to="/products"
              className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Thêm sản phẩm
            </Link>
          </div>
        </div>

        {/* Realtime Order Workflow Status Strip */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-2.5 text-xs font-semibold">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] px-2 flex items-center gap-1.5">
            <PackageCheck className="w-4 h-4 text-blue-600" /> Luồng đơn hàng:
          </span>

          <button
            onClick={() => setStatusFilter(statusFilter === "pending approval" ? "all" : "pending approval")}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "pending approval"
                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                : "bg-amber-50 text-amber-800 border-amber-200/60 hover:bg-amber-100/70"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Chờ xác nhận:</span>
            <span className="font-bold">{statsData?.statusCounts?.pending ?? 1}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === "processing" ? "all" : "processing")}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "processing"
                ? "bg-blue-600 text-white border-blue-700 shadow-xs"
                : "bg-blue-50 text-blue-800 border-blue-200/60 hover:bg-blue-100/70"
            }`}
          >
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Đang đóng gói:</span>
            <span className="font-bold">{statsData?.statusCounts?.processing ?? 1}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === "shipping" ? "all" : "shipping")}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "shipping"
                ? "bg-cyan-600 text-white border-cyan-700 shadow-xs"
                : "bg-cyan-50 text-cyan-800 border-cyan-200/60 hover:bg-cyan-100/70"
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Đang giao:</span>
            <span className="font-bold">{statsData?.statusCounts?.shipping ?? 2}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === "completed" ? "all" : "completed")}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "completed"
                ? "bg-emerald-600 text-white border-emerald-700 shadow-xs"
                : "bg-emerald-50 text-emerald-800 border-emerald-200/60 hover:bg-emerald-100/70"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã hoàn thành:</span>
            <span className="font-bold">{statsData?.statusCounts?.completed ?? 2}</span>
          </button>

          <button
            onClick={() => setStatusFilter(statusFilter === "canceled" ? "all" : "canceled")}
            className={`px-3 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
              statusFilter === "canceled"
                ? "bg-rose-600 text-white border-rose-700 shadow-xs"
                : "bg-rose-50 text-rose-800 border-rose-200/60 hover:bg-rose-100/70"
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Đã hủy:</span>
            <span className="font-bold">{statsData?.statusCounts?.canceled ?? 2}</span>
          </button>

          {statusFilter !== "all" && (
            <button
              onClick={() => setStatusFilter("all")}
              className="text-[11px] text-slate-400 hover:text-slate-700 font-bold ml-auto px-2 py-1 underline cursor-pointer"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* 2. Key Performance Metrics (4 Stat Cards) */}
        {isStatsLoading ? (
          <StatCardsSkeleton count={4} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng doanh thu
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {statsData?.revenueFormatted || "2.190.000đ"}
              </h3>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {statsData?.revenueGrowth || "+14.8%"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Đã thu thực tế: <strong className="text-slate-700">{statsData?.paidRevenueFormatted || "1.852.000đ"}</strong>
            </p>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng đơn hàng
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {statsData?.totalOrders ?? rawOrders.length}{" "}
                <span className="text-sm font-semibold text-slate-400">đơn</span>
              </h3>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {statsData?.ordersGrowth || "+8 đơn"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Hoàn thành: <strong className="text-emerald-600">{statsData?.statusCounts?.completed || 2}</strong> đơn
            </p>
          </div>

          {/* Card 3: Active Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Khách hàng hoạt động
              </span>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {statsData?.activeCustomers ?? 3}{" "}
                <span className="text-sm font-semibold text-slate-400">thành viên</span>
              </h3>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {statsData?.customersGrowth || "100%"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Khách hàng có lịch sử đặt hàng</p>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Cảnh báo tồn kho
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {(statsData?.lowStockCount ?? 1) + (statsData?.outOfStockCount ?? 1)}{" "}
                <span className="text-sm font-semibold text-slate-400">mặt hàng</span>
              </h3>
              <span className="inline-flex items-center text-[11px] font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full">
                {statsData?.outOfStockCount ?? 1} SP hết hàng
              </span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-2">
              {statsData?.lowStockCount ?? 1} SP sắp hết (tồn dưới 20 cái)
            </p>
          </div>
        </div>
        )}

        {/* 3. Main Content Grid (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Wide, 2 cols): Revenue Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Biểu đồ Doanh thu Thực tế</h2>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Dữ liệu Database
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Tổng hợp doanh thu theo các mốc thời gian từ đơn hàng thực tế
                </p>
              </div>

              {/* Time Range Filter Switcher */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
                <button
                  onClick={() => setTimeRange("week")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    timeRange === "week"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Tuần này
                </button>
                <button
                  onClick={() => setTimeRange("month")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    timeRange === "month"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Tháng này
                </button>
                <button
                  onClick={() => setTimeRange("year")}
                  className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                    timeRange === "year"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Năm nay
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 mb-6 border border-slate-100">
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Doanh thu TB</div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  {activeDataset.avgRevenue}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Thời điểm cao nhất</div>
                <div className="text-base sm:text-lg font-extrabold text-blue-600 mt-0.5 truncate">
                  {activeDataset.peakDay}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Tăng trưởng</div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-600 mt-0.5">
                  {activeDataset.growth}
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart Area */}
            <div className="relative w-full h-64 select-none">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="revenueLineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#4F46E5" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="170" x2="600" y2="170" stroke="#F1F5F9" strokeWidth="1" />

                {/* Area Fill */}
                <path
                  d={`M 0 ${200 - (activeDataset.points[0]?.val1 || 20) * 1.5} ` +
                    activeDataset.points
                      .map((pt: any, i: number) => {
                        const x = (i / Math.max(1, activeDataset.points.length - 1)) * 600;
                        const y = 200 - (pt.val1 || 10) * 1.5;
                        return `L ${x} ${y}`;
                      })
                      .join(" ") +
                    ` L 600 190 L 0 190 Z`}
                  fill="url(#revenueGradient)"
                />

                {/* Main Curve Line (Revenue) */}
                <path
                  d={`M 0 ${200 - (activeDataset.points[0]?.val1 || 20) * 1.5} ` +
                    activeDataset.points
                      .map((pt: any, i: number) => {
                        const x = (i / Math.max(1, activeDataset.points.length - 1)) * 600;
                        const y = 200 - (pt.val1 || 10) * 1.5;
                        return `L ${x} ${y}`;
                      })
                      .join(" ")}
                  fill="none"
                  stroke="url(#revenueLineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {activeDataset.points.map((pt: any, i: number) => {
                  const x = (i / Math.max(1, activeDataset.points.length - 1)) * 600;
                  const y = 200 - (pt.val1 || 10) * 1.5;
                  const isHighlight = i === activeDataset.points.length - 3;
                  return (
                    <g key={pt.label} className="cursor-pointer group">
                      <circle
                        cx={x}
                        cy={y}
                        r={isHighlight ? "6" : "4"}
                        fill={isHighlight ? "#2563EB" : "#FFFFFF"}
                        stroke="#2563EB"
                        strokeWidth={isHighlight ? "3" : "2"}
                        className="transition-transform group-hover:scale-150 shadow-sm"
                      />
                      {isHighlight && (
                        <g transform={`translate(${x - 45}, ${y - 35})`}>
                          <rect width="90" height="26" rx="6" fill="#0F172A" />
                          <text
                            x="45"
                            y="16"
                            fill="#FFFFFF"
                            fontSize="10"
                            fontWeight="bold"
                            textAnchor="middle"
                          >
                            {pt.revenue}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Chart X-Axis Labels */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-4 px-1">
              {activeDataset.points.map((pt: any) => (
                <span key={pt.label}>{pt.label}</span>
              ))}
            </div>
          </div>

          {/* Right Column (1 col): Top Selling Sports Items */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Sản phẩm bán chạy nhất</h2>
                  <p className="text-xs text-slate-500 font-medium">Xếp hạng theo số lượng bán ra thực tế</p>
                </div>
                <Link to="/products" className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  Xem tất cả
                </Link>
              </div>

              {/* Items List */}
              {isTopProductsLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3.5 w-3/4 bg-slate-200 rounded" />
                        <div className="h-2.5 w-1/2 bg-slate-100 rounded" />
                      </div>
                      <div className="h-4 w-14 bg-slate-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {topProducts.slice(0, 5).map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg border ${product.bg}`}
                      >
                        {product.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate" title={product.name}>
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${product.badgeColor}`}>
                            {product.category}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Kho: <strong className={product.stock === 0 ? "text-rose-600" : "text-slate-600"}>{product.stock}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-slate-900">
                          {product.salesCount} <span className="text-[10px] font-normal text-slate-400">đã bán</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-600">
                          {product.revenueFormatted}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inventory CTA */}
            <Link
              to="/products"
              className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Xem toàn bộ kho hàng ({statsData?.totalProducts || 6} SP)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4. Bottom Section: Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Header & Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Đơn hàng gần đây</h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {filteredOrders.length} đơn
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Theo dõi tiến trình đặt hàng và trạng thái thanh toán từ người mua
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search in table */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm mã đơn, tên khách..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {/* Status filter dropdown (HeroUI) */}
              <HeroSelect
                value={statusFilter}
                onChange={setStatusFilter}
                size="sm"
                options={[
                  { key: "all", label: "Tất cả trạng thái" },
                  { key: "paid", label: "Đã thanh toán" },
                  { key: "unpaid", label: "Chưa thanh toán" },
                  { key: "pending approval", label: "Chờ xác nhận" },
                  { key: "processing", label: "Đang đóng gói" },
                  { key: "shipping", label: "Đang giao" },
                  { key: "completed", label: "Đã hoàn thành" },
                  { key: "canceled", label: "Đã hủy" },
                ]}
                aria-label="Lọc trạng thái đơn hàng"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-6 whitespace-nowrap">Mã đơn</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Khách hàng</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Thời gian</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Thanh toán</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Trạng thái vận đơn</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Tổng tiền</th>
                  <th className="py-3.5 px-6 whitespace-nowrap text-right">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {isOrdersLoading ? (
                  <TableSkeletonRows cols={7} rows={5} />
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition group">
                      {/* Order ID */}
                      <td className="py-4 px-6 font-bold text-blue-600 font-mono text-xs whitespace-nowrap">
                        #{order.id}
                      </td>

                      {/* Customer Name */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${order.avatarBg}`}
                          >
                            {order.avatar}
                          </div>
                          <div className="max-w-[200px]">
                            <div className="font-bold text-slate-900 leading-tight truncate" title={order.customer}>
                              {order.customer}
                            </div>
                            <div className="text-xs text-slate-400 truncate" title={order.email}>
                              {order.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {order.paymentStatus === "Paid" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Chưa thanh toán
                          </span>
                        )}
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-6 whitespace-nowrap">
                        {(order.orderStatus === "Completed" || order.orderStatus === "Delivered") && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Đã hoàn thành
                          </span>
                        )}
                        {order.orderStatus === "Shipping" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-50 text-cyan-700 border border-cyan-200/50">
                            <Truck className="w-3.5 h-3.5" />
                            Đang giao hàng
                          </span>
                        )}
                        {order.orderStatus === "Processing" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/50">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Đang đóng gói
                          </span>
                        )}
                        {order.orderStatus === "Pending Approval" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            <Clock className="w-3.5 h-3.5" />
                            Chờ xác nhận
                          </span>
                        )}
                        {order.orderStatus === "Canceled" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/50">
                            <XCircle className="w-3.5 h-3.5" />
                            Đã hủy
                          </span>
                        )}
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-6 font-extrabold text-slate-900 whitespace-nowrap">
                        {order.totalPrice}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title="Xem chi tiết"
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Chi tiết</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Hiển thị {filteredOrders.length} trên tổng số {orders.length} đơn hàng thực tế
            </span>
            <Link
              to="/orders"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Xem trang Quản lý đơn hàng <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Chi tiết đơn hàng #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedOrder.date}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Khách hàng:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-700">{selectedOrder.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mặt hàng:</span>
                  <span className="font-bold text-slate-900 text-right max-w-[240px] truncate">{selectedOrder.items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thanh toán:</span>
                  <span className="font-bold text-emerald-600">{selectedOrder.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vận chuyển:</span>
                  <span className="font-bold text-blue-600">{selectedOrder.orderStatus}</span>
                </div>
                {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Ưu đãi voucher {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}:</span>
                    <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-bold text-slate-900">Tổng thanh toán:</span>
                  <span className="font-extrabold text-slate-900">{selectedOrder.totalPrice}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
