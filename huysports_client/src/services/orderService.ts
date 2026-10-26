import { api } from "./api";
import { Order } from "../types";

export interface CreateOrderPayload {
  customer: {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    fullName: string;
    phone: string;
    email: string;
    city: string;
    district: string;
    ward: string;
    addressLine: string;
    note?: string;
  };
  items: {
    productId: string;
    productName: string;
    productImage: string;
    sku: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
  }[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: "COD" | "VNPAY";
  notes?: string;
}

const normalizeOrder = (raw: any): Order => {
  return {
    id: String(raw.id || `ord-${Date.now()}`),
    orderNumber: raw.orderNumber || `#SPX-${Math.floor(1000 + Math.random() * 9000)}`,
    customer: {
      id: raw.customer?.id,
      fullName: raw.customer?.name || raw.customer?.fullName || "Khách Hàng",
      email: raw.customer?.email || "customer@sportx.store",
      phone: raw.customer?.phone || "0398802022",
    },
    shippingAddress: {
      fullName: raw.shippingAddress?.fullName || raw.customer?.name || "Khách Hàng",
      phone: raw.shippingAddress?.phone || raw.customer?.phone || "0398802022",
      email: raw.shippingAddress?.email || raw.customer?.email || "customer@sportx.store",
      city: raw.shippingAddress?.city || "Hà Nội",
      district: raw.shippingAddress?.district || "Sơn Tây",
      ward: raw.shippingAddress?.ward || "Xuân Khanh",
      addressLine: raw.shippingAddress?.addressLine || raw.customer?.address || "Xuân Khanh, Sơn Tây, Hà Nội",
      note: raw.note || raw.notes || "",
    },
    items: Array.isArray(raw.items)
      ? raw.items.map((i: any) => {
          const isValidUrl = (url: any) => typeof url === "string" && (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/"));
          const resolvedImage = isValidUrl(i.productImage)
            ? i.productImage
            : isValidUrl(i.thumbnail)
            ? i.thumbnail
            : "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500";
          return {
            productId: i.productId || i.id || "p-1",
            productName: i.productName || i.name || "Sản phẩm SportX",
            productImage: resolvedImage,
            sku: i.sku || "SPX-001",
            size: i.size || "L",
            color: i.color || "Mặc định",
            price: Number(i.price || i.unitPrice || 250000),
            quantity: Number(i.quantity || i.qty || 1),
          };
        })
      : [],
    subtotal: Number(raw.subtotal || raw.totalAmount || 0),
    shippingFee: Number(raw.shippingFee || 0),
    discountAmount: Number(raw.discountAmount || 0),
    couponCode: raw.couponCode,
    totalAmount: Number(raw.totalAmount || 0),
    paymentMethod: raw.paymentMethod || "COD",
    paymentStatus: raw.paymentStatus === "Paid" ? "PAID" : "PENDING",
    fulfillmentStatus:
      raw.fulfillmentStatus === "Completed"
        ? "DELIVERED"
        : raw.fulfillmentStatus === "Shipping"
        ? "SHIPPING"
        : raw.fulfillmentStatus === "Processing"
        ? "PROCESSING"
        : raw.fulfillmentStatus === "Canceled"
        ? "CANCELLED"
        : "PENDING",
    transactionId: raw.transactionDetails?.transactionCode,
    shippingCarrier: raw.shippingCarrier,
    trackingCode: raw.trackingCode,
    cancelReason: raw.cancelReason,
    cancelledAt: raw.cancelledAt,
    cancelledBy: raw.cancelledBy,
    returnRequest: raw.returnRequest,
    notes: raw.note || raw.notes,
    createdAt: raw.createdAt || new Date().toISOString(),
    updatedAt: raw.updatedAt || new Date().toISOString(),
  };
};

export const orderService = {
  createOrder: async (payload: CreateOrderPayload): Promise<{ success: boolean; data: Order; paymentUrl?: string }> => {
    // Map to backend schema
    const backendPayload = {
      customer: {
        id: payload.customer.id,
        name: payload.shippingAddress.fullName,
        email: payload.shippingAddress.email,
        phone: payload.shippingAddress.phone,
        address: `${payload.shippingAddress.addressLine}, ${payload.shippingAddress.ward}, ${payload.shippingAddress.district}, ${payload.shippingAddress.city}`,
      },
      items: payload.items.map((item) => ({
        id: item.productId,
        sku: item.sku,
        name: item.productName,
        category: "Sportswear",
        thumbnail: item.productImage,
        size: item.size,
        color: item.color,
        colorHex: "#0F172A",
        qty: item.quantity,
        unitPrice: item.price,
      })),
      subtotal: payload.subtotal,
      shippingFee: payload.shippingFee,
      discountAmount: payload.discountAmount,
      couponCode: payload.couponCode,
      totalAmount: payload.totalAmount,
      paymentMethod: payload.paymentMethod,
      note: payload.notes,
    };

    try {
      const res = await api.post("/orders", backendPayload);
      const raw = res.data?.data || res.data;
      const normalized = normalizeOrder(raw);

      // Save to local storage cache of client orders
      if (typeof window !== "undefined") {
        const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        localStorage.setItem("sportx_local_orders", JSON.stringify([normalized, ...existing]));
      }

      return {
        success: true,
        data: normalized,
        paymentUrl: res.data?.paymentUrl,
      };
    } catch (err: any) {
      // If backend responded with validation/stock error, bubble it up to UI!
      if (err.response?.data?.message) {
        throw new Error(err.response.data.message);
      }

      // If genuine network failure and no response
      if (!err.response) {
        const localOrderNumber = `SPX-${Math.floor(1000 + Math.random() * 9000)}`;
        const fallbackOrder: Order = {
          id: `ord-${Date.now()}`,
          orderNumber: localOrderNumber,
          customer: payload.customer,
          shippingAddress: payload.shippingAddress,
          items: payload.items,
          subtotal: payload.subtotal,
          shippingFee: payload.shippingFee,
          discountAmount: payload.discountAmount,
          couponCode: payload.couponCode,
          totalAmount: payload.totalAmount,
          paymentMethod: payload.paymentMethod,
          paymentStatus: payload.paymentMethod === "COD" ? "PENDING" : "PAID",
          fulfillmentStatus: "PROCESSING",
          notes: payload.notes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (typeof window !== "undefined") {
          const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
          localStorage.setItem("sportx_local_orders", JSON.stringify([fallbackOrder, ...existing]));
        }

        return {
          success: true,
          data: fallbackOrder,
        };
      }

      throw new Error(err.message || "Đã xảy ra lỗi khi tạo đơn hàng!");
    }
  },

  getOrderById: async (id: string): Promise<{ success: boolean; data: Order }> => {
    try {
      const cleanId = id.replace(/^#/, "");
      const res = await api.get(`/orders/${cleanId}`);
      return { success: true, data: normalizeOrder(res.data?.data || res.data) };
    } catch {
      if (typeof window !== "undefined") {
        const cleanId = id.replace(/^#/, "").toLowerCase();
        const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        const found = existing.find(
          (o) => o.id === id || o.orderNumber.replace(/^#/, "").toLowerCase() === cleanId
        );
        if (found) return { success: true, data: found };
      }
      throw new Error("Không tìm thấy đơn hàng");
    }
  },

  trackOrderByCode: async (orderNumberOrPhone: string): Promise<{ success: boolean; data: Order[] }> => {
    try {
      const q = orderNumberOrPhone.trim();
      const cleanQ = q.replace(/^#/, "");
      const res = await api.get("/orders", {
        params: cleanQ ? { search: cleanQ } : {},
      });
      const rawList = res.data?.data || res.data || [];
      if (Array.isArray(rawList) && rawList.length > 0) {
        return { success: true, data: rawList.map(normalizeOrder) };
      }
      // Check local storage
      if (typeof window !== "undefined") {
        const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        if (!cleanQ) {
          return { success: true, data: existing };
        }
        const lowerQ = cleanQ.toLowerCase();
        const found = existing.filter(
          (o) =>
            o.orderNumber.replace(/^#/, "").toLowerCase().includes(lowerQ) ||
            o.shippingAddress?.phone.includes(lowerQ) ||
            o.customer?.email?.toLowerCase().includes(lowerQ)
        );
        return { success: true, data: found };
      }
      return { success: true, data: [] };
    } catch {
      if (typeof window !== "undefined") {
        const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        const q = orderNumberOrPhone.trim();
        const cleanQ = q.replace(/^#/, "");
        if (!cleanQ) {
          return { success: true, data: existing };
        }
        const lowerQ = cleanQ.toLowerCase();
        const found = existing.filter(
          (o) =>
            o.orderNumber.replace(/^#/, "").toLowerCase().includes(lowerQ) ||
            o.shippingAddress?.phone.includes(lowerQ) ||
            o.customer?.email?.toLowerCase().includes(lowerQ)
        );
        return { success: true, data: found };
      }
      return { success: true, data: [] };
    }
  },

  createVNPayUrl: async (orderId: string, amount: number, orderInfo: string): Promise<{ paymentUrl: string }> => {
    const res = await api.post("/payment/vnpay/create-payment-url", {
      orderId,
      amount,
      orderInfo,
    });
    return res.data;
  },

  cancelOrder: async (id: string, reason: string): Promise<{ success: boolean; message: string; data?: Order }> => {
    try {
      const cleanId = (id || "").replace(/^#/, "");
      const res = await api.post(`/orders/${encodeURIComponent(cleanId)}/cancel`, {
        reason,
        cancelledBy: "customer",
      });

      // Update local storage if present
      if (typeof window !== "undefined") {
        const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        const updated = existing.map((o) => {
          const oClean = (o.orderNumber || "").replace(/^#/, "");
          return o.id === id || o.orderNumber === id || oClean === cleanId || o.id === cleanId
            ? { ...o, fulfillmentStatus: "CANCELLED" as const, cancelReason: reason }
            : o;
        });
        localStorage.setItem("sportx_local_orders", JSON.stringify(updated));
      }

      return {
        success: true,
        message: res.data?.message || "Đã hủy đơn hàng thành công.",
        data: res.data?.data ? normalizeOrder(res.data.data) : undefined,
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Không thể hủy đơn hàng");
    }
  },

  requestReturn: async (payload: {
    orderNumber: string;
    reason: string;
    detailedReason?: string;
    bankName?: string;
    bankAccount?: string;
    accountHolder?: string;
    refundAmount?: number;
  }): Promise<{ success: boolean; message: string; data?: Order }> => {
    try {
      const res = await api.post(`/orders/${payload.orderNumber}/return-request`, payload);

      // Update local storage if present
      if (typeof window !== "undefined") {
        const existing: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        const updated = existing.map((o) =>
          o.orderNumber === payload.orderNumber || o.id === payload.orderNumber
            ? {
                ...o,
                returnRequest: {
                  reason: payload.reason,
                  detailedReason: payload.detailedReason,
                  bankName: payload.bankName,
                  bankAccount: payload.bankAccount,
                  accountHolder: payload.accountHolder,
                  refundAmount: payload.refundAmount || o.totalAmount,
                  status: "Pending" as const,
                  requestedAt: new Date().toISOString(),
                },
              }
            : o
        );
        localStorage.setItem("sportx_local_orders", JSON.stringify(updated));
      }

      return {
        success: true,
        message: res.data?.message || "Đã gửi yêu cầu đổi trả / hoàn hàng thành công.",
        data: res.data?.data ? normalizeOrder(res.data.data) : undefined,
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || "Không thể gửi yêu cầu hoàn hàng");
    }
  },
};
