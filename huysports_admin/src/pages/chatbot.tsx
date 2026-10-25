import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { formatDateTime } from "@/utils/formatUtils";
import {
  Bot,
  Ruler,
  HelpCircle,
  MessageSquare,
  Search,
  Plus,
  Trash2,
  Sparkles,
  Send,
  User,
} from "lucide-react";

type ChatbotTab = "size_rules" | "faq" | "logs";

export interface SizeRule {
  id: string;
  ruleCode: string;
  category: "Apparel" | "Shoes" | "Training Gear";
  heightMin: number;
  heightMax: number;
  weightMin: number;
  weightMax: number;
  gender: "Male" | "Female" | "Unisex";
  suggestedSize: string;
  fitType: "Slim Fit" | "Regular Fit" | "Loose Fit";
  status: "Active" | "Inactive";
  note?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  intent: "Return Policy" | "Shipping Time" | "Product Care" | "Size Fitting" | "Payment & Warranty";
  confidence: number;
  usageCount: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "bot" | "agent";
  text: string;
  timestamp: string;
  productCard?: {
    id?: string;
    name: string;
    category: string;
    price: string;
    sizeSuggested?: string;
    thumbnail: string;
  };
}

export interface ChatSession {
  id: string;
  customerName: string;
  customerPhone: string;
  avatar: string;
  timestamp: string;
  lastMessage: string;
  status: "Bot Resolved" | "Product Recommended" | "Human Escalated";
  unreadCount?: number;
  messages: ChatMessage[];
}

const INITIAL_SESSIONS: ChatSession[] = [
  {
    id: "session-1",
    customerName: "Mark Davidson",
    customerPhone: "+84 912 888 111",
    avatar: "MD",
    timestamp: "14:32 Today",
    lastMessage: "Got it! Based on 172cm & 68kg, Size M is optimal...",
    status: "Product Recommended",
    messages: [
      {
        id: "m1",
        sender: "user",
        text: "Hi! I am looking for lightweight running shoes for 10km training.",
        timestamp: "14:30",
      },
      {
        id: "m2",
        sender: "bot",
        text: "Hello Mark! 🏃‍♂️ I'd love to help you find the ideal pair. What is your height, weight, and normal shoe size?",
        timestamp: "14:30",
      },
      {
        id: "m3",
        sender: "user",
        text: "I am 172cm tall, weight 68kg, normally wear size 41 or 42.",
        timestamp: "14:31",
      },
      {
        id: "m4",
        sender: "bot",
        text: "Got it! Based on 172cm & 68kg with neutral arch cushioning, **Size M (EU 41.5)** will give you the most responsive fit. Here is our best seller:",
        timestamp: "14:32",
        productCard: {
          name: "Adidas Ultraboost Light Running Shoes",
          category: "Running • Boost Cushioning",
          price: "$149.00 (Was $190.00)",
          sizeSuggested: "Recommended: EU 41.5 / Size M",
          thumbnail: "🏃",
        },
      },
      {
        id: "m5",
        sender: "user",
        text: "Awesome, does it come with free return if it doesn't fit?",
        timestamp: "14:33",
      },
      {
        id: "m6",
        sender: "bot",
        text: "Yes, 100%! SportX offers 30-day free door-to-door size exchange. Would you like to add it to your cart or pay via VNPAY / MoMo?",
        timestamp: "14:33",
      },
    ],
  },
  {
    id: "session-2",
    customerName: "Sarah Jenkins",
    customerPhone: "+84 908 777 666",
    avatar: "SJ",
    timestamp: "13:15 Today",
    lastMessage: "Thank you for the quick shipping info!",
    status: "Bot Resolved",
    messages: [
      {
        id: "s2-1",
        sender: "user",
        text: "Hello, if I order a football boot now to District 1, when will it arrive?",
        timestamp: "13:12",
      },
      {
        id: "s2-2",
        sender: "bot",
        text: "Hi Sarah! Orders placed before 15:00 to District 1, HCMC qualify for SportX Same-Day Fast Delivery. You will receive it by 18:30 today!",
        timestamp: "13:13",
      },
      {
        id: "s2-3",
        sender: "user",
        text: "Thank you for the quick shipping info!",
        timestamp: "13:15",
      },
    ],
  },
  {
    id: "session-3",
    customerName: "Nguyen Hoang Long",
    customerPhone: "+84 933 222 111",
    avatar: "HL",
    timestamp: "11:40 Today",
    lastMessage: "I want to speak with a human support agent regarding racket string tension.",
    status: "Human Escalated",
    messages: [
      {
        id: "s3-1",
        sender: "user",
        text: "Can I request custom 28 lbs string tension on Yonex Astrox 88D Pro?",
        timestamp: "11:38",
      },
      {
        id: "s3-2",
        sender: "bot",
        text: "Yes, we provide professional electronic stringing service. For high tensions above 27 lbs, I am connecting you with our Master Stringing Specialist.",
        timestamp: "11:39",
      },
      {
        id: "s3-3",
        sender: "user",
        text: "I want to speak with a human support agent regarding racket string tension.",
        timestamp: "11:40",
      },
    ],
  },
];

