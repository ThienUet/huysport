import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api";

/**
 * Hook to fetch dashboard summary KPI statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: dashboardService.getStats,
  });
}

/**
 * Hook to fetch revenue chart data by timeframe
 */
export function useRevenueChart(timeframe: "week" | "month" | "year" = "month") {
  return useQuery({
    queryKey: ["dashboard-chart", timeframe],
    queryFn: () => dashboardService.getRevenueChart(timeframe),
  });
}

/**
 * Hook to fetch best selling products for dashboard
 */
export function useTopProducts() {
  return useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: dashboardService.getTopProducts,
  });
}
