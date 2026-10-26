import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/api";

/**
 * Hook to fetch analytics reports
 */
export function useAnalyticsReports() {
  return useQuery({
    queryKey: ["analytics-reports"],
    queryFn: analyticsService.getReports,
  });
}
