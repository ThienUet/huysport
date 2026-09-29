import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Megaphone,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Bot,
  LogOut,
  UserCheck,
  ShieldCheck,
  Crown,
  Briefcase,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasRole } = useAuthStore();
  const toast = useToastStore();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    toast.success("Đã đăng xuất", "Hẹn gặp lại bạn!");
    navigate("/login");
  };

  const navItems = [
    { name: "Tổng quan", icon: LayoutDashboard, path: "/", badge: null },
    { name: "Sản phẩm & Kho", icon: Package, path: "/products", badge: null },
    { name: "Đơn hàng", icon: ShoppingBag, path: "/orders", badge: "Live" },
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
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row antialiased">
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
              {isAdmin ? "Super Admin" : "Staff"}
            </div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 p-5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-2 mb-8">
            <img
              src="/logo-256.png"
              alt="HuySport Logo"
              className="w-11 h-11 object-contain rounded-full shadow-sm"
            />
            <div>
              <div className="font-black text-xl tracking-tight text-slate-900 leading-none">
                Huy<span className="text-emerald-600">Sport</span>
              </div>
              <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1">
                Admin Management
              </div>
            </div>
          </div>

          {/* User quick role indicator */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {isAdmin ? <Crown className="w-4 h-4 text-amber-600" /> : <Briefcase className="w-4 h-4 text-blue-600" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">
                {user?.fullName || "Quản trị viên"}
              </div>
              <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                {isAdmin ? "Super Admin" : "Staff Member"}
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Menu
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
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-blue-50/90 text-blue-600 font-semibold shadow-sm shadow-blue-500/5"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? "text-blue-600" : "text-slate-400"
                    }`}
                  />
                  <span>{item.name}</span>
                  {item.badge && (
                    <span className="ml-auto bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
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
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Preferences
          </div>
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* 1. Top Header Bar */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Global Search Input */}
          <div className="relative w-full max-w-md mr-4">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search orders, products, customers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 md:gap-4 relative">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="relative p-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition focus:outline-none cursor-pointer"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white ring-2 ring-white">
                  5
                </span>
              </button>

              {/* Notification Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
                    <span className="font-bold text-sm text-slate-900">Notifications</span>
                    <span className="text-xs bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-full">
                      5 New
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100/50">
                      <div className="font-bold text-blue-900">New Order #SPX-9821 received</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Nike Mercurial Elite • $299.00</div>
                    </div>
                    <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100/50">
                      <div className="font-bold text-amber-900">Low Stock Alert: 12 Products</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">Pro Dumbbell Set stock is under 5 units</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Vertical Divider */}
            <div className="h-7 w-px bg-slate-200"></div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-200/60 text-left focus:outline-none cursor-pointer"
              >
                <div className="relative">
                  <img
                    src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/20"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                    {user?.fullName || "Đinh Công Hùng"}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isAdmin ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {isAdmin ? "Super Admin" : "Staff"}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-medium">{user?.email || "admin@sportx.store"}</div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-xs font-bold text-slate-900 truncate">{user?.email || "admin@sportx.store"}</p>
                    <p className="text-[10px] text-blue-600 font-bold mt-0.5">Role: {user?.role || "ADMIN"}</p>
                  </div>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition">
                    <UserCheck className="w-4 h-4 text-slate-400" />
                    Account Profile
                  </button>
                  <button className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    Roles & Permissions
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-rose-500" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
