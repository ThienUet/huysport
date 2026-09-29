import { useState } from "react";
import AdminLayout from "@/layouts/admin-layout";
import {
  HelpCircle,
  Search,
  BookOpen,
  Truck,
  CreditCard,
  Bot,
  CheckCircle2,
  MessageCircle,
  Phone,
  Mail,
  Plus,
  Send,
  Sparkles,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Technical Support");
  const [ticketPriority, setTicketPriority] = useState("Medium");
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const helpGuides = [
    {
      title: "Getting Started & Storefront Setup",
      desc: "Complete guide on configuring your sports catalog, themes, and staff permissions.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      readTime: "5 min read",
    },
    {
      title: "Order Fulfillment & Shipping Sync",
      desc: "Step-by-step instructions for batch dispatching orders and syncing courier tracking.",
      icon: Truck,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      readTime: "8 min read",
    },
    {
      title: "Payment Gateway Credentials (VNPAY & MoMo)",
      desc: "How to obtain Merchant TMN Code, generate Secret Hash, and configure webhook callbacks.",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      readTime: "6 min read",
    },
    {
      title: "AI Sizing Engine Rules & Heuristics",
      desc: "Best practices for calibrating size recommendation rules for athletic apparel and footwear.",
      icon: Bot,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      readTime: "10 min read",
    },
  ];

  const filteredGuides = helpGuides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setIsTicketModalOpen(false);
      setTicketSubject("");
      setTicketMessage("");
    }, 2000);
  };

  return (
    <AdminLayout>
      <div className="space-y-7">
        {/* Top Hero Section */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-8 text-white shadow-lg shadow-blue-500/10 text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              SportX Knowledge & Support Center
            </span>
            <h1 className="text-3xl font-black tracking-tight">How can we help you today?</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Search documentation guides, verify system uptime, or connect directly with our engineering support squad.
            </p>

            {/* Search Box */}
            <div className="relative max-w-lg mx-auto pt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guides, documentation, API FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white text-slate-900 placeholder:text-slate-400 text-xs font-medium rounded-2xl shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
        </div>

        {/* Quick Help Categories & System Service Health */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Guides List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-blue-600" />
              Popular Administration Guides
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => {
                const Icon = guide.icon;
                return (
                  <div
                    key={guide.title}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3 cursor-pointer group"
                  >
                    <div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${guide.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition">
                        {guide.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        {guide.desc}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] font-bold text-slate-400">
                      <span>{guide.readTime}</span>
                      <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        Read Guide →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Service Health Status (1 Col) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-sm text-slate-900">System Service Health</h3>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  All Systems Normal
                </span>
              </div>

              <div className="space-y-3 pt-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">SportX API Service</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">99.98% Uptime</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">VNPAY Gateway</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">Operational</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">MoMo Webhook Handler</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">Operational</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">Gemini 3.7 AI Engine</span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-bold">100% Online</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Last status ping check: <strong>Just now (Live)</strong>
            </div>
          </div>
        </div>

        {/* Contact & Direct Support Channels */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Direct Support Channels</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Live Chat */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Live Chat Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect instantly with dedicated technical engineers.
              </p>
              <span className="text-xs font-bold text-emerald-600 inline-block pt-1">
                ● Online (Avg. 2 min response)
              </span>
            </div>

            {/* Hotline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Hotline 24/7</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Emergency escalation phone support for warehouse & store issues.
              </p>
              <div className="font-mono font-bold text-xs text-indigo-600 pt-1">
                1900-SPORTX (Ext 1)
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Email Support</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Send queries, feature requests, and custom integrations.
              </p>
              <div className="font-bold text-xs text-slate-800 pt-1">
                support@sportx.store
              </div>
            </div>

            {/* Submit a Ticket Card */}
            <div
              onClick={() => setIsTicketModalOpen(true)}
              className="bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl p-5 text-white shadow-md shadow-blue-500/20 flex flex-col justify-between cursor-pointer hover:opacity-95 transition"
            >
              <div>
                <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center mb-2">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm">Submit a Ticket</h3>
                <p className="text-xs text-blue-100 mt-1">
                  Create a tracked incident or bug report for our dev team.
                </p>
              </div>

              <div className="pt-2 text-xs font-bold text-white flex items-center gap-1">
                Open Ticket Form →
              </div>
            </div>
          </div>
        </div>

        {/* Submit Ticket Modal */}
        {isTicketModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Send className="w-4 h-4 text-blue-600" />
                  Submit Support Ticket
                </h3>
                <button
                  onClick={() => setIsTicketModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {ticketSubmitted ? (
                <div className="py-8 text-center space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                  <h4 className="font-bold text-base text-slate-900">Ticket #SPX-TK-902 Created!</h4>
                  <p className="text-xs text-slate-500">
                    Our technical support team will reply within 2 hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Issue Subject *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. VNPAY Webhook returning error 99"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200"
                      >
                        <option value="Technical Support">Technical Support</option>
                        <option value="Payment Gateway">Payment Gateway</option>
                        <option value="AI Sizing Tuning">AI Sizing Tuning</option>
                        <option value="Inventory Sync">Inventory Sync</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Priority</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 font-bold text-slate-700 rounded-xl border border-slate-200"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High (Urgent)">High (Urgent)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Detailed Description *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Provide order ID or error logs to help us diagnose quickly..."
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsTicketModalOpen(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
                    >
                      Send Ticket
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
