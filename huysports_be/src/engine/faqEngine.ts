import { FAQItem, Product } from "../types/index.js";
import { db } from "../db/store.js";
import { SizeEngine, SizeRecommendationResult } from "./sizeEngine.js";

export interface BotRecommendedProduct {
  id: string;
  name: string;
  title?: string;
  category: string;
  sport?: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  images: string[];
  thumbnail: string;
  rating: number;
  reviewCount: number;
  sizeSuggested?: string;
  brand?: string;
  description?: string;
}

export interface BotProcessResult {
  replyText: string;
  reply: string;
  matchedIntent?: string;
  intent?: string;
  confidence: number;
  isFaqMatch: boolean;
  isSizeRecommendation: boolean;
  quickReplies?: string[];
  recommendedProducts?: BotRecommendedProduct[];
  suggestedProduct?: {
    id?: string;
    name: string;
    category: string;
    price: string;
    sizeSuggested?: string;
    thumbnail: string;
  };
  sizeRecommendation?: {
    recommendedSize: string;
    alternativeSize?: string;
    confidenceScore: number;
    reason: string;
    fitAnalysis: string;
  };
}

// Fallback high quality imagery by category
const CATEGORY_IMAGES: Record<string, string[]> = {
  Football: [
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
  ],
  Running: [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  ],
  Gym: [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800",
  ],
  Badminton: [
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800",
  ],
};

export class FAQEngine {
  public static removeAccents(str: string): string {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase();
  }

  // Format number to VND currency (e.g. 289000 -> "289.000đ")
  public static formatPriceVND(price: number): string {
    let effective = price;
    if (effective > 0 && effective < 1000) {
      effective = effective * 1000;
    }
    return `${Math.round(effective).toLocaleString("vi-VN")}đ`;
  }

  // Normalize product to client-friendly format
  public static toRecommendedProduct(p: Product, sizeSuggested?: string): BotRecommendedProduct {
    const cat = p.category || "Football";
    const fallbackList = CATEGORY_IMAGES[cat] || CATEGORY_IMAGES["Football"];
    const imgUrl = (p.thumbnail && p.thumbnail.startsWith("http")) ? p.thumbnail : fallbackList[0];

    let rawPrice = p.discountPrice || p.basePrice || 250;
    if (rawPrice > 0 && rawPrice < 1000) {
      rawPrice = Math.round(rawPrice * 1000);
    }

    let origPrice = p.basePrice;
    if (origPrice && origPrice < 1000) {
      origPrice = Math.round(origPrice * 1000);
    }

    return {
      id: p.id,
      name: p.title,
      title: p.title,
      category: p.category,
      sport: p.category,
      price: rawPrice,
      originalPrice: origPrice !== rawPrice ? origPrice : undefined,
      discountPrice: rawPrice,
      images: [imgUrl, ...fallbackList.slice(1)],
      thumbnail: imgUrl,
      rating: 4.9,
      reviewCount: 48,
      sizeSuggested,
      brand: p.brand,
      description: p.description,
    };
  }

