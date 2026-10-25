import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ChatMessage } from "../types";

interface ChatbotState {
  isOpen: boolean;
  messages: ChatMessage[];
  sessionId: string;
  isTyping: boolean;
  setIsOpen: (open: boolean) => void;
  toggleOpen: () => void;
  addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  id: "msg-welcome",
  sender: "bot",
  content: "Xin chào bạn! 👋 Tôi là **Trợ Lý AI SportX**.\nTôi có thể giúp bạn:\n• 📐 **Tư vấn chọn Size chuẩn xác** theo chiều cao & cân nặng\n• 👟 **Gợi ý trang phục & dụng cụ thể thao** chính hãng\n• 📦 **Tra cứu đơn hàng** realtime\n• 🛡️ **Hỗ trợ chính sách** đổi size 30 ngày & giao hàng\n\nBạn hãy gửi tin nhắn hoặc chọn nhanh gợi ý bên dưới nhé!",
  timestamp: new Date().toISOString(),
  quickReplies: [
    "Tư vấn size (Cao 1m75 nặng 70kg)",
    "Xem đồ bóng đá hot",
    "Giày chạy bộ êm ái",
    "Chính sách đổi trả 30 ngày",
  ],
};

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      isOpen: false,
      messages: [INITIAL_GREETING],
      sessionId: `session-${Date.now()}`,
      isTyping: false,

      setIsOpen: (open) => set({ isOpen: open }),
      toggleOpen: () => set((state) => ({ isOpen: !state.isOpen })),

      addMessage: (msg) => {
        const newMessage: ChatMessage = {
          ...msg,
          id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },

      setIsTyping: (typing) => set({ isTyping: typing }),

      clearMessages: () =>
        set({
          messages: [
            {
              ...INITIAL_GREETING,
              id: `msg-welcome-${Date.now()}`,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
    }),
    {
      name: "sportx_client_chatbot_v2", // use v2 to ensure users get fresh start
    }
  )
);