export default function ChatbotPage() {
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<ChatbotTab>("size_rules");
  const [isAiFittingEnabled, setIsAiFittingEnabled] = useState(true);

  // Tab 1: Size Rules State & Query
  const { data: sizeRules = [] } = useQuery<SizeRule[]>({
    queryKey: ["size-rules"],
    queryFn: chatbotService.getSizeRules,
  });

  const [ruleSearch, setRuleSearch] = useState("");
  const [isAddRuleModalOpen, setIsAddRuleModalOpen] = useState(false);
  const [newRuleCategory, setNewRuleCategory] = useState<SizeRule["category"]>("Apparel");
  const [newRuleGender, setNewRuleGender] = useState<SizeRule["gender"]>("Male");
  const [newRuleHeightMin, setNewRuleHeightMin] = useState(160);
  const [newRuleHeightMax, setNewRuleHeightMax] = useState(170);
  const [newRuleWeightMin, setNewRuleWeightMin] = useState(55);
  const [newRuleWeightMax, setNewRuleWeightMax] = useState(65);
  const [newRuleSize, setNewRuleSize] = useState("Size M");
  const [newRuleFit, setNewRuleFit] = useState<SizeRule["fitType"]>("Regular Fit");

  // Size Rule Mutations
  const createRuleMutation = useMutation({
    mutationFn: chatbotService.createSizeRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-rules"] });
      toast.success("Thành công", "Đã tạo quy tắc kích cỡ mới");
      setIsAddRuleModalOpen(false);
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  const deleteRuleMutation = useMutation({
    mutationFn: chatbotService.deleteSizeRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["size-rules"] });
      toast.success("Thành công", "Đã xóa quy tắc kích cỡ");
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  // Tab 2: FAQ State & Query
  const { data: faqs = [] } = useQuery<FAQItem[]>({
    queryKey: ["faqs"],
    queryFn: chatbotService.getFAQs,
  });

  const [faqSearch, setFaqSearch] = useState("");
  const [selectedIntent, setSelectedIntent] = useState<string>("all");
  const [isAddFaqOpen, setIsAddFaqOpen] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newFaqIntent, setNewFaqIntent] = useState<FAQItem["intent"]>("Size Fitting");

  // FAQ Mutations
  const createFaqMutation = useMutation({
    mutationFn: chatbotService.createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("Thành công", "Đã thêm câu hỏi FAQ mới vào Knowledge Base");
      setNewFaqQuestion("");
      setNewFaqAnswer("");
      setIsAddFaqOpen(false);
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  const deleteFaqMutation = useMutation({
    mutationFn: chatbotService.deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      toast.success("Thành công", "Đã xóa câu hỏi FAQ");
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

  // Tab 3: Conversation Logs & Simulator State
  const { data: serverSessions = [] } = useQuery<ChatSession[]>({
    queryKey: ["chat-sessions"],
    queryFn: chatbotService.getSessions,
  });

  const [activeSessionId, setActiveSessionId] = useState<string>("chat-1");
  const [replyText, setReplyText] = useState("");

  const sessions: ChatSession[] = serverSessions.length > 0 ? serverSessions : INITIAL_SESSIONS;
  const activeSession = useMemo(() => {
    return sessions.find((s: ChatSession) => s.id === activeSessionId) || sessions[0];
  }, [sessions, activeSessionId]);

  // AI Message Processing Mutation (for chat simulator)
  const processMessageMutation = useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      chatbotService.processMessage({ message, sessionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
      setReplyText("");
    },
  });

  // Filtered Size Rules
  const filteredRules = useMemo(() => {
    return sizeRules.filter((r: SizeRule) => {
      return (
        r.ruleCode.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        r.suggestedSize.toLowerCase().includes(ruleSearch.toLowerCase()) ||
        r.category.toLowerCase().includes(ruleSearch.toLowerCase())
      );
    });
  }, [sizeRules, ruleSearch]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq: FAQItem) => {
      const matchSearch =
        faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
        faq.answer.toLowerCase().includes(faqSearch.toLowerCase());
      const matchIntent = selectedIntent === "all" || faq.intent === selectedIntent;
      return matchSearch && matchIntent;
    });
  }, [faqs, faqSearch, selectedIntent]);

  // Handle Add Size Rule
  const handleAddSizeRule = (e: React.FormEvent) => {
    e.preventDefault();
    createRuleMutation.mutate({
      ruleCode: `R-${newRuleCategory.slice(0, 3).toUpperCase()}-00${sizeRules.length + 1}`,
      category: newRuleCategory,
      gender: newRuleGender,
      heightMin: Number(newRuleHeightMin),
      heightMax: Number(newRuleHeightMax),
      weightMin: Number(newRuleWeightMin),
      weightMax: Number(newRuleWeightMax),
      suggestedSize: newRuleSize,
      fitType: newRuleFit,
      status: "Active",
    });
  };

  // Handle Add FAQ
  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;
    createFaqMutation.mutate({
      question: newFaqQuestion,
      answer: newFaqAnswer,
      intent: newFaqIntent,
      confidence: 0.96,
    });
  };

  // Handle Agent or Customer message in simulator
  const handleSendAgentReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeSession) return;
    processMessageMutation.mutate({
      message: replyText,
      sessionId: activeSession.id,
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* 1. Top Bar & Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                <Bot className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Quản lý Trợ lý AI Chatbot
              </h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Công nghệ Gemini 3.7 Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Cấu hình quy tắc tư vấn kích cỡ tự động, cơ sở tri thức (FAQ) và theo dõi hội thoại khách hàng theo thời gian thực.
            </p>
          </div>

          {/* AI Master Engine Toggle */}
          <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs self-start md:self-auto">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isAiFittingEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                }`}
              />
              <span className="text-xs font-bold text-slate-700">Tự động tư vấn size:</span>
            </div>
            <button
              onClick={() => setIsAiFittingEnabled(!isAiFittingEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                isAiFittingEnabled ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                  isAiFittingEnabled ? "left-6" : "left-1"
                }`}
              />
            </button>
            <span
              className={`text-xs font-bold ${
                isAiFittingEnabled ? "text-blue-600" : "text-slate-400"
              }`}
            >
              {isAiFittingEnabled ? "Đang bật" : "Đang tắt"}
            </span>
          </div>
        </div>

        {/* 3 Main Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px">
          <button
            onClick={() => setActiveTab("size_rules")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px ${
              activeTab === "size_rules"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <Ruler className="w-4 h-4" />
            Quy tắc tư vấn kích cỡ (Size Rules)
            <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {sizeRules.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px ${
              activeTab === "faq"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            Câu hỏi thường gặp & Tri thức (FAQ)
            <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {faqs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px ${
              activeTab === "logs"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Nhật ký hội thoại
            <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {sessions.length} Trực tiếp
            </span>
          </button>
        </div>

        {/* ========================================================= */}
        {/* TAB 1: Size Recommendation Rules */}
        {/* ========================================================= */}
        {activeTab === "size_rules" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm quy tắc theo mã, kích cỡ, danh mục..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAddRuleModalOpen(true)}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Thêm quy tắc kích cỡ
                </button>
              </div>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                      <th className="py-3.5 px-5 whitespace-nowrap">Mã quy tắc</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Khoảng chiều cao (cm)</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Khoảng cân nặng (kg)</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Danh mục</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Kích cỡ gợi ý</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Giới tính & Phom dáng</th>
                      <th className="py-3.5 px-5 whitespace-nowrap">Trạng thái</th>
                      <th className="py-3.5 px-5 whitespace-nowrap text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredRules.map((rule: SizeRule) => {
                      const categoryLabel =
                        rule.category === "Apparel"
                          ? "Quần áo"
                          : rule.category === "Shoes"
                          ? "Giày dép"
                          : "Dụng cụ";
                      const genderLabel =
                        rule.gender === "Male"
                          ? "Nam"
                          : rule.gender === "Female"
                          ? "Nữ"
                          : "Unisex";
                      return (
                        <tr key={rule.id} className="hover:bg-slate-50/70 transition group">
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span
                              className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"
                              title={`Mã quy tắc AI: ${rule.ruleCode}`}
                            >
                              {rule.ruleCode}
                            </span>
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                            {rule.heightMin} cm – {rule.heightMax} cm
                          </td>
                          <td className="py-4 px-5 font-bold text-slate-900 whitespace-nowrap">
                            {rule.weightMin} kg – {rule.weightMax} kg
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                              {categoryLabel}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span
                              className="inline-flex items-center gap-1 font-extrabold text-sm text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-xl border border-blue-200/50"
                              title={`AI gợi ý size: ${rule.suggestedSize}`}
                            >
                              {rule.suggestedSize}
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-600 font-bold">{genderLabel}</span>
                              <span className="text-[11px] text-slate-400">({rule.fitType})</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Hoạt động
                            </span>
                          </td>
                          <td className="py-4 px-5 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                              <button
                                onClick={() => {
                                  deleteRuleMutation.mutate(rule.id);
                                }}
                                title="Xóa quy tắc"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: FAQ & Knowledge Base */}
        {/* ========================================================= */}
        {activeTab === "faq" && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi hoặc từ khóa..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Intent Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <HeroSelect
                  value={selectedIntent}
                  onChange={setSelectedIntent}
                  size="sm"
                  options={[
                    { key: "all", label: "Tất cả chủ đề" },
                    { key: "Return Policy", label: "Chính sách đổi trả" },
                    { key: "Shipping Time", label: "Thời gian giao hàng" },
                    { key: "Product Care", label: "Bảo quản sản phẩm" },
                    { key: "Size Fitting", label: "Tư vấn chọn size" },
                    { key: "Payment & Warranty", label: "Thanh toán & Bảo hành" },
                  ]}
                  aria-label="Lọc theo chủ đề"
                />

                <button
                  onClick={() => setIsAddFaqOpen(true)}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition inline-flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  Thêm câu hỏi FAQ
                </button>
              </div>
            </div>

            {/* Q&A Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq: FAQItem) => {
                const intentLabel =
                  faq.intent === "Return Policy"
                    ? "Chính sách đổi trả"
                    : faq.intent === "Shipping Time"
                    ? "Thời gian giao hàng"
                    : faq.intent === "Size Fitting"
                    ? "Tư vấn chọn size"
                    : faq.intent === "Product Care"
                    ? "Bảo quản sản phẩm"
                    : "Thanh toán & Bảo hành";
                return (
                  <div
                    key={faq.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            faq.intent === "Return Policy"
                              ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                              : faq.intent === "Shipping Time"
                              ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                              : faq.intent === "Size Fitting"
                              ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                          }`}
                        >
                          🏷️ {intentLabel}
                        </span>
                        <span className="text-[11px] font-bold text-slate-400">
                          {faq.usageCount} lượt kích hoạt
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 leading-snug">
                        {faq.question}
                      </h3>

                      <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        {faq.answer}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <span className="text-slate-400 font-medium">
                        Độ chính xác: <strong className="text-emerald-600">{faq.confidence * (faq.confidence <= 1 ? 100 : 1)}%</strong>
                      </span>
                      <button
                        onClick={() => deleteFaqMutation.mutate(faq.id)}
                        title="Xóa câu hỏi FAQ"
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: Conversation Logs (Split View) */}
        {/* ========================================================= */}
        {activeTab === "logs" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
            {/* Left Column: Recent Chat Sessions List (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cuộc trò chuyện gần đây</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Ghi nhận tương tác AI tự động</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              </div>

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {sessions.map((session: ChatSession) => {
                  const isSelected = session.id === activeSession.id;
                  return (
                    <div
                      key={session.id}
                      onClick={() => setActiveSessionId(session.id)}
                      className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                        isSelected ? "bg-blue-50/70 border-l-4 border-blue-600" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {session.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-slate-900 truncate">
                            {session.customerName}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatDateTime(session.timestamp)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {session.lastMessage}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {session.status === "Product Recommended" && (
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                              🛒 Đã gợi ý sản phẩm
                            </span>
                          )}
                          {session.status === "Bot Resolved" && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              🤖 Bot đã giải quyết
                            </span>
                          )}
                          {session.status === "Human Escalated" && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              🙋‍♂️ Chuyển tư vấn viên
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Full Chat Transcript View (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
              {/* Transcript Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                    {activeSession.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm text-slate-900">
                        {activeSession.customerName}
                      </h3>
                      <span className="font-mono text-[11px] text-slate-400">
                        {activeSession.customerPhone}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Trợ lý AI SportX đã kết nối (Phiên #{activeSession.id})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl">
                    {activeSession.status === "Product Recommended"
                      ? "Đã gợi ý sản phẩm"
                      : activeSession.status === "Bot Resolved"
                      ? "Bot đã xử lý xong"
                      : "Cần tư vấn viên"}
                  </span>
                </div>
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/30">
                {activeSession.messages.map((msg: ChatMessage) => {
                  const isUser = msg.sender === "user";
                  const isBot = msg.sender === "bot";
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-3 max-w-[85%] ${isUser ? "ml-auto flex-row-reverse" : ""}`}
                    >
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-xs ${
                          isUser
                            ? "bg-blue-600 text-white"
                            : isBot
                            ? "bg-gradient-to-tr from-slate-900 to-indigo-900 text-white"
                            : "bg-emerald-600 text-white"
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>

                      {/* Bubble */}
                      <div className="space-y-2">
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                            isUser
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none"
                          }`}
                        >
                          <div className="font-bold text-[10px] mb-1 opacity-75">
                            {isUser ? "Khách hàng" : isBot ? "Trợ lý AI SportX" : "Tư vấn viên"} •{" "}
                            {formatDateTime(msg.timestamp)}
                          </div>
                          <div className="whitespace-pre-line">{msg.text}</div>
                        </div>

                        {/* Product Recommendation Card Embed */}
                        {msg.productCard && (
                          <div className="p-3.5 bg-white border border-blue-200 rounded-2xl shadow-sm flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                              {msg.productCard.thumbnail && (msg.productCard.thumbnail.startsWith("http") || msg.productCard.thumbnail.startsWith("/")) ? (
                                <img
                                  src={msg.productCard.thumbnail}
                                  alt={msg.productCard.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl">{msg.productCard.thumbnail || "👟"}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 text-xs">
                              <h5 className="font-bold text-slate-900 truncate">
                                {msg.productCard.name}
                              </h5>
                              <p className="text-[11px] text-slate-400">
                                {msg.productCard.category}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="font-extrabold text-blue-600">
                                  {msg.productCard.price}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  {msg.productCard.sizeSuggested}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Agent Manual Reply Input */}
              <form
                onSubmit={handleSendAgentReply}
                className="p-3 bg-white border-t border-slate-100 flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Tiếp quản cuộc trò chuyện hoặc gửi phản hồi với vai trò Tư vấn viên..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Size Rule */}
        {isAddRuleModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" /> Thêm quy tắc tư vấn kích cỡ
                </h3>
                <button
                  onClick={() => setIsAddRuleModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSizeRule} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Danh mục</label>
                    <HeroSelect
                      value={newRuleCategory}
                      onChange={(val) => setNewRuleCategory(val as any)}
                      options={[
                        { key: "Apparel", label: "Quần áo" },
                        { key: "Shoes", label: "Giày dép" },
                        { key: "Training Gear", label: "Dụng cụ tập" },
                      ]}
                      className="w-full"
                      triggerClassName="w-full bg-slate-50"
                      aria-label="Chọn danh mục"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
                    <HeroSelect
                      value={newRuleGender}
                      onChange={(val) => setNewRuleGender(val as any)}
                      options={[
                        { key: "Male", label: "Nam" },
                        { key: "Female", label: "Nữ" },
                        { key: "Unisex", label: "Unisex" },
                      ]}
                      className="w-full"
                      triggerClassName="w-full bg-slate-50"
                      aria-label="Chọn giới tính"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khoảng chiều cao (cm)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newRuleHeightMin}
                        onChange={(e) => setNewRuleHeightMin(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Từ"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={newRuleHeightMax}
                        onChange={(e) => setNewRuleHeightMax(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Đến"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Khoảng cân nặng (kg)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newRuleWeightMin}
                        onChange={(e) => setNewRuleWeightMin(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Từ"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={newRuleWeightMax}
                        onChange={(e) => setNewRuleWeightMax(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Đến"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Kích cỡ gợi ý</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Size M hoặc Size 41"
                      value={newRuleSize}
                      onChange={(e) => setNewRuleSize(e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phom dáng (Fit)</label>
                    <HeroSelect
                      value={newRuleFit}
                      onChange={(val) => setNewRuleFit(val as any)}
                      options={[
                        { key: "Slim Fit", label: "Ôm sát (Slim Fit)" },
                        { key: "Regular Fit", label: "Vừa vặn (Regular Fit)" },
                        { key: "Loose Fit", label: "Rộng rãi (Loose Fit)" },
                      ]}
                      className="w-full"
                      triggerClassName="w-full bg-slate-50"
                      aria-label="Chọn phom dáng"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRuleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm"
                  >
                    Lưu quy tắc
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add FAQ Entry */}
        {isAddFaqOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" /> Thêm câu hỏi & Tri thức cho Bot
                </h3>
                <button
                  onClick={() => setIsAddFaqOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddFaq} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chủ đề / Ý định (Intent)</label>
                  <HeroSelect
                    value={newFaqIntent}
                    onChange={(val) => setNewFaqIntent(val as any)}
                    options={[
                      { key: "Return Policy", label: "Chính sách đổi trả" },
                      { key: "Shipping Time", label: "Thời gian giao hàng" },
                      { key: "Product Care", label: "Bảo quản sản phẩm" },
                      { key: "Size Fitting", label: "Tư vấn chọn size" },
                      { key: "Payment & Warranty", label: "Thanh toán & Bảo hành" },
                    ]}
                    className="w-full"
                    triggerClassName="w-full bg-slate-50"
                    aria-label="Chọn chủ đề"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Câu hỏi / Mẫu truy vấn</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Giày đá bóng không vừa có được đổi size không?"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Câu trả lời tự động của Bot</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Nhập nội dung phản hồi chính xác mà trợ lý AI sẽ trả lời khách..."
                    value={newFaqAnswer}
                    onChange={(e) => setNewFaqAnswer(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddFaqOpen(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm"
                  >
                    Thêm tri thức
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
