import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { marketingService } from "@/services/api";

/**
 * Hook to fetch marketing coupons
 */
export function useCoupons() {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: marketingService.getCoupons,
  });
}

/**
 * Hook to create a new coupon
 */
export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => marketingService.createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

/**
 * Hook to update an existing coupon
 */
export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => marketingService.updateCoupon(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

/**
 * Hook to delete a coupon
 */
export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketingService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
  });
}

/**
 * Hook to test applying coupon
 */
export function useApplyCoupon() {
  return useMutation({
    mutationFn: (payload: { code: string; orderTotal: number }) =>
      marketingService.applyCoupon(payload),
  });
}
