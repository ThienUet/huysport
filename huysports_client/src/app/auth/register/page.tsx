"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input } from "@heroui/react";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaArrowRight,
  FaCircleCheck,
  FaCircleExclamation,
} from "react-icons/fa6";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/stores/useAuthStore";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMessage("Vui lòng điền đầy đủ họ tên, email và mật khẩu!");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải chứa ít nhất 6 ký tự!");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const res = await authService.register({ fullName, email, password, phone, role: "CUSTOMER" });
      if (res.success) {
        if (res.token && res.user) {
          setAuth(res.user, res.token);
        }
        setSuccessMessage("Đăng ký tài khoản thành công! Đang chuyển hướng...");
        setTimeout(() => {
          router.push("/account");
        }, 1000);
      } else {
        setErrorMessage(res.message || "Đăng ký không thành công. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Email này có thể đã được đăng ký!");
    } finally {
      setIsLoading(false);
    }
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
            <h2 className="text-lg font-bold text-gray-800">Tạo Tài Khoản Mới</h2>
            <p className="text-xs text-gray-500">
              Gia nhập cộng đồng HuySport để nhận ưu đãi mua sắm
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="text"
              label="Họ và tên của bạn"
              placeholder="Nguyễn Văn A"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              startContent={<FaUser className="w-3.5 h-3.5 text-gray-400" />}
              isRequired
              radius="lg"
              classNames={{
                inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent",
              }}
            />

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
              type="tel"
              label="Số điện thoại"
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              startContent={<FaPhone className="w-3.5 h-3.5 text-gray-400" />}
              radius="lg"
              classNames={{
                inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent",
              }}
            />

            <Input
              type="password"
              label="Mật khẩu"
              placeholder="Tối thiểu 6 ký tự"
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
              Tạo Tài Khoản
            </Button>

            <div className="text-center pt-4 text-sm text-gray-500 border-t border-gray-100 mt-4">
              Đã có tài khoản?{" "}
              <Link href="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
