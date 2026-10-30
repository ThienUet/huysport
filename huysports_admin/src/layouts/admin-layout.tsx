import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import GlobalSearch from "@/components/GlobalSearch";
import { Dropdown } from "@heroui/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Megaphone,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Menu,
  X,
  Bot,
  LogOut,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Camera,
  Upload,
  Loader2,
  Sparkles,
} from "lucide-react";
import { uploadService } from "@/services/api";

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80",
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, updateUser, hasRole } = useAuthStore();
  const toast = useToastStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Clean full name by removing any embedded parenthetical roles like "(Super Admin)"
  const cleanFullName = (user?.fullName || "Đinh Công Hùng")
    .replace(/\s*\([^)]*\)/g, "")
    .trim();

  // Sidebar collapse state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sportx_admin_sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        localStorage.setItem("sportx_admin_sidebar_collapsed", String(next));
      }
      return next;
    });
  };

  const handleSignOut = () => {
    logout();
    toast.success("Đã đăng xuất", "Hẹn gặp lại bạn!");
    navigate("/login");
  };

  const navItems = [
    { name: "Tổng quan", icon: LayoutDashboard, path: "/", badge: null },
    { name: "Sản phẩm & Kho", icon: Package, path: "/products", badge: null },
    { name: "Đơn hàng", icon: ShoppingBag, path: "/orders", badge: "Trực tiếp" },
    { name: "Khách hàng", icon: Users, path: "/customers", badge: null },
    { name: "AI Chatbot & Size", icon: Bot, path: "/chatbot", badge: "AI" },
    { name: "Mã giảm giá", icon: Megaphone, path: "/marketing", badge: null },
    { name: "Thống kê & Báo cáo", icon: BarChart3, path: "/analytics", badge: null },
  ];

  const bottomNavItems = [
    ...(hasRole("ADMIN")
      ? [{ name: "Cài đặt hệ thống", icon: Settings, path: "/settings" }]
      : []),
    { name: "Hướng dẫn & Trợ giúp", icon: HelpCircle, path: "/help" },
  ];

  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo-256.png"
            alt="HuySport Logo"
            className="w-9 h-9 object-contain rounded-full shadow-sm"
          />
          <div>
            <div className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
              Huy<span className="text-emerald-600">Sport</span>
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              {isAdmin ? "Quản trị viên cấp cao" : "Nhân viên"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Fixed Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200/90 flex flex-col transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "w-20" : "w-64"
        } ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } overflow-visible`}
      >
        {/* Floating edge collapse toggle button */}
        <button
          onClick={toggleSidebar}
          type="button"
          className="hidden lg:flex absolute -right-3.5 top-6 w-7 h-7 bg-white border border-slate-300 rounded-full shadow-md items-center justify-center text-slate-600 hover:text-blue-600 hover:border-blue-400 hover:scale-110 active:scale-95 transition-all cursor-pointer z-50 ring-2 ring-white"
          title={sidebarCollapsed ? "Mở rộng thanh menu" : "Thu gọn thanh menu"}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-700" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Scrollable inner content */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto overflow-x-hidden p-3.5">
          <div>
            {/* Logo & Brand Header */}
            <div className="flex items-center px-1 mb-6 h-11">
              <Link to="/" className="flex items-center min-w-0" title="HuySport Quản Trị Hệ Thống">
                <img
                  src="/logo-256.png"
                  alt="HuySport Logo"
                  className="w-10 h-10 object-contain rounded-full shadow-sm shrink-0"
                />
                <div
                  className={`flex flex-col transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                    sidebarCollapsed ? "opacity-0 max-w-0 ml-0 pointer-events-none" : "opacity-100 max-w-[160px] ml-3"
                  }`}
                >
                  <div className="font-black text-xl tracking-tight text-slate-900 leading-none">
                    Huy<span className="text-emerald-600">Sport</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                    Quản Trị Hệ Thống
                  </div>
                </div>
              </Link>
            </div>

            {/* Main Navigation Header */}
            <div
              className={`text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                sidebarCollapsed
                  ? "opacity-0 max-h-0 mb-0 pointer-events-none"
                  : "opacity-100 max-h-6 mb-2"
              }`}
            >
              Menu Chính
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    title={sidebarCollapsed ? item.name : undefined}
                    className={`flex items-center px-3 py-2.5 rounded-xl font-medium text-sm transition-colors duration-150 relative group ${
                      isActive
                        ? "bg-blue-50/90 text-blue-600 font-semibold shadow-xs shadow-blue-500/5"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors ${
                        isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                      }`}
                    />
                    <span
                      className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                        sidebarCollapsed
                          ? "opacity-0 max-w-0 ml-0 pointer-events-none"
                          : "opacity-100 max-w-[150px] ml-3"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.badge && (
                      <span
                        className={`bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold shrink-0 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                          sidebarCollapsed
                            ? "opacity-0 max-w-0 scale-0 pointer-events-none"
                            : "opacity-100 max-w-[60px] scale-100 ml-auto"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-100 pt-4 space-y-1">
            <div
              className={`text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                sidebarCollapsed
                  ? "opacity-0 max-h-0 mb-0 pointer-events-none"
                  : "opacity-100 max-h-6 mb-2"
              }`}
            >
              Cài đặt & Hỗ trợ
            </div>
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  title={sidebarCollapsed ? item.name : undefined}
                  className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span
                    className={`transition-all duration-300 ease-in-out overflow-hidden whitespace-nowrap ${
                      sidebarCollapsed
                        ? "opacity-0 max-w-0 ml-0 pointer-events-none"
                        : "opacity-100 max-w-[150px] ml-3"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        {/* 1. Top Header Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between sticky top-[57px] lg:top-0 z-30 shadow-xs">
          <div className="flex-1 max-w-xl pr-2 sm:pr-0">
            {/* Global Autocomplete Search with Debounce */}
            <GlobalSearch />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 relative">
            {/* Notification Bell (HeroUI Dropdown) */}
            <Dropdown>
              <Dropdown.Trigger className="focus:outline-none">
                <button
                  type="button"
                  className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                  title="Thông báo"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white">
                    5
                  </span>
                </button>
              </Dropdown.Trigger>

              <Dropdown.Popover
                placement="bottom end"
                className="z-50 min-w-[320px] bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-200 p-4 focus:outline-none animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                  <span className="font-bold text-sm text-slate-900">Thông báo mới</span>
                  <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                    5 mới
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100/50">
                    <div className="font-bold text-blue-900">Đơn hàng mới #SPX-9821 đã nhận</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Nike Mercurial Elite • 299.000đ</div>
                  </div>
                  <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100/50">
                    <div className="font-bold text-amber-900">Cảnh báo sắp hết hàng: 12 sản phẩm</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Bộ tạ tay Pro chỉ còn dưới 5 sản phẩm</div>
                  </div>
                </div>
              </Dropdown.Popover>
            </Dropdown>

            {/* Vertical Divider */}
            <div className="h-5 w-px bg-slate-200"></div>

            {/* User Profile (HeroUI Dropdown) */}
            <Dropdown>
              <Dropdown.Trigger className="focus:outline-none">
                <button
                  type="button"
                  className="flex items-center gap-2.5 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-slate-100 transition-colors text-left focus:outline-none cursor-pointer group"
                  title={cleanFullName}
                >
                  <div className="relative shrink-0">
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                      alt={cleanFullName}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200/80 group-hover:ring-blue-400 transition"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {cleanFullName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium leading-tight">
                      {isAdmin ? "Super Admin" : "Staff"}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform duration-200 group-hover:text-slate-600" />
                </button>
              </Dropdown.Trigger>

              <Dropdown.Popover
                placement="bottom end"
                className="z-50 min-w-[260px] bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-2 focus:outline-none animate-in fade-in zoom-in-95 duration-150"
              >
                {/* User Identity Header */}
                <div className="p-2.5 bg-slate-50/80 rounded-xl mb-1 border border-slate-100/80">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                      alt={cleanFullName}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">{cleanFullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{user?.email || "admin@sportx.store"}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-200/50 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400">Vai trò:</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100/70 text-blue-700">
                      {isAdmin ? "Quản trị viên cấp cao" : "Nhân viên"}
                    </span>
                  </div>
                </div>

                {/* Navigation Actions */}
                <div className="py-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4 text-blue-600" />
                    Đổi ảnh đại diện (Avatar)
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    Hồ sơ tài khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/settings")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Vai trò & Phân quyền
                  </button>
                </div>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Đăng xuất
                </button>
              </Dropdown.Popover>
            </Dropdown>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-6 lg:p-8 space-y-5 sm:space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* Avatar Change Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">Thay đổi ảnh đại diện</h3>
                  <p className="text-[11px] text-slate-400">Lưu vào thư mục <strong>HuyHung/images/avatars/</strong></p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAvatarModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Current Avatar Preview */}
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <div className="relative">
                <img
                  src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                  alt={cleanFullName}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-blue-500/20 shadow-md"
                />
                <span className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]">
                  ✓
                </span>
              </div>
              <span className="text-xs font-bold text-slate-800">{cleanFullName}</span>
            </div>

            {/* Option 1: Upload from computer */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">1. Tải ảnh mới từ máy tính:</label>
              <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-3.5 flex items-center justify-center gap-3 bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingAvatar}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploadingAvatar(true);
                    try {
                      const base64 = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = reject;
                        reader.readAsDataURL(file);
                      });

                      const res = await uploadService.uploadImage({
                        image: base64,
                        filename: `avatar-${file.name}`,
                        type: "avatar",
                      });
                      const finalUrl = res?.url || base64;
                      updateUser({ avatar: finalUrl });
                      toast.success("Thành công", "Đã lưu ảnh đại diện vào thư mục images/avatars");
                      setIsAvatarModalOpen(false);
                    } catch (err: any) {
                      toast.error("Lỗi", err.message || "Không thể tải ảnh avatar lên");
                    } finally {
                      setIsUploadingAvatar(false);
                      e.target.value = "";
                    }
                  }}
                />
                {isUploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                )}
                <div className="text-left">
                  <span className="text-xs font-bold text-slate-700 block">
                    {isUploadingAvatar ? "Đang tải ảnh avatar lên..." : "Chọn ảnh từ máy tính"}
                  </span>
                  <span className="text-[10px] text-slate-400 block">PNG, JPG, WEBP</span>
                </div>
              </label>
            </div>

            {/* Option 2: Enter Image URL */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">2. Hoặc dán link URL ảnh trực tiếp:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={avatarUrlInput}
                  onChange={(e) => setAvatarUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => {
                    const url = avatarUrlInput.trim();
                    if (!url) return;
                    updateUser({ avatar: url });
                    toast.success("Thành công", "Đã cập nhật ảnh đại diện từ liên kết");
                    setAvatarUrlInput("");
                    setIsAvatarModalOpen(false);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Lưu
                </button>
              </div>
            </div>

            {/* Option 3: Pick from Presets */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> 3. Hoặc chọn nhanh avatar mẫu:
              </label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_AVATARS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      updateUser({ avatar: url });
                      toast.success("Thành công", "Đã chọn ảnh đại diện mẫu");
                      setIsAvatarModalOpen(false);
                    }}
                    className="relative aspect-square rounded-full overflow-hidden border-2 border-slate-200 hover:border-blue-600 hover:scale-105 transition cursor-pointer"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
