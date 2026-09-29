import mongoose, { Schema, Document } from "mongoose";
import { ChatMessage } from "../types/index.js";

export interface IChatSessionDocument extends Document {
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

const ChatMessageSchema = new Schema(
  {
    id: { type: String, required: true },
    sender: { type: String, enum: ["user", "bot", "agent"], required: true },
    text: { type: String, required: true },
    timestamp: { type: String, required: true },
    productCard: {
      id: { type: String },
      name: { type: String },
      category: { type: String },
      price: { type: String },
      sizeSuggested: { type: String },
      thumbnail: { type: String },
    },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSessionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    avatar: { type: String, default: "👤" },
    timestamp: { type: String, required: true },
    lastMessage: { type: String, required: true },
    status: {
      type: String,
      enum: ["Bot Resolved", "Product Recommended", "Human Escalated"],
      default: "Bot Resolved",
    },
    unreadCount: { type: Number, default: 0 },
    messages: [ChatMessageSchema],
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

export const ChatSessionModel =
  mongoose.models.ChatSession || mongoose.model<IChatSessionDocument>("ChatSession", ChatSessionSchema);
