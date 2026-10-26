import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/api";

/**
 * Hook to login admin user
 */
export function useAdminLogin() {
  return useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      authService.login(payload),
  });
}

/**
 * Hook to register admin user
 */
export function useAdminRegister() {
  return useMutation({
    mutationFn: (payload: { email: string; password: string; fullName: string; phone?: string; role?: string }) =>
      authService.register(payload),
  });
}

/**
 * Hook to get current admin profile
 */
export function useAdminCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ["admin-me"],
    queryFn: authService.getMe,
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to fetch users list for user management
 */
export function useAdminUsers() {
  return useQuery({
    queryKey: ["admin-users"],
    queryFn: authService.getUsers,
  });
}

/**
 * Hook to update user role
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      authService.updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}

/**
 * Hook to toggle user active status
 */
export function useToggleUserStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authService.toggleUserStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
}
