import mongoose, { Schema, Document } from "mongoose";
import { ShippingAddressItem, CustomerOrderHistory } from "../types/index.js";

export interface ICustomerDocument extends Document {
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
}

const AddressSchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, enum: ["Home", "Office", "Other"], default: "Home" },
    recipientName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const OrderHistorySchema = new Schema(
  {
    id: { type: String, required: true },
    orderNumber: { type: String, required: true },
    date: { type: String, required: true },
    itemsSummary: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ["Delivered", "Shipping", "Processing", "Canceled"], default: "Processing" },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true },
    phone: { type: String, required: true },
    avatar: { type: String, default: "👤" },
    avatarBg: { type: String, default: "bg-blue-100 text-blue-700" },
    primaryAddress: { type: String, default: "" },
    joinedDate: { type: String, default: () => new Date().toISOString() },
    totalOrders: { type: Number, default: 0 },
    lifetimeSpent: { type: Number, default: 0.0 },
    tier: { type: String, enum: ["VIP", "Loyal", "New"], default: "New" },
    status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
    addresses: [AddressSchema],
    orderHistory: [OrderHistorySchema],
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

export const CustomerModel = mongoose.models.Customer || mongoose.model<ICustomerDocument>("Customer", CustomerSchema);
