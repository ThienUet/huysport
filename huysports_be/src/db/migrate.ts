import mongoose from "mongoose";
import dotenv from "dotenv";
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
  INITIAL_USERS,
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  INITIAL_SIZE_RULES,
  INITIAL_FAQS,
  INITIAL_CHAT_SESSIONS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
} from "./seed.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sportx_db";

const printHeader = (title: string) => {
  console.log("\n=======================================================");
  console.log(`🚀 ${title}`);
  console.log("=======================================================\n");
};

const printHelp = () => {
  console.log(`
SportX Database Migration CLI
Usage: pnpm db:migrate [flag] (or tsx src/db/migrate.ts [flag])

Flags:
  --status              Show current database connection & collection document counts
  --fresh, -f           Drop all existing collections, re-create indexes, and seed initial data
  --seed, -s            Seed initial data into empty collections
  --drop                Drop all collections in the database
  --init                Ensure collections and indexes exist without dropping data
  --help, -h            Show this help message

Examples:
  pnpm db:fresh         # Fresh reset: drop everything & re-seed
  pnpm db:seed          # Seed initial demo data
  pnpm db:status        # Check database statistics
`);
};

const connectDB = async () => {
  mongoose.set("strictQuery", false);
  const conn = await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log(`🌿 [Connected]: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  return conn;
};

const showStatus = async () => {
  printHeader("MongoDB Database Status");
  const stats = [
    { Collection: "Users (users)", Count: await UserModel.countDocuments() },
    { Collection: "Products (products)", Count: await ProductModel.countDocuments() },
    { Collection: "Orders (orders)", Count: await OrderModel.countDocuments() },
    { Collection: "Customers (customers)", Count: await CustomerModel.countDocuments() },
    { Collection: "Size Rules (sizerules)", Count: await SizeRuleModel.countDocuments() },
    { Collection: "FAQs (faqs)", Count: await FAQModel.countDocuments() },
    { Collection: "Chat Sessions (chatsessions)", Count: await ChatSessionModel.countDocuments() },
    { Collection: "Coupons (coupons)", Count: await CouponModel.countDocuments() },
    { Collection: "Settings (settings)", Count: await SettingsModel.countDocuments() },
  ];

  console.table(stats);
};

const dropAll = async () => {
  printHeader("Dropping All Collections");
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.drop().catch(() => {});
    console.log(`🗑️  Dropped collection: ${collection.collectionName}`);
  }
  console.log("✅ All collections dropped successfully.");
};

const syncIndexes = async () => {
  console.log("⚡ Creating & synchronizing indexes...");
  await Promise.all([
    UserModel.syncIndexes(),
    ProductModel.syncIndexes(),
    OrderModel.syncIndexes(),
    CustomerModel.syncIndexes(),
    SizeRuleModel.syncIndexes(),
    FAQModel.syncIndexes(),
    ChatSessionModel.syncIndexes(),
    CouponModel.syncIndexes(),
    SettingsModel.syncIndexes(),
  ]);
  console.log("✅ Indexes synchronized successfully.");
};

const seedData = async (force: boolean = false) => {
  printHeader("Seeding Database Collections");

  // Users
  const userCount = await UserModel.countDocuments();
  if (userCount === 0 || force) {
    if (force) await UserModel.deleteMany({});
    await UserModel.insertMany(INITIAL_USERS);
    console.log(`🌱 Users seeded: ${INITIAL_USERS.length} accounts.`);
  } else {
    console.log(`ℹ️  Users already has ${userCount} records. Skipped.`);
  }

  // Products
  const prodCount = await ProductModel.countDocuments();
  if (prodCount === 0 || force) {
    if (force) await ProductModel.deleteMany({});
    await ProductModel.insertMany(INITIAL_PRODUCTS);
    console.log(`🌱 Products seeded: ${INITIAL_PRODUCTS.length} items.`);
  } else {
    console.log(`ℹ️  Products already has ${prodCount} records. Skipped.`);
  }

  // Orders
  const orderCount = await OrderModel.countDocuments();
  if (orderCount === 0 || force) {
    if (force) await OrderModel.deleteMany({});
    await OrderModel.insertMany(INITIAL_ORDERS);
    console.log(`🌱 Orders seeded: ${INITIAL_ORDERS.length} records.`);
  } else {
    console.log(`ℹ️  Orders already has ${orderCount} records. Skipped.`);
  }

  // Customers
  const custCount = await CustomerModel.countDocuments();
  if (custCount === 0 || force) {
    if (force) await CustomerModel.deleteMany({});
    await CustomerModel.insertMany(INITIAL_CUSTOMERS);
    console.log(`🌱 Customers seeded: ${INITIAL_CUSTOMERS.length} records.`);
  } else {
    console.log(`ℹ️  Customers already has ${custCount} records. Skipped.`);
  }

  // Size Rules
  const sizeCount = await SizeRuleModel.countDocuments();
  if (sizeCount === 0 || force) {
    if (force) await SizeRuleModel.deleteMany({});
    await SizeRuleModel.insertMany(INITIAL_SIZE_RULES);
    console.log(`🌱 Size Rules seeded: ${INITIAL_SIZE_RULES.length} rules.`);
  } else {
    console.log(`ℹ️  Size Rules already has ${sizeCount} records. Skipped.`);
  }

  // FAQs
  const faqCount = await FAQModel.countDocuments();
  if (faqCount === 0 || force) {
    if (force) await FAQModel.deleteMany({});
    await FAQModel.insertMany(INITIAL_FAQS);
    console.log(`🌱 FAQs seeded: ${INITIAL_FAQS.length} items.`);
  } else {
    console.log(`ℹ️  FAQs already has ${faqCount} records. Skipped.`);
  }

  // Chat Sessions
  const sessionCount = await ChatSessionModel.countDocuments();
  if (sessionCount === 0 || force) {
    if (force) await ChatSessionModel.deleteMany({});
    await ChatSessionModel.insertMany(INITIAL_CHAT_SESSIONS);
    console.log(`🌱 Chat Sessions seeded: ${INITIAL_CHAT_SESSIONS.length} sessions.`);
  } else {
    console.log(`ℹ️  Chat Sessions already has ${sessionCount} records. Skipped.`);
  }

  // Coupons
  const couponCount = await CouponModel.countDocuments();
  if (couponCount === 0 || force) {
    if (force) await CouponModel.deleteMany({});
    await CouponModel.insertMany(INITIAL_COUPONS);
    console.log(`🌱 Coupons seeded: ${INITIAL_COUPONS.length} coupons.`);
  } else {
    console.log(`ℹ️  Coupons already has ${couponCount} records. Skipped.`);
  }

  // Settings
  const settingsCount = await SettingsModel.countDocuments();
  if (settingsCount === 0 || force) {
    if (force) await SettingsModel.deleteMany({});
    await SettingsModel.create(INITIAL_SETTINGS);
    console.log(`🌱 Store Settings seeded.`);
  } else {
    console.log(`ℹ️  Settings already configured. Skipped.`);
  }

  console.log("\n✅ Database Seeding completed successfully!");
};

const run = async () => {
  const args = process.argv.slice(2);
  const flag = args[0];

  if (flag === "--help" || flag === "-h") {
    printHelp();
    process.exit(0);
  }

  try {
    await connectDB();

    if (flag === "--status") {
      await showStatus();
    } else if (flag === "--fresh" || flag === "-f") {
      await dropAll();
      await syncIndexes();
      await seedData(true);
      await showStatus();
    } else if (flag === "--seed" || flag === "-s") {
      await syncIndexes();
      await seedData(false);
      await showStatus();
    } else if (flag === "--drop") {
      await dropAll();
      await showStatus();
    } else {
      // Default: sync indexes and seed if empty
      console.log("ℹ️  Running default migration (init & seed if empty)...");
      await syncIndexes();
      await seedData(false);
      await showStatus();
    }

    await mongoose.disconnect();
    console.log("🌿 [Disconnected]: MongoDB session closed.");
    process.exit(0);
  } catch (error: any) {
    console.error("❌ [Migration Failed]:", error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
};

run();
