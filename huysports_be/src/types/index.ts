// Domain types for SportX Backend System

export interface VariantItem {
  id: string;
  sku: string;
  color: string;
  colorHex: string;
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  sku: string;
  category: "Football" | "Running" | "Gym" | "Badminton";
  brand: string;
  basePrice: number;
  discountPrice?: number;
  thumbnail: string;
  icon: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  totalStock: number;
  status: "Active" | "Draft";
  description?: string;
  variants: VariantItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  size: string;
  color: string;
  colorHex: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  dateTime: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    address: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "VNPAY" | "MoMo" | "COD";
  paymentStatus: "Paid" | "Unpaid";
  fulfillmentStatus: "Pending Approval" | "Processing" | "Shipping" | "Completed" | "Canceled";
  transactionDetails?: {
    gateway: "VNPAY" | "MoMo" | "COD";
    transactionCode: string;
    timestamp: string;
    bankCode?: string;
    responseMessage?: string;
  };
  note?: string;
  createdAt?: string;
}

export interface ShippingAddressItem {
  id: string;
  label: "Home" | "Office" | "Other";
  recipientName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
}

export interface CustomerOrderHistory {
  id: string;
  orderNumber: string;
  date: string;
  itemsSummary: string;
  totalAmount: number;
  status: "Delivered" | "Shipping" | "Processing" | "Canceled";
}

export interface Customer {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatar: string;
  avatarBg: string;
  primaryAddress: string;
  joinedDate: string;
  totalOrders: number;
  lifetimeSpent: number;
  tier: "VIP" | "Loyal" | "New";
  status: "Active" | "Blocked";
  addresses: ShippingAddressItem[];
  orderHistory: CustomerOrderHistory[];
  createdAt?: string;
}

export interface SizeRule {
  id: string;
  ruleCode: string;
  category: "Apparel" | "Shoes" | "Training Gear";
  heightMin: number;
  heightMax: number;
  weightMin: number;
  weightMax: number;
  gender: "Male" | "Female" | "Unisex";
  suggestedSize: string;
  fitType: "Slim Fit" | "Regular Fit" | "Loose Fit";
  status: "Active" | "Inactive";
  note?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  intent: "Return Policy" | "Shipping Time" | "Product Care" | "Size Fitting" | "Payment & Warranty";
  confidence: number;
  usageCount: number;
  keywords?: string[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "agent";
  text: string;
  timestamp: string;
  productCard?: {
    id?: string;
    name: string;
    category: string;
    price: string;
    sizeSuggested?: string;
    thumbnail: string;
  };
}

export interface ChatSession {
  id: string;
  customerName: string;
  customerPhone: string;
  avatar: string;
  timestamp: string;
  lastMessage: string;
  status: "Bot Resolved" | "Product Recommended" | "Human Escalated";
  unreadCount?: number;
  messages: ChatMessage[];
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  startDate: string;
  endDate: string;
  status: "Active" | "Expired" | "Disabled";
}

export interface SystemSettings {
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  currency: string;
  shippingFeeDefault: number;
  freeShippingThreshold: number;
  vnpayEnabled: boolean;
  vnpayTmnCode: string;
  vnpayHashSecret: string;
  momoEnabled: boolean;
  momoPartnerCode: string;
  codEnabled: boolean;
  chatbotEnabled: boolean;
  chatbotAutoReply: boolean;
  defaultConfidenceThreshold: number;
}

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: "Active" | "Blocked";
  createdAt: string;
  lastLoginAt?: string;
}

export interface AuthUserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: "Active" | "Blocked";
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: string;
}

export interface LoginResponse {
  user: AuthUserResponse;
  tokens: AuthTokens;
}

