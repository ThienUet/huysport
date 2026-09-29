import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useToastStore } from "@/store/useToastStore";
import { authService } from "@/services/api";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Crown,
  Briefcase,
  Sparkles,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const toast = useToastStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const from = (location.state as any)?.from?.pathname || "/";

  const handleLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    const loginEmail = customEmail || email;
    const loginPassword = customPass || password;

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage("Vui lòng nhập đầy đủ Email và Mật khẩu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await authService.login({
        email: loginEmail.trim(),
        password: loginPassword.trim(),
      });

      if (res.success && res.data) {
        const { user, tokens } = res.data;
        login(tokens.accessToken, user);
        toast.success(
          "Đăng nhập thành công",
          `Chào mừng ${user.fullName} (${user.role === "ADMIN" ? "Super Admin" : "Staff"}) quay trở lại!`
        );
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.message || "Đăng nhập không thành công.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Email hoặc mật khẩu không chính xác.");
      toast.error("Đăng nhập thất bại", err.message || "Kiểm tra lại thông tin đăng nhập.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoRole: "ADMIN" | "STAFF") => {
    if (demoRole === "ADMIN") {
      setEmail("admin@sportx.store");
      setPassword("Admin@123456");
      handleLogin(undefined, "admin@sportx.store", "Admin@123456");
    } else {
      setEmail("staff@sportx.store");
      setPassword("Staff@123456");
      handleLogin(undefined, "staff@sportx.store", "Staff@123456");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden relative z-10">
        {/* Left Column: Visual & Brand Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent"></div>

          <div>
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <img
                src="/logo-256.png"
                alt="HuySport Logo"
                className="w-14 h-14 object-contain rounded-full bg-white p-1 shadow-xl shadow-emerald-950/20"
              />
              <div>
                <h1 className="font-black text-2xl tracking-tight leading-none text-white">
                  Huy<span className="text-emerald-400">Sport</span>
                </h1>
                <p className="text-[11px] font-bold text-emerald-200/80 uppercase tracking-widest mt-1">
                  Admin Platform
                </p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-snug mb-3">
              Hệ thống Quản trị & AI Chatbot Thể Thao
            </h2>
            <p className="text-xs sm:text-sm text-blue-100/80 leading-relaxed">
              Giải pháp thương mại điện tử chuyên nghiệp tích hợp AI tư vấn kích cỡ theo chỉ số cơ thể, quản lý đa kho, phân loại khách hàng và thanh toán trực tuyến.
            </p>
          </div>

          {/* Quick Demo Login Presets */}
          <div className="mt-8 pt-6 border-t border-white/15 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Đăng nhập thử nghiệm nhanh 1-Click:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("ADMIN")}
                disabled={isLoading}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-xl text-xs font-bold transition text-left backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-white">Super Admin (Toàn quyền)</div>
                    <div className="text-[10px] text-blue-200 font-mono">admin@sportx.store</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("STAFF")}
                disabled={isLoading}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 rounded-xl text-xs font-bold transition text-left backdrop-blur-md"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center">
                    <Briefcase className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-white">Staff (Quản lý Đơn & Kho)</div>
                    <div className="text-[10px] text-blue-200 font-mono">staff@sportx.store</div>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Login Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Đăng Nhập Quản Trị</h2>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Nhập thông tin xác thực để truy cập vào hệ thống SportX.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                <ShieldCheck className="w-3.5 h-3.5" />
                Bảo mật JWT
              </span>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={(e) => handleLogin(e)} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Địa chỉ Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="admin@sportx.store"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 block">
                    Mật khẩu <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                    Quên mật khẩu?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Đang xác thực...
                  </span>
                ) : (
                  <>
                    <span>Đăng Nhập Vào Hệ Thống</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer & Register Link */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Chưa có tài khoản nhân sự?</span>
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              Đăng ký tài khoản mới &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
