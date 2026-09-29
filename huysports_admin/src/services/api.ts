import apiClient from "@/lib/axios";

// --- Dashboard Service ---
export const dashboardService = {
  getStats: async () => {
    const res = await apiClient.get("/dashboard/stats");
    return res.data.data;
  },
  getRevenueChart: async (timeframe: "week" | "month" | "year") => {
    const res = await apiClient.get(`/dashboard/revenue-chart?timeframe=${timeframe}`);
    return res.data.data;
  },
  getTopProducts: async () => {
    const res = await apiClient.get("/dashboard/top-products");
    return res.data.data;
  },
};

// --- Product Service ---
export const productService = {
  getAll: async (params?: { search?: string; category?: string; status?: string; brand?: string }) => {
    const res = await apiClient.get("/products", { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/products/${id}`);
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post("/products", payload);
    return res.data.data;
  },
  update: async (id: string, payload: any) => {
    const res = await apiClient.put(`/products/${id}`, payload);
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete(`/products/${id}`);
    return res.data;
  },
};

// --- Order Service ---
export const orderService = {
  getAll: async (params?: { status?: string; search?: string; paymentMethod?: string }) => {
    const res = await apiClient.get("/orders", { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/orders/${id}`);
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post("/orders", payload);
    return res.data.data;
  },
  updateStatus: async (id: string, payload: { fulfillmentStatus?: string; paymentStatus?: string; transactionDetails?: any }) => {
    const res = await apiClient.put(`/orders/${id}/status`, payload);
    return res.data.data;
  },
};

// --- Customer Service ---
export const customerService = {
  getAll: async (params?: { search?: string; tier?: string; status?: string }) => {
    const res = await apiClient.get("/customers", { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get(`/customers/${id}`);
    return res.data.data;
  },
  updateStatus: async (id: string, status: "Active" | "Blocked") => {
    const res = await apiClient.put(`/customers/${id}/status`, { status });
    return res.data.data;
  },
  update: async (id: string, payload: any) => {
    const res = await apiClient.put(`/customers/${id}`, payload);
    return res.data.data;
  },
};

// --- Chatbot & Size Rules & FAQ Service ---
export const chatbotService = {
  getSizeRules: async () => {
    const res = await apiClient.get("/chatbot/size-rules");
    return res.data.data;
  },
  createSizeRule: async (payload: any) => {
    const res = await apiClient.post("/chatbot/size-rules", payload);
    return res.data.data;
  },
  updateSizeRule: async (id: string, payload: any) => {
    const res = await apiClient.put(`/chatbot/size-rules/${id}`, payload);
    return res.data.data;
  },
  deleteSizeRule: async (id: string) => {
    const res = await apiClient.delete(`/chatbot/size-rules/${id}`);
    return res.data;
  },
  getFAQs: async () => {
    const res = await apiClient.get("/chatbot/faqs");
    return res.data.data;
  },
  createFAQ: async (payload: any) => {
    const res = await apiClient.post("/chatbot/faqs", payload);
    return res.data.data;
  },
  updateFAQ: async (id: string, payload: any) => {
    const res = await apiClient.put(`/chatbot/faqs/${id}`, payload);
    return res.data.data;
  },
  deleteFAQ: async (id: string) => {
    const res = await apiClient.delete(`/chatbot/faqs/${id}`);
    return res.data;
  },
  recommendSize: async (payload: { height: number; weight: number; gender?: string; fitPreference?: string }) => {
    const res = await apiClient.post("/chatbot/recommend-size", payload);
    return res.data.data;
  },
  processMessage: async (payload: { message: string; sessionId?: string }) => {
    const res = await apiClient.post("/chatbot/message", payload);
    return res.data.data;
  },
  getSessions: async () => {
    const res = await apiClient.get("/chatbot/sessions");
    return res.data.data;
  },
};

// --- Marketing / Coupon Service ---
export const marketingService = {
  getCoupons: async () => {
    const res = await apiClient.get("/coupons");
    return res.data.data;
  },
  createCoupon: async (payload: any) => {
    const res = await apiClient.post("/coupons", payload);
    return res.data.data;
  },
  updateCoupon: async (id: string, payload: any) => {
    const res = await apiClient.put(`/coupons/${id}`, payload);
    return res.data.data;
  },
  deleteCoupon: async (id: string) => {
    const res = await apiClient.delete(`/coupons/${id}`);
    return res.data;
  },
  applyCoupon: async (payload: { code: string; orderTotal: number }) => {
    const res = await apiClient.post("/coupons/apply", payload);
    return res.data.data;
  },
};

// --- Analytics Service ---
export const analyticsService = {
  getReports: async () => {
    const res = await apiClient.get("/analytics/reports");
    return res.data.data;
  },
};

// --- Settings Service ---
export const settingsService = {
  get: async () => {
    const res = await apiClient.get("/settings");
    return res.data.data;
  },
  update: async (payload: any) => {
    const res = await apiClient.put("/settings", payload);
    return res.data.data;
  },
};

// --- Payment Service ---
export const paymentService = {
  createVNPayUrl: async (payload: { orderId?: string; amount?: number; orderInfo?: string }) => {
    const res = await apiClient.post("/payment/vnpay/create-url", payload);
    return res.data.data;
  },
};

// --- Auth & RBAC Service ---
export const authService = {
  login: async (payload: { email: string; password: string }) => {
    const res = await apiClient.post("/auth/login", payload);
    return res.data;
  },
  register: async (payload: { email: string; password: string; fullName: string; phone?: string; role?: string }) => {
    const res = await apiClient.post("/auth/register", payload);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get("/auth/me");
    return res.data.data;
  },
  changePassword: async (payload: { currentPassword: string; newPassword: string }) => {
    const res = await apiClient.post("/auth/change-password", payload);
    return res.data;
  },
  getUsers: async () => {
    const res = await apiClient.get("/auth/users");
    return res.data.data;
  },
  updateUserRole: async (id: string, role: string) => {
    const res = await apiClient.patch(`/auth/users/${id}/role`, { role });
    return res.data.data;
  },
  toggleUserStatus: async (id: string) => {
    const res = await apiClient.patch(`/auth/users/${id}/status`);
    return res.data.data;
  },
};

