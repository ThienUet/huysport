"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Chip, Tabs, Tab, Input } from "@heroui/react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapPin,
  FaBox,
  FaRightFromBracket,
  FaCalendarDays,
  FaAward,
  FaChevronRight,
  FaBagShopping,
  FaLock,
} from "react-icons/fa6";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { authService } from "@/services/authService";
import { Order } from "@/types";

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isHydrated, setAuth, logout } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const localToken = typeof window !== "undefined" ? localStorage.getItem("sportx_client_token") : null;

    if (!isHydrated && localToken) {
      return;
    }

    if (!isAuthenticated && !localToken) {
      router.push("/auth/login");
    } else if (localToken && !user) {
      authService
        .getMe()
        .then((res) => {
          if (res.success && res.user) {
            setAuth(res.user, localToken);
          } else {
            router.push("/auth/login");
          }
        })
        .catch(() => {})
        .finally(() => {
          setIsCheckingAuth(false);
        });
    } else {
      setIsCheckingAuth(false);
    }
  }, [isAuthenticated, isHydrated, user, token, router, setAuth]);

  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ["orders", "user", user?.email || "customer"],
    queryFn: () => orderService.trackOrderByCode(user?.email || user?.phone || "customer@sportx.store"),
    enabled: !!user?.email || !!user?.phone,
  });

  const orders: Order[] = ordersData?.data || [];

  if (isCheckingAuth || (!user && (isAuthenticated || (typeof window !== "undefined" && localStorage.getItem("sportx_client_token"))))) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-500 font-semibold">Đang tải thông tin tài khoản...</p>
      </div>
    );
  }

  const currentUser = user || {
    id: "usr-guest",
    fullName: "Khách Hàng Thân Thiết",
    email: "customer@sportx.store",
    role: "customer" as const,
    avatar: "",
    phone: "0398802022",
    address: "Xuân Khanh, Sơn Tây, Hà Nội",
  };

  const getStatusColor = (status: string) => {
    if (status === "DELIVERED") return "success";
    if (status === "PENDING") return "warning";
    if (status === "CANCELLED") return "danger";
    return "default";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Profile Header */}
        <div className="bg-emerald-600 text-white p-6 sm:p-8 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Avatar
              size="lg"
              name={currentUser.fullName}
              className="w-16 h-16 text-lg font-bold bg-white text-emerald-600 border-2 border-emerald-200 flex-shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser.fullName}</h1>
                <Chip size="sm" className="bg-emerald-700 text-white font-bold text-xs border-none">
                  {currentUser.role === "admin" ? "Quản Trị Viên" : "Thành Viên SportX"}
                </Chip>
              </div>
              <p className="text-sm text-emerald-100">{currentUser.email}</p>
            </div>
          </div>

          <Button
            className="bg-white/20 hover:bg-white/30 text-white font-bold text-sm rounded-lg"
            startContent={<FaRightFromBracket className="w-4 h-4" />}
            onPress={() => {
              logout();
              router.push("/");
            }}
          >
            Đăng Xuất
          </Button>
        </div>

        <Tabs 
          aria-label="Account Options" 
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gray-200",
            cursor: "w-full bg-emerald-600",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-emerald-600 text-gray-500 font-bold text-sm"
          }}
        >
          <Tab
            key="info"
            title={
              <div className="flex items-center space-x-2">
                <FaUser className="w-4 h-4" />
                <span>Thông tin</span>
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  Cập Nhật Thông Tin
                </h3>
                <div className="space-y-4 pt-2">
                  <Input 
                    label="Họ và tên" 
                    defaultValue={currentUser.fullName} 
                    radius="lg"
                    classNames={{ inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent" }}
                  />
                  <Input 
                    label="Email" 
                    defaultValue={currentUser.email} 
                    radius="lg"
                    isDisabled
                  />
                  <Input 
                    label="Số điện thoại" 
                    defaultValue={currentUser.phone} 
                    radius="lg"
                    classNames={{ inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent" }}
                  />
                  <Input 
                    label="Địa chỉ" 
                    defaultValue={currentUser.address} 
                    radius="lg"
                    classNames={{ inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent" }}
                  />
                  <Button radius="full" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full">
                    Lưu Thay Đổi
                  </Button>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
                  Thành Viên SportX
                </h3>
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-900 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <FaAward className="w-5 h-5 text-emerald-600" /> Điểm Tích Lũy:
                  </div>
                  <p className="text-2xl font-extrabold text-emerald-600">450 Điểm</p>
                  <p className="text-sm text-emerald-700">Được giảm thêm 5% cho các đơn hàng tiếp theo</p>
                </div>
              </div>
            </div>
          </Tab>

          <Tab
            key="orders"
            title={
              <div className="flex items-center space-x-2">
                <FaBox className="w-4 h-4" />
                <span>Đơn hàng</span>
              </div>
            }
          >
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 mt-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="font-bold text-base text-gray-900">
                  Lịch Sử Đơn Hàng Của Bạn
                </h3>
                <span className="text-sm font-semibold text-gray-500">
                  {orders.length} đơn hàng
                </span>
              </div>

              {isOrdersLoading ? (
                <div className="py-12 text-center text-sm text-gray-400">Đang tải lịch sử đơn hàng...</div>
              ) : orders.length === 0 ? (
                <div className="py-12 text-center space-y-3">
                  <FaBagShopping className="w-12 h-12 text-gray-300 mx-auto" />
                  <p className="text-sm text-gray-500">Bạn chưa có đơn hàng nào tại SportX.</p>
                  <Button as={Link} href="/products" radius="full" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm">
                    Mua Sắm Ngay
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div
                      key={ord.id || ord.orderNumber}
                      className="p-4 rounded-xl border border-gray-200 hover:border-emerald-300 transition space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 font-mono font-bold text-gray-900">
                          <span>{ord.orderNumber}</span>
                          <Chip size="sm" color={getStatusColor(ord.fulfillmentStatus) as any} variant="flat" className="font-sans font-bold">
                            {ord.fulfillmentStatus}
                          </Chip>
                        </div>
                        <span className="font-extrabold text-emerald-600 text-base">
                          {ord.totalAmount?.toLocaleString("vi-VN")}đ
                        </span>
                      </div>

                      <div className="text-sm text-gray-500 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1.5">
                          <FaCalendarDays className="w-3.5 h-3.5" />
                          {new Date(ord.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                        <span>•</span>
                        <span>{ord.items?.length || 1} sản phẩm</span>
                        <span>•</span>
                        <span>Thanh toán: {ord.paymentMethod}</span>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Link
                          href={`/orders?search=${encodeURIComponent(ord.orderNumber)}`}
                          className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
                        >
                          Xem chi tiết <FaChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tab>

          <Tab
            key="password"
            title={
              <div className="flex items-center space-x-2">
                <FaLock className="w-4 h-4" />
                <span>Đổi mật khẩu</span>
              </div>
            }
          >
            <div className="max-w-md mt-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-bold text-base text-gray-900 border-b border-gray-100 pb-3">
                Thay Đổi Mật Khẩu
              </h3>
              <div className="space-y-4 pt-2">
                <Input 
                  type="password"
                  label="Mật khẩu hiện tại" 
                  radius="lg"
                  classNames={{ inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent" }}
                />
                <Input 
                  type="password"
                  label="Mật khẩu mới" 
                  radius="lg"
                  classNames={{ inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent" }}
                />
                <Input 
                  type="password"
                  label="Xác nhận mật khẩu mới" 
                  radius="lg"
                  classNames={{ inputWrapper: "focus-within:!ring-2 focus-within:!ring-emerald-500 focus-within:!border-transparent" }}
                />
                <Button radius="full" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full mt-2">
                  Cập Nhật Mật Khẩu
                </Button>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  );
}
