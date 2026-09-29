import { create } from "zustand";

export type UserRole = "ADMIN" | "STAFF" | "CUSTOMER";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: "Active" | "Blocked";
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const STORAGE_TOKEN_KEY = "sportx_auth_token";
const STORAGE_USER_KEY = "sportx_auth_user";

// Load initial state from localStorage
const getInitialToken = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  } catch {
    return null;
  }
};

const getInitialUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = getInitialToken();
  const initialUser = getInitialUser();

  return {
    token: initialToken,
    user: initialUser,
    isAuthenticated: !!initialToken && !!initialUser,

    login: (token: string, user: AuthUser) => {
      try {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
      } catch (e) {
        console.error("Failed to persist auth to localStorage", e);
      }
      set({ token, user, isAuthenticated: true });
    },

    logout: () => {
      try {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
        localStorage.removeItem(STORAGE_USER_KEY);
      } catch (e) {
        console.error("Failed to clear auth from localStorage", e);
      }
      set({ token: null, user: null, isAuthenticated: false });
    },

    updateUser: (updatedFields: Partial<AuthUser>) => {
      const currentUser = get().user;
      if (!currentUser) return;
      const newUser = { ...currentUser, ...updatedFields };
      try {
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.error("Failed to update user in localStorage", e);
      }
      set({ user: newUser });
    },

    hasRole: (roles: UserRole | UserRole[]) => {
      const currentUser = get().user;
      if (!currentUser) return false;
      const roleList = Array.isArray(roles) ? roles : [roles];
      return roleList.includes(currentUser.role);
    },
  };
});
