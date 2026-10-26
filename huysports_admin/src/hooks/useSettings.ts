import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/api";

/**
 * Hook to fetch system settings
 */
export function useSystemSettings() {
  return useQuery({
    queryKey: ["system-settings"],
    queryFn: settingsService.get,
  });
}

/**
 * Hook to update system settings
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => settingsService.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
    },
  });
}
