import { useState } from "react";
import AdminLayout from "@/layouts/admin-layout";
import {
  Calendar,
  Download,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Bot,
  PieChart,
  BarChart2,
  FileSpreadsheet,
  FileText,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("01 Aug - 23 Sep 2026");
  const [chartMetric, setChartMetric] = useState<"revenue" | "profit">("revenue");
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Revenue & Sales Trend chart data
  const trendData = [
    { label: "Aug 1", revenue: 65, profit: 24, orders: 420 },
    { label: "Aug 8", revenue: 82, profit: 31, orders: 540 },
    { label: "Aug 15", revenue: 74, profit: 28, orders: 490 },
    { label: "Aug 22", revenue: 95, profit: 36, orders: 620 },
    { label: "Aug 29", revenue: 88, profit: 33, orders: 580 },
    { label: "Sep 5", revenue: 110, profit: 42, orders: 740 },
    { label: "Sep 12", revenue: 135, profit: 52, orders: 910 },
    { label: "Sep 19", revenue: 124, profit: 47, orders: 830 },
    { label: "Sep 23", revenue: 142, profit: 55, orders: 980 },
  ];

  // Category Donut Chart Data
  const categoryData = [
    { name: "Football", percentage: 42, color: "#2563EB", amount: "$60,000", icon: "⚽" },
    { name: "Gym & Running", percentage: 30, color: "#06B6D4", amount: "$42,850", icon: "🏃" },
    { name: "Badminton", percentage: 18, color: "#10B981", amount: "$25,710", icon: "🏸" },
    { name: "Accessories", percentage: 10, color: "#F59E0B", amount: "$14,290", icon: "🧦" },
  ];

  // Top 5 Best-Selling Sports Items
  const topApparelItems = [
    {
      name: "Nike Pro Dri-FIT Compression Tights",
      category: "Football / Gym",
      unitsSold: 2150,
      revenue: "$75,250",
      percentage: 100,
      color: "bg-blue-600",
    },
    {
      name: "Adidas Ultraboost Light Running Shoes",
      category: "Running",
      unitsSold: 1680,
      revenue: "$250,320",
      percentage: 78,
      color: "bg-cyan-500",
    },
    {
      name: "Yonex Astrox 88D Pro Badminton Racket",
      category: "Badminton",
      unitsSold: 1340,
      revenue: "$308,200",
      percentage: 62,
      color: "bg-emerald-500",
    },
    {
      name: "Puma Future Ultimate FG Football Boots",
      category: "Football",
      unitsSold: 1120,
      revenue: "$207,200",
      percentage: 52,
      color: "bg-indigo-500",
    },
    {
      name: "SportX Seamless Breathable Training Shorts",
      category: "Gym & Fitness",
      unitsSold: 980,
      revenue: "$29,400",
      percentage: 45,
      color: "bg-amber-500",
    },
  ];

  // Stock Turnover & Inventory Health Table Data
  const stockTurnoverItems = [
    {
      name: "Nike Mercurial Superfly 9 Elite FG",
      sku: "SPX-FTB-01",
      category: "Football",
      stock: 12,
      status: "Critical Low",
      statusColor: "bg-rose-50 text-rose-700 border-rose-200",
      weeksToStockout: "1.2 weeks",
      action: "Reorder 100 units",
    },
    {
      name: "SportX Pro Adjustable Dumbbell 20kg",
      sku: "SPX-GYM-08",
      category: "Gym",
      stock: 18,
      status: "Low Stock",
      statusColor: "bg-amber-50 text-amber-700 border-amber-200",
      weeksToStockout: "2.0 weeks",
      action: "Reorder 50 units",
    },
    {
      name: "Yonex Astrox 88D Pro Badminton Racket",
      sku: "SPX-BAD-05",
      category: "Badminton",
      stock: 0,
      status: "Out of Stock",
      statusColor: "bg-red-100 text-red-800 border-red-300",
      weeksToStockout: "0 weeks",
      action: "Immediate Restock",
    },
    {
      name: "SportX Dry-Fit Athletic Vest (Size XXL)",
      sku: "SPX-APP-99",
      category: "Gym",
      stock: 320,
      status: "Overstocked",
      statusColor: "bg-purple-50 text-purple-700 border-purple-200",
      weeksToStockout: "18.5 weeks",
      action: "Run 20% Flash Sale",
    },
  ];

  const handleExport = (type: "pdf" | "excel" | "csv") => {
    alert(`Generating ${type.toUpperCase()} detailed analytics report for period: ${dateRange}`);
    setExportDropdownOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Top Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Analytics & Detailed Reports
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Financial performance, sports product category breakdowns, inventory velocity, and AI chatbot ROI.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs text-xs font-bold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-800"
              >
                <option value="01 Aug - 23 Sep 2026">01 Aug - 23 Sep 2026</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Q3 2026 (Jul - Sep)">Q3 2026 (Jul - Sep)</option>
                <option value="Year-to-Date 2026">Year-to-Date 2026</option>
              </select>
            </div>

            {/* Export Report Dropdown */}
            <div className="relative">
              <button
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shadow-slate-900/10 active:scale-95"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in duration-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase">
                    Select Format
                  </div>
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <FileText className="w-4 h-4 text-rose-500" />
                    Export PDF Document
                  </button>
                  <button
                    onClick={() => handleExport("excel")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    Export Excel Sheet (.xlsx)
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition"
                  >
                    <Download className="w-4 h-4 text-blue-500" />
                    Export CSV Raw Data
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Analytics Overview Cards (Top row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Gross Revenue */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Gross Revenue
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">$142,850</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 14.8%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">+$18,400 vs previous period</p>
          </div>

          {/* Card 2: Net Profit */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Net Profit
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">$48,620</h3>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                Margin 34.0%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">↑ 11.2% net operational growth</p>
          </div>

          {/* Card 3: Average Order Value (AOV) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Avg. Order Value (AOV)
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">$115.20</h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                ↑ 6.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2 font-medium">Avg. 2.4 items per cart</p>
          </div>

          {/* Card 4: Chatbot Conversion Rate */}
          <div className="bg-white rounded-2xl p-5 border border-purple-200/80 bg-gradient-to-br from-white to-purple-50/40 shadow-xs hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-purple-800 uppercase tracking-wider">
                Chatbot Conv. Rate
              </span>
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold text-slate-900">24.5%</h3>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                ↑ 3.8%
              </span>
            </div>
            <p className="text-[11px] text-purple-700 font-semibold mt-2">
              $34,800 generated from AI advice
            </p>
          </div>
        </div>

        {/* 3. Chart Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1 (Large Line/Bar Chart): Revenue & Sales Trend (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Revenue & Sales Trend</h2>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                    Dual Metric
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Gross revenue progression vs net profit margins over time
                </p>
              </div>

              {/* Metric Switcher */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 self-start sm:self-auto">
                <button
                  onClick={() => setChartMetric("revenue")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartMetric === "revenue"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Gross Revenue ($)
                </button>
                <button
                  onClick={() => setChartMetric("profit")}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    chartMetric === "profit"
                      ? "bg-white text-emerald-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Net Profit ($)
                </button>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="relative w-full h-64 select-none">
              <svg
                viewBox="0 0 600 200"
                className="w-full h-full overflow-visible"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Grid Lines */}
                <line x1="0" y1="20" x2="600" y2="20" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="70" x2="600" y2="70" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="120" x2="600" y2="120" stroke="#F1F5F9" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="170" x2="600" y2="170" stroke="#F1F5F9" strokeWidth="1" />

                {/* Bars in background */}
                {trendData.map((item, i) => {
                  const x = (i / (trendData.length - 1)) * 560 + 20;
                  const barHeight = item.revenue * 0.9;
                  return (
                    <rect
                      key={item.label}
                      x={x - 12}
                      y={180 - barHeight}
                      width="24"
                      height={barHeight}
                      rx="6"
                      fill="#EFF6FF"
                      className="hover:fill-blue-100 transition-colors cursor-pointer"
                    />
                  );
                })}

                {/* Area Fill */}
                <path
                  d={`M 20 ${180 - trendData[0].revenue * 0.9} ` +
                    trendData
                      .map((d, i) => {
                        const x = (i / (trendData.length - 1)) * 560 + 20;
                        const val = chartMetric === "revenue" ? d.revenue : d.profit * 2.2;
                        return `L ${x} ${180 - val * 0.9}`;
                      })
                      .join(" ") +
                    ` L 580 180 L 20 180 Z`}
                  fill="url(#analyticsGradient)"
                />

                {/* Curve Line */}
                <path
                  d={`M 20 ${180 - trendData[0].revenue * 0.9} ` +
                    trendData
                      .map((d, i) => {
                        const x = (i / (trendData.length - 1)) * 560 + 20;
                        const val = chartMetric === "revenue" ? d.revenue : d.profit * 2.2;
                        return `L ${x} ${180 - val * 0.9}`;
                      })
                      .join(" ")}
                  fill="none"
                  stroke={chartMetric === "revenue" ? "#2563EB" : "#10B981"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {trendData.map((d, i) => {
                  const x = (i / (trendData.length - 1)) * 560 + 20;
                  const val = chartMetric === "revenue" ? d.revenue : d.profit * 2.2;
                  const y = 180 - val * 0.9;
                  const isPeak = i === trendData.length - 1;
                  return (
                    <g key={d.label} className="cursor-pointer group">
                      <circle
                        cx={x}
                        cy={y}
                        r={isPeak ? "6" : "4"}
                        fill={isPeak ? "#2563EB" : "#FFFFFF"}
                        stroke="#2563EB"
                        strokeWidth="2.5"
                      />
                      {isPeak && (
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
                            $142,850 Peak
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-Axis */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 mt-4 px-2">
              {trendData.map((d) => (
                <span key={d.label}>{d.label}</span>
              ))}
            </div>
          </div>

          {/* Chart 2 (Donut Chart): Sales Distribution by Sport Category (1 Col) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Category Distribution</h2>
                  <p className="text-xs text-slate-500 font-medium">Sales split by sport activity</p>
                </div>
                <PieChart className="w-4 h-4 text-slate-400" />
              </div>

              {/* Donut Chart Visual representation */}
              <div className="flex items-center justify-center my-4 relative">
                <svg viewBox="0 0 160 160" className="w-40 h-40 transform -rotate-90">
                  {/* Football 42% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#2563EB"
                    strokeWidth="22"
                    strokeDasharray="158 219"
                    strokeDashoffset="0"
                  />
                  {/* Gym/Running 30% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#06B6D4"
                    strokeWidth="22"
                    strokeDasharray="113 264"
                    strokeDashoffset="-158"
                  />
                  {/* Badminton 18% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="22"
                    strokeDasharray="68 309"
                    strokeDashoffset="-271"
                  />
                  {/* Accessories 10% */}
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="transparent"
                    stroke="#F59E0B"
                    strokeWidth="22"
                    strokeDasharray="38 339"
                    strokeDashoffset="-339"
                  />
                </svg>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Top Sport</span>
                  <span className="text-base font-black text-slate-900">Football</span>
                  <span className="text-xs font-bold text-blue-600">42%</span>
                </div>
              </div>

              {/* Category Breakdown Legend */}
              <div className="space-y-2.5 mt-2">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-semibold text-slate-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{cat.amount}</span>
                      <span className="font-bold text-slate-400 text-[11px] w-8 text-right">
                        {cat.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-center text-[11px] text-slate-400 font-medium">
              Total Catalog Volume: <strong>$142,850.00</strong>
            </div>
          </div>
        </div>

        {/* Chart 3: Top 5 Best-Selling Sports Items */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Top 5 Best-Selling Sports Apparel & Gear Items
                </h2>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  High Velocity
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Ranked by units sold and gross revenue contribution
              </p>
            </div>
            <BarChart2 className="w-5 h-5 text-slate-400" />
          </div>

          <div className="space-y-4">
            {topApparelItems.map((item, idx) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-[10px] flex items-center justify-center text-slate-700 shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold hidden sm:inline">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <span className="font-bold text-slate-700">
                      {item.unitsSold.toLocaleString()} units
                    </span>
                    <span className="font-extrabold text-slate-900 w-20">{item.revenue}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all duration-500`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Inventory & Chatbot Performance Widgets (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Stock Turnover Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">Stock Turnover Velocity</h2>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Critical stockout alerts vs overstocked storage
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 border-b border-slate-200">
                      <th className="py-2.5 px-3">Item & Category</th>
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Stockout ETA</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {stockTurnoverItems.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900 truncate max-w-[150px]">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">{item.stock}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.statusColor}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-600 font-semibold">
                          {item.weeksToStockout}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer">
                            {item.action}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Warehouse Health Index: <strong className="text-emerald-600">88.4% Optimal</strong></span>
              <button className="text-blue-600 font-bold hover:underline">Full Stock Audit →</button>
            </div>
          </div>

          {/* Right Column: AI Chatbot Insights & ROI Widget */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900">AI Chatbot ROI & Insights</h2>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Automated sales conversion and sizing engine accuracy
                  </p>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl">
                  Gemini 3.7
                </span>
              </div>

              {/* 3 Metric Mini Cards */}
              <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 text-center">
                  <div className="text-[10px] font-bold text-purple-700 uppercase">Conversations</div>
                  <div className="text-lg font-black text-purple-900 mt-0.5">12,450</div>
                  <div className="text-[10px] text-purple-600 font-semibold mt-0.5">↑ 22% this month</div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-100 text-center">
                  <div className="text-[10px] font-bold text-emerald-700 uppercase">Size Accuracy</div>
                  <div className="text-lg font-black text-emerald-900 mt-0.5">98.4%</div>
                  <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">&lt;1.6% exchange rate</div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 text-center">
                  <div className="text-[10px] font-bold text-blue-700 uppercase">Assisted Sales</div>
                  <div className="text-lg font-black text-blue-900 mt-0.5">$34,800</div>
                  <div className="text-[10px] text-blue-600 font-semibold mt-0.5">24.5% conversion</div>
                </div>
              </div>

              {/* Bot Capabilities Summary */}
              <div className="space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span>Average AI Response Latency</span>
                  <strong className="text-slate-900">1.1 seconds</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span>Automated Queries Resolved without Human</span>
                  <strong className="text-emerald-600">89.2% (Bot-only)</strong>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
                  <span>Most Frequent Advice Intent</span>
                  <strong className="text-blue-600">Running Shoe Size Fitting</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Customer Satisfaction (CSAT): <strong className="text-emerald-600">4.9 / 5.0 ★</strong></span>
              <a href="/chatbot" className="text-purple-600 font-bold hover:underline">
                Tune AI Rules →
              </a>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
