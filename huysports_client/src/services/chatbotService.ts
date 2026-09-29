import { api } from "./api";
import { SizeRecommendationInput, SizeRecommendationResult, Product } from "../types";
import { productService } from "./productService";

export interface ChatMessageResponse {
  success: boolean;
  reply: string;
  intent?: string;
  recommendedProducts?: Product[];
  sizeRecommendation?: SizeRecommendationResult;
  quickReplies?: string[];
}

export const chatbotService = {
  sendMessage: async (message: string, sessionId?: string): Promise<ChatMessageResponse> => {
    try {
      const res = await api.post("/chatbot/message", {
        message,
        sessionId,
      });
      if (res.data?.success) {
        return res.data;
      }
      return await localChatbotResponse(message);
    } catch {
      return await localChatbotResponse(message);
    }
  },

  recommendSize: async (input: SizeRecommendationInput): Promise<{ success: boolean; data: SizeRecommendationResult }> => {
    try {
      const res = await api.post("/chatbot/size-recommend", input);
      if (res.data?.success && res.data?.data) {
        return res.data;
      }
      return { success: true, data: localCalculateSize(input) };
    } catch {
      return { success: true, data: localCalculateSize(input) };
    }
  },
};

const localCalculateSize = (input: SizeRecommendationInput): SizeRecommendationResult => {
  const { heightCm, weightKg, bodyFitPreference } = input;
  let size = "L";
  let altSize = "XL";
  let reason = "Khớp với chỉ số thể trạng chuẩn của bạn";

  if (heightCm < 165) {
    if (weightKg < 55) { size = "S"; altSize = "M"; }
    else { size = "M"; altSize = "L"; }
  } else if (heightCm <= 175) {
    if (weightKg < 65) { size = "M"; altSize = "L"; }
    else if (weightKg <= 75) { size = "L"; altSize = "XL"; }
    else { size = "XL"; altSize = "2XL"; }
  } else {
    if (weightKg < 75) { size = "L"; altSize = "XL"; }
    else if (weightKg <= 85) { size = "XL"; altSize = "2XL"; }
    else { size = "2XL"; altSize = "3XL"; }
  }

  if (bodyFitPreference === "Loose Fit / Thoải mái") {
    size = altSize;
    reason = "Đã tăng thêm 1 size để đảm bảo sự rộng rãi và thoải mái khi vận động.";
  }

  const bmi = (weightKg / ((heightCm / 100) ** 2)).toFixed(1);

  return {
    recommendedSize: size,
    alternativeSize: altSize,
    confidenceScore: 96,
    reason,
    fitAnalysis: `Với chiều cao ${heightCm}cm, cân nặng ${weightKg}kg (chỉ số BMI: ${bmi}), size ${size} là kích cỡ tối ưu nhất giúp bạn thoải mái vận động và tôn dáng.`,
  };
};

const localChatbotResponse = async (msg: string): Promise<ChatMessageResponse> => {
  const q = msg.toLowerCase();
  const productsRes = await productService.getProducts();
  const prods = productsRes.data || [];

  // Match height/weight intent e.g. "cao 1m70 nang 65kg" or "170cm 65kg"
  const heightMatch = q.match(/(\d{3})\s*cm|1m(\d{2})/);
  const weightMatch = q.match(/(\d{2,3})\s*kg/);

  if (heightMatch && weightMatch) {
    let height = heightMatch[1] ? parseInt(heightMatch[1]) : 170 + parseInt(heightMatch[2] || "0");
    let weight = parseInt(weightMatch[1]);
    const sizeRec = localCalculateSize({ heightCm: height, weightKg: weight, gender: "Nam" });

    return {
      success: true,
      reply: `Dựa trên chiều cao ${height}cm và cân nặng ${weight}kg của bạn, AI đề xuất size tối ưu nhất là Size **${sizeRec.recommendedSize}**. Bạn có thể xem các mẫu áo bán chạy dưới đây nhé!`,
      sizeRecommendation: sizeRec,
      recommendedProducts: prods.slice(0, 2),
      quickReplies: ["Xem áo bóng đá", "Xem đồ chạy bộ", "Chính sách giao hàng"],
    };
  }

  if (q.includes("size") || q.includes("kích cỡ") || q.includes("tư vấn")) {
    return {
      success: true,
      reply: "Bạn muốn AI tư vấn kích cỡ (Size) cho môn thể thao nào? Bạn hãy gửi chiều cao (cm) và cân nặng (kg) cho mình nhé! (Ví dụ: Cao 175cm nặng 70kg)",
      quickReplies: ["Cao 170cm nặng 65kg", "Cao 175cm nặng 72kg", "Cao 165cm nặng 55kg"],
    };
  }

  if (q.includes("đổi trả") || q.includes("bảo hành") || q.includes("chính sách")) {
    return {
      success: true,
      reply: "SportX hỗ trợ ĐỔI SIZE MIỄN PHÍ trong vòng 30 ngày kể từ ngày nhận hàng! Sản phẩm cần giữ nguyên tem mác và chưa qua giặt tẩy.",
      quickReplies: ["Tư vấn chọn size", "Tra cứu đơn hàng", "Xem sản phẩm Hot"],
    };
  }

  if (q.includes("ship") || q.includes("giao hàng") || q.includes("phí")) {
    return {
      success: true,
      reply: "SportX MIỄN PHÍ VẬN CHUYỂN toàn quốc cho mọi đơn hàng từ 500.000đ. Đơn dưới 500.000đ áp dụng phí đồng giá 30.000đ (Giao hàng nhanh 2-3 ngày).",
      quickReplies: ["Mã giảm giá SPORTX10", "Mua sắm ngay", "Tư vấn size"],
    };
  }

  return {
    success: true,
    reply: "Cảm ơn bạn đã nhắn tin! Tôi có thể tư vấn chọn size chuẩn xác theo chiều cao/cân nặng, gợi ý các mẫu áo đấu mới nhất hoặc kiểm tra đơn hàng giúp bạn.",
    recommendedProducts: prods.slice(0, 2),
    quickReplies: ["Tư vấn chọn Size chuẩn", "Sản phẩm bán chạy", "Tra cứu đơn hàng"],
  };
};
