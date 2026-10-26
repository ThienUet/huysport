"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, Button, Chip, Tabs, Tab, Input, Tooltip } from "@heroui/react";
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
  FaXmark,
  FaCircleCheck,
  FaCircleExclamation,
  FaCamera,
} from "react-icons/fa6";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTrackOrders, useCancelOrder } from "@/hooks";
import { authService } from "@/services/authService";
import { Order } from "@/types";
import { formatDateTime } from "@/utils/formatUtils";

const CANCEL_REASONS = [
  "Sai thông tin nhận hàng (địa chỉ, số điện thoại)",
  "Muốn thay đổi kích cỡ (size) hoặc màu sắc sản phẩm",
  "Đổi ý, không muốn mua nữa",
  "Tìm thấy giá tốt hơn ở nơi khác",
  "Đặt trùng đơn hàng",
  "Khác...",
];

export default function AccountPage() {
  const router = useRouter();
  const { user, token, isAuthenticated, isHydrated, setAuth, logout, updateUser } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadMsg, setAvatarUploadMsg] = useState<string | null>(null);

  const handleClientAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setAvatarUploadMsg(null);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
        : "http://localhost:5000";

      const res = await fetch(`${apiUrl}/api/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: base64,
          filename: `avatar-${file.name}`,
          type: "avatar",
        }),
      });

      const data = await res.json();
      const finalUrl = data?.url || base64;
      if (user) {
        updateUser({ avatar: finalUrl });
        authService.updateProfile({ avatar: finalUrl }).catch(() => {});
      } else {
        const updatedGuest = { ...currentUser, avatar: finalUrl };
        setAuth(updatedGuest, "sportx_guest_token");
      }
      setAvatarUploadMsg("Đã cập nhật và lưu ảnh avatar vào images/avatars!");
      setTimeout(() => setAvatarUploadMsg(null), 3500);
    } catch {
      setAvatarUploadMsg("Lỗi khi tải ảnh đại diện lên");
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // Cancellation modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

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

  const userQueryKey = user?.email || user?.phone || "customer@sportx.store";
  const { data: ordersData, isLoading: isOrdersLoading, refetch: refetchOrders } = useTrackOrders(userQueryKey);
  const cancelOrderMutation = useCancelOrder();

  const orders: Order[] = ordersData?.data || [];

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const finalReason = selectedReason === "Khác..." ? (customReasonText.trim() || "Khách yêu cầu hủy đơn") : selectedReason;

    setIsCancelling(true);
    setCancelMessage(null);
    try {
      await cancelOrderMutation.mutateAsync({ id: cancelModalOrder.id, reason: finalReason });
      setCancelMessage({
        type: "success",
        text: `Đã hủy đơn hàng #${cancelModalOrder.orderNumber} thành công và hoàn trả lại số lượng tồn kho.`,
      });
      setCancelModalOrder(null);
      refetchOrders();
    } catch (err: any) {
      setCancelMessage({
        type: "error",
        text: err.message || "Không thể hủy đơn hàng lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (isCheckingAuth || (!user && (isAuthenticated || (typeof window !== "undefined" && localStorage.getItem("sportx_client_token"))))) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-pulse">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-slate-200 rounded" />
              <div className="h-4 w-52 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="h-10 w-28 bg-slate-100 rounded-xl" />
        </div>
        <div className="flex gap-2 border-b border-gray-200 pb-2">
          <div className="h-9 w-28 bg-emerald-100 rounded-lg" />
          <div className="h-9 w-28 bg-slate-100 rounded-lg" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 w-full bg-slate-50 border border-slate-100 rounded-xl" />
          ))}
        </div>
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
            <div className="relative group">
              <Avatar
                size="lg"
                src={currentUser.avatar || undefined}
                name={currentUser.fullName}
                className="w-16 h-16 text-lg font-bold bg-white text-emerald-600 border-2 border-emerald-200 flex-shrink-0"
              />
              <label
                htmlFor="client-avatar-file"
                className="absolute inset-0 bg-black/50 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer text-white"
                title="Thay đổi ảnh đại diện (Lưu vào images/avatars)"
              >
                <FaCamera className="w-4 h-4" />
                <span className="text-[9px] font-bold mt-0.5">Đổi ảnh</span>
              </label>
              <input
                id="client-avatar-file"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={isUploadingAvatar}
                onChange={handleClientAvatarChange}
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold">{currentUser.fullName}</h1>
                <Chip size="sm" className="bg-emerald-700 text-white font-bold text-xs border-none">
                  {currentUser.role === "admin" ? "Quản Trị Viên" : "Thành Viên SportX"}
                </Chip>
              </div>
              <p className="text-sm text-emerald-100">{currentUser.email}</p>
              {isUploadingAvatar && <p className="text-xs text-emerald-200 animate-pulse">Đang tải ảnh avatar lên...</p>}
              {avatarUploadMsg && <p className="text-xs text-white font-semibold">{avatarUploadMsg}</p>}
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

              {cancelMessage && (
                <div
                  className={`p-3.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                    cancelMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {cancelMessage.type === "success" ? (
                      <FaCircleCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <FaCircleExclamation className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{cancelMessage.text}</span>
                  </div>
                  <button
                    onClick={() => setCancelMessage(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <FaXmark className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {isOrdersLoading ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-4 rounded-xl border border-gray-100 bg-slate-50/70 space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="h-5 w-28 bg-slate-200 rounded" />
                        <div className="h-5 w-20 bg-slate-200 rounded-full" />
                      </div>
                      <div className="h-4 w-2/3 bg-slate-100 rounded" />
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="h-4 w-32 bg-slate-100 rounded" />
                        <div className="h-4 w-24 bg-emerald-100 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
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
                  {orders.map((ord) => {
                    const normStatus = (ord.fulfillmentStatus || "").toUpperCase();
                    const canCancel = normStatus === "PENDING" || normStatus === "PROCESSING";
                    const isShipping = normStatus === "SHIPPING";

                    return (
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
                            {formatDateTime(ord.createdAt || ord.dateTime)}
                          </span>
                          <span>•</span>
                          <span>{ord.items?.length || 1} sản phẩm</span>
                          <span>•</span>
                          <span>Thanh toán: {ord.paymentMethod}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                          {canCancel ? (
                            <button
                              type="button"
                              onClick={() => {
                                setCancelModalOrder(ord);
                                setSelectedReason(CANCEL_REASONS[0]);
                                setCustomReasonText("");
                              }}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
                            >
                              <FaXmark className="w-3.5 h-3.5" />
                              Hủy đơn này
                            </button>
                          ) : isShipping ? (
                            <Tooltip
                              content="Đang giao hàng, bạn không được hủy đơn hàng."
                              placement="top"
                              classNames={{
                                content: "text-xs py-1.5 px-3 font-semibold bg-gray-900 text-white rounded-lg shadow-xl",
                              }}
                            >
                              <div
                                className="inline-block cursor-not-allowed"
                                title="Đang giao hàng, bạn không được hủy đơn hàng."
                              >
                                <button
                                  type="button"
                                  disabled
                                  className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 flex items-center gap-1.5 cursor-not-allowed opacity-80 pointer-events-none"
                                >
                                  <FaXmark className="w-3.5 h-3.5" />
                                  Hủy đơn này
                                </button>
                              </div>
                            </Tooltip>
                          ) : ord.fulfillmentStatus === "CANCELLED" ? (
                            <span className="text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                              Đơn đã hủy & hoàn kho
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Đã giao thành công
                            </span>
                          )}

                          <Link
                            href={`/orders?search=${encodeURIComponent(ord.orderNumber.replace(/^#/, ""))}`}
                            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1.5"
                          >
                            Xem chi tiết <FaChevronRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}
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

        {/* Cancel Order Modal */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
              <div>
                <h3 className="text-base font-extrabold text-gray-900">
                  Xác nhận hủy đơn hàng #{cancelModalOrder.orderNumber}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Đơn hàng đang ở trạng thái <strong>{cancelModalOrder.fulfillmentStatus === "PROCESSING" ? "Đang đóng gói" : "Chờ xác nhận"}</strong>. Sau khi hủy, hệ thống sẽ tự động hoàn lại số lượng tồn kho cho các sản phẩm.
                </p>
              </div>

              <div className="space-y-2.5">
                <label className="block text-xs font-bold text-gray-700">
                  Chọn lý do bạn muốn hủy đơn:
                </label>
                <div className="space-y-2">
                  {CANCEL_REASONS.map((reason) => (
                    <label
                      key={reason}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                        selectedReason === reason
                          ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold"
                          : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="cancel_reason_account"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => setSelectedReason(reason)}
                        className="text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === "Khác..." && (
                  <div className="mt-2">
                    <textarea
                      rows={2}
                      placeholder="Nhập lý do cụ thể của bạn..."
                      value={customReasonText}
                      onChange={(e) => setCustomReasonText(e.target.value)}
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <Button
                  size="sm"
                  variant="light"
                  className="font-bold text-xs"
                  onClick={() => setCancelModalOrder(null)}
                  isDisabled={isCancelling}
                >
                  Giữ đơn hàng
                </Button>
                <Button
                  size="sm"
                  color="danger"
                  className="font-bold text-xs bg-rose-600 text-white rounded-full shadow-xs cursor-pointer"
                  onClick={handleConfirmCancelOrder}
                  isLoading={isCancelling}
                >
                  Xác nhận hủy đơn
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
