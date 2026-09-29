import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import {
  Product,
  Order,
  Customer,
  SizeRule,
  FAQItem,
  ChatSession,
  Coupon,
  SystemSettings,
  User,
} from "../types/index.js";
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

interface DatabaseSchema {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  sizeRules: SizeRule[];
  faqs: FAQItem[];
  chatSessions: ChatSession[];
  coupons: Coupon[];
  settings: SystemSettings;
  users: User[];
}

class DataStore {
  private data: DatabaseSchema;
  private dbFilePath: string;

  constructor() {
    const dataDir = path.join(process.cwd(), "data");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.dbFilePath = path.join(dataDir, "db.json");
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbFilePath)) {
        const fileContent = fs.readFileSync(this.dbFilePath, "utf8");
        const parsed = JSON.parse(fileContent);
        if (!parsed.users || parsed.users.length === 0) {
          parsed.users = INITIAL_USERS;
          this.saveData(parsed);
        } else {
          // Ensure default seed users exist and have fresh hash
          for (const seedUser of INITIAL_USERS) {
            const idx = parsed.users.findIndex((u: User) => u.email.toLowerCase() === seedUser.email.toLowerCase());
            if (idx === -1) {
              parsed.users.push(seedUser);
            } else if (parsed.users[idx].passwordHash.startsWith("$2a$10$fWJ5Wp0v")) {
              parsed.users[idx].passwordHash = seedUser.passwordHash;
            }
          }
          this.saveData(parsed);
        }
        return parsed;
      }
    } catch (err) {
      console.warn("Could not read db.json, initializing from seed data:", err);
    }

    const defaultData: DatabaseSchema = {
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS,
      customers: INITIAL_CUSTOMERS,
      sizeRules: INITIAL_SIZE_RULES,
      faqs: INITIAL_FAQS,
      chatSessions: INITIAL_CHAT_SESSIONS,
      coupons: INITIAL_COUPONS,
      settings: INITIAL_SETTINGS,
      users: INITIAL_USERS,
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(this.dbFilePath, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      console.error("Failed to save db.json:", err);
    }
  }

  public persist() {
    this.saveData();
  }

  private isMongoReady(): boolean {
    return mongoose.connection.readyState === 1;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | null {
    return this.data.products.find((p) => p.id === id) || null;
  }

  public addProduct(product: Product): Product {
    this.data.products.unshift(product);
    this.persist();
    if (this.isMongoReady()) {
      ProductModel.create(product).catch((err: any) => console.error("Mongo ProductModel sync error:", err.message));
    }
    return product;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      ProductModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo ProductModel update error:", err.message)
      );
    }
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    const deleted = this.data.products.length < initialLen;
    if (deleted) {
      this.persist();
      if (this.isMongoReady()) {
        ProductModel.deleteOne({ id }).catch((err: any) => console.error("Mongo ProductModel delete error:", err.message));
      }
    }
    return deleted;
  }

  // --- Orders ---
  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | null {
    return this.data.orders.find((o) => o.id === id) || null;
  }

  public addOrder(order: Order): Order {
    this.data.orders.unshift(order);
    this.persist();
    if (this.isMongoReady()) {
      OrderModel.create(order).catch((err: any) => console.error("Mongo OrderModel sync error:", err.message));
    }
    return order;
  }

  public updateOrder(id: string, updates: Partial<Order>): Order | null {
    const index = this.data.orders.findIndex((o) => o.id === id);
    if (index === -1) return null;
    this.data.orders[index] = { ...this.data.orders[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      OrderModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo OrderModel update error:", err.message)
      );
    }
    return this.data.orders[index];
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return this.data.customers;
  }

  public getCustomerById(id: string): Customer | null {
    return this.data.customers.find((c) => c.id === id) || null;
  }

  public addCustomer(customer: Customer): Customer {
    this.data.customers.unshift(customer);
    this.persist();
    if (this.isMongoReady()) {
      CustomerModel.create(customer).catch((err: any) => console.error("Mongo CustomerModel sync error:", err.message));
    }
    return customer;
  }

  public updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const index = this.data.customers.findIndex((c) => c.id === id);
    if (index === -1) return null;
    this.data.customers[index] = { ...this.data.customers[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      CustomerModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo CustomerModel update error:", err.message)
      );
    }
    return this.data.customers[index];
  }

  // --- Size Rules (AI Chatbot) ---
  public getSizeRules(): SizeRule[] {
    return this.data.sizeRules;
  }

  public addSizeRule(rule: SizeRule): SizeRule {
    this.data.sizeRules.unshift(rule);
    this.persist();
    if (this.isMongoReady()) {
      SizeRuleModel.create(rule).catch((err: any) => console.error("Mongo SizeRuleModel sync error:", err.message));
    }
    return rule;
  }

  public updateSizeRule(id: string, updates: Partial<SizeRule>): SizeRule | null {
    const index = this.data.sizeRules.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.data.sizeRules[index] = { ...this.data.sizeRules[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      SizeRuleModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo SizeRuleModel update error:", err.message)
      );
    }
    return this.data.sizeRules[index];
  }

  public deleteSizeRule(id: string): boolean {
    const initialLen = this.data.sizeRules.length;
    this.data.sizeRules = this.data.sizeRules.filter((r) => r.id !== id);
    const deleted = this.data.sizeRules.length < initialLen;
    if (deleted) {
      this.persist();
      if (this.isMongoReady()) {
        SizeRuleModel.deleteOne({ id }).catch((err: any) => console.error("Mongo SizeRuleModel delete error:", err.message));
      }
    }
    return deleted;
  }

  // --- FAQs (AI Chatbot) ---
  public getFAQs(): FAQItem[] {
    return this.data.faqs;
  }

  public addFAQ(faq: FAQItem): FAQItem {
    this.data.faqs.unshift(faq);
    this.persist();
    if (this.isMongoReady()) {
      FAQModel.create(faq).catch((err: any) => console.error("Mongo FAQModel sync error:", err.message));
    }
    return faq;
  }

  public updateFAQ(id: string, updates: Partial<FAQItem>): FAQItem | null {
    const index = this.data.faqs.findIndex((f) => f.id === id);
    if (index === -1) return null;
    this.data.faqs[index] = { ...this.data.faqs[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      FAQModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo FAQModel update error:", err.message)
      );
    }
    return this.data.faqs[index];
  }

  public deleteFAQ(id: string): boolean {
    const initialLen = this.data.faqs.length;
    this.data.faqs = this.data.faqs.filter((f) => f.id !== id);
    const deleted = this.data.faqs.length < initialLen;
    if (deleted) {
      this.persist();
      if (this.isMongoReady()) {
        FAQModel.deleteOne({ id }).catch((err: any) => console.error("Mongo FAQModel delete error:", err.message));
      }
    }
    return deleted;
  }

  // --- Chat Sessions ---
  public getChatSessions(): ChatSession[] {
    return this.data.chatSessions;
  }

  public getChatSessionById(id: string): ChatSession | null {
    return this.data.chatSessions.find((s) => s.id === id) || null;
  }

  public addChatSession(session: ChatSession): ChatSession {
    this.data.chatSessions.unshift(session);
    this.persist();
    if (this.isMongoReady()) {
      ChatSessionModel.create(session).catch((err: any) => console.error("Mongo ChatSessionModel sync error:", err.message));
    }
    return session;
  }

  public updateChatSession(id: string, updates: Partial<ChatSession>): ChatSession | null {
    const index = this.data.chatSessions.findIndex((s) => s.id === id);
    if (index === -1) return null;
    this.data.chatSessions[index] = { ...this.data.chatSessions[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      ChatSessionModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo ChatSessionModel update error:", err.message)
      );
    }
    return this.data.chatSessions[index];
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public addCoupon(coupon: Coupon): Coupon {
    this.data.coupons.unshift(coupon);
    this.persist();
    if (this.isMongoReady()) {
      CouponModel.create(coupon).catch((err: any) => console.error("Mongo CouponModel sync error:", err.message));
    }
    return coupon;
  }

  public updateCoupon(id: string, updates: Partial<Coupon>): Coupon | null {
    const index = this.data.coupons.findIndex((cp) => cp.id === id);
    if (index === -1) return null;
    this.data.coupons[index] = { ...this.data.coupons[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      CouponModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo CouponModel update error:", err.message)
      );
    }
    return this.data.coupons[index];
  }

  public deleteCoupon(id: string): boolean {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((cp) => cp.id !== id);
    const deleted = this.data.coupons.length < initialLen;
    if (deleted) {
      this.persist();
      if (this.isMongoReady()) {
        CouponModel.deleteOne({ id }).catch((err: any) => console.error("Mongo CouponModel delete error:", err.message));
      }
    }
    return deleted;
  }

  // --- Users & RBAC ---
  public getUsers(): User[] {
    return this.data.users || [];
  }

  public getUserById(id: string): User | null {
    return (this.data.users || []).find((u) => u.id === id) || null;
  }

  public getUserByEmail(email: string): User | null {
    return (this.data.users || []).find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public createUser(user: User): User {
    if (!this.data.users) this.data.users = [];
    this.data.users.unshift(user);
    this.persist();
    if (this.isMongoReady()) {
      UserModel.create(user).catch((err: any) => console.error("Mongo UserModel sync error:", err.message));
    }
    return user;
  }

  public updateUser(id: string, updates: Partial<User>): User | null {
    if (!this.data.users) return null;
    const index = this.data.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.persist();
    if (this.isMongoReady()) {
      UserModel.findOneAndUpdate({ id }, { $set: updates }).catch((err: any) =>
        console.error("Mongo UserModel update error:", err.message)
      );
    }
    return this.data.users[index];
  }

  public deleteUser(id: string): boolean {
    if (!this.data.users) return false;
    const initialLen = this.data.users.length;
    this.data.users = this.data.users.filter((u) => u.id !== id);
    const deleted = this.data.users.length < initialLen;
    if (deleted) {
      this.persist();
      if (this.isMongoReady()) {
        UserModel.deleteOne({ id }).catch((err: any) => console.error("Mongo UserModel delete error:", err.message));
      }
    }
    return deleted;
  }

  // --- Settings ---
  public getSettings(): SystemSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.persist();
    if (this.isMongoReady()) {
      SettingsModel.findOneAndUpdate({}, { $set: updates }, { upsert: true }).catch((err: any) =>
        console.error("Mongo SettingsModel update error:", err.message)
      );
    }
    return this.data.settings;
  }
}

export const db = new DataStore();
