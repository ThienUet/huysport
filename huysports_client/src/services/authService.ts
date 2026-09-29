import { api } from "./api";
import { User } from "../types";

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  role?: "ADMIN" | "STAFF" | "CUSTOMER";
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/login", payload);
    const data = res.data?.data || res.data;
    const token = data?.tokens?.accessToken || data?.accessToken || data?.token || res.data?.token || "";
    const rawUser = data?.user || res.data?.user;

    const user: User = {
      id: rawUser?.id || `usr-${Date.now()}`,
      fullName: rawUser?.fullName || "Khách Hàng",
      email: rawUser?.email || payload.email,
      role: (rawUser?.role || "CUSTOMER").toLowerCase() as any,
      avatar: rawUser?.avatar || "",
      phone: rawUser?.phone || "",
      address: rawUser?.address || "",
    };

    return {
      success: true,
      token,
      user,
      message: res.data?.message || "Đăng nhập thành công!",
    };
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const res = await api.post("/auth/register", {
      ...payload,
      role: payload.role || "CUSTOMER",
    });
    const data = res.data?.data || res.data;
    const token = data?.tokens?.accessToken || data?.accessToken || data?.token || res.data?.token || "";
    const rawUser = data?.user || res.data?.user;

    const user: User = {
      id: rawUser?.id || `usr-${Date.now()}`,
      fullName: rawUser?.fullName || payload.fullName,
      email: rawUser?.email || payload.email,
      role: (rawUser?.role || "CUSTOMER").toLowerCase() as any,
      avatar: rawUser?.avatar || "",
      phone: rawUser?.phone || payload.phone || "",
      address: rawUser?.address || "",
    };

    return {
      success: true,
      token,
      user,
      message: res.data?.message || "Đăng ký tài khoản thành công!",
    };
  },

  getMe: async (): Promise<{ success: boolean; user: User }> => {
    const res = await api.get("/auth/me");
    const rawUser = res.data?.data || res.data;
    return {
      success: true,
      user: {
        id: rawUser.id,
        fullName: rawUser.fullName,
        email: rawUser.email,
        role: (rawUser.role || "CUSTOMER").toLowerCase() as any,
        avatar: rawUser.avatar,
        phone: rawUser.phone,
        address: rawUser.address,
      },
    };
  },
};