  // Parse height and weight from natural language
  public static extractPhysicalStats(text: string): {
    height?: number;
    weight?: number;
    gender: "Male" | "Female" | "Unisex";
    fitPreference?: "Slim Fit" | "Regular Fit" | "Loose Fit";
  } {
    const raw = text.toLowerCase();
    const clean = this.removeAccents(raw);
    let height: number | undefined;
    let weight: number | undefined;
    let gender: "Male" | "Female" | "Unisex" = "Unisex";
    let fitPreference: "Slim Fit" | "Regular Fit" | "Loose Fit" | undefined;

    if (clean.includes("nam") || clean.includes("anh") || clean.includes("trai") || clean.includes("men")) {
      gender = "Male";
    } else if (clean.includes("nu") || clean.includes("chi") || clean.includes("gai") || clean.includes("women")) {
      gender = "Female";
    }

    if (clean.includes("om") || clean.includes("body") || clean.includes("bo sat") || clean.includes("slim")) {
      fitPreference = "Slim Fit";
    } else if (clean.includes("rong") || clean.includes("oversize") || clean.includes("thoai mai") || clean.includes("loose")) {
      fitPreference = "Loose Fit";
    } else if (clean.includes("vua") || clean.includes("chuan") || clean.includes("regular")) {
      fitPreference = "Regular Fit";
    }

    // Height extraction:
    // e.g., "1m75", "1m7", "1.75m", "1,75m", "175cm", "175 cm", "cao 175", "cao m75", "cao 1m68"
    const mMatch = clean.match(/1[m,.](\d{1,2})/);
    const cmMatch = clean.match(/(\d{3})\s*cm/);
    const caoMatch = clean.match(/cao\s*(\d{2,3})/);
    const mShortMatch = clean.match(/(?:cao\s*)?m(\d{2})/);

    if (mMatch) {
      const part = mMatch[1].length === 1 ? mMatch[1] + "0" : mMatch[1];
      height = 100 + parseInt(part, 10);
    } else if (cmMatch) {
      height = parseInt(cmMatch[1], 10);
    } else if (caoMatch) {
      const val = parseInt(caoMatch[1], 10);
      if (val >= 140 && val <= 220) height = val;
    } else if (mShortMatch) {
      height = 100 + parseInt(mShortMatch[1], 10);
    }

    // Weight extraction:
    // e.g., "70kg", "70 kg", "70 kí", "70 ký", "70 cân", "nang 70", "nang 68kg"
    const kgMatch = clean.match(/(\d{2,3})\s*(?:kg|ki|ky|can)/);
    const nangMatch = clean.match(/nang\s*(\d{2,3})/);

    if (kgMatch) {
      weight = parseInt(kgMatch[1], 10);
    } else if (nangMatch) {
      const val = parseInt(nangMatch[1], 10);
      if (val >= 35 && val <= 160) weight = val;
    }

    return { height, weight, gender, fitPreference };
  }

  // Extract Order Number e.g. "SPX-9820", "SPX9820", "ord-1"
  public static extractOrderCode(text: string): string | null {
    const m = text.match(/(SPX-?\d{4,6}|ord-\d+)/i);
    return m ? m[1].toUpperCase().replace("SPX", "SPX-").replace("--", "-") : null;
  }

