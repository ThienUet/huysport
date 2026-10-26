import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "@/services/api";

export interface CustomerQueryParams {
  search?: string;
  tier?: string;
  status?: string;
}

/**
 * Hook to fetch customer list with filters
 */
export function useCustomers(params?: CustomerQueryParams) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customerService.getAll(params),
  });
}

/**
 * Hook to fetch a single customer by ID
 */
export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => customerService.getById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to toggle customer status (Active | Blocked)
 */
export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "Active" | "Blocked" }) =>
      customerService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

/**
 * Hook to update customer profile info
 */
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      customerService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
