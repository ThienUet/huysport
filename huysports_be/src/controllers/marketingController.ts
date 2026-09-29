import { Request, Response } from "express";
import { db } from "../db/store.js";
import { Coupon } from "../types/index.js";

export class MarketingController {
  public static getCoupons(req: Request, res: Response) {
    const coupons = db.getCoupons();
    res.json({ success: true, data: coupons, total: coupons.length });
  }

  public static createCoupon(req: Request, res: Response) {
    const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, startDate, endDate, status } = req.body;

    if (!code || !discountValue || !minOrderValue) {
      return res.status(400).json({ success: false, message: "Missing required coupon fields" });
    }

    const newCoupon: Coupon = {
      id: `cp-${Date.now()}`,
      code: code.toUpperCase(),
      description: description || `Giảm giá mã ${code}`,
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: status || "Active",
    };

    const created = db.addCoupon(newCoupon);
    res.status(201).json({ success: true, message: "Coupon created", data: created });
  }

  public static updateCoupon(req: Request, res: Response) {
    const { id } = req.params;
    const updated = db.updateCoupon(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon updated", data: updated });
  }

  public static deleteCoupon(req: Request, res: Response) {
    const { id } = req.params;
    const deleted = db.deleteCoupon(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Coupon not found" });
    }
    res.json({ success: true, message: "Coupon deleted" });
  }

  public static applyCoupon(req: Request, res: Response) {
    const { code, orderTotal } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = db.getCoupons().find((c) => c.code.toUpperCase() === code.toUpperCase() && c.status === "Active");
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Invalid or expired coupon code" });
    }

    if (orderTotal < coupon.minOrderValue) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu để áp dụng mã là $${coupon.minOrderValue}`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = (orderTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    res.json({
      success: true,
      message: `Áp dụng thành công mã giảm giá ${coupon.code}`,
      data: {
        code: coupon.code,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalTotal: Math.max(0, Math.round((orderTotal - discountAmount) * 100) / 100),
      },
    });
  }
}
