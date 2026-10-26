import { api } from "./api";
import { Product, ProductVariant } from "../types";

export interface ProductQueryParams {
  category?: string;
  sport?: string;
  gender?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: string;
  isFeatured?: boolean;
  page?: number;
  limit?: number;
}

// Fallback high quality imagery by sport/category
const CATEGORY_IMAGES: Record<string, string[]> = {
  "Bóng đá": [
    "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800",
    "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
    "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
  ],
  "Chạy bộ": [
    "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
    "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800",
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800",
  ],
  "Gym / Fitness": [
    "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
    "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800",
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800",
  ],
  "Cầu lông": [
    "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
    "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=800",
  ],
  "Phụ kiện": [
    "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800",
  ],
};

const mapCategoryToVietnamese = (cat: string): "Bóng đá" | "Chạy bộ" | "Gym / Fitness" | "Cầu lông" | "Phụ kiện" => {
  if (!cat) return "Bóng đá";
  const c = cat.toLowerCase();
  if (c.includes("foot") || c.includes("bóng") || c.includes("đá")) return "Bóng đá";
  if (c.includes("run") || c.includes("chạy")) return "Chạy bộ";
  if (c.includes("gym") || c.includes("fit") || c.includes("tập")) return "Gym / Fitness";
  if (c.includes("badminton") || c.includes("cầu") || c.includes("lông")) return "Cầu lông";
  return "Phụ kiện";
};

