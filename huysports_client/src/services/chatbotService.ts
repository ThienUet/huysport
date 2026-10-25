import { api } from "./api";
import { SizeRecommendationInput, SizeRecommendationResult, Product } from "../types";
import { productService, normalizeProduct } from "./productService";

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
        const raw = res.data;
        const inner = raw.data || {};

        // Extract reply text reliably across response formats
        const replyText =
          raw.reply ||
          raw.replyText ||
          inner.reply ||
          inner.replyText ||
          "Dạ SportX có thể hỗ trợ gì cho bạn?";

        // Extract and normalize recommended products
        const rawProds =
          raw.recommendedProducts ||
          inner.recommendedProducts ||
          (raw.suggestedProduct ? [raw.suggestedProduct] : []) ||
          (inner.suggestedProduct ? [inner.suggestedProduct] : []);

        const recommendedProducts = Array.isArray(rawProds) && rawProds.length > 0
          ? rawProds.map(normalizeProduct)
          : undefined;

        // Extract size recommendation
        const sizeRecommendation = raw.sizeRecommendation || inner.sizeRecommendation;

        // Extract quick replies
        const quickReplies = raw.quickReplies || inner.quickReplies || [
          "Tư vấn chọn size chuẩn",
          "Xem đồ bóng đá hot",
          "Giày chạy bộ êm ái",
          "Chính sách đổi trả",
        ];

        const intent = raw.intent || raw.matchedIntent || inner.intent || inner.matchedIntent;

        return {
          success: true,
          reply: replyText,
          intent,
          recommendedProducts,
          sizeRecommendation,
          quickReplies,
        };
      }
      return await localChatbotResponse(message);
    } catch {
      return await localChatbotResponse(message);
    }
  },

  recommendSize: async (input: SizeRecommendationInput): Promise<{ success: boolean; data: SizeRecommendationResult }> => {
    try {
      // Support primary backend route
      const res = await api.post("/chatbot/recommend-size", input);
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
  let size = "Size L";
  let altSize = "Size XL";
  let reason = "Khớp với chỉ số thể trạng chuẩn của bạn";

  if (heightCm < 165) {
    if (weightKg < 55) { size = "Size S"; altSize = "Size M"; }
    else { size = "Size M"; altSize = "Size L"; }
  } else if (heightCm <= 175) {
    if (weightKg < 65) { size = "Size M"; altSize = "Size L"; }
    else if (weightKg <= 75) { size = "Size L"; altSize = "Size XL"; }
    else { size = "Size XL"; altSize = "Size 2XL"; }
  } else {
    if (weightKg < 75) { size = "Size L"; altSize = "Size XL"; }
    else if (weightKg <= 85) { size = "Size XL"; altSize = "Size 2XL"; }
    else { size = "Size 2XL"; altSize = "Size 3XL"; }
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
    fitAnalysis: `Với chiều cao ${heightCm}cm, cân nặng ${weightKg}kg (chỉ số BMI: ${bmi}), ${size} là kích cỡ tối ưu nhất giúp bạn thoải mái vận động và tôn dáng.`,
  };
};

const localChatbotResponse = async (msg: string): Promise<ChatMessageResponse> => {
  const q = msg.toLowerCase();
  const productsRes = await productService.getProducts();
  const prods = productsRes.data || [];

  // Match height/weight intent e.g. "cao 1m70 nang 65kg" or "170cm 65kg"
  const heightMatch = q.match(/(\d{3})\s*cm|1m(\d{2})/);
  const weightMatch = q.match(/(\d{2,3})\s*(?:kg|ki|ky|can)/);

  if (heightMatch && weightMatch) {
    const height = heightMatch[1] ? parseInt(heightMatch[1]) : 170 + parseInt(heightMatch[2] || "0");
    const weight = parseInt(weightMatch[1]);
    const sizeRec = localCalculateSize({ heightCm: height, weightKg: weight, gender: "Nam" });

    return {
      success: true,
      reply: `Dựa trên chiều cao **${height}cm** và cân nặng **${weight}kg** của bạn (BMI: ${(weight / ((height / 100) ** 2)).toFixed(1)}), SportX AI đề xuất kích cỡ tối ưu nhất là **${sizeRec.recommendedSize}**.\n\nDưới đây là các mẫu đồ thể thao bán chạy nhất đã sẵn size này để bạn chọn lựa:`,
      sizeRecommendation: sizeRec,
      recommendedProducts: prods.slice(0, 3),
      quickReplies: ["Xem áo bóng đá", "Xem đồ chạy bộ", "Chính sách đổi size miễn phí", "Mã giảm giá SPORTX10"],
    };
  }

  if (q.includes("bong da") || q.includes("da banh") || q.includes("football") || q.includes("giay da")) {
    const fbProds = prods.filter((p) => p.category === "Bóng đá");
    return {
      success: true,
      reply: "⚽ **Bộ sưu tập Bóng Đá tại SportX:**\nSportX có đầy đủ giày đinh FG bám sân đỉnh cao, áo đấu tuyển quốc gia và tất chống trượt cao cấp. Mời bạn tham khảo:",
      recommendedProducts: (fbProds.length > 0 ? fbProds : prods).slice(0, 3),
      quickReplies: ["Tư vấn size (Cao 1m75 nặng 70kg)", "Xem đồ chạy bộ", "Mã giảm giá SPORTX10"],
    };
  }

  if (q.includes("chay bo") || q.includes("running") || q.includes("marathon")) {
    const runProds = prods.filter((p) => p.category === "Chạy bộ");
    return {
      success: true,
      reply: "🏃‍♂️ **Dòng sản phẩm Chạy Bộ chuyên dụng tại SportX:**\nCông nghệ đệm giày trợ lực êm ái cùng áo Singlet marathon siêu nhẹ giúp bạn chinh phục mọi cự ly:",
      recommendedProducts: (runProds.length > 0 ? runProds : prods).slice(0, 3),
      quickReplies: ["Tư vấn chọn size", "Xem đồ bóng đá", "Chính sách giao hàng"],
    };
  }

  if (q.includes("size") || q.includes("kích cỡ") || q.includes("tư vấn") || q.includes("mặc")) {
    return {
      success: true,
      reply: "Để SportX AI tư vấn size chuẩn xác nhất, bạn vui lòng cho mình biết **Chiều cao (cm)** và **Cân nặng (kg)** nhé!\n\n*(Ví dụ: 'mình cao 1m75 nặng 70kg thích mặc thoải mái')*",
      quickReplies: ["Cao 1m70 nặng 65kg", "Cao 1m75 nặng 72kg", "Cao 1m65 nặng 55kg", "Cao 1m80 nặng 82kg"],
    };
  }

  if (q.includes("đổi trả") || q.includes("bảo hành") || q.includes("chính sách") || q.includes("doi tra")) {
    return {
      success: true,
      reply: "🛡️ **Chính sách đổi trả & bảo hành tại SportX:**\n• Đổi size miễn phí trong vòng **30 ngày** kể từ khi nhận hàng.\n• Sản phẩm giữ nguyên tem mác, hộp và chưa qua giặt tẩy.\n• Bảo hành keo chỉ chính hãng 12 tháng.",
      quickReplies: ["Tư vấn chọn size", "Tra cứu đơn hàng", "Xem sản phẩm Hot"],
    };
  }

  if (q.includes("ship") || q.includes("giao hàng") || q.includes("phí") || q.includes("van chuyen")) {
    return {
      success: true,
      reply: "🚚 **Thời gian & Phí giao hàng:**\n• **MIỄN PHÍ VẬN CHUYỂN** toàn quốc cho đơn hàng từ **500.000đ**.\n• Nội thành Hà Nội & TP.HCM: Nhận hàng trong **24h - 48h**.\n• Các tỉnh thành khác: 2 - 4 ngày làm việc.",
      quickReplies: ["Mã giảm giá SPORTX10", "Mua sắm ngay", "Tư vấn chọn size"],
    };
  }

  return {
    success: true,
    reply: "Dạ SportX có thể hỗ trợ bạn tư vấn chọn size chuẩn xác, gợi ý các mẫu áo đấu/giày thể thao mới nhất hoặc kiểm tra tiến trình đơn hàng giúp bạn nhé! ✨",
    recommendedProducts: prods.slice(0, 3),
    quickReplies: ["Tư vấn chọn Size chuẩn", "Xem sản phẩm bán chạy", "Chính sách đổi trả 30 ngày"],
  };
};
