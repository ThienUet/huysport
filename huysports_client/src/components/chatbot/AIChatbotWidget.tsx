"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import {
  FaXmark,
  FaPaperPlane,
  FaRobot,
  FaArrowRotateRight,
  FaChevronRight,
  FaMessage,
} from "react-icons/fa6";
import { useChatbotStore } from "@/stores/useChatbotStore";
import { chatbotService } from "@/services/chatbotService";

export default function AIChatbotWidget() {
  const {
    isOpen,
    setIsOpen,
    toggleOpen,
    messages,
    addMessage,
    isTyping,
    setIsTyping,
    clearMessages,
    sessionId,
  } = useChatbotStore();

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    addMessage({
      sender: "user",
      content: text,
    });
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await chatbotService.sendMessage(text, sessionId);
      setIsTyping(false);

      if (response.success) {
        addMessage({
          sender: "bot",
          content: response.reply || "Cảm ơn bạn! Tôi có thể hỗ trợ gì thêm?",
          quickReplies: response.quickReplies,
          recommendedProducts: response.recommendedProducts,
          sizeRecommendation: response.sizeRecommendation,
        });
      } else {
        addMessage({
          sender: "bot",
          content: "Tôi có thể giúp bạn tư vấn kích cỡ (Size), gợi ý các mẫu áo bóng đá/chạy bộ mới nhất, hoặc hướng dẫn chính sách giao hàng đổi trả!",
          quickReplies: ["Tư vấn size", "Xem sản phẩm Hot", "Chính sách đổi trả"],
        });
      }
    } catch {
      setIsTyping(false);
      addMessage({
        sender: "bot",
        content: "Dạ SportX đã nhận được câu hỏi. Bạn có thể cho tôi biết Chiều cao và Cân nặng để tôi tính toán size chuẩn nhất nhé!",
        quickReplies: ["Cao 1m70 nặng 65kg", "Chính sách giao hàng", "Áo bóng đá hot"],
      });
    }
  };

  return (
    <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={toggleOpen}
          className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
          aria-label="Mở Hỗ trợ Tư vấn"
        >
          <div className="relative flex items-center justify-center">
            <FaMessage className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-emerald-600 rounded-full" />
          </div>
          <span className="hidden sm:inline font-bold text-xs tracking-wide pr-1">Tư Vấn Size & SP</span>
        </button>
      )}

      {/* Responsive Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[390px] max-w-[400px] h-[500px] sm:h-[550px] max-h-[82vh] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="bg-emerald-600 text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-emerald-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-700 flex items-center justify-center text-white">
                <FaRobot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-white">Trợ Lý SportX</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-emerald-100 font-normal">Tư vấn size & hỗ trợ mua hàng</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearMessages}
                title="Làm mới cuộc trò chuyện"
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                <FaArrowRotateRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                <FaXmark className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-3 bg-gray-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                    <FaRobot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div className={`space-y-2 max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-xs"
                        : "bg-gray-100 text-gray-800 border border-gray-200/80 rounded-bl-xs shadow-2xs"
                    }`}
                  >
                    {msg.content}
                  </div>

                  {/* Size Recommendation Box */}
                  {msg.sizeRecommendation && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-700">Size phù hợp nhất:</span>
                        <span className="text-base font-bold text-emerald-600 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                          {msg.sizeRecommendation.recommendedSize}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-snug">
                        {msg.sizeRecommendation.fitAnalysis}
                      </p>
                    </div>
                  )}

                  {/* Recommended Products */}
                  {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                        Sản phẩm gợi ý:
                      </span>
                      <div className="space-y-1.5">
                        {msg.recommendedProducts.slice(0, 2).map((prod) => (
                          <div
                            key={prod.id}
                            className="p-2 rounded-xl bg-white border border-gray-200 flex gap-2 items-center hover:border-emerald-400 transition"
                          >
                            <img
                              src={prod.images?.[0] || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-bold text-[11px] text-gray-900 truncate">{prod.name}</h5>
                              <div className="text-[11px] font-bold text-emerald-600">
                                {prod.price.toLocaleString("vi-VN")}đ
                              </div>
                            </div>
                            <Link
                              href={`/products/${prod.id}`}
                              onClick={() => setIsOpen(false)}
                              className="p-1 rounded-md bg-gray-100 text-gray-700 hover:bg-emerald-600 hover:text-white transition flex-shrink-0"
                            >
                              <FaChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Replies */}
                  {msg.quickReplies && msg.quickReplies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {msg.quickReplies.map((reply, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(reply)}
                          className="px-2.5 py-1 text-[10px] sm:text-[11px] font-bold bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full transition cursor-pointer"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 items-center text-gray-400 text-xs">
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs">
                  <FaRobot className="w-3.5 h-3.5" />
                </div>
                <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-100" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce delay-200" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-gray-100">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-1.5"
            >
              <Input
                type="text"
                placeholder="Nhập tin nhắn..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                size="sm"
                radius="full"
                classNames={{
                  inputWrapper: "bg-gray-100 hover:bg-gray-200 border-none shadow-none text-xs",
                }}
              />
              <Button
                type="submit"
                isIconOnly
                size="sm"
                className="rounded-full h-8.5 w-8.5 min-w-[34px] bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                isDisabled={!inputValue.trim() || isTyping}
              >
                <FaPaperPlane className="w-3.5 h-3.5" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

