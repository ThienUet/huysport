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
  content: "Xin chào! Tôi là SportX AI Assistant. Tôi có thể tư vấn kích cỡ (Size), gợi ý trang phục thể thao hoặc hỗ trợ đơn hàng giúp bạn.",
  timestamp: new Date().toISOString(),
  quickReplies: [
    "Tư vấn chọn Size chuẩn xác",
    "Xem các sản phẩm bán chạy nhất",
    "Chính sách giao hàng & đổi trả",
    "Tra cứu tình trạng đơn hàng",
  ],
};

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set, get) => ({
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

      clearMessages: () => set({ messages: [INITIAL_GREETING] }),
    }),
    {
      name: "sportx_client_chatbot",
    }
  )
);
