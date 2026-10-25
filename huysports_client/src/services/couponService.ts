import { api } from "./api";
import { Coupon } from "../types";

export const couponService = {
  validateCoupon: async (
    code: string,
    orderValue: number
  ): Promise<{ success: boolean; coupon?: Coupon; discountAmount: number; message: string }> => {
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, discountAmount: 0, message: "Vui lòng nhập mã ưu đãi!" };
    }

    try {
      // Call backend apply endpoint
      const res = await api.post("/coupons/apply", {
        code: cleanCode,
        orderTotal: orderValue,
      });

      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const couponData: Coupon = data.coupon || {
          id: `cp-${cleanCode.toLowerCase()}`,
          code: cleanCode,
          discountType: data.discountType || "percentage",
          discountValue: data.discountValue || 10,
          minOrderValue: data.minOrderValue || 0,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
          usedCount: 1,
          status: "Active",
          description: data.description || `Mã giảm giá ${cleanCode}`,
        };

        return {
          success: true,
          coupon: couponData,
          discountAmount: Number(data.discountAmount || 0),
          message:
            res.data.message ||
            `Áp dụng thành công mã ${cleanCode}! Giảm ${Number(data.discountAmount || 0).toLocaleString("vi-VN")}đ`,
        };
      }

      return {
        success: false,
        discountAmount: 0,
        message: res.data?.message || "Mã giảm giá không hợp lệ!",
      };
    } catch (err: any) {
      // If backend gave an explicit validation error message
      if (err.response?.data?.message) {
        return {
          success: false,
          discountAmount: 0,
          message: err.response.data.message,
        };
      }

      // Offline fallback for demo code SPORTX10
      if (cleanCode === "SPORTX10") {
        const discountAmount = Math.round((orderValue * 10) / 100);
        return {
          success: true,
          coupon: {
            id: "cp-sportx10",
            code: "SPORTX10",
            discountType: "percentage",
            discountValue: 10,
            minOrderValue: 200000,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 30).toISOString(),
            usedCount: 1,
            status: "Active",
            description: "Giảm 10% đơn hàng từ 200.000đ",
          },
          discountAmount,
          message: `Áp dụng thành công mã SPORTX10! Giảm ${discountAmount.toLocaleString("vi-VN")}đ`,
        };
      }

      return {
        success: false,
        discountAmount: 0,
        message: "Không thể kết nối máy chủ để kiểm tra mã giảm giá!",
      };
    }
  },
};
