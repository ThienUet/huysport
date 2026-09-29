"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import {
  FaLock,
  FaEnvelope,
  FaArrowRight,
  FaCircleCheck,
  FaCircleExclamation,
} from "react-icons/fa6";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await authService.login({ email, password });
      if (res.success) {
        if (res.token && res.user) {
          setAuth(res.user, res.token);
        }
        setSuccessMessage("Đăng nhập thành công! Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/account");
        }, 800);
      } else {
        setErrorMessage(res.message || "Đăng nhập không thành công. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Email hoặc mật khẩu không chính xác!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Customer@123456");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:py-16">
      <div className="max-w-md w-full mx-auto px-4 space-y-6 sm:space-y-8">
        
        {successMessage && (
          <div className="p-3.5 rounded-md bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center gap-2 border border-emerald-200">
            <FaCircleCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-md bg-red-50 text-red-700 text-sm font-semibold flex items-center gap-2 border border-red-200">
            <FaCircleExclamation className="w-4 h-4 text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-xl border border-gray-200 shadow-sm">
          <div className="text-center space-y-3 mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-2 group">
              <img
                src="/logo-256.png"
                alt="HuySport Logo"
                className="w-16 h-16 object-contain rounded-full group-hover:scale-105 transition-transform"
              />
              <div className="flex items-baseline leading-none">
                <span className="text-2xl font-black tracking-tight text-gray-900">HUY</span>
                <span className="text-2xl font-black tracking-tight text-emerald-600">SPORT</span>
              </div>
            </Link>
            <h2 className="text-lg font-bold text-gray-800">Đăng Nhập Tài Khoản</h2>
            <p className="text-xs text-gray-500">
              Chào mừng trở lại với hệ thống mua sắm thể thao
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Địa chỉ Email"
              placeholder="email@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<FaEnvelope className="w-3.5 h-3.5 text-gray-400" />}
              isRequired
              radius="lg"
              classNames={{
                inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent",
              }}
            />

            <Input
              type="password"
              label="Mật khẩu"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              startContent={<FaLock className="w-3.5 h-3.5 text-gray-400" />}
              isRequired
              radius="lg"
              classNames={{
                inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent",
              }}
            />

            <Button
              type="submit"
              radius="full"
              size="lg"
              className="w-full font-bold text-sm h-11 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white"
              endContent={<FaArrowRight className="w-3.5 h-3.5" />}
              isLoading={isLoading}
            >
              Đăng Nhập Ngay
            </Button>

            {/* Quick Demo Accounts */}
            <div className="pt-4 border-t border-gray-100 space-y-2 mt-4">
              <span className="text-xs font-bold text-gray-400 block text-center uppercase tracking-wider">
                Tài Khoản Mẫu Thử Nghiệm:
              </span>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo("customer@sportx.store")}
                  className="text-xs bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 font-semibold px-3 py-1.5 rounded-md transition cursor-pointer"
                >
                  Khách Hàng Mẫu
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemo("admin@sportx.store")}
                  className="text-xs bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-600 font-semibold px-3 py-1.5 rounded-md transition cursor-pointer"
                >
                  Admin Quản Trị
                </button>
              </div>
            </div>

            <div className="text-center pt-4 text-sm text-gray-500">
              Chưa có tài khoản?{" "}
              <Link href="/auth/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