export const normalizeProduct = (raw: any): Product => {
  const category = mapCategoryToVietnamese(raw.category || raw.sport);
  const fallbackImages = CATEGORY_IMAGES[category] || CATEGORY_IMAGES["Bóng đá"];

  const toFullUrl = (url: string) => {
    if (!url) return url;
    if (url.startsWith("/")) {
      const apiHost = process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:5000";
      return `${apiHost}${url}`;
    }
    return url;
  };

  // Normalize images
  let images: string[] = [];
  if (Array.isArray(raw.images) && raw.images.length > 0 && raw.images.some((img: string) => typeof img === "string" && (img.startsWith("http") || img.startsWith("/") || img.startsWith("data:")))) {
    images = raw.images.map(toFullUrl);
  } else if (raw.thumbnail && typeof raw.thumbnail === "string" && (raw.thumbnail.startsWith("http") || raw.thumbnail.startsWith("/") || raw.thumbnail.startsWith("data:"))) {
    images = [toFullUrl(raw.thumbnail), ...fallbackImages];
  } else {
    images = fallbackImages;
  }

  // Ensure thumbnail is always included at the front of images gallery
  if (raw.thumbnail && typeof raw.thumbnail === "string" && (raw.thumbnail.startsWith("http") || raw.thumbnail.startsWith("/") || raw.thumbnail.startsWith("data:"))) {
    const fullThumb = toFullUrl(raw.thumbnail);
    if (!images.includes(fullThumb)) {
      images.unshift(fullThumb);
    }
  }

  // Normalize prices (if backend stores in USD e.g. 229.0 or small units, convert to VND e.g. 229000)
  let rawPrice = Number(raw.basePrice || raw.price || 250000);
  if (rawPrice > 0 && rawPrice < 1000) {
    rawPrice = Math.round(rawPrice * 1000);
  }

  let rawDiscountPrice = raw.discountPrice ? Number(raw.discountPrice) : undefined;
  if (rawDiscountPrice && rawDiscountPrice < 1000) {
    rawDiscountPrice = Math.round(rawDiscountPrice * 1000);
  }

  const effectivePrice = rawDiscountPrice || rawPrice;
  const originalPrice = rawDiscountPrice ? rawPrice : undefined;
  const discountPercent = originalPrice ? Math.round(((originalPrice - effectivePrice) / originalPrice) * 100) : (raw.discountPercent || 0);

  // Normalize variants
  let variants: ProductVariant[] = [];
  if (Array.isArray(raw.variants) && raw.variants.length > 0) {
    variants = raw.variants.map((v: any) => {
      let vPrice = Number(v.price || effectivePrice);
      if (vPrice < 1000 && vPrice > 0) vPrice = Math.round(vPrice * 1000);

      // If variant has old default 250000 or equals rawPrice while discountPrice is active,
      // sync with current effectivePrice:
      if (!vPrice || vPrice === 250000 || rawDiscountPrice || vPrice === rawPrice) {
        vPrice = effectivePrice;
      }

      return {
        sku: v.sku || `${raw.sku || "SPX"}-${v.size || "L"}`,
        size: v.size || "L",
        color: v.color || "Mặc định",
        colorHex: v.colorHex || "#0F172A",
        price: vPrice,
        stock: v.stock !== undefined ? Math.max(0, Number(v.stock)) : 0,
      };
    });
  } else {
    const rawStock = raw.totalStock !== undefined ? Number(raw.totalStock) : (raw.stock !== undefined ? Number(raw.stock) : 0);
    const defaultSizes = Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes : ["S", "M", "L", "XL", "2XL"];
    const perSizeStock = rawStock > 0 ? Math.floor(rawStock / defaultSizes.length) : 0;
    variants = defaultSizes.map((sz: string, idx: number) => ({
      sku: `${raw.sku || "SPX"}-${sz}`,
      size: sz,
      color: "Mặc định",
      colorHex: "#0F172A",
      price: effectivePrice,
      stock: idx === 0 ? rawStock - perSizeStock * (defaultSizes.length - 1) : perSizeStock,
    }));
  }

  const computedStock = variants.length > 0
    ? variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)
    : (raw.totalStock !== undefined ? Number(raw.totalStock) : (raw.stock !== undefined ? Number(raw.stock) : 0));

  const totalStock = raw.totalStock !== undefined ? Number(raw.totalStock) : computedStock;

  return {
    id: String(raw.id || `p-${Math.random().toString(36).slice(2, 7)}`),
    name: raw.title || raw.name || "Trang phục Thể thao SportX",
    slug: (raw.title || raw.name || "sportx-product").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    sku: raw.sku || "SPX-001",
    category,
    sport: category,
    gender: (raw.gender as any) || "Unisex",
    brand: raw.brand || "SportX Pro",
    basePrice: rawPrice,
    price: effectivePrice,
    originalPrice,
    discountPercent,
    stock: totalStock,
    description: raw.description || "Sản phẩm trang phục thể thao chính hãng cao cấp, chất liệu thoáng khí, co giãn đa chiều mang lại sự thoải mái tối đa trong mọi hoạt động tập luyện và thi đấu.",
    images,
    variants,
    rating: raw.rating || 4.9,
    reviewCount: raw.reviewCount || 36,
    isFeatured: raw.isFeatured ?? true,
    isNewArrival: raw.isNewArrival ?? true,
    isBestSeller: raw.isBestSeller ?? (discountPercent > 0 || totalStock > 100),
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

// Fallback seed products if backend offline
const FALLBACK_PRODUCTS: Product[] = [
  normalizeProduct({
    id: "p-1",
    title: "Áo Đấu Bóng Đá Tuyển Việt Nam 2026 - Aeroready Chính Hãng",
    sku: "SPX-FTB-01",
    category: "Bóng đá",
    brand: "SportX Pro",
    basePrice: 350000,
    discountPrice: 289000,
    description: "Áo thi đấu đội tuyển phiên bản Pro-Match chất liệu Aeroready siêu nhẹ, thoát mồ hôi 3D cực mát.",
    totalStock: 145,
    sizes: ["S", "M", "L", "XL", "2XL"],
  }),
  normalizeProduct({
    id: "p-2",
    title: "Quần Short Tập Gym & Chạy Bộ 2 Lớp Kháng Khuẩn Co Giãn 4 Chiều",
    sku: "SPX-GYM-08",
    category: "Gym / Fitness",
    brand: "Nike",
    basePrice: 280000,
    discountPrice: 220000,
    description: "Quần short thể thao 2 lớp có túi trong đựng điện thoại, lưng thun co giãn không hằn da.",
    totalStock: 80,
    sizes: ["M", "L", "XL"],
  }),
  normalizeProduct({
    id: "p-3",
    title: "Áo Chạy Bộ Siêu Nhẹ Marathon Pro Singlet Thoáng Khí Tối Đa",
    sku: "SPX-RUN-14",
    category: "Chạy bộ",
    brand: "Adidas",
    basePrice: 320000,
    discountPrice: 249000,
    description: "Dòng áo Singlet chuyên dụng cho các giải chạy Full Marathon 42km, chống ma sát núm ngực.",
    totalStock: 320,
    sizes: ["S", "M", "L", "XL"],
  }),
  normalizeProduct({
    id: "p-4",
    title: "Áo Cầu Lông Thi Đấu Yonex Championship Pro Co Giãn Thoáng Mát",
    sku: "SPX-BAD-05",
    category: "Cầu lông",
    brand: "Yonex",
    basePrice: 390000,
    discountPrice: 310000,
    description: "Áo thi đấu cầu lông chính hãng chuyên nghiệp, sợi dệt lục giác giải phóng nhiệt nhanh.",
    totalStock: 65,
    sizes: ["M", "L", "XL", "2XL"],
  }),
  normalizeProduct({
    id: "p-5",
    title: "Áo Nén Cơ Body Fit Nam Tập Gym Tăng Cường Tuần Hoàn Máu",
    sku: "SPX-GYM-22",
    category: "Gym / Fitness",
    brand: "Under Armour",
    basePrice: 420000,
    discountPrice: 349000,
    description: "Áo compression fit ôm sát cơ bắp, hỗ trợ giữ ấm và giảm đau mỏi cơ sau buổi tập nặng.",
    totalStock: 90,
    sizes: ["S", "M", "L", "XL"],
  }),
  normalizeProduct({
    id: "p-6",
    title: "Bộ Quần Áo Bóng Đá Real Madrid 2026 Bản Thi Đấu Sân Nhà",
    sku: "SPX-FTB-07",
    category: "Bóng đá",
    brand: "Adidas",
    basePrice: 450000,
    discountPrice: 360000,
    description: "Bộ quần áo bóng đá Real Madrid trắng hoàng gia, logo thêu sắc nét, chất vải hạt mè kim cương.",
    totalStock: 110,
    sizes: ["S", "M", "L", "XL", "2XL"],
  }),
];

export const productService = {
  searchProducts: async (query: string): Promise<Product[]> => {
    if (!query || !query.trim()) return [];
    try {
      const res = await api.get("/search", { params: { q: query.trim() } });
      const rawProducts = res.data?.data?.products || [];
      if (Array.isArray(rawProducts) && rawProducts.length > 0) {
        return rawProducts.map(normalizeProduct);
      }
      const fallback = await productService.getProducts({ search: query.trim() });
      return fallback.data.slice(0, 6);
    } catch {
      const fallback = await productService.getProducts({ search: query.trim() });
      return fallback.data.slice(0, 6);
    }
  },

  getProducts: async (params?: ProductQueryParams): Promise<{ success: boolean; data: Product[]; total?: number }> => {
    try {
      const res = await api.get("/products", { params });
      const rawList = res.data?.data || res.data || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        const normalized = rawList.map(normalizeProduct);
        return { success: true, data: normalized, total: normalized.length };
      }
      return { success: true, data: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length };
    } catch {
      return { success: true, data: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length };
    }
  },

  getProductById: async (id: string): Promise<{ success: boolean; data: Product }> => {
    try {
      const res = await api.get(`/products/${id}`);
      const raw = res.data?.data || res.data;
      if (raw) {
        return { success: true, data: normalizeProduct(raw) };
      }
      const found = FALLBACK_PRODUCTS.find((p) => p.id === id) || FALLBACK_PRODUCTS[0];
      return { success: true, data: found };
    } catch {
      const found = FALLBACK_PRODUCTS.find((p) => p.id === id) || FALLBACK_PRODUCTS[0];
      return { success: true, data: found };
    }
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const res = await productService.getProducts();
    return res.data.slice(0, 8);
  },

  getNewArrivals: async (): Promise<Product[]> => {
    const res = await productService.getProducts();
    return res.data.slice(0, 8);
  },
};
