import { useMutation, useQuery } from "@tanstack/react-query";
import { authService, LoginPayload, RegisterPayload } from "@/services/authService";

/**
 * Hook to get current logged in user profile
 */
export function useCurrentUser(enabled = true) {
  return useQuery({
    queryKey: ["client-auth-me"],
    queryFn: () => authService.getMe(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Hook to login client user
 */
export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),
  });
}

/**
 * Hook to register client user
 */
export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => authService.register(payload),
  });
}

/**
 * Hook to change password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      authService.changePassword(payload),
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (payload: { fullName?: string; phone?: string; address?: string }) =>
      authService.updateProfile(payload),
  });
}
