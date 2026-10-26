import mongoose, { Schema, Document } from "mongoose";
import { VariantItem } from "../types/index.js";

export interface IProductDocument extends Document {
  id: string;
  title: string;
  sku: string;
  category: "Football" | "Running" | "Gym" | "Badminton";
  brand: string;
  basePrice: number;
  discountPrice?: number;
  thumbnail: string;
  images?: string[];
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

const VariantItemSchema = new Schema(
  {
    id: { type: String, required: true },
    sku: { type: String, required: true },
    color: { type: String, required: true },
    colorHex: { type: String, required: true },
    size: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProductDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, index: true },
    category: { type: String, enum: ["Football", "Running", "Gym", "Badminton"], required: true },
    brand: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discountPrice: { type: Number },
    thumbnail: { type: String, required: true },
    images: [{ type: String }],
    icon: { type: String, default: "⚽" },
    sizes: [{ type: String }],
    colors: [
      {
        name: { type: String, required: true },
        hex: { type: String, required: true },
      },
    ],
    totalStock: { type: Number, required: true, default: 0 },
    status: { type: String, enum: ["Active", "Draft"], default: "Active" },
    description: { type: String },
    variants: [VariantItemSchema],
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

export const ProductModel = mongoose.models.Product || mongoose.model<IProductDocument>("Product", ProductSchema);
