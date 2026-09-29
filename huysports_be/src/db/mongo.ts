import mongoose from "mongoose";
import {
  UserModel,
  ProductModel,
  OrderModel,
  CustomerModel,
  SizeRuleModel,
  FAQModel,
  ChatSessionModel,
  CouponModel,
  SettingsModel,
} from "../models/index.js";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SIZE_RULES,
  INITIAL_FAQS,
  INITIAL_CHAT_SESSIONS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
} from "./seed.js";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sportx_db";

export const connectMongoDB = async (): Promise<typeof mongoose> => {
  try {
    mongoose.set("strictQuery", false);
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`🌿 [MongoDB Connected]: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);

    // Auto-seed initial data if collections are empty
    await autoSeedDatabase();

    return conn;
  } catch (error: any) {
    console.error("❌ [MongoDB Connection Error]:", error.message);
    throw error;
  }
};

const autoSeedDatabase = async (): Promise<void> => {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Users collection into MongoDB...");
      await UserModel.insertMany(INITIAL_USERS);
    }

    const productCount = await ProductModel.countDocuments();
    if (productCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Products collection into MongoDB...");
      await ProductModel.insertMany(INITIAL_PRODUCTS);
    }

    const orderCount = await OrderModel.countDocuments();
    if (orderCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Orders collection into MongoDB...");
      await OrderModel.insertMany(INITIAL_ORDERS);
    }

    const customerCount = await CustomerModel.countDocuments();
    if (customerCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Customers collection into MongoDB...");
      await CustomerModel.insertMany(INITIAL_CUSTOMERS);
    }

    const sizeRuleCount = await SizeRuleModel.countDocuments();
    if (sizeRuleCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Size Rules collection into MongoDB...");
      await SizeRuleModel.insertMany(INITIAL_SIZE_RULES);
    }

    const faqCount = await FAQModel.countDocuments();
    if (faqCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding FAQs collection into MongoDB...");
      await FAQModel.insertMany(INITIAL_FAQS);
    }

    const sessionCount = await ChatSessionModel.countDocuments();
    if (sessionCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Chat Sessions collection into MongoDB...");
      await ChatSessionModel.insertMany(INITIAL_CHAT_SESSIONS);
    }

    const couponCount = await CouponModel.countDocuments();
    if (couponCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Coupons collection into MongoDB...");
      await CouponModel.insertMany(INITIAL_COUPONS);
    }

    const settingsCount = await SettingsModel.countDocuments();
    if (settingsCount === 0) {
      console.log("🌱 [Auto-Seed]: Seeding Settings collection into MongoDB...");
      await SettingsModel.create(INITIAL_SETTINGS);
    }

    console.log("✅ [Auto-Seed Complete]: All MongoDB collections verified & ready.");
  } catch (err: any) {
    console.error("⚠️ [Auto-Seed Warning]:", err.message);
  }
};
