import AdminLayout from "@/layouts/admin-layout";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";
import {
  Download,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Bot,
  PieChart,
  BarChart2,
  FileSpreadsheet,
  FileText,
  Sparkles,
  CheckCircle2,
  Truck,
  Loader2,
  Clock,
  XCircle,
  Package,
  ShieldAlert,
  Users,
} from "lucide-react";
import { exportToCSV, exportToExcel, printHtmlReport, ReportSection } from "@/utils/exportUtils";
import { useToastStore } from "@/store/useToastStore";
import { HeroDropdown } from "@/components/ui/HeroDropdown";

export default function AnalyticsPage() {
  const toast = useToastStore();
  const dateRange = "Tháng 10/2026 (Hiện tại)";

  // Fetch real analytics report from database
  const { data: reportData } = useQuery({
    queryKey: ["analytics-reports"],
    queryFn: analyticsService.getReports,
  });

  const kpis = reportData?.kpis || {
    totalRevenue: 2190000,
    revenueFormatted: "2.190.000đ",
    netProfit: 700800,
    profitFormatted: "700.800đ",
    averageOrderValue: 365000,
    aovFormatted: "365.000đ",
    totalOrders: 8,
    completedOrders: 2,
    completionRate: "25.0%",
    canceledOrders: 2,
    returnRate: "25.0%",
    shippingOrders: 2,
    processingOrders: 1,
    pendingOrders: 1,
  };

  const categorySales = reportData?.categorySales || [];
  const inventoryHealth = reportData?.inventoryHealth || [];
  const aiStats = reportData?.aiConsultationStats || {
    totalSessions: 4,
    totalMessages: 41,
    recommendedSessions: 3,
    conversionRate: "75%",
  };
  const customerStats = reportData?.customerStats || {
    totalCustomers: 3,
    activeCustomers: 3,
    tierBreakdown: { VIP: 1, Loyal: 1, New: 1 },
  };

  const getReportSections = (): ReportSection[] => [
    {
      title: "1. Chỉ số Hiệu quả Tài chính & Vận hành Cốt lõi (Từ Cơ Sở Dữ Liệu)",
      description: "Tổng hợp doanh thu, lợi nhuận ước tính, giá trị đơn trung bình và hiệu suất bán hàng thực tế.",
      kpis: [
        { label: "Tổng Doanh Thu", value: kpis.revenueFormatted, note: "Doanh thu các đơn hợp lệ" },
        { label: "Lợi Nhuận Ước Tính (32%)", value: kpis.profitFormatted, note: "Biên LN bán lẻ thể thao" },
        { label: "Giá Trị Đơn TB (AOV)", value: kpis.aovFormatted, note: "Bình quân mỗi đơn hàng" },
        { label: "Trợ Lý AI Chatbot", value: `${aiStats.totalSessions} phiên tư vấn`, note: `Tỷ lệ gợi ý thành công: ${aiStats.conversionRate}` },
      ],
    },
    {
      title: "2. Doanh thu theo Phân môn Thể thao",
      description: "Cơ cấu tỷ trọng doanh số theo từng nhóm thể thao chính tại cửa hàng SportX.",
      headers: ["Môn thể thao", "Số mặt hàng", "Tồn kho", "Đã bán", "Doanh thu thực tế", "Tỷ trọng"],
      rows: categorySales.map((c: any) => [
        c.name,
        `${c.productCount} SP`,
        `${c.totalStock} cái`,
        `${c.unitsSold} cái`,
        c.revenueFormatted,
        `${c.percentage}%`,
      ]),
    },
    {
      title: "3. Tình trạng Tồn kho & Cảnh báo Mặt hàng Cần Bổ sung",
      description: "Danh sách sản phẩm thể thao và mức độ tồn kho cần nhập bổ sung khẩn cấp.",
      headers: ["Tên sản phẩm", "Mã SKU", "Danh mục", "Giá bán", "Tồn kho", "Trạng thái", "Khuyến nghị"],
      rows: inventoryHealth.map((item: any) => [
        item.name,
        item.sku,
        item.category,
        item.basePriceFormatted,
        `${item.stock} cái`,
        item.status,
        item.action,
      ]),
    },
    {
      title: "4. Tiến độ Vận hành & Luồng Đơn hàng",
      description: "Thống kê tỷ lệ hoàn thành, giao hàng và hủy đơn trên hệ thống.",
      headers: ["Trạng thái", "Số lượng đơn", "Tỷ lệ"],
      rows: [
        ["Đã hoàn thành", `${kpis.completedOrders} đơn`, kpis.completionRate],
        ["Đang giao hàng", `${kpis.shippingOrders} đơn`, `${Math.round((kpis.shippingOrders / kpis.totalOrders) * 100)}%`],
        ["Đang đóng gói", `${kpis.processingOrders} đơn`, `${Math.round((kpis.processingOrders / kpis.totalOrders) * 100)}%`],
        ["Chờ xác nhận", `${kpis.pendingOrders} đơn`, `${Math.round((kpis.pendingOrders / kpis.totalOrders) * 100)}%`],
        ["Đã hủy", `${kpis.canceledOrders} đơn`, kpis.returnRate],
      ],
    },
  ];

  const handleExport = (type: "pdf" | "excel" | "csv") => {
    const sections = getReportSections();
    const cleanRange = dateRange.replace(/[\/\\:*?"<>| ]+/g, "_");

    if (type === "pdf") {
      printHtmlReport("Báo Cáo Thống Kê Hoạt Động & Tồn Kho SportX", dateRange, sections);
      toast.success("Mở bản in báo cáo", "Cửa sổ in và xuất PDF đã sẵn sàng.");
    } else if (type === "excel") {
      exportToExcel(`BaoCao_ThongKe_SportX_${cleanRange}`, "BÁO CÁO THỐNG KÊ DOANH THU & TỒN KHO SPORTX", sections, dateRange);
      toast.success("Xuất file Excel thành công", `File BaoCao_ThongKe_SportX_${cleanRange}.xls đã tải xuống.`);
    } else if (type === "csv") {
      const csvHeaders = ["Mục báo cáo", "Chỉ tiêu / Tên / Phân loại", "Thông tin 1", "Thông tin 2", "Thông tin 3", "Đề xuất xử lý"];
      const csvRows: (string | number)[][] = [];

      sections.forEach((sec) => {
        if (sec.kpis) {
          sec.kpis.forEach((kpi) => {
            csvRows.push([sec.title, kpi.label, kpi.value, kpi.note || "", "", ""]);
          });
        }
        if (sec.rows) {
          sec.rows.forEach((row) => {
            csvRows.push([sec.title, ...row]);
          });
        }
      });

      exportToCSV(`BaoCao_ThongKe_SportX_${cleanRange}`, csvHeaders, csvRows);
      toast.success("Xuất file CSV thành công", `File BaoCao_ThongKe_SportX_${cleanRange}.csv đã tải xuống.`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Thống kê & Báo cáo Hoạt động
              </h1>
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <BarChart2 className="w-3.5 h-3.5" /> Dữ liệu Database
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Phân tích doanh thu, cơ cấu phân môn thể thao, hiệu quả tư vấn AI và tình trạng tồn kho thực tế.
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
              onAction={(key) => handleExport(key as "pdf" | "excel" | "csv")}
            />

            <Link
              to="/"
              className="h-9 px-3.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition inline-flex items-center justify-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              Về trang Tổng quan
            </Link>
          </div>
        </div>

        {/* 1. Core KPIs (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Tổng doanh thu
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.revenueFormatted}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Từ <strong className="text-slate-700">{kpis.totalOrders}</strong> đơn hàng đã ghi nhận
            </p>
          </div>

          {/* Card 2: Estimated Net Profit */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Lợi nhuận ước tính (32%)
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.profitFormatted}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Biên lợi nhuận bán lẻ thể thao ổn định
            </p>
          </div>

          {/* Card 3: Average Order Value */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Giá trị đơn TB (AOV)
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {kpis.aovFormatted}
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">
              Bình quân trên mỗi đơn hàng hợp lệ
            </p>
          </div>

          {/* Card 4: AI Chatbot Consultations */}
          <div className="bg-white rounded-2xl p-5 border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/40 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Trợ lý AI Chatbot
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">
              {aiStats.totalSessions} <span className="text-sm font-semibold text-slate-400">phiên tư vấn</span>
            </div>
            <p className="text-[11px] text-purple-700 font-semibold mt-2">
              {aiStats.totalMessages} tin nhắn • Gợi ý thành công {aiStats.conversionRate}
            </p>
          </div>
        </div>

        {/* 2. Middle Row: Category Breakdown & Fulfillment Status (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Sales Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-blue-600" />
                    Cơ cấu Doanh số theo Phân môn
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Tỷ trọng doanh số ghi nhận từ các môn thể thao tại cửa hàng
                  </p>
                </div>
              </div>

              {/* Category Progress Bars */}
              <div className="space-y-4 my-2">
                {categorySales.map((cat: any) => (
                  <div key={cat.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5 text-slate-800">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({cat.productCount} SP • Tồn: {cat.totalStock})
                        </span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-900 font-bold">{cat.revenueFormatted}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                          {cat.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${cat.percentage}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Cập nhật tự động theo các đơn hàng hoàn tất</span>
              <Link to="/products" className="text-blue-600 font-bold hover:underline">
                Quản lý danh mục →
              </Link>
            </div>
          </div>

          {/* Order Fulfillment Health */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-600" />
                    Tiến độ Vận đơn & Tỷ lệ Giao hàng
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Theo dõi tỷ lệ hoàn thành và luồng xử lý đơn hàng thực tế
                  </p>
                </div>
              </div>

              {/* Big KPI Metrics */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 mb-4 border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Tỷ lệ hoàn thành</span>
                  <div className="text-2xl font-black text-emerald-600 mt-0.5">
                    {kpis.completionRate}
                  </div>
                  <span className="text-[11px] text-slate-400">{kpis.completedOrders} đơn đã giao thành công</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-400">Tỷ lệ hủy đơn</span>
                  <div className="text-2xl font-black text-rose-600 mt-0.5">
                    {kpis.returnRate}
                  </div>
                  <span className="text-[11px] text-slate-400">{kpis.canceledOrders} đơn bị hủy</span>
                </div>
              </div>

              {/* Status breakdown grid */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Đã hoàn thành
                  </span>
                  <span className="font-bold text-slate-900">{kpis.completedOrders} đơn</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <Truck className="w-4 h-4 text-cyan-600" /> Đang giao hàng
                  </span>
                  <span className="font-bold text-slate-900">{kpis.shippingOrders} đơn</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <Loader2 className="w-4 h-4 text-blue-600" /> Đang đóng gói
                  </span>
                  <span className="font-bold text-slate-900">{kpis.processingOrders} đơn</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <Clock className="w-4 h-4 text-amber-600" /> Chờ xác nhận
                  </span>
                  <span className="font-bold text-slate-900">{kpis.pendingOrders} đơn</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                  <span className="flex items-center gap-2 font-semibold text-slate-700">
                    <XCircle className="w-4 h-4 text-rose-600" /> Đã hủy
                  </span>
                  <span className="font-bold text-slate-900">{kpis.canceledOrders} đơn</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400 flex items-center justify-between">
              <span>Được tính toán theo đúng quy trình giao hàng SportX</span>
              <Link to="/orders" className="text-blue-600 font-bold hover:underline">
                Xem chi tiết đơn hàng →
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Real Inventory Health Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Báo cáo Tình trạng Tồn kho & Đề xuất Bổ sung
                </h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {inventoryHealth.length} sản phẩm
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Theo dõi mức độ an toàn tồn kho để kịp thời đặt hàng thêm từ nhà cung cấp
              </p>
            </div>

            <Link
              to="/products"
              className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-2 shrink-0 self-start sm:self-auto cursor-pointer"
            >
              <Package className="w-4 h-4" />
              Quản lý trong Kho hàng
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-6 whitespace-nowrap">Sản phẩm</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Mã SKU</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Phân môn</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Giá niêm yết</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Tồn kho thực tế</th>
                  <th className="py-3.5 px-6 whitespace-nowrap">Tình trạng</th>
                  <th className="py-3.5 px-6 whitespace-nowrap text-right">Khuyến nghị xử lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {inventoryHealth.map((item: any) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl p-1 bg-slate-100 rounded-lg shrink-0">{item.thumbnail || "👟"}</span>
                        <div className="max-w-[240px]">
                          <div className="font-bold text-slate-900 leading-tight truncate" title={item.name}>
                            {item.name}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono truncate" title={item.id}>{item.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-slate-600 font-bold whitespace-nowrap" title={item.sku}>
                      {item.sku}
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {item.category}
                    </td>
                    <td className="py-4 px-6 text-xs font-extrabold text-slate-900 whitespace-nowrap">
                      {item.basePriceFormatted}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`text-sm font-black ${item.stock === 0 ? "text-rose-600" : item.stock <= 20 ? "text-amber-600" : "text-slate-900"}`}>
                        {item.stock}
                      </span>
                      <span className="text-xs text-slate-400 font-normal ml-1">cái</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${item.statusColor}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg" title={item.action}>
                        {item.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Bottom Row: Customer & AI Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Customer Tiers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-600" /> Phân hạng khách hàng thể thao
              </div>
              <div className="text-lg font-black text-slate-900">
                {customerStats.totalCustomers} Khách hàng thân thiết
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/60">
                  VIP: {customerStats.tierBreakdown?.VIP || 1}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60">
                  Thân thiết: {customerStats.tierBreakdown?.Loyal || 1}
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  Mới: {customerStats.tierBreakdown?.New || 1}
                </span>
              </div>
            </div>
            <Link to="/customers" className="text-xs font-bold text-blue-600 hover:underline">
              Chi tiết →
            </Link>
          </div>

          {/* AI Chatbot Engagement */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" /> Tương tác Trợ lý AI HuySport
              </div>
              <div className="text-lg font-black text-slate-900">
                {aiStats.totalSessions} Phiên tư vấn tự động
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Tư vấn chọn size giày, quần áo và tra cứu tình trạng vận đơn trực tuyến.
              </p>
            </div>
            <Link to="/chatbot" className="text-xs font-bold text-purple-600 hover:underline">
              Cấu hình AI →
            </Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
