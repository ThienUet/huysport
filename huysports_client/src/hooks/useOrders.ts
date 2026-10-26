import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService, CreateOrderPayload } from "@/services/orderService";
import { Order } from "@/types";

/**
 * Hook to track/search orders by code, phone, or view all user orders
 */
export function useTrackOrders(searchQuery: string = "") {
  return useQuery<{ success: boolean; data: Order[] }>({
    queryKey: ["orders", searchQuery.trim()],
    queryFn: () => orderService.trackOrderByCode(searchQuery.trim()),
    staleTime: 1000 * 30,
  });
}

/**
 * Hook to get order details by ID
 */
export function useOrder(id: string) {
  return useQuery<{ success: boolean; data: Order }>({
    queryKey: ["order", id],
    queryFn: () => orderService.getOrderById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new order (Checkout)
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => orderService.createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

/**
 * Hook to cancel an order (Customer cancel)
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      orderService.cancelOrder(id, reason),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.id] });
    },
  });
}

/**
 * Hook to request return/refund
 */
export function useRequestReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      orderNumber: string;
      reason: string;
      detailedReason?: string;
      bankName?: string;
      bankAccount?: string;
      accountHolder?: string;
      refundAmount?: number;
    }) => orderService.requestReturn(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", variables.orderNumber] });
    },
  });
}
