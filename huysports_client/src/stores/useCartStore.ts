import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Coupon } from "../types";

interface CartState {
  items: CartItem[];
  coupon: Coupon | null;
  discountAmount: number;
  isCartDrawerOpen: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (coupon: Coupon | null, discountAmount: number) => void;
  removeCoupon: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      discountAmount: 0,
      isCartDrawerOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.sku === item.sku);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const newQty = Math.min(updatedItems[existingIndex].quantity + quantity, item.maxStock || 99);
            updatedItems[existingIndex].quantity = newQty;
            return { items: updatedItems, isCartDrawerOpen: true };
          } else {
            return {
              items: [...state.items, { ...item, quantity: Math.min(quantity, item.maxStock || 99) }],
              isCartDrawerOpen: true,
            };
          }
        });
      },

      removeItem: (sku) => {
        set((state) => ({
          items: state.items.filter((i) => i.sku !== sku),
        }));
      },

      updateQuantity: (sku, quantity) => {
        if (quantity <= 0) {
          get().removeItem(sku);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.sku === sku ? { ...i, quantity: Math.min(quantity, i.maxStock || 99) } : i)),
        }));
      },

      clearCart: () => {
        set({ items: [], coupon: null, discountAmount: 0 });
      },

      setCoupon: (coupon, discountAmount) => {
        set({ coupon, discountAmount });
      },

      removeCoupon: () => {
        set({ coupon: null, discountAmount: 0 });
      },

      setIsCartDrawerOpen: (open) => {
        set({ isCartDrawerOpen: open });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal >= 500000 ? 0 : 30000; // Free ship from 500.000đ
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = get().getShippingFee();
        const discount = get().discountAmount;
        return Math.max(0, subtotal + shipping - discount);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "sportx_client_cart",
    }
  )
);
