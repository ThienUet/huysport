import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { orderService } from "@/services/api";

export interface OrderQueryParams {
  status?: string;
  search?: string;
  paymentMethod?: string;
}

export interface UpdateOrderStatusPayload {
  id: string;
  fulfillmentStatus?: string;
  paymentStatus?: string;
  shippingCarrier?: string;
  trackingCode?: string;
  cancelReason?: string;
  failedDeliveryAttempts?: number;
  transactionDetails?: any;
}

/**
 * Hook to fetch all orders with optional filter
 */
export function useOrders(params?: OrderQueryParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => orderService.getAll(params),
  });
}

/**
 * Hook to fetch a single order by ID
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => orderService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => orderService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

/**
 * Hook to update order fulfillment or payment status
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateOrderStatusPayload) => {
      const { id, ...data } = payload;
      return orderService.updateStatus(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-orders"] });
    },
  });
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { reason?: string; cancelledBy?: string } }) =>
      orderService.cancel(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}

/**
 * Hook to process customer return request (approve, reject, complete)
 */
export function useProcessReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: string; payload: { action: "approve" | "reject" | "complete"; adminNote?: string } }) =>
      orderService.processReturn(payload.id, payload.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
    },
  });
}
