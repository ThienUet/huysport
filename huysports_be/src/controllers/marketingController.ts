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
      return res.status(400).json({ success: false, message: "Vui lòng nhập mã giảm giá" });
    }

    const codeStr = String(code).trim().toUpperCase();
    const coupon = db.getCoupons().find((c) => c.code.toUpperCase() === codeStr);
    
    if (!coupon) {
      return res.status(404).json({ success: false, message: "Mã giảm giá không tồn tại trên hệ thống!" });
    }

    if (coupon.status !== "Active") {
      return res.status(400).json({ success: false, message: "Mã giảm giá này hiện không còn hoạt động hoặc đã bị vô hiệu hóa!" });
    }

    // Check expiry
    const now = new Date();
    if (coupon.endDate) {
      const end = new Date(coupon.endDate);
      end.setHours(23, 59, 59, 999);
      if (now > end) {
        return res.status(400).json({ success: false, message: "Mã giảm giá này đã hết hạn sử dụng!" });
      }
    }
    if (coupon.startDate) {
      const start = new Date(coupon.startDate);
      start.setHours(0, 0, 0, 0);
      if (now < start) {
        return res.status(400).json({ success: false, message: "Mã giảm giá chưa đến ngày bắt đầu chương trình!" });
      }
    }

    // Check usage limit
    if (typeof coupon.usageLimit === "number" && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: "Mã giảm giá đã hết lượt sử dụng trong chương trình này!" });
    }

    const totalNum = Number(orderTotal) || 0;
    const minSpend = Number(coupon.minOrderValue) || 0;
    if (totalNum < minSpend) {
      return res.status(400).json({
        success: false,
        message: `Đơn hàng tối thiểu để áp dụng mã là ${minSpend.toLocaleString("vi-VN")}đ (Đơn hiện tại: ${totalNum.toLocaleString("vi-VN")}đ)`,
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      discountAmount = Math.round((totalNum * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === "free_shipping") {
      discountAmount = coupon.discountValue || 30000;
    } else {
      discountAmount = Math.min(totalNum, coupon.discountValue);
    }

    res.json({
      success: true,
      message: `Áp dụng thành công mã ưu đãi ${coupon.code}! Giảm ${discountAmount.toLocaleString("vi-VN")}đ`,
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        finalTotal: Math.max(0, totalNum - discountAmount),
        minOrderValue: coupon.minOrderValue,
        description: coupon.description,
        coupon,
      },
    });
  }
}
