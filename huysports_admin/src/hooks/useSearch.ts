import { useQuery } from "@tanstack/react-query";
import { searchService, GlobalSearchResult } from "@/services/api";

export type { GlobalSearchResult };

/**
 * Hook to execute global search across products, orders, customers
 */
export function useGlobalSearch(query: string) {
  const cleanQuery = query.trim();
  return useQuery<GlobalSearchResult>({
    queryKey: ["global-search", cleanQuery],
    queryFn: () => searchService.search(cleanQuery),
    enabled: cleanQuery.length > 0,
    staleTime: 1000 * 30, // 30s
  });
}
