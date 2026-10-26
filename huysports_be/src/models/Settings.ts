import mongoose, { Schema, Document } from "mongoose";

export interface ISettingsDocument extends Document {
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
  codEnabled: boolean;
  chatbotEnabled: boolean;
  chatbotAutoReply: boolean;
  defaultConfidenceThreshold: number;
}

const SettingsSchema = new Schema<ISettingsDocument>(
  {
    storeName: { type: String, required: true },
    storeEmail: { type: String, required: true },
    storePhone: { type: String, required: true },
    storeAddress: { type: String, required: true },
    currency: { type: String, default: "USD ($)" },
    shippingFeeDefault: { type: Number, default: 5.0 },
    freeShippingThreshold: { type: Number, default: 100.0 },
    vnpayEnabled: { type: Boolean, default: true },
    vnpayTmnCode: { type: String, default: "SPORTX01" },
    vnpayHashSecret: { type: String, default: "ABCXYZ1234567890SPORTXSECRETKEY" },
    codEnabled: { type: Boolean, default: true },
    chatbotEnabled: { type: Boolean, default: true },
    chatbotAutoReply: { type: Boolean, default: true },
    defaultConfidenceThreshold: { type: Number, default: 0.75 },
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

export const SettingsModel =
  mongoose.models.Settings || mongoose.model<ISettingsDocument>("Settings", SettingsSchema);
