import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Coupon } from "../types";

interface CartState {
  items: CartItem[];
  buyNowItem: CartItem | null;
  coupon: Coupon | null;
  discountAmount: number;
  isCartDrawerOpen: boolean;

  // Cart operations
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (sku: string) => void;
  updateQuantity: (sku: string, quantity: number) => void;
  toggleSelectItem: (sku: string) => void;
  toggleSelectAll: (select: boolean) => void;
  removeSelectedItems: () => void;
  clearCart: () => void;

  // Shopee-style separate "Mua Ngay" (Buy Now) item
  setBuyNowItem: (item: CartItem) => void;
  clearBuyNowItem: () => void;

  setCoupon: (coupon: Coupon | null, discountAmount: number) => void;
  removeCoupon: () => void;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Calculation helpers
  getSelectedItems: () => CartItem[];
  getSubtotal: (onlySelected?: boolean) => number;
  getShippingFee: (onlySelected?: boolean) => number;
  getTotal: (onlySelected?: boolean) => number;
  getItemCount: () => number;
  getSelectedCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      buyNowItem: null,
      coupon: null,
      discountAmount: 0,
      isCartDrawerOpen: false,

      addItem: (item, quantity = 1) => {
        const availableStock = typeof item.maxStock === "number" ? item.maxStock : 99;
        if (availableStock <= 0) {
          return;
        }

        set((state) => {
          const existingIndex = state.items.findIndex((i) => i.sku === item.sku);
          if (existingIndex > -1) {
            const updatedItems = [...state.items];
            const currentQty = updatedItems[existingIndex].quantity;
            const newQty = Math.min(currentQty + quantity, availableStock);
            updatedItems[existingIndex].quantity = newQty;
            updatedItems[existingIndex].maxStock = availableStock;
            updatedItems[existingIndex].selected = true; // Auto select when modified
            return { items: updatedItems, isCartDrawerOpen: true };
          } else {
            return {
              items: [
                ...state.items,
                {
                  ...item,
                  maxStock: availableStock,
                  quantity: Math.min(quantity, availableStock),
                  selected: true,
                },
              ],
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
          items: state.items.map((i) => {
            if (i.sku !== sku) return i;
            const limit = typeof i.maxStock === "number" ? i.maxStock : 99;
            return {
              ...i,
              quantity: Math.min(quantity, Math.max(1, limit)),
            };
          }),
        }));
      },

      toggleSelectItem: (sku) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.sku === sku ? { ...i, selected: i.selected === false ? true : false } : i
          ),
        }));
      },

      toggleSelectAll: (select) => {
        set((state) => ({
          items: state.items.map((i) => ({ ...i, selected: select })),
        }));
      },

      removeSelectedItems: () => {
        set((state) => ({
          items: state.items.filter((i) => i.selected === false),
          coupon: null,
          discountAmount: 0,
        }));
      },

      clearCart: () => {
        set({ items: [], coupon: null, discountAmount: 0 });
      },

      setBuyNowItem: (item) => {
        set({ buyNowItem: { ...item, selected: true } });
      },

      clearBuyNowItem: () => {
        set({ buyNowItem: null });
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

      getSelectedItems: () => {
        return get().items.filter((i) => i.selected !== false);
      },

      getSubtotal: (onlySelected = true) => {
        const targetList = onlySelected ? get().getSelectedItems() : get().items;
        return targetList.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getShippingFee: (onlySelected = true) => {
        const subtotal = get().getSubtotal(onlySelected);
        if (subtotal === 0) return 0;
        return subtotal >= 500000 ? 0 : 30000; // Free ship from 500.000đ
      },

      getTotal: (onlySelected = true) => {
        const subtotal = get().getSubtotal(onlySelected);
        if (subtotal === 0) return 0;
        const shipping = get().getShippingFee(onlySelected);
        const discount = get().discountAmount;
        return Math.max(0, subtotal + shipping - discount);
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSelectedCount: () => {
        return get().getSelectedItems().reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "sportx_client_cart",
    }
  )
);
