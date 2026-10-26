export interface ProductVariant {
  sku: string;
  size: string;
  color: string;
  colorHex?: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: "Bóng đá" | "Chạy bộ" | "Gym / Fitness" | "Cầu lông" | "Phụ kiện";
  sport: "Bóng đá" | "Chạy bộ" | "Gym / Fitness" | "Cầu lông" | "Phụ kiện" | "Tất cả";
  gender: "Nam" | "Nữ" | "Unisex";
  brand: string;
  basePrice?: number;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  description: string;
  specifications?: Record<string, string>;
  careInstructions?: string[];
  images: string[];
  variants: ProductVariant[];
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
  maxStock: number;
  selected?: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  sku: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  ward: string;
  addressLine: string;
  note?: string;
}

export interface ReturnRequest {
  reason: string;
  detailedReason?: string;
  bankName?: string;
  bankAccount?: string;
  accountHolder?: string;
  refundAmount: number;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: "COD" | "VNPAY";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus: "PENDING" | "PROCESSING" | "SHIPPING" | "DELIVERED" | "CANCELLED";
  shippingCarrier?: string;
  trackingCode?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  returnRequest?: ReturnRequest;
  transactionId?: string;
  notes?: string;
  dateTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: "admin" | "staff" | "customer";
  avatar?: string;
  phone?: string;
  address?: string;
}

export interface SizeRecommendationInput {
  heightCm: number;
  weightKg: number;
  gender: "Nam" | "Nữ" | "Unisex";
  category?: string;
  bodyFitPreference?: "Slim Fit" | "Regular Fit" | "Loose Fit / Thoải mái";
  chestCm?: number;
  waistCm?: number;
}

export interface SizeRecommendationResult {
  recommendedSize: string;
  alternativeSize?: string;
  confidenceScore: number;
  reason: string;
  fitAnalysis: string;
  matchedRuleId?: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "system";
  content: string;
  timestamp: string;
  quickReplies?: string[];
  recommendedProducts?: Product[];
  sizeRecommendation?: SizeRecommendationResult;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENT" | "FIXED_AMOUNT" | "percentage" | "fixed" | "free_shipping";
  discountValue: number;
  minOrderValue: number;
  maxDiscountAmount?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit?: number;
  usageCount?: number;
  usedCount?: number;
  isActive?: boolean;
  status?: string;
  description?: string;
}
