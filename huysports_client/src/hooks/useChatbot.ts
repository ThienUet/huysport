import { useMutation } from "@tanstack/react-query";
import { chatbotService } from "@/services/chatbotService";
import { SizeRecommendationInput } from "@/types";

/**
 * Hook to recommend size using AI size engine
 */
export function useRecommendSize() {
  return useMutation({
    mutationFn: (input: SizeRecommendationInput) => chatbotService.recommendSize(input),
  });
}

/**
 * Hook to send message to AI Chatbot
 */
export function useChatbotMessage() {
  return useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      chatbotService.sendMessage(message, sessionId),
  });
}