  public static processMessage(messageText: string): BotProcessResult {
    const rawText = messageText.trim();
    const cleanText = this.removeAccents(rawText);
    const activeProducts = db.getProducts().filter((p) => p.status === "Active");

    // -------------------------------------------------------------
    // 1. ORDER TRACKING (Tra cứu đơn hàng)
    // -------------------------------------------------------------
    const orderCode = this.extractOrderCode(rawText);
    if (orderCode || cleanText.includes("tra cuu don") || cleanText.includes("kiem tra don") || cleanText.includes("tinh trang don")) {
      const orders = db.getOrders();
      if (orderCode) {
        const found = orders.find(
          (o) =>
            o.orderNumber.toUpperCase() === orderCode ||
            o.orderNumber.replace("-", "").toUpperCase() === orderCode.replace("-", "") ||
            o.id.toLowerCase() === orderCode.toLowerCase()
        );

        if (found) {
          const statusMap: Record<string, string> = {
            "Pending Approval": "⏳ Chờ xác nhận",
            Processing: "⚙️ Đang xử lý đóng gói",
            Shipping: "🚚 Đang vận chuyển giao hàng",
            Completed: "✅ Giao hàng thành công",
            Canceled: "❌ Đã hủy",
          };
          const statusVN = statusMap[found.fulfillmentStatus] || found.fulfillmentStatus;
          const itemsText = found.items
            .map((it) => `• **${it.name}** (x${it.qty}) - Size ${it.size}`)
            .join("\n");
          const totalVND = this.formatPriceVND(found.totalAmount);

          const reply = `📦 **Thông tin đơn hàng ${found.orderNumber}:**\n\n` +
            `• **Trạng thái:** ${statusVN}\n` +
            `• **Khách hàng:** ${found.customer.name} (${found.customer.phone})\n` +
            `• **Địa chỉ nhận:** ${found.customer.address}\n` +
            `• **Thanh toán:** ${found.paymentMethod} (${found.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"})\n` +
            `• **Tổng tiền:** **${totalVND}**\n\n` +
            `**Sản phẩm trong đơn:**\n${itemsText}\n\n` +
            `Nếu bạn cần hỗ trợ thay đổi địa chỉ hoặc hủy đơn, vui lòng liên hệ hotline: **0912.888.999** nhé!`;

          return {
            replyText: reply,
            reply,
            matchedIntent: "Order Tracking",
            intent: "Order Tracking",
            confidence: 0.99,
            isFaqMatch: true,
            isSizeRecommendation: false,
            quickReplies: ["Tư vấn chọn Size chuẩn", "Xem sản phẩm bán chạy", "Chính sách đổi trả"],
          };
        } else {
          const reply = `Dạ SportX chưa tìm thấy đơn hàng nào có mã **${orderCode}** trên hệ thống.\n\nBạn vui lòng kiểm tra lại mã đơn (thường có định dạng SPX-XXXX trong email xác nhận hoặc tin nhắn SMS), hoặc bạn có thể vào mục **Tài khoản > Đơn hàng của tôi** để xem nhé!`;
          return {
            replyText: reply,
            reply,
            matchedIntent: "Order Tracking",
            intent: "Order Tracking",
            confidence: 0.95,
            isFaqMatch: true,
            isSizeRecommendation: false,
            quickReplies: ["Tra cứu mã SPX-9820", "Chính sách giao hàng", "Tư vấn chọn size"],
          };
        }
      } else {
        const reply = `Để tra cứu đơn hàng nhanh nhất, bạn hãy gửi **Mã đơn hàng** cho SportX nhé (Ví dụ: 'SPX-9820').\n\nHoặc bạn có thể truy cập mục **Đơn mua** trong trang Tài khoản để xem tiến trình giao hàng trực tiếp.`;
        return {
          replyText: reply,
          reply,
          matchedIntent: "Order Tracking",
          intent: "Order Tracking",
          confidence: 0.92,
          isFaqMatch: true,
          isSizeRecommendation: false,
          quickReplies: ["Tra cứu mã SPX-9820", "Thời gian giao hàng", "Tư vấn chọn size"],
        };
      }
    }

    // -------------------------------------------------------------
    // 2. SIZE FITTING & PHYSICAL STATS (Tư vấn kích cỡ trang phục)
    // -------------------------------------------------------------
    const stats = this.extractPhysicalStats(rawText);

    // 2A. Đầy đủ cả chiều cao và cân nặng
    if (stats.height && stats.weight) {
      const rec: SizeRecommendationResult = SizeEngine.recommendSize({
        height: stats.height,
        weight: stats.weight,
        gender: stats.gender,
        fitPreference: stats.fitPreference,
      });

      // Tìm sản phẩm phù hợp môn thể thao nếu có đề cập
      let targetProds = activeProducts;
      if (cleanText.includes("bong da") || cleanText.includes("da banh") || cleanText.includes("foot")) {
        targetProds = activeProducts.filter((p) => p.category === "Football");
      } else if (cleanText.includes("chay bo") || cleanText.includes("run")) {
        targetProds = activeProducts.filter((p) => p.category === "Running");
      } else if (cleanText.includes("gym") || cleanText.includes("the hinh") || cleanText.includes("ta")) {
        targetProds = activeProducts.filter((p) => p.category === "Gym");
      } else if (cleanText.includes("cau long") || cleanText.includes("badminton") || cleanText.includes("vot")) {
        targetProds = activeProducts.filter((p) => p.category === "Badminton");
      }
      if (targetProds.length === 0) targetProds = activeProducts;

      const topProducts = targetProds.slice(0, 3).map((p) =>
        this.toRecommendedProduct(p, `${rec.suggestedSize} (${rec.fitType})`)
      );

      const altAdvice = rec.alternateSizes && rec.alternateSizes.length > 0
        ? `\n💡 **Gợi ý thêm:**\n${rec.alternateSizes.map((a) => `• Chọn **${a.size}**: ${a.reason}`).join("\n")}`
        : "";

      const reply = `Xin chào bạn! SportX AI đã phân tích thể trạng của bạn:\n\n` +
        `📏 **Chiều cao:** ${stats.height}cm | ⚖️ **Cân nặng:** ${stats.weight}kg\n` +
        `📊 **Chỉ số BMI:** ${rec.bmi} (${rec.bmiCategory})\n` +
        `🎯 **Size đề xuất tối ưu:** **${rec.suggestedSize}** (${rec.fitType})\n\n` +
        `${rec.advice}${altAdvice}\n\n` +
        `Dưới đây là các mẫu đồ thể thao bán chạy nhất đã có sẵn **${rec.suggestedSize}**, bạn có thể bấm xem ngay nhé:`;

      const primary = topProducts[0];

      return {
        replyText: reply,
        reply,
        matchedIntent: "Size Fitting",
        intent: "Size Fitting",
        confidence: 0.98,
        isFaqMatch: false,
        isSizeRecommendation: true,
        sizeRecommendation: {
          recommendedSize: rec.suggestedSize,
          alternativeSize: rec.alternateSizes?.[0]?.size,
          confidenceScore: Math.round(rec.confidence * 100),
          reason: `Phù hợp với thể trạng BMI ${rec.bmi} (${rec.bmiCategory})`,
          fitAnalysis: `Với chiều cao ${stats.height}cm, cân nặng ${stats.weight}kg, form ${rec.suggestedSize} (${rec.fitType}) mang lại cảm giác thoải mái nhất khi vận động mạnh.`,
        },
        recommendedProducts: topProducts,
        suggestedProduct: primary
          ? {
              id: primary.id,
              name: primary.name,
              category: primary.category,
              price: this.formatPriceVND(primary.price),
              sizeSuggested: `${rec.suggestedSize} (${rec.fitType})`,
              thumbnail: primary.thumbnail,
            }
          : undefined,
        quickReplies: ["Xem đồ bóng đá", "Xem đồ chạy bộ", "Chính sách đổi size miễn phí", "Mã giảm giá SPORTX10"],
      };
    }

    // 2B. Khách chỉ nói chiều cao (thiếu cân nặng)
    if (stats.height && !stats.weight) {
      const reply = `Dạ SportX đã nhận thông tin chiều cao của bạn là **${stats.height}cm**! 📏\n\nĐể AI tính toán chính xác chỉ số thể trạng (BMI) và đề xuất size chuẩn nhất (S, M, L, XL, XXL), bạn cho SportX biết thêm **cân nặng (kg)** của bạn nhé!\n\n*(Ví dụ: 'mình nặng 65kg' hoặc '68 ký thích mặc rộng')*`;
      return {
        replyText: reply,
        reply,
        matchedIntent: "Size Fitting",
        intent: "Size Fitting",
        confidence: 0.90,
        isFaqMatch: false,
        isSizeRecommendation: false,
        quickReplies: ["Nặng 55kg", "Nặng 65kg", "Nặng 72kg", "Nặng 80kg"],
      };
    }

    // 2C. Khách chỉ nói cân nặng (thiếu chiều cao)
    if (!stats.height && stats.weight) {
      const reply = `Dạ SportX đã nhận thông tin cân nặng của bạn là **${stats.weight}kg**! ⚖️\n\nBạn cho SportX biết thêm **chiều cao (cm hoặc mét)** của bạn nhé để AI gợi ý size vừa vặn và tôn dáng nhất!\n\n*(Ví dụ: 'mình cao 1m72' hoặc 'cao 175cm')*`;
      return {
        replyText: reply,
        reply,
        matchedIntent: "Size Fitting",
        intent: "Size Fitting",
        confidence: 0.90,
        isFaqMatch: false,
        isSizeRecommendation: false,
        quickReplies: ["Cao 1m65", "Cao 1m70", "Cao 1m75", "Cao 1m80"],
      };
    }

    // -------------------------------------------------------------
    // 3. GREETINGS & POLITE INTENTS (Chào hỏi, Cảm ơn)
    // -------------------------------------------------------------
    const words = cleanText.split(/\s+/);
    const isGreeting =
      cleanText === "hi" ||
      cleanText === "hello" ||
      cleanText === "chao" ||
      cleanText === "alo" ||
      cleanText.startsWith("xin chao") ||
      cleanText.startsWith("chao ban") ||
      cleanText.startsWith("chao shop") ||
      cleanText.startsWith("chao ad") ||
      cleanText.startsWith("hi shop") ||
      cleanText.startsWith("hello shop") ||
      cleanText.includes("co ai khong");

    if (isGreeting) {
      const reply = `Xin chào bạn! 👋 Tôi là **Trợ Lý AI SportX**.\n\n` +
        `Tôi có thể hỗ trợ bạn:\n` +
        `• 📐 **Tư vấn chọn Size chuẩn xác**: Chỉ cần gửi chiều cao & cân nặng (VD: 'cao 1m75 nặng 70kg').\n` +
        `• 👟 **Gợi ý trang phục & dụng cụ**: Đồ bóng đá, chạy bộ, gym, cầu lông chính hãng.\n` +
        `• 📦 **Tra cứu đơn hàng**: Kiểm tra tiến trình giao hàng realtime.\n` +
        `• 🛡️ **Giải đáp chính sách**: Đổi size 30 ngày, bảo hành, phí ship, thanh toán VNPAY/COD.\n\n` +
        `Bạn đang quan tâm đến sản phẩm hoặc cần SportX hỗ trợ điều gì hôm nay?`;

      return {
        replyText: reply,
        reply,
        matchedIntent: "Greeting",
        intent: "Greeting",
        confidence: 0.99,
        isFaqMatch: true,
        isSizeRecommendation: false,
        recommendedProducts: activeProducts.slice(0, 2).map((p) => this.toRecommendedProduct(p)),
        quickReplies: [
          "Tư vấn size (Cao 1m70 nặng 65kg)",
          "Xem đồ bóng đá hot",
          "Giày chạy bộ êm ái",
          "Chính sách đổi trả 30 ngày",
        ],
      };
    }

    if (
      cleanText.includes("cam on") ||
      cleanText.includes("thank") ||
      cleanText.includes("tuyet voi") ||
      cleanText.includes("ok shop")
    ) {
      const reply = `SportX rất vui được đồng hành và hỗ trợ bạn! 🥰\n\nChúc bạn có những buổi tập luyện và thi đấu thể thao thật nhiều năng lượng và bứt phá giới hạn. Nếu cần thêm thông tin gì, bạn đừng ngại nhắn cho SportX bất cứ lúc nào nhé! ✨`;
      return {
        replyText: reply,
        reply,
        matchedIntent: "Gratitude",
        intent: "Gratitude",
        confidence: 0.99,
        isFaqMatch: true,
        isSizeRecommendation: false,
        quickReplies: ["Xem thêm sản phẩm hot", "Tư vấn chọn size", "Mã giảm giá SPORTX10"],
      };
    }

    // -------------------------------------------------------------
    // 4. COUPONS & PROMOTIONS (Mã giảm giá / Ưu đãi)
    // -------------------------------------------------------------
    if (cleanText.includes("ma giam gia") || cleanText.includes("voucher") || cleanText.includes("coupon") || cleanText.includes("code")) {
      const reply = `🎁 **Mã Giảm Giá Độc Quyền Hiện Có Tại SportX:**\n\n` +
        `1. **SPORTX10**: Giảm ngay **10%** cho mọi đơn hàng từ 300.000đ (Dành cho thành viên mới).\n` +
        `2. **FREESHIP**: Miễn phí vận chuyển toàn quốc cho đơn hàng từ **500.000đ**.\n` +
        `3. **SPORTXVIP**: Giảm ngay **50.000đ** cho khách hàng thanh toán trực tuyến qua VNPAY.\n\n` +
        `Bạn chỉ cần nhập mã tại bước thanh toán (Checkout) là được áp dụng ngay nhé! 🛒`;

      const topProducts = activeProducts.slice(0, 2).map((p) => this.toRecommendedProduct(p));

      return {
        replyText: reply,
        reply,
        matchedIntent: "Coupon Inquiry",
        intent: "Coupon Inquiry",
        confidence: 0.98,
        isFaqMatch: true,
        isSizeRecommendation: false,
        recommendedProducts: topProducts,
        quickReplies: ["Mua sắm ngay", "Tư vấn chọn size", "Chính sách giao hàng"],
      };
    }

    // -------------------------------------------------------------
    // 5. PRODUCT RECOMMENDATION & DISCOVERY (Tư vấn sản phẩm)
    // -------------------------------------------------------------
    const hasWord = (w: string) => words.includes(w);
    const isProductQuery =
      hasWord("ao") ||
      hasWord("quan") ||
      hasWord("giay") ||
      hasWord("vot") ||
      cleanText.includes("bong da") ||
      cleanText.includes("da banh") ||
      cleanText.includes("chay bo") ||
      cleanText.includes("running") ||
      cleanText.includes("gym") ||
      cleanText.includes("the hinh") ||
      cleanText.includes("cau long") ||
      cleanText.includes("badminton") ||
      cleanText.includes("nike") ||
      cleanText.includes("adidas") ||
      cleanText.includes("yonex") ||
      cleanText.includes("sportx") ||
      cleanText.includes("ban chay") ||
      cleanText.includes("bestseller") ||
      cleanText.includes("hot") ||
      cleanText.includes("sale") ||
      cleanText.includes("giam gia") ||
      cleanText.includes("khuyen mai") ||
      cleanText.includes("san pham");

    if (isProductQuery) {
      let filtered = activeProducts;
      let replyIntro = "Dưới đây là các sản phẩm thể thao nổi bật tại SportX được khách hàng đánh giá cao nhất:";
      let currentIntent = "Product Recommendation";

      if (cleanText.includes("bong da") || cleanText.includes("da banh") || cleanText.includes("football") || cleanText.includes("soccer")) {
        filtered = activeProducts.filter((p) => p.category === "Football");
        replyIntro = `⚽ **Bộ sưu tập Bóng Đá chuyên nghiệp tại SportX:**\nSportX mang đến cho bạn giày đinh FG bám sân cực tốt, áo đấu thoáng khí Aeroready và tất chống trượt cao cấp. Mời bạn tham khảo:`;
        currentIntent = "Football Inquiry";
      } else if (cleanText.includes("chay bo") || cleanText.includes("run") || cleanText.includes("marathon")) {
        filtered = activeProducts.filter((p) => p.category === "Running");
        replyIntro = `🏃‍♂️ **Dòng sản phẩm Chạy Bộ chuyên dụng tại SportX:**\nTrang bị công nghệ đệm hạt Boost siêu nhẹ, hấp thụ phản lực tối đa và áo Singlet thoáng khí chống ma sát giúp bạn bứt phá mọi cự ly:`;
        currentIntent = "Running Inquiry";
      } else if (cleanText.includes("gym") || cleanText.includes("the hinh") || cleanText.includes("ta") || cleanText.includes("fitness")) {
        filtered = activeProducts.filter((p) => p.category === "Gym");
        replyIntro = `💪 **Trang thiết bị & Đồ tập Gym SportX Pro:**\nChất liệu co giãn 4 chiều Dry-Fit kháng khuẩn, thoát mồ hôi 3D cực nhanh kết hợp cùng phụ kiện tập luyện bền bỉ:`;
        currentIntent = "Gym Inquiry";
      } else if (cleanText.includes("cau long") || cleanText.includes("badminton") || cleanText.includes("vot")) {
        filtered = activeProducts.filter((p) => p.category === "Badminton");
        replyIntro = `🏸 **Trang phục & Dụng cụ Cầu Lông chính hãng:**\nVợt công thủ toàn diện trợ lực dẻo dai kết hợp áo thi đấu mát lạnh giúp bạn tự tin làm chủ từng pha cầu:`;
        currentIntent = "Badminton Inquiry";
      } else if (cleanText.includes("sale") || cleanText.includes("giam gia") || cleanText.includes("khuyen mai")) {
        filtered = activeProducts.filter((p) => (p.discountPrice && p.discountPrice < p.basePrice) || p.basePrice < 200);
        replyIntro = `🔥 **Sản phẩm đang Giảm Giá & Ưu Đãi Cực Sốc tại SportX:**\nĐừng quên nhập thêm mã voucher **SPORTX10** để được giảm thêm 10% cho đơn hàng nhé!`;
        currentIntent = "Promotion Inquiry";
      } else if (cleanText.includes("ban chay") || cleanText.includes("hot") || cleanText.includes("bestseller")) {
        filtered = activeProducts.filter((p) => p.totalStock > 100 || (p.discountPrice && p.discountPrice > 0));
        replyIntro = `⭐ **Top Sản Phẩm Bán Chạy Nhất Tuần Này tại SportX:**\nĐược hàng nghìn vận động viên và người yêu thể thao tin dùng:`;
        currentIntent = "Bestseller Inquiry";
      } else if (cleanText.includes("nike")) {
        filtered = activeProducts.filter((p) => p.brand.toLowerCase().includes("nike"));
        replyIntro = `👟 **Bộ sưu tập Nike Chính Hãng tại SportX:**\nCam kết 100% chính hãng, bảo hành keo chỉ 12 tháng:`;
        currentIntent = "Brand Nike";
      } else if (cleanText.includes("adidas")) {
        filtered = activeProducts.filter((p) => p.brand.toLowerCase().includes("adidas"));
        replyIntro = `👟 **Bộ sưu tập Adidas Chính Hãng tại SportX:**\nCông nghệ đỉnh cao cho hiệu suất tập luyện tối đa:`;
        currentIntent = "Brand Adidas";
      }

      if (filtered.length === 0) filtered = activeProducts;

      const topProducts = filtered.slice(0, 3).map((p) => this.toRecommendedProduct(p));
      const primary = topProducts[0];

      const prodsListText = topProducts
        .map((p, idx) => `${idx + 1}. **${p.name}** - Giá ưu đãi: **${this.formatPriceVND(p.price)}**`)
        .join("\n");

      const reply = `${replyIntro}\n\n${prodsListText}\n\n` +
        `Bạn có thể bấm vào thẻ sản phẩm bên dưới để xem chi tiết ảnh thật và chọn màu, hoặc nhắn chiều cao/cân nặng để mình tư vấn size vừa khít nhé!`;

      return {
        replyText: reply,
        reply,
        matchedIntent: currentIntent,
        intent: currentIntent,
        confidence: 0.96,
        isFaqMatch: false,
        isSizeRecommendation: false,
        recommendedProducts: topProducts,
        suggestedProduct: primary
          ? {
              id: primary.id,
              name: primary.name,
              category: primary.category,
              price: this.formatPriceVND(primary.price),
              thumbnail: primary.thumbnail,
            }
          : undefined,
        quickReplies: ["Tư vấn chọn size chuẩn", "Xem đồ bóng đá", "Xem giày chạy bộ", "Mã giảm giá SPORTX10"],
      };
    }

    // -------------------------------------------------------------
    // 6. FAQ KNOWLEDGE BASE MATCHING (Câu hỏi thường gặp)
    // -------------------------------------------------------------
    const faqs = db.getFAQs();
    let bestFaq: FAQItem | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      const cleanQ = this.removeAccents(faq.question);
      const keywords = (faq.keywords || []).map((k) => this.removeAccents(k));

      // Direct keyword matches
      for (const kw of keywords) {
        if (cleanText.includes(kw)) {
          score += 35;
        }
      }

      // Semantic words overlap
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

      let dynamicReplies = ["Tư vấn chọn size", "Sản phẩm bán chạy", "Kiểm tra đơn hàng"];
      if (bestFaq.intent === "Return Policy") {
        dynamicReplies = ["Tư vấn chọn size chuẩn", "Cách đổi hàng", "Xem đồ hot"];
      } else if (bestFaq.intent === "Shipping Time") {
        dynamicReplies = ["Phí ship bao nhiêu?", "Tra cứu đơn hàng", "Mua hàng ngay"];
      } else if (bestFaq.intent === "Payment & Warranty") {
        dynamicReplies = ["Thanh toán VNPAY", "Mã giảm giá", "Mua hàng ngay"];
      }

      return {
        replyText: bestFaq.answer,
        reply: bestFaq.answer,
        matchedIntent: bestFaq.intent,
        intent: bestFaq.intent,
        confidence: bestFaq.confidence,
        isFaqMatch: true,
        isSizeRecommendation: false,
        recommendedProducts: activeProducts.slice(0, 2).map((p) => this.toRecommendedProduct(p)),
        quickReplies: dynamicReplies,
      };
    }

