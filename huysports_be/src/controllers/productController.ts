import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/store.js";
import { Product, VariantItem } from "../types/index.js";

export class ProductController {
  public static getAll(req: Request, res: Response) {
    let products = db.getProducts();
    const { search, category, status, brand } = req.query;

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === "string" && category !== "all") {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (status && typeof status === "string" && status !== "all") {
      products = products.filter((p) => p.status.toLowerCase() === status.toLowerCase());
    }

    if (brand && typeof brand === "string" && brand !== "all") {
      products = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
    }

    res.json({
      success: true,
      data: products,
      total: products.length,
    });
  }

  public static getById(req: Request, res: Response) {
    const { id } = req.params;
    const product = db.getProductById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, data: product });
  }

  public static create(req: Request, res: Response) {
    const {
      title,
      sku,
      category,
      brand,
      basePrice,
      discountPrice,
      thumbnail = "👟",
      icon = "⚽",
      sizes = ["S", "M", "L", "XL"],
      colors = [{ name: "Black", hex: "#0F172A" }],
      totalStock = 0,
      status = "Active",
      description = "",
      variants,
    } = req.body;

    if (!title || !sku || !category || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: "Missing required product fields: title, sku, category, basePrice",
      });
    }

    const productId = `p-${Date.now()}`;

    // Auto-generate variants if not provided
    let generatedVariants: VariantItem[] = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      generatedVariants = variants;
    } else {
      let count = 1;
      for (const color of colors) {
        for (const size of sizes) {
          generatedVariants.push({
            id: `v-${productId}-${count++}`,
            sku: `${sku}-${color.name.slice(0, 3).toUpperCase()}-${size}`,
            color: color.name,
            colorHex: color.hex,
            size,
            price: discountPrice || basePrice,
            stock: Math.floor(totalStock / (colors.length * sizes.length)) || 10,
          });
        }
      }
    }

    const newProduct: Product = {
      id: productId,
      title,
      sku,
      category,
      brand: brand || "SportX",
      basePrice: Number(basePrice),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      thumbnail,
      icon,
      sizes,
      colors,
      totalStock: generatedVariants.reduce((sum, v) => sum + (v.stock || 0), 0) || Number(totalStock),
      status,
      description,
      variants: generatedVariants,
      createdAt: new Date().toISOString(),
    };

    const created = db.addProduct(newProduct);
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: created,
    });
  }

  public static update(req: Request, res: Response) {
    const { id } = req.params;
    const existing = db.getProductById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const updates = req.body;
    if (updates.variants && Array.isArray(updates.variants)) {
      updates.totalStock = updates.variants.reduce((sum: number, v: VariantItem) => sum + (v.stock || 0), 0);
    }

    const updated = db.updateProduct(id, updates);
    res.json({
      success: true,
      message: "Product updated successfully",
      data: updated,
    });
  }

  public static delete(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = db.deleteProduct(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }
    res.json({ success: true, message: "Product deleted successfully" });
  }
}
