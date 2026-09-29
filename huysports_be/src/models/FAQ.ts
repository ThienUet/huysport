import mongoose, { Schema, Document } from "mongoose";

export interface IFAQDocument extends Document {
  id: string;
  question: string;
  answer: string;
  intent: "Return Policy" | "Shipping Time" | "Product Care" | "Size Fitting" | "Payment & Warranty";
  confidence: number;
  usageCount: number;
}

const FAQSchema = new Schema<IFAQDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    intent: {
      type: String,
      enum: ["Return Policy", "Shipping Time", "Product Care", "Size Fitting", "Payment & Warranty"],
      required: true,
    },
    confidence: { type: Number, default: 0.95 },
    usageCount: { type: Number, default: 0 },
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

export const FAQModel = mongoose.models.FAQ || mongoose.model<IFAQDocument>("FAQ", FAQSchema);
