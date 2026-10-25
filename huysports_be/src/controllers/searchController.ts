import { Request, Response } from "express";
import { db } from "../db/store.js";

function removeVietnameseTones(str: string): string {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
}

const categoryVNAliases: Record<string, string[]> = {
  Football: ["bong da", "da bong", "giay da bong", "giay da banh", "da banh"],
  Running: ["chay bo", "chay", "giay chay", "dien kinh"],
  Basketball: ["bong ro", "giay bong ro"],
  Gym: ["gym", "the hinh", "tap gym", "the thao"],
  Tennis: ["tennis", "quan vot", "giay tennis"],
  Training: ["tap luyen", "training"],
};

export class SearchController {
  public static globalSearch(req: Request, res: Response) {
    const rawQuery = (req.query.q as string) || (req.query.query as string) || "";
    const cleanQuery = rawQuery.trim();

    if (!cleanQuery) {
      return res.json({
        success: true,
        data: {
          query: "",
          counts: { products: 0, orders: 0, customers: 0, total: 0 },
          products: [],
          orders: [],
          customers: [],
        },
      });
    }

    const normQuery = removeVietnameseTones(cleanQuery);
    const lowerQuery = cleanQuery.toLowerCase();

    // 1. Search Products
    const allProducts = db.getProducts();
    const matchedProducts = allProducts.filter((p) => {
      const titleNorm = removeVietnameseTones(p.title);
      const brandNorm = removeVietnameseTones(p.brand);
      const catNorm = removeVietnameseTones(p.category);
      const descNorm = removeVietnameseTones(p.description || "");
      const skuLower = (p.sku || "").toLowerCase();

      // Check category VN synonyms
      const aliases = categoryVNAliases[p.category] || [];
      const matchAlias = aliases.some((a) => normQuery.includes(a) || a.includes(normQuery));

      return (
        titleNorm.includes(normQuery) ||
        p.title.toLowerCase().includes(lowerQuery) ||
        skuLower.includes(lowerQuery) ||
        brandNorm.includes(normQuery) ||
        catNorm.includes(normQuery) ||
        descNorm.includes(normQuery) ||
        matchAlias
      );
    }).slice(0, 6);

    // 2. Search Orders
    const allOrders = db.getOrders();
    const matchedOrders = allOrders.filter((o) => {
      const orderNumLower = (o.orderNumber || "").toLowerCase();
      const customerNameNorm = removeVietnameseTones(o.customer?.name || "");
      const customerPhone = (o.customer?.phone || "").replace(/\s+/g, "");
      const customerEmail = (o.customer?.email || "").toLowerCase();
      const itemsMatch = o.items?.some((item) =>
        removeVietnameseTones(item.name).includes(normQuery)
      );

      return (
        orderNumLower.includes(lowerQuery) ||
        customerNameNorm.includes(normQuery) ||
        customerPhone.includes(cleanQuery.replace(/\s+/g, "")) ||
        customerEmail.includes(lowerQuery) ||
        itemsMatch
      );
    }).slice(0, 6);

    // 3. Search Customers
    const allCustomers = db.getCustomers();
    const matchedCustomers = allCustomers.filter((c) => {
      const fullNameNorm = removeVietnameseTones(c.fullName || "");
      const emailLower = (c.email || "").toLowerCase();
      const phoneClean = (c.phone || "").replace(/\s+/g, "");
      const addressNorm = removeVietnameseTones(c.primaryAddress || "");

      return (
        fullNameNorm.includes(normQuery) ||
        emailLower.includes(lowerQuery) ||
        phoneClean.includes(cleanQuery.replace(/\s+/g, "")) ||
        addressNorm.includes(normQuery)
      );
    }).slice(0, 6);

    const total = matchedProducts.length + matchedOrders.length + matchedCustomers.length;

    res.json({
      success: true,
      data: {
        query: cleanQuery,
        counts: {
          products: matchedProducts.length,
          orders: matchedOrders.length,
          customers: matchedCustomers.length,
          total,
        },
        products: matchedProducts,
        orders: matchedOrders,
        customers: matchedCustomers,
      },
    });
  }
}
