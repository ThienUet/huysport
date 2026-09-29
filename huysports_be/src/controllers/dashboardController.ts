import { Request, Response } from "express";
import { db } from "../db/store.js";

export class DashboardController {
  public static getStats(req: Request, res: Response) {
    const orders = db.getOrders();
    const products = db.getProducts();
    const customers = db.getCustomers();

    // Calculate total revenue from paid orders
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "Paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = orders.length;
    const activeCustomers = customers.filter((c) => c.status === "Active").length;

    // Low stock items (totalStock < 20)
    const lowStockCount = products.filter((p) => p.totalStock < 20).length;

    res.json({
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        revenueFormatted: `$${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        revenueGrowth: "↑ 12.5%",
        totalOrders,
        ordersGrowth: "↑ 8.2%",
        activeCustomers,
        customersGrowth: "↑ 5.4%",
        lowStockCount,
      },
    });
  }

  public static getRevenueChart(req: Request, res: Response) {
    const timeframe = (req.query.timeframe as string) || "month";

    const chartDatasets = {
      week: {
        avgRevenue: "$6,468.00",
        peakDay: "$8,950 (Fri)",
        growth: "↑ 4.2%",
        points: [
          { label: "Mon", val1: 45, val2: 30, revenue: "$4,500" },
          { label: "Tue", val1: 65, val2: 50, revenue: "$6,500" },
          { label: "Wed", val1: 55, val2: 40, revenue: "$5,500" },
          { label: "Thu", val1: 75, val2: 60, revenue: "$7,500" },
          { label: "Fri", val1: 95, val2: 80, revenue: "$9,500" },
          { label: "Sat", val1: 85, val2: 70, revenue: "$8,500" },
          { label: "Sun", val1: 70, val2: 55, revenue: "$7,000" },
        ],
      },
      month: {
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
      },
      year: {
        avgRevenue: "$42,800.00/mo",
        peakDay: "Q4 Peak ($145k)",
        growth: "↑ 24.8%",
        points: [
          { label: "2021", val1: 30, val2: 20, revenue: "$210,000" },
          { label: "2022", val1: 45, val2: 35, revenue: "$320,000" },
          { label: "2023", val1: 60, val2: 50, revenue: "$410,000" },
          { label: "2024", val1: 75, val2: 62, revenue: "$485,000" },
          { label: "2025", val1: 88, val2: 74, revenue: "$520,000" },
          { label: "2026", val1: 95, val2: 82, revenue: "$543,360" },
        ],
      },
    };

    const dataset = chartDatasets[timeframe as keyof typeof chartDatasets] || chartDatasets.month;
    res.json({ success: true, data: dataset });
  }

  public static getTopProducts(req: Request, res: Response) {
    const products = db.getProducts();
    const topProducts = [
      {
        id: "p-1",
        name: "Nike Mercurial Superfly 9 Elite FG",
        category: "Football",
        icon: "⚽",
        bg: "bg-orange-50 text-orange-600 border-orange-100",
        salesCount: 356,
        revenue: "$106,444",
        badgeColor: "bg-blue-50 text-blue-700",
      },
      {
        id: "p-2",
        name: "SportX Pro Adjustable Dumbbell 20kg",
        category: "Gym & Fitness",
        icon: "💪",
        bg: "bg-indigo-50 text-indigo-600 border-indigo-100",
        salesCount: 284,
        revenue: "$25,560",
        badgeColor: "bg-indigo-50 text-indigo-700",
      },
      {
        id: "p-3",
        name: "Adidas Ultraboost Light Running Shoes",
        category: "Running",
        icon: "🏃",
        bg: "bg-emerald-50 text-emerald-600 border-emerald-100",
        salesCount: 210,
        revenue: "$31,290",
        badgeColor: "bg-emerald-50 text-emerald-700",
      },
      {
        id: "p-5",
        name: "SportX Pro Dry-Fit Training Vest",
        category: "Running / Gym",
        icon: "🎽",
        bg: "bg-blue-50 text-blue-600 border-blue-100",
        salesCount: 195,
        revenue: "$6,825",
        badgeColor: "bg-blue-50 text-blue-700",
      },
    ];

    res.json({ success: true, data: topProducts });
  }
}
