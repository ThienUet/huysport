import mongoose, { Schema, Document } from "mongoose";
import { OrderItem } from "../types/index.js";

export interface IOrderDocument extends Document {
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
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  couponCode?: string;
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
  returnRequest?: any;
}

const OrderItemSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    thumbnail: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    qty: { type: Number, required: true, default: 1 },
    unitPrice: { type: Number, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    orderNumber: { type: String, required: true, unique: true, index: true },
    dateTime: { type: String, required: true },
    customer: {
      id: { type: String },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      avatar: { type: String, default: "👤" },
      address: { type: String, required: true },
    },
    items: [OrderItemSchema],
    totalAmount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ["VNPAY", "MoMo", "COD"], required: true },
    paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    fulfillmentStatus: {
      type: String,
      enum: ["Pending Approval", "Processing", "Shipping", "Completed", "Canceled"],
      default: "Pending Approval",
    },
    transactionDetails: {
      gateway: { type: String },
      transactionCode: { type: String },
      timestamp: { type: String },
      bankCode: { type: String },
      responseMessage: { type: String },
    },
    note: { type: String },
    subtotal: { type: Number },
    shippingFee: { type: Number },
    discountAmount: { type: Number },
    couponCode: { type: String },
    returnRequest: {
      reason: { type: String },
      detailedReason: { type: String },
      bankName: { type: String },
      bankAccount: { type: String },
      accountHolder: { type: String },
      refundAmount: { type: Number },
      status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed"] },
      adminNote: { type: String },
      requestedAt: { type: String },
      processedAt: { type: String },
      completedAt: { type: String },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const OrderModel = mongoose.models.Order || mongoose.model<IOrderDocument>("Order", OrderSchema);