    // -------------------------------------------------------------
    // 7. INTELLIGENT FALLBACK (Xử lý câu hỏi tự nhiên)
    // -------------------------------------------------------------
    const reply = `Dạ SportX đã nhận được tin nhắn của bạn! ✨\n\n` +
      `Để SportX tư vấn cho bạn nhanh và chuẩn xác nhất, bạn có thể:\n` +
      `1. 📐 **Chọn Size**: Gửi số đo chiều cao và cân nặng (Ví dụ: *'mình cao 1m75 nặng 70kg'*).\n` +
      `2. 👟 **Tìm sản phẩm**: Nhập nhu cầu như *'áo bóng đá'*, *'giày chạy bộ'*, *'đồ gym'*, *'vợt cầu lông'*.\n` +
      `3. 📦 **Đơn hàng**: Gửi mã đơn (Ví dụ: *'SPX-9820'*).\n` +
      `4. 🎁 **Ưu đãi**: Nhập *'mã giảm giá'* hoặc *'khuyến mãi'*.\n\n` +
      `Dưới đây là một số mẫu đồ thể thao bán chạy nhất bạn có thể tham khảo ngay:`;

    const topProducts = activeProducts.slice(0, 2).map((p) => this.toRecommendedProduct(p));

    return {
      replyText: reply,
      reply,
      matchedIntent: "General Inquiry",
      intent: "General Inquiry",
      confidence: 0.85,
      isFaqMatch: false,
      isSizeRecommendation: false,
      recommendedProducts: topProducts,
      suggestedProduct: topProducts[0]
        ? {
            id: topProducts[0].id,
            name: topProducts[0].name,
            category: topProducts[0].category,
            price: this.formatPriceVND(topProducts[0].price),
            thumbnail: topProducts[0].thumbnail,
          }
        : undefined,
      quickReplies: [
        "Tư vấn size (Cao 1m75 nặng 70kg)",
        "Xem áo bóng đá hot",
        "Giày chạy bộ êm ái",
        "Chính sách đổi trả 30 ngày",
      ],
    };
  }
}
