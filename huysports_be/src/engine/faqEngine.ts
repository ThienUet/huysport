import { FAQItem, ChatMessage, Product } from "../types/index.js";
import { db } from "../db/store.js";
import { SizeEngine } from "./sizeEngine.js";

export interface BotProcessResult {
  replyText: string;
  matchedIntent?: string;
  confidence: number;
  isFaqMatch: boolean;
  isSizeRecommendation: boolean;
  suggestedProduct?: {
    id?: string;
    name: string;
    category: string;
    price: string;
    sizeSuggested?: string;
    thumbnail: string;
  };
}

export class FAQEngine {
  private static removeAccents(str: string): string {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  // Parse height and weight from natural language Vietnamese text
  // e.g., "cao 1m75 nang 70kg", "170cm 65kg", "m75 70 ký", "cao 1.75m nang 68kg"
  public static extractPhysicalStats(text: string): { height?: number; weight?: number; gender?: "Male" | "Female" | "Unisex" } | null {
    const raw = text.toLowerCase();
    let height: number | undefined;
    let weight: number | undefined;
    let gender: "Male" | "Female" | "Unisex" = "Unisex";

    if (raw.includes("nam") || raw.includes("anh") || raw.includes("trai")) gender = "Male";
    if (raw.includes("nu") || raw.includes("chị") || raw.includes("gái")) gender = "Female";

    // Regex for height: 1m75, 1m70, 1.75m, 175cm, 175 cm, cao 175
    const heightMatch1 = raw.match(/(\d{1})[m,.](\d{1,2})/); // 1m75 or 1.75
    const heightMatch2 = raw.match(/cao\s*(\d{2,3})/); // cao 175
    const heightMatch3 = raw.match(/(\d{3})\s*cm/); // 175cm

    if (heightMatch1) {
      const meters = parseInt(heightMatch1[1], 10);
      let cmPart = heightMatch1[2];
      if (cmPart.length === 1) cmPart = cmPart + "0";
      height = meters * 100 + parseInt(cmPart, 10);
    } else if (heightMatch2) {
      height = parseInt(heightMatch2[1], 10);
    } else if (heightMatch3) {
      height = parseInt(heightMatch3[1], 10);
    }

    // Regex for weight: 70kg, 70 kg, 70 ký, nặng 70, nang 70
    const weightMatch1 = raw.match(/(\d{2,3})\s*(kg|kí|ký|cân)/);
    const weightMatch2 = raw.match(/n[aặ]ng\s*(\d{2,3})/);

    if (weightMatch1) {
      weight = parseInt(weightMatch1[1], 10);
    } else if (weightMatch2) {
      weight = parseInt(weightMatch2[1], 10);
    }

    if (height && weight) {
      return { height, weight, gender };
    }
    return null;
  }

  public static processMessage(messageText: string): BotProcessResult {
    const rawText = messageText.trim();
    const cleanText = this.removeAccents(rawText);

    // 1. Check if user is asking for size recommendation with measurements
    const stats = this.extractPhysicalStats(rawText);
    if (stats && stats.height && stats.weight) {
      const rec = SizeEngine.recommendSize({
        height: stats.height,
        weight: stats.weight,
        gender: stats.gender,
      });

      // Find a matching featured product
      const products = db.getProducts().filter((p) => p.status === "Active");
      const matchedProduct = products[0] || null;

      return {
        replyText: `Chào bạn! ${rec.advice} \n\nBạn có thể tham khảo ngay các mẫu trang phục thể thao bán chạy nhất bên dưới đã có sẵn size này:`,
        matchedIntent: "Size Fitting",
        confidence: 0.98,
        isFaqMatch: false,
        isSizeRecommendation: true,
        suggestedProduct: matchedProduct
          ? {
              id: matchedProduct.id,
              name: matchedProduct.title,
              category: matchedProduct.category,
              price: `$${matchedProduct.discountPrice || matchedProduct.basePrice}`,
              sizeSuggested: `${rec.suggestedSize} (${rec.fitType})`,
              thumbnail: matchedProduct.thumbnail,
            }
          : undefined,
      };
    }

    // 2. FAQ Semantic & Keyword Matching
    const faqs = db.getFAQs();
    let bestFaq: FAQItem | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      const cleanQ = this.removeAccents(faq.question);
      const keywords = (faq.keywords || []).map((k) => this.removeAccents(k));

      // Direct keyword match
      for (const kw of keywords) {
        if (cleanText.includes(kw)) {
          score += 30;
        }
      }

      // Word overlap with question
      const qWords = cleanQ.split(/\s+/).filter((w) => w.length > 2);
      for (const w of qWords) {
        if (cleanText.includes(w)) {
          score += 10;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestFaq = faq;
      }
    }

    if (bestFaq && highestScore >= 20) {
      bestFaq.usageCount += 1;
      db.persist();

      return {
        replyText: bestFaq.answer,
        matchedIntent: bestFaq.intent,
        confidence: bestFaq.confidence,
        isFaqMatch: true,
        isSizeRecommendation: false,
      };
    }

    // 3. Fallback Response
    const defaultReplies = [
      "Dạ SportX có thể hỗ trợ gì cho bạn? Bạn có thể hỏi về tư vấn size (ví dụ: 'mình cao 1m75 nặng 70kg'), kiểm tra chính sách giao hàng, đổi trả hoặc phương thức thanh toán VNPAY/MoMo nhé!",
      "Dạ câu hỏi của bạn đã được ghi nhận. Để được tư vấn chọn size chuẩn xác, bạn hãy cho SportX biết chiều cao và cân nặng của bạn nhé!",
    ];

    return {
      replyText: defaultReplies[0],
      matchedIntent: "General Inquiry",
      confidence: 0.60,
      isFaqMatch: false,
      isSizeRecommendation: false,
    };
  }
}
