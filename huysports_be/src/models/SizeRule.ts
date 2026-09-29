import mongoose, { Schema, Document } from "mongoose";

export interface ISizeRuleDocument extends Document {
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

const SizeRuleSchema = new Schema<ISizeRuleDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    ruleCode: { type: String, required: true, unique: true, index: true },
    category: { type: String, enum: ["Apparel", "Shoes", "Training Gear"], required: true },
    heightMin: { type: Number, required: true },
    heightMax: { type: Number, required: true },
    weightMin: { type: Number, required: true },
    weightMax: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Unisex"], required: true },
    suggestedSize: { type: String, required: true },
    fitType: { type: String, enum: ["Slim Fit", "Regular Fit", "Loose Fit"], default: "Regular Fit" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    note: { type: String },
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

export const SizeRuleModel = mongoose.models.SizeRule || mongoose.model<ISizeRuleDocument>("SizeRule", SizeRuleSchema);
