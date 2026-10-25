import { useState } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { HeroSelect } from "@/components/ui/HeroSelect";
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
      title: "Bắt đầu & Thiết lập cửa hàng",
      desc: "Hướng dẫn đầy đủ về cách cấu hình danh mục thể thao, giao diện và phân quyền nhân viên.",
      icon: BookOpen,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      readTime: "5 phút đọc",
    },
    {
      title: "Xử lý đơn hàng & Đồng bộ vận chuyển",
      desc: "Hướng dẫn từng bước đóng gói xử lý hàng loạt và đồng bộ mã vận đơn đối tác.",
      icon: Truck,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
      readTime: "8 phút đọc",
    },
    {
      title: "Cấu hình cổng thanh toán (VNPAY & MoMo)",
      desc: "Cách lấy mã TMN Code, sinh khóa Hash Secret và cấu hình webhook callback.",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      readTime: "6 phút đọc",
    },
    {
      title: "Quy tắc tư vấn kích cỡ tự động AI",
      desc: "Kinh nghiệm thực tiễn hiệu chỉnh các quy tắc kích cỡ chuẩn xác cho quần áo và giày thể thao.",
      icon: Bot,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      readTime: "10 phút đọc",
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
              Trung tâm Trợ giúp & Tri thức SportX
            </span>
            <h1 className="text-3xl font-black tracking-tight">Chúng tôi có thể giúp gì cho bạn hôm nay?</h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Tìm kiếm tài liệu hướng dẫn, kiểm tra trạng thái máy chủ hoặc liên hệ trực tiếp với đội ngũ kỹ sư hỗ trợ.
            </p>

            {/* Search Box */}
            <div className="relative max-w-lg mx-auto pt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, hướng dẫn vận hành, câu hỏi API..."
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
              Tài liệu hướng dẫn quản trị phổ biến
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
                        Đọc hướng dẫn →
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
                <h3 className="font-bold text-sm text-slate-900">Trạng thái máy chủ & Dịch vụ</h3>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Hoạt động bình thường
                </span>
              </div>

              <div className="space-y-3 pt-3 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">Dịch vụ API SportX</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">99.98% Thời gian online</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">Cổng thanh toán VNPAY</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">Hoạt động tốt</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">Cổng MoMo Webhook</span>
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">Hoạt động tốt</span>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-slate-800">Động cơ AI Gemini 3.7</span>
                  </div>
                  <span className="text-[11px] text-purple-600 font-bold">100% Trực tuyến</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-400 text-center">
              Lần kiểm tra gần nhất: <strong>Vừa xong (Trực tiếp)</strong>
            </div>
          </div>
        </div>

        {/* Contact & Direct Support Channels */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Kênh hỗ trợ trực tiếp</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Live Chat */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Trò chuyện trực tuyến</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Kết nối ngay lập tức với kỹ sư kỹ thuật chuyên trách.
              </p>
              <span className="text-xs font-bold text-emerald-600 inline-block pt-1">
                ● Trực tuyến (Phản hồi TB 2 phút)
              </span>
            </div>

            {/* Hotline */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Tổng đài 24/7</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hỗ trợ khẩn cấp qua điện thoại đối với sự cố kho hàng và vận hành.
              </p>
              <div className="font-mono font-bold text-xs text-indigo-600 pt-1">
                1900-SPORTX (Nhánh 1)
              </div>
            </div>

            {/* Email */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Hỗ trợ qua Email</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Gửi yêu cầu giải đáp, đề xuất tính năng hoặc tích hợp tùy biến.
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
                <h3 className="font-bold text-sm">Gửi phiếu hỗ trợ (Ticket)</h3>
                <p className="text-xs text-blue-100 mt-1">
                  Tạo phiếu báo cáo sự cố hoặc lỗi hệ thống tới đội ngũ kỹ thuật.
                </p>
              </div>

              <div className="pt-2 text-xs font-bold text-white flex items-center gap-1">
                Mở biểu mẫu Ticket →
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
                  Gửi yêu cầu hỗ trợ kỹ thuật
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
                  <h4 className="font-bold text-base text-slate-900">Đã tạo phiếu hỗ trợ #SPX-TK-902!</h4>
                  <p className="text-xs text-slate-500">
                    Đội ngũ kỹ thuật viên sẽ phản hồi bạn trong vòng 2 giờ.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Tiêu đề vấn đề *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ví dụ: Webhook VNPAY trả về mã lỗi 99"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Danh mục sự cố</label>
                      <HeroSelect
                        value={ticketCategory}
                        onChange={setTicketCategory}
                        options={[
                          { key: "Technical Support", label: "Hỗ trợ kỹ thuật" },
                          { key: "Payment Gateway", label: "Cổng thanh toán" },
                          { key: "AI Sizing Tuning", label: "Hiệu chỉnh tư vấn AI" },
                          { key: "Inventory Sync", label: "Đồng bộ tồn kho" },
                        ]}
                        className="w-full"
                        triggerClassName="w-full bg-slate-50 py-2.5"
                        aria-label="Chọn danh mục sự cố"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
                      <HeroSelect
                        value={ticketPriority}
                        onChange={setTicketPriority}
                        options={[
                          { key: "Low", label: "Thấp" },
                          { key: "Medium", label: "Trung bình" },
                          { key: "High (Urgent)", label: "Cao (Khẩn cấp)" },
                        ]}
                        className="w-full"
                        triggerClassName="w-full bg-slate-50 py-2.5"
                        aria-label="Chọn mức độ ưu tiên"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Mô tả chi tiết *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Cung cấp mã đơn hàng hoặc nhật ký lỗi để chúng tôi chẩn đoán nhanh nhất..."
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
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition shadow-md shadow-blue-500/20 active:scale-95"
                    >
                      Gửi phiếu hỗ trợ
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
