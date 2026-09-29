import mongoose, { Schema, Document } from "mongoose";
import { UserRole } from "../types/index.js";

export interface IUserDocument extends Document {
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

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, default: "" },
    role: { type: String, enum: ["ADMIN", "STAFF", "CUSTOMER"], default: "STAFF" },
    avatar: { type: String, default: "" },
    status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
    createdAt: { type: String, default: () => new Date().toISOString() },
    lastLoginAt: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
