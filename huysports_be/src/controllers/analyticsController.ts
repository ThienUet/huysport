import { Request, Response } from "express";
import { db } from "../db/store.js";

const normalizeAmount = (val: number): number => {
  if (!val || val <= 0) return 0;
  if (val < 1000) return val * 1000;
  return val;
};

const formatVND = (num: number): string => {
  return `${Math.round(num).toLocaleString("vi-VN")}đ`;
};

export class AnalyticsController {
  public static getReports(req: Request, res: Response) {
    const products = db.getProducts();
    const orders = db.getOrders();
    const customers = db.getCustomers();
    const chatSessions = db.getChatSessions ? db.getChatSessions() : [];

    // Valid non-canceled orders
    const validOrders = orders.filter((o) => o.fulfillmentStatus !== "Canceled");

    const totalOrders = orders.length || 1;
    const completedOrders = orders.filter((o) => o.fulfillmentStatus === "Completed").length;
    const shippingOrders = orders.filter((o) => o.fulfillmentStatus === "Shipping").length;
    const processingOrders = orders.filter((o) => o.fulfillmentStatus === "Processing").length;
    const pendingOrders = orders.filter((o) => o.fulfillmentStatus === "Pending Approval").length;
    const canceledOrders = orders.filter((o) => o.fulfillmentStatus === "Canceled").length;

    // Financials
    const totalRevenue = validOrders.reduce(
      (sum, o) => sum + normalizeAmount(o.totalAmount),
      0
    );

    const estimatedNetProfit = Math.round(totalRevenue * 0.32); // 32% realistic profit margin for sports retail
    const averageOrderValue = Math.round(
      totalRevenue / Math.max(1, validOrders.length)
    );

    const returnRate = ((canceledOrders / totalOrders) * 100).toFixed(1) + "%";
    const completionRate = ((completedOrders / totalOrders) * 100).toFixed(1) + "%";

    // Category Sales Breakdown from real DB products & orders
    const categoryConfigs: Record<
      string,
      { name: string; color: string; icon: string }
    > = {
      Football: { name: "Bóng đá", color: "#2563EB", icon: "⚽" },
      Gym: { name: "Gym & Thể hình", color: "#4F46E5", icon: "💪" },
      Running: { name: "Chạy bộ", color: "#06B6D4", icon: "🏃" },
      Badminton: { name: "Cầu lông", color: "#10B981", icon: "🏸" },
    };

    const categoryMap: Record<
      string,
      { count: number; unitsSold: number; revenue: number; stock: number }
    > = {};

    // Initialize all existing categories from products
    products.forEach((p) => {
      const cat = p.category || "Khác";
      if (!categoryMap[cat]) {
        categoryMap[cat] = { count: 0, unitsSold: 0, revenue: 0, stock: 0 };
      }
      categoryMap[cat].count += 1;
      categoryMap[cat].stock += p.totalStock ?? 0;
    });

    // Accumulate order sales by category
    orders.forEach((o) => {
      if (o.fulfillmentStatus === "Canceled") return;
      (o.items || []).forEach((item) => {
        // Find category from product or item
        let cat = item.category;
        if (!cat) {
          const matchedProd = products.find(
            (p) => p.title.trim().toLowerCase() === item.name?.trim().toLowerCase()
          );
          cat = matchedProd?.category || "Khác";
        }
        if (!categoryMap[cat]) {
          categoryMap[cat] = { count: 1, unitsSold: 0, revenue: 0, stock: 0 };
        }
        const qty = item.qty || 1;
        const price = normalizeAmount(item.unitPrice || 0);
        categoryMap[cat].unitsSold += qty;
        categoryMap[cat].revenue += qty * price;
      });
    });

    // Calculate percentages
    const totalCatRevenue =
      Object.values(categoryMap).reduce((s, c) => s + c.revenue, 0) || totalRevenue || 1;

    const categorySales = Object.entries(categoryMap).map(([rawCat, data]) => {
      const config = categoryConfigs[rawCat] || {
        name: rawCat,
        color: "#64748B",
        icon: "🏅",
      };
      const percentage = Math.max(
        5,
        Math.round((data.revenue / totalCatRevenue) * 100)
      );

      return {
        key: rawCat,
        name: config.name,
        color: config.color,
        icon: config.icon,
        productCount: data.count,
        totalStock: data.stock,
        unitsSold: data.unitsSold,
        revenue: data.revenue,
        revenueFormatted: formatVND(data.revenue),
        percentage,
      };
    });

    // Real Inventory Health based on actual db products
    const inventoryHealth = products
      .map((p) => {
        const stock = p.totalStock ?? 0;
        let status = "Còn hàng tốt";
        let statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        let action = "Duy trì ổn định";
        let urgency = 3;

        if (stock === 0) {
          status = "Đã hết hàng";
          statusColor = "bg-rose-100 text-rose-800 border-rose-300";
          action = "Nhập hàng khẩn cấp";
          urgency = 1;
        } else if (stock <= 20) {
          status = "Sắp hết hàng";
          statusColor = "bg-amber-50 text-amber-700 border-amber-200";
          action = "Cần bổ sung kho";
          urgency = 2;
        }

        const catConfig = categoryConfigs[p.category] || { name: p.category };

        return {
          id: p.id,
          name: p.title,
          sku: `SPX-${p.id.toUpperCase()}`,
          category: catConfig.name,
          stock,
          status,
          statusColor,
          action,
          urgency,
          thumbnail: p.thumbnail,
          basePrice: normalizeAmount(p.basePrice || 0),
          basePriceFormatted: formatVND(normalizeAmount(p.basePrice || 0)),
        };
      })
      .sort((a, b) => a.urgency - b.urgency || a.stock - b.stock);

    // AI Chatbot metrics
    const totalSessions = chatSessions.length;
    const totalMessages = chatSessions.reduce(
      (sum: number, s: any) => sum + (s.messages?.length || 0),
      0
    );
    const recommendedSessions = chatSessions.filter(
      (s: any) => s.status === "Product Recommended"
    ).length;

    // Customer tier breakdown
    const tierBreakdown = {
      VIP: customers.filter((c) => c.tier === "VIP").length,
      Loyal: customers.filter((c) => c.tier === "Loyal").length,
      New: customers.filter((c) => c.tier === "New" || !c.tier).length,
    };

    res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue,
          revenueFormatted: formatVND(totalRevenue),
          netProfit: estimatedNetProfit,
          profitFormatted: formatVND(estimatedNetProfit),
          averageOrderValue,
          aovFormatted: formatVND(averageOrderValue),
          totalOrders,
          completedOrders,
          completionRate,
          canceledOrders,
          returnRate,
          shippingOrders,
          processingOrders,
          pendingOrders,
        },
        categorySales,
        inventoryHealth,
        aiConsultationStats: {
          totalSessions,
          totalMessages,
          recommendedSessions,
          conversionRate: totalSessions > 0 ? `${Math.round((recommendedSessions / totalSessions) * 100)}%` : "0%",
        },
        customerStats: {
          totalCustomers: customers.length,
          activeCustomers: customers.filter((c) => c.status === "Active").length,
          tierBreakdown,
        },
      },
    });
  }
}
