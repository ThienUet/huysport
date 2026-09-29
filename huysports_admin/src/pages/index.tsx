import { useState } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery } from "@tanstack/react-query";
import { dashboardService, orderService } from "@/services/api";
import {
  DollarSign,
  ShoppingBag,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Plus,
  Eye,
  Edit2,
  MoreVertical,
  CheckCircle2,
  Truck,
  Loader2,
  Search,
  ArrowRight,
} from "lucide-react";

export default function IndexPage() {
  // Chart timeframe state
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // React Query Hooks
  const { data: statsData } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });

  const { data: chartData } = useQuery({
    queryKey: ["dashboard-chart", timeRange],
    queryFn: () => dashboardService.getRevenueChart(timeRange),
  });

  const { data: topProductsData } = useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: dashboardService.getTopProducts,
  });

  const { data: ordersData } = useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: () => orderService.getAll(),
  });

  // Fallback fallback datasets
  const fallbackChart = {
    avgRevenue: "$1,510.00",
    peakDay: "$4,850 (15th)",
    growth: "↑ 12.5%",
    points: [
      { label: "Jan", val1: 25, val2: 18, revenue: "$28,400" },
      { label: "Feb", val1: 45, val2: 30, revenue: "$32,100" },
      { label: "Mar", val1: 32, val2: 25, revenue: "$30,500" },
      { label: "Apr", val1: 58, val2: 42, revenue: "$36,200" },
      { label: "May", val1: 38, val2: 28, revenue: "$34,000" },
      { label: "Jun", val1: 62, val2: 48, revenue: "$38,900" },
      { label: "Jul", val1: 65, val2: 52, revenue: "$39,800" },
      { label: "Aug", val1: 52, val2: 40, revenue: "$37,200" },
      { label: "Sep", val1: 70, val2: 55, revenue: "$41,000" },
      { label: "Oct", val1: 88, val2: 68, revenue: "$43,500" },
      { label: "Nov", val1: 96, val2: 76, revenue: "$45,280" },
      { label: "Dec", val1: 85, val2: 70, revenue: "$44,100" },
    ],
  };

  const activeDataset = chartData || fallbackChart;
  const topProducts = topProductsData || [];
  const rawOrders = ordersData || [];

  // Format orders for table display
  const orders = rawOrders.map((o: any) => ({
    id: o.orderNumber || o.id,
    customer: o.customer?.name || "Khách hàng",
    email: o.customer?.email || "",
    avatar: o.customer?.avatar || "SP",
    avatarBg: "bg-blue-100 text-blue-700",
    date: o.dateTime || "Vừa xong",
    paymentStatus: o.paymentStatus || "Unpaid",
    orderStatus: o.fulfillmentStatus || "Processing",
    totalPrice: `$${o.totalAmount?.toFixed(2) || "0.00"}`,
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

  return (
    <AdminLayout>
      <div className="space-y-7">
        {/* Page Title & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Performance Overview
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                Live Store
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Real-time insights and e-commerce inventory status for SportX Store.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition flex items-center gap-2 shadow-xs">
              <Download className="w-4 h-4 text-slate-400" />
              Export Report
            </button>
            <button className="px-3.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20">
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>
        </div>

        {/* 2. Key Performance Metrics (4 Stat Cards in a row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Revenue
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {statsData?.revenueFormatted || "$528.00"}
              </h3>
              <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                {statsData?.revenueGrowth || "12.5%"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Doanh thu từ các đơn đã thanh toán</p>
          </div>

          {/* Card 2: Total Orders */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Total Orders
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
                {statsData?.ordersGrowth || "8.2%"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Cập nhật theo thời gian thực</p>
          </div>

          {/* Card 3: Active Customers */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Active Customers
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
                {statsData?.customersGrowth || "5.4%"}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Khách hàng hoạt động tích cực</p>
          </div>

          {/* Card 4: Low Stock Alert */}
          <div className="bg-white rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-white to-amber-50/40 shadow-xs hover:shadow-md transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Low Stock Alert
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">
                {statsData?.lowStockCount ?? 2}{" "}
                <span className="text-sm font-semibold text-slate-400">mặt hàng</span>
              </h3>
              <span className="inline-flex items-center text-xs font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded-full animate-pulse">
                Cảnh báo kho
              </span>
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-2">
              Cần nhập thêm vào kho sớm
            </p>
          </div>
        </div>

        {/* 3. Main Content Grid (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (Wide, 2 cols): Revenue & Orders Overview Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Revenue & Orders Overview</h2>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Live Sync
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Sales performance trend vs monthly targets
                </p>
              </div>

              {/* Time Range Filter Switcher */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
                <button
                  onClick={() => setTimeRange("week")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeRange === "week"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setTimeRange("month")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeRange === "month"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  This Month
                </button>
                <button
                  onClick={() => setTimeRange("year")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    timeRange === "year"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  This Year
                </button>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 mb-6 border border-slate-100">
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Avg. Revenue</div>
                <div className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  {activeDataset.avgRevenue}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Peak Period</div>
                <div className="text-base sm:text-lg font-extrabold text-blue-600 mt-0.5">
                  {activeDataset.peakDay}
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-bold uppercase">Growth Trend</div>
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
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
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
                  d={`M 0 ${200 - (activeDataset.points[0].val1 * 1.6)} ` +
                    activeDataset.points
                      .map((pt: any, i: number) => {
                        const x = (i / (activeDataset.points.length - 1)) * 600;
                        const y = 200 - pt.val1 * 1.6;
                        return `L ${x} ${y}`;
                      })
                      .join(" ") +
                    ` L 600 190 L 0 190 Z`}
                  fill="url(#revenueGradient)"
                />

                {/* Main Curve Line (Revenue) */}
                <path
                  d={`M 0 ${200 - (activeDataset.points[0].val1 * 1.6)} ` +
                    activeDataset.points
                      .map((pt: any, i: number) => {
                        const x = (i / (activeDataset.points.length - 1)) * 600;
                        const y = 200 - pt.val1 * 1.6;
                        return `L ${x} ${y}`;
                      })
                      .join(" ")}
                  fill="none"
                  stroke="url(#revenueLineGradient)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Secondary Orders Line (Dotted) */}
                <path
                  d={`M 0 ${200 - (activeDataset.points[0].val2 * 1.5)} ` +
                    activeDataset.points
                      .map((pt: any, i: number) => {
                        const x = (i / (activeDataset.points.length - 1)) * 600;
                        const y = 200 - pt.val2 * 1.5;
                        return `L ${x} ${y}`;
                      })
                      .join(" ")}
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Data Points */}
                {activeDataset.points.map((pt: any, i: number) => {
                  const x = (i / (activeDataset.points.length - 1)) * 600;
                  const y = 200 - pt.val1 * 1.6;
                  const isHighlight = i === activeDataset.points.length - 2;
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
                  <h2 className="text-base font-bold text-slate-900">Top Selling Sports Items</h2>
                  <p className="text-xs text-slate-500 font-medium">Ranked by overall volume</p>
                </div>
                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  View All
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3.5">
                {topProducts.map((product: any) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100 cursor-pointer"
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl border ${product.bg}`}
                    >
                      {product.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {product.name}
                      </h4>
                      <span
                        className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md mt-0.5 ${product.badgeColor}`}
                      >
                        {product.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {product.salesCount} <span className="text-[11px] font-normal text-slate-400">sold</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-600">{product.revenue}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Inventory CTA */}
            <button className="w-full mt-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center justify-center gap-1.5">
              <span>Generate Full Inventory Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4. Bottom Section: Recent Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Table Header & Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Recent Orders Table</h2>
                <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
                  {filteredOrders.length} Orders
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage and track customer order status and fulfillment
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search in table */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter order ID or client..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-slate-50 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-medium"
                />
              </div>

              {/* Status filter dropdown */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 text-xs font-bold text-slate-700 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="shipping">Shipping</option>
                <option value="processing">Processing</option>
              </select>
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-6">Customer Name</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Payment Status</th>
                  <th className="py-3.5 px-6">Order Status</th>
                  <th className="py-3.5 px-6">Total Price</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition group">
                      {/* Order ID */}
                      <td className="py-4 px-6 font-bold text-blue-600 font-mono text-xs">
                        #{order.id}
                      </td>

                      {/* Customer Name */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${order.avatarBg}`}
                          >
                            {order.avatar}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {order.customer}
                            </div>
                            <div className="text-xs text-slate-400">{order.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {order.date}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-6">
                        {order.paymentStatus === "Paid" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Order Status */}
                      <td className="py-4 px-6">
                        {order.orderStatus === "Delivered" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Delivered
                          </span>
                        )}
                        {order.orderStatus === "Shipping" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                            <Truck className="w-3.5 h-3.5" />
                            Shipping
                          </span>
                        )}
                        {order.orderStatus === "Processing" && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Processing
                          </span>
                        )}
                      </td>

                      {/* Total Price */}
                      <td className="py-4 px-6 font-extrabold text-slate-900">
                        {order.totalPrice}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            title="Edit Order"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            title="More Options"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                      No matching orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Showing {filteredOrders.length} of {orders.length} orders
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold transition disabled:opacity-50"
                disabled
              >
                Previous
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 font-bold transition">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Order Details #{selectedOrder.id}
                  </h3>
                  <p className="text-xs text-slate-400">{selectedOrder.date}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-lg p-1"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-medium text-slate-700">{selectedOrder.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Items Ordered:</span>
                  <span className="font-bold text-slate-900 text-right">{selectedOrder.items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Status:</span>
                  <span className="font-bold text-emerald-600">{selectedOrder.paymentStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Order Status:</span>
                  <span className="font-bold text-blue-600">{selectedOrder.orderStatus}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-3 text-sm">
                  <span className="font-bold text-slate-900">Total Price:</span>
                  <span className="font-extrabold text-slate-900">{selectedOrder.totalPrice}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
