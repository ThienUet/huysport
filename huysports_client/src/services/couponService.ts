import { api } from "./api";
import { Coupon } from "../types";

export const couponService = {
  validateCoupon: async (
    code: string,
    orderValue: number
  ): Promise<{ success: boolean; coupon?: Coupon; discountAmount: number; message: string }> => {
    try {
      const res = await api.get("/marketing/coupons");
      const coupons: Coupon[] = res.data?.data || res.data || [];
      const found = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);

      if (!found) {
        // Mock validate if backend empty
        if (code.toUpperCase() === "SPORTX10") {
          const discountAmount = Math.round((orderValue * 10) / 100);
          return {
            success: true,
            coupon: {
              id: "cp-sportx10",
              code: "SPORTX10",
              discountType: "PERCENT",
              discountValue: 10,
              minOrderValue: 0,
              startDate: new Date().toISOString(),
              endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
              usageCount: 1,
              isActive: true,
              description: "Giảm 10% đơn hàng đầu tiên",
            },
            discountAmount,
            message: `Áp dụng thành công mã SPORTX10! Giảm ${discountAmount.toLocaleString("vi-VN")}đ`,
          };
        }
        return { success: false, discountAmount: 0, message: "Mã giảm giá không tồn tại hoặc đã hết hạn!" };
      }

      if (orderValue < found.minOrderValue) {
        return {
          success: false,
          discountAmount: 0,
          message: `Đơn hàng phải đạt tối thiểu ${found.minOrderValue.toLocaleString("vi-VN")}đ để sử dụng mã này!`,
        };
      }

      let discountAmount = 0;
      if (found.discountType === "PERCENT") {
        discountAmount = (orderValue * found.discountValue) / 100;
        if (found.maxDiscountAmount && discountAmount > found.maxDiscountAmount) {
          discountAmount = found.maxDiscountAmount;
        }
      } else {
        discountAmount = found.discountValue;
      }

      return {
        success: true,
        coupon: found,
        discountAmount,
        message: `Áp dụng thành công mã ${found.code}! Giảm ${discountAmount.toLocaleString("vi-VN")}đ`,
      };
    } catch {
      // Fallback if network issue
      if (code.toUpperCase() === "SPORTX10") {
        const discountAmount = Math.round((orderValue * 10) / 100);
        return {
          success: true,
          coupon: {
            id: "cp-sportx10",
            code: "SPORTX10",
            discountType: "PERCENT",
            discountValue: 10,
            minOrderValue: 0,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
            usageCount: 1,
            isActive: true,
          },
          discountAmount,
          message: `Áp dụng thành công mã SPORTX10! Giảm ${discountAmount.toLocaleString("vi-VN")}đ`,
        };
      }
      return { success: false, discountAmount: 0, message: "Không thể kết nối máy chủ kiểm tra mã!" };
    }
  },
};
