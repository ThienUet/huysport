import { create } from "zustand";

interface FilterState {
  category: string;
  sport: string;
  gender: string;
  brand: string;
  size: string;
  minPrice: number;
  maxPrice: number;
  search: string;
  sort: string;
  setCategory: (category: string) => void;
  setSport: (sport: string) => void;
  setGender: (gender: string) => void;
  setBrand: (brand: string) => void;
  setSize: (size: string) => void;
  setPriceRange: (min: number, max: number) => void;
  setSearch: (search: string) => void;
  setSort: (sort: string) => void;
  resetFilters: () => void;
}

const INITIAL_FILTERS = {
  category: "all",
  sport: "all",
  gender: "all",
  brand: "all",
  size: "all",
  minPrice: 0,
  maxPrice: 3000000,
  search: "",
  sort: "featured",
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...INITIAL_FILTERS,

  setCategory: (category) => set({ category }),
  setSport: (sport) => set({ sport }),
  setGender: (gender) => set({ gender }),
  setBrand: (brand) => set({ brand }),
  setSize: (size) => set({ size }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setSearch: (search) => set({ search }),
  setSort: (sort) => set({ sort }),
  resetFilters: () => set({ ...INITIAL_FILTERS }),
}));
