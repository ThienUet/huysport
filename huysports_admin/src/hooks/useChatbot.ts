import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/services/api";

/**
 * Hook to fetch size rules
 */
export function useSizeRules() {
  return useQuery({
    queryKey: ["size-rules"],
    queryFn: chatbotService.getSizeRules,
  });
}

/**
 * Hook to create a size rule
 */
export function useCreateSizeRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => chatbotService.createSizeRule(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-rules"] });
    },
  });
}

/**
 * Hook to update a size rule
 */
export function useUpdateSizeRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      chatbotService.updateSizeRule(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-rules"] });
    },
  });
}

/**
 * Hook to delete a size rule
 */
export function useDeleteSizeRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatbotService.deleteSizeRule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-rules"] });
    },
  });
}

/**
 * Hook to fetch chatbot FAQs
 */
export function useFAQs() {
  return useQuery({
    queryKey: ["faqs"],
    queryFn: chatbotService.getFAQs,
  });
}

/**
 * Hook to create FAQ
 */
export function useCreateFAQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => chatbotService.createFAQ(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

/**
 * Hook to update FAQ
 */
export function useUpdateFAQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      chatbotService.updateFAQ(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

/**
 * Hook to delete FAQ
 */
export function useDeleteFAQ() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatbotService.deleteFAQ(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
    },
  });
}

/**
 * Hook to recommend size using AI rule engine
 */
export function useRecommendSize() {
  return useMutation({
    mutationFn: (payload: { height: number; weight: number; gender?: string; fitPreference?: string }) =>
      chatbotService.recommendSize(payload),
  });
}

/**
 * Hook to process chatbot messages
 */
export function useProcessMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { message: string; sessionId?: string }) =>
      chatbotService.processMessage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
    },
  });
}

/**
 * Hook to fetch chat sessions
 */
export function useChatSessions() {
  return useQuery({
    queryKey: ["chat-sessions"],
    queryFn: chatbotService.getSessions,
  });
}
