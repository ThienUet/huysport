import { useState, useMemo } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatbotService } from "@/services/api";
import { useToastStore } from "@/store/useToastStore";
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
                AI Chatbot Assistant Management
              </h1>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Gemini 3.7 Engine
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Configure automated size recommendation heuristics, domain knowledge base, and inspect real-time customer dialogues.
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
              <span className="text-xs font-bold text-slate-700">AI Auto Size Fitting:</span>
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
              {isAiFittingEnabled ? "Enabled" : "Disabled"}
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
            Size Recommendation Rules
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
            FAQ & Knowledge Base
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
            Conversation Logs
            <span className="bg-rose-100 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {sessions.length} Live
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
                  placeholder="Search rules by code, size, category..."
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsAddRuleModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Add Size Rule
                </button>
              </div>
            </div>

            {/* Rules Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                      <th className="py-3.5 px-5">Rule ID</th>
                      <th className="py-3.5 px-5">Height Range (cm)</th>
                      <th className="py-3.5 px-5">Weight Range (kg)</th>
                      <th className="py-3.5 px-5">Product Category</th>
                      <th className="py-3.5 px-5">Suggested Size</th>
                      <th className="py-3.5 px-5">Gender & Fit</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                    {filteredRules.map((rule: SizeRule) => (
                      <tr key={rule.id} className="hover:bg-slate-50/70 transition group">
                        <td className="py-4 px-5">
                          <span className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                            {rule.ruleCode}
                          </span>
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900">
                          {rule.heightMin} cm – {rule.heightMax} cm
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900">
                          {rule.weightMin} kg – {rule.weightMax} kg
                        </td>
                        <td className="py-4 px-5">
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold text-[11px]">
                            {rule.category}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center gap-1 font-extrabold text-sm text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-xl border border-blue-200/50">
                            {rule.suggestedSize}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-600 font-bold">{rule.gender}</span>
                            <span className="text-[11px] text-slate-400">({rule.fitType})</span>
                          </div>
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Active
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => {
                                deleteRuleMutation.mutate(rule.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
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
                  placeholder="Search questions or keywords..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Intent Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedIntent}
                  onChange={(e) => setSelectedIntent(e.target.value)}
                  className="bg-slate-50 text-xs font-bold text-slate-700 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                >
                  <option value="all">All Intent Topics</option>
                  <option value="Return Policy">Return Policy</option>
                  <option value="Shipping Time">Shipping Time</option>
                  <option value="Product Care">Product Care</option>
                  <option value="Size Fitting">Size Fitting</option>
                  <option value="Payment & Warranty">Payment & Warranty</option>
                </select>

                <button
                  onClick={() => setIsAddFaqOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20"
                >
                  <Plus className="w-4 h-4" />
                  Add FAQ Entry
                </button>
              </div>
            </div>

            {/* Q&A Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFaqs.map((faq: FAQItem) => (
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
                        🏷️ {faq.intent}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {faq.usageCount} bot hits
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
                      Match Accuracy: <strong className="text-emerald-600">{faq.confidence}%</strong>
                    </span>
                    <button
                      onClick={() => deleteFaqMutation.mutate(faq.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
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
                  <h3 className="font-bold text-sm text-slate-900">Recent Customer Sessions</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Auto-recorded AI interactions</p>
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
                            {session.timestamp}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {session.lastMessage}
                        </p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {session.status === "Product Recommended" && (
                            <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                              🛒 Product Recommended
                            </span>
                          )}
                          {session.status === "Bot Resolved" && (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                              🤖 Bot Resolved
                            </span>
                          )}
                          {session.status === "Human Escalated" && (
                            <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                              🙋‍♂️ Escalated to Human
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
                      SportX AI Bot Connected (Session #{activeSession.id})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-xl">
                    {activeSession.status}
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
                            {isUser ? "Customer" : isBot ? "SportX AI Assistant" : "Live Agent"} •{" "}
                            {msg.timestamp}
                          </div>
                          <div className="whitespace-pre-line">{msg.text}</div>
                        </div>

                        {/* Product Recommendation Card Embed */}
                        {msg.productCard && (
                          <div className="p-3.5 bg-white border border-blue-200 rounded-2xl shadow-sm flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl shrink-0">
                              {msg.productCard.thumbnail}
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
                  placeholder="Take over or whisper a response as Human Agent..."
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
                  <Ruler className="w-4 h-4 text-blue-600" /> Add Size Recommendation Rule
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
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={newRuleCategory}
                      onChange={(e: any) => setNewRuleCategory(e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                    >
                      <option value="Apparel">Apparel</option>
                      <option value="Shoes">Shoes</option>
                      <option value="Training Gear">Training Gear</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender</label>
                    <select
                      value={newRuleGender}
                      onChange={(e: any) => setNewRuleGender(e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Height Range (cm)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newRuleHeightMin}
                        onChange={(e) => setNewRuleHeightMin(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Min"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={newRuleHeightMax}
                        onChange={(e) => setNewRuleHeightMax(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Max"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Weight Range (kg)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newRuleWeightMin}
                        onChange={(e) => setNewRuleWeightMin(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Min"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={newRuleWeightMax}
                        onChange={(e) => setNewRuleWeightMax(Number(e.target.value))}
                        className="w-1/2 p-2 bg-slate-50 rounded-xl border border-slate-200"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Suggested Size</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Size M or EU 41"
                      value={newRuleSize}
                      onChange={(e) => setNewRuleSize(e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold text-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Fit Preference</label>
                    <select
                      value={newRuleFit}
                      onChange={(e: any) => setNewRuleFit(e.target.value)}
                      className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                    >
                      <option value="Slim Fit">Slim Fit</option>
                      <option value="Regular Fit">Regular Fit</option>
                      <option value="Loose Fit">Loose Fit</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRuleModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 rounded-xl text-slate-700 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm"
                  >
                    Save Rule
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
                  <HelpCircle className="w-4 h-4 text-blue-600" /> Add FAQ & Knowledge Entry
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
                  <label className="block font-bold text-slate-700 mb-1">Intent Category</label>
                  <select
                    value={newFaqIntent}
                    onChange={(e: any) => setNewFaqIntent(e.target.value)}
                    className="w-full p-2 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="Return Policy">Return Policy</option>
                    <option value="Shipping Time">Shipping Time</option>
                    <option value="Product Care">Product Care</option>
                    <option value="Size Fitting">Size Fitting</option>
                    <option value="Payment & Warranty">Payment & Warranty</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Question / User Query</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Can I return football boots if the size is tight?"
                    value={newFaqQuestion}
                    onChange={(e) => setNewFaqQuestion(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 rounded-xl border border-slate-200 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Automated Bot Answer</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide the exact guidance response the AI chatbot should respond with..."
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-sm"
                  >
                    Add Knowledge
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
