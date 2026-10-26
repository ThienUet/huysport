import { useQuery } from "@tanstack/react-query";
import { productService, ProductQueryParams } from "@/services/productService";
import { Product } from "@/types";

/**
 * Hook to fetch products with filters (sport, category, price, search, etc.)
 */
export function useProducts(params?: ProductQueryParams) {
  return useQuery<{ success: boolean; data: Product[]; total?: number }>({
    queryKey: ["products", params],
    queryFn: () => productService.getProducts(params),
    staleTime: 1000 * 5, // 5 seconds
    refetchOnMount: true,
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(id: string) {
  return useQuery<{ success: boolean; data: Product }>({
    queryKey: ["product", id],
    queryFn: () => productService.getProductById(id),
    enabled: Boolean(id),
    staleTime: 0, // Always re-fetch when viewing product detail to guarantee latest info & price
    refetchOnMount: "always",
  });
}

/**
 * Hook to fetch featured products for homepage
 */
export function useFeaturedProducts() {
  return useQuery<Product[]>({
    queryKey: ["products", "featured"],
    queryFn: () => productService.getFeaturedProducts(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch new arrivals
 */
export function useNewArrivals() {
  return useQuery<Product[]>({
    queryKey: ["products", "new-arrivals"],
    queryFn: () => productService.getNewArrivals(),
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook for live debounced instant product search
 */
export function useSearchProducts(query: string) {
  const cleanQuery = query.trim();
  return useQuery<Product[]>({
    queryKey: ["client-search", cleanQuery],
    queryFn: () => productService.searchProducts(cleanQuery),
    enabled: cleanQuery.length > 0,
    staleTime: 1000 * 30, // 30 seconds
  });
}
