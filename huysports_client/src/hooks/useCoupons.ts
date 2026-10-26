import { useMutation, useQuery } from "@tanstack/react-query";
import { couponService } from "@/services/couponService";

/**
 * Hook to validate coupon code against order value
 */
export function useValidateCoupon() {
  return useMutation({
    mutationFn: ({ code, orderValue }: { code: string; orderValue: number }) =>
      couponService.validateCoupon(code, orderValue),
  });
}

/**
 * Hook to get active public coupons
 */
export function useActiveCoupons() {
  return useQuery({
    queryKey: ["active-coupons"],
    queryFn: () => couponService.getActiveCoupons(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
