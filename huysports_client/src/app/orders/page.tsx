"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input, Button, Chip, Tooltip } from "@heroui/react";
import {
  FaMagnifyingGlass,
  FaBox,
  FaTruckFast,
  FaCircleCheck,
  FaClock,
  FaCircleExclamation,
  FaPhone,
  FaMapPin,
  FaCalendarDays,
  FaCreditCard,
  FaBoxOpen,
  FaXmark,
  FaArrowRotateLeft,
  FaBuildingColumns,
} from "react-icons/fa6";
import { useTrackOrders, useCancelOrder, useRequestReturn } from "@/hooks";
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

const RETURN_REASONS = [
  "Sản phẩm bị lỗi, rách hoặc bung keo do nhà sản xuất",
  "Giao sai mẫu mã, sai kích cỡ (size) hoặc sai màu sắc",
  "Mặc không vừa vặn, có nhu cầu đổi sang kích cỡ khác",
  "Sản phẩm thực tế không đúng với mô tả trên website",
  "Khác...",
];

function OrdersContent() {
  const searchParams = useSearchParams();
  const rawSearch = searchParams.get("search") || "";
  const initialSearch = rawSearch.trim().replace(/^#/, "");
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [submittedQuery, setSubmittedQuery] = useState(initialSearch);

  // Cancel order modal state
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelActionMessage, setCancelActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [recentOrderNumbers, setRecentOrderNumbers] = useState<string[]>([]);

  // Return & refund modal state
  const [returnModalOrder, setReturnModalOrder] = useState<Order | null>(null);
  const [selectedReturnReason, setSelectedReturnReason] = useState(RETURN_REASONS[0]);
  const [customReturnText, setCustomReturnText] = useState("");
  const [bankName, setBankName] = useState("Vietcombank");
  const [bankAccount, setBankAccount] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);

  useEffect(() => {
    if (initialSearch) {
      setSearchInput(initialSearch);
      setSubmittedQuery(initialSearch);
    }
    if (typeof window !== "undefined") {
      try {
        const local: Order[] = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
        const codes = Array.from(new Set(local.map((o) => o.orderNumber.replace(/^#/, "")))).slice(0, 5);
        setRecentOrderNumbers(codes);
      } catch {}
    }
  }, [initialSearch]);

  // Use custom React Query hooks
  const { data: ordersData, isLoading, refetch } = useTrackOrders(submittedQuery);
  const cancelOrderMutation = useCancelOrder();
  const requestReturnMutation = useRequestReturn();

  const orders: Order[] = ordersData?.data || [];

  const handleConfirmCancelOrder = async () => {
    if (!cancelModalOrder) return;
    const finalReason = selectedReason === "Khác..." ? (customReasonText.trim() || "Khách yêu cầu hủy đơn") : selectedReason;

    setIsCancelling(true);
    setCancelActionMessage(null);
    try {
      await cancelOrderMutation.mutateAsync({ id: cancelModalOrder.id, reason: finalReason });
      setCancelActionMessage({
        type: "success",
        text: `Đã hủy đơn hàng #${cancelModalOrder.orderNumber} thành công và hoàn trả lại số lượng tồn kho.`,
      });
      setCancelModalOrder(null);
      refetch();
    } catch (err: any) {
      setCancelActionMessage({
        type: "error",
        text: err.message || "Không thể hủy đơn hàng lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleConfirmReturnOrder = async () => {
    if (!returnModalOrder) return;
    const finalReason =
      selectedReturnReason === "Khác..."
        ? customReturnText.trim() || "Khách yêu cầu đổi trả hàng"
        : selectedReturnReason;

    setIsSubmittingReturn(true);
    setCancelActionMessage(null);

    try {
      await requestReturnMutation.mutateAsync({
        orderNumber: returnModalOrder.orderNumber,
        reason: finalReason,
        detailedReason: customReturnText,
        bankName,
        bankAccount,
        accountHolder,
        refundAmount: returnModalOrder.totalAmount,
      });

      setCancelActionMessage({
        type: "success",
        text: `Đã gửi yêu cầu đổi trả / hoàn hàng cho đơn #${returnModalOrder.orderNumber}. Đội ngũ SportX sẽ xử lý và liên hệ với bạn!`,
      });
      setReturnModalOrder(null);
      refetch();
    } catch (err: any) {
      setCancelActionMessage({
        type: "error",
        text: err.message || "Không thể gửi yêu cầu hoàn hàng lúc này. Vui lòng thử lại sau.",
      });
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim().replace(/^#/, "");
    if (clean) {
      setSubmittedQuery(clean);
    }
  };

  const getStatusBadge = (order: Order) => {
    if (order.returnRequest) {
      switch (order.returnRequest.status) {
        case "Pending":
          return <Chip className="bg-amber-100 text-amber-800 font-bold border-none" variant="flat" size="sm">Chờ Duyệt Đổi Trả</Chip>;
        case "Approved":
          return <Chip className="bg-blue-100 text-blue-800 font-bold border-none" variant="flat" size="sm">Đã Duyệt Đổi Trả</Chip>;
        case "Completed":
          return <Chip className="bg-emerald-100 text-emerald-800 font-bold border-none" variant="flat" size="sm">Đã Hoàn Hàng / Tiền</Chip>;
        case "Rejected":
          return <Chip className="bg-rose-100 text-rose-800 font-bold border-none" variant="flat" size="sm">Từ Chối Đổi Trả</Chip>;
      }
    }

    switch (order.fulfillmentStatus) {
      case "DELIVERED":
        return <Chip className="bg-emerald-100 text-emerald-700 font-bold border-none" variant="flat" size="sm">Đã Giao Hàng</Chip>;
      case "SHIPPING":
        return <Chip className="bg-emerald-50 text-emerald-600 font-bold border-none" variant="flat" size="sm">Đang Giao Hàng</Chip>;
      case "PROCESSING":
        return <Chip className="bg-amber-100 text-amber-700 font-bold border-none" variant="flat" size="sm">Đang Đóng Gói</Chip>;
      case "CANCELLED":
        return <Chip className="bg-gray-200 text-gray-700 font-bold border-none" variant="flat" size="sm">Đã Hủy</Chip>;
      default:
        return <Chip className="bg-amber-50 text-amber-600 font-bold border-none" variant="flat" size="sm">Chờ Xác Nhận</Chip>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Theo Dõi Trạng Thái Thời Gian Thực
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Tra Cứu Thông Tin Đơn Hàng
        </h1>
        <p className="text-xs text-gray-500">
          Nhập mã đơn hàng (VD: <strong>SPX-1234</strong>) hoặc số điện thoại đặt hàng để kiểm tra tiến trình giao hàng.
        </p>
      </div>

      {/* Search Bar Form */}
      <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
        <Input
          type="text"
          placeholder="Nhập mã đơn hàng hoặc số điện thoại..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          size="md"
          radius="full"
          startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400" />}
          classNames={{
            inputWrapper: "bg-white border border-gray-200 shadow-sm focus-within:!border-emerald-500",
          }}
        />
        <Button
          type="submit"
          color="primary"
          className="font-bold text-xs px-6 rounded-full shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          isLoading={isLoading}
        >
          Tra Cứu
        </Button>
      </form>

      {/* Quick Recent Order Chips */}
      {recentOrderNumbers.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-gray-500 max-w-xl mx-auto">
          <span className="font-semibold text-gray-700">Đơn gần đây của bạn:</span>
          {recentOrderNumbers.map((code) => {
            const cleanCode = code.replace(/^#/, "");
            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setSearchInput(cleanCode);
                  setSubmittedQuery(cleanCode);
                }}
                className="px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 font-mono font-bold text-gray-800 rounded-lg border border-gray-200 shadow-2xs transition cursor-pointer"
              >
                #{cleanCode}
              </button>
            );
          })}
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-6">
        {cancelActionMessage && (
          <div
            className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border ${
              cancelActionMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}
          >
            <span>{cancelActionMessage.text}</span>
            <button
              onClick={() => setCancelActionMessage(null)}
              className="text-xs font-bold underline ml-2"
            >
              Đóng
            </button>
          </div>
        )}

        {isLoading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map((idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-5 w-32 bg-slate-200 rounded" />
                      <div className="h-5 w-24 bg-blue-100 rounded-full" />
                    </div>
                    <div className="h-3.5 w-44 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-28 bg-emerald-100 rounded" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 bg-slate-200 rounded" />
                    <div className="h-3 w-1/3 bg-slate-100 rounded" />
                  </div>
                  <div className="h-4 w-20 bg-slate-200 rounded shrink-0" />
                </div>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="h-4 w-48 bg-slate-100 rounded" />
                  <div className="h-8 w-24 bg-slate-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && submittedQuery && orders.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-gray-200 space-y-3 shadow-sm">
            <FaCircleExclamation className="w-10 h-10 text-gray-400 mx-auto" />
            <h3 className="font-bold text-gray-900 text-sm">Không tìm thấy đơn hàng phù hợp!</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Vui lòng kiểm tra lại mã đơn hàng hoặc số điện thoại bạn đã nhập.
            </p>
          </div>
        )}

        {orders.map((order) => {
          const normStatus = (order.fulfillmentStatus || "").toUpperCase();
          const isShipping = normStatus === "SHIPPING";
          const isDelivered = normStatus === "DELIVERED" || normStatus === "COMPLETED";
          const isCanceled = normStatus === "CANCELLED" || normStatus === "CANCELED";
          const canCancel = !isShipping && !isDelivered && !isCanceled;

          return (
            <div
              key={order.id || order.orderNumber}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-6 p-6"
            >
              {/* Order Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-lg text-gray-900 font-mono">
                      #{order.orderNumber.replace(/^#/, "")}
                    </span>
                    {getStatusBadge(order)}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                    <FaCalendarDays className="w-3.5 h-3.5" />
                    <span>Ngày đặt: {formatDateTime(order.createdAt || (order as any).dateTime)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Tổng thanh toán:</span>
                  <span className="text-xl font-bold text-emerald-600 block">
                    {order.totalAmount?.toLocaleString("vi-VN")}đ
                  </span>
                  {order.discountAmount && order.discountAmount > 0 ? (
                    <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded inline-block mt-0.5">
                      Đã giảm: -{order.discountAmount.toLocaleString("vi-VN")}đ {order.couponCode ? `(${order.couponCode})` : ""}
                    </span>
                  ) : null}
                </div>
              </div>

            {/* Carrier Tracking Badge if Shipping */}
            {order.fulfillmentStatus === "SHIPPING" && (
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold">
                  <FaTruckFast className="w-4 h-4 text-blue-600" />
                  <span>Đơn vị vận chuyển: {order.shippingCarrier || "GHTK (Giao Hàng Tiết Kiệm)"}</span>
                </div>
                {order.trackingCode && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] bg-white px-2.5 py-1 rounded-md border border-blue-200 self-start sm:self-auto font-bold text-blue-700">
                    <span>Mã vận đơn:</span>
                    <span>{order.trackingCode}</span>
                  </div>
                )}
              </div>
            )}

            {/* Cancellation Notice if Cancelled */}
            {order.fulfillmentStatus === "CANCELLED" && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-rose-800">
                  <FaCircleExclamation className="w-4 h-4 text-rose-600" />
                  Đơn hàng đã được hủy và hoàn trả lại số lượng tồn kho
                </div>
                <p className="text-rose-700 font-medium">
                  Lý do: <strong>{order.cancelReason || "Khách yêu cầu hủy / Sai thông tin"}</strong>
                </p>
              </div>
            )}

            {/* Tiến trình đơn hàng */}
            {order.fulfillmentStatus !== "CANCELLED" && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-[11px] sm:text-xs">
                <div className="p-2 sm:p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-1.5 truncate">
                  <FaCircleCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">1. Chờ xác nhận</span>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-lg border font-bold flex items-center gap-1.5 truncate ${
                    order.fulfillmentStatus !== "PENDING"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  <FaBoxOpen className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">2. Đang đóng gói</span>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-lg border font-bold flex items-center gap-1.5 truncate ${
                    order.fulfillmentStatus === "SHIPPING" || order.fulfillmentStatus === "DELIVERED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  <FaTruckFast className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">3. Đang giao hàng</span>
                </div>
                <div
                  className={`p-2 sm:p-3 rounded-lg border font-bold flex items-center gap-1.5 truncate ${
                    order.fulfillmentStatus === "DELIVERED"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-gray-50 border-gray-200 text-gray-400"
                  }`}
                >
                  <FaCircleCheck className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">4. Giao thành công</span>
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Sản Phẩm Trong Đơn ({order.items?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          item.productImage && (item.productImage.startsWith("http") || item.productImage.startsWith("/"))
                            ? item.productImage
                            : "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"
                        }
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-white border border-gray-200 flex-shrink-0"
                      />
                      <div>
                        <h5 className="font-bold text-gray-900">{item.productName}</h5>
                        <div className="text-[11px] text-gray-500">
                          Size: {item.size} • Màu: {item.color} • SL: {item.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping & Payment Meta Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100 text-xs text-gray-600">
              <div className="space-y-1">
                <span className="font-bold text-gray-900 flex items-center gap-1.5">
                  <FaMapPin className="w-3.5 h-3.5 text-emerald-600" /> Địa Chỉ Giao Hàng:
                </span>
                <p>{order.shippingAddress?.fullName} - {order.shippingAddress?.phone}</p>
                <p className="text-gray-500">
                  {order.shippingAddress?.addressLine}, {order.shippingAddress?.ward}, {order.shippingAddress?.district}, {order.shippingAddress?.city}
                </p>
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="font-bold text-gray-900 flex items-center sm:justify-end gap-1.5">
                  <FaCreditCard className="w-3.5 h-3.5 text-emerald-600" /> Phương Thức Thanh Toán:
                </span>
                <p className="font-bold text-gray-800">{order.paymentMethod}</p>
                <p className="text-[11px] text-gray-500">
                  Trạng thái thanh toán: <strong className="text-emerald-600">{order.paymentStatus}</strong>
                </p>
              </div>
            </div>

            {/* Order Action Footer */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs">
                {canCancel ? (
                  <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium inline-block">
                    ✓ Đơn hàng đang chuẩn bị. Bạn có thể hủy đơn trước khi giao cho bên vận chuyển.
                  </span>
                ) : isShipping ? (
                  <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-medium inline-block border border-amber-200">
                    ⚡ Đơn hàng đang giao. Không thể hủy đơn trong quá trình vận chuyển.
                  </span>
                ) : isCanceled ? (
                  <span className="text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md font-medium inline-block">
                    Đơn hàng đã được hủy thành công và hoàn lại số lượng tồn kho.
                  </span>
                ) : order.returnRequest ? (
                  order.returnRequest.status === "Pending" ? (
                    <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md font-medium inline-block border border-amber-200">
                      ⏳ Đã gửi yêu cầu đổi trả ({order.returnRequest.reason}). SportX đang thẩm định hồ sơ.
                    </span>
                  ) : order.returnRequest.status === "Approved" ? (
                    <span className="text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md font-medium inline-block border border-blue-200">
                      📦 Yêu cầu đổi trả đã được duyệt! Shop: "{order.returnRequest.adminNote || 'Gửi hàng về số 12 Hữu Nghị, Xuân Khanh, Sơn Tây'}"
                    </span>
                  ) : order.returnRequest.status === "Completed" ? (
                    <span className="text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md font-medium inline-block border border-emerald-200">
                      ✓ Đã hoàn tất đổi trả & hoàn {order.returnRequest.refundAmount?.toLocaleString("vi-VN")}đ về STK {order.returnRequest.bankAccount} ({order.returnRequest.bankName}).
                    </span>
                  ) : (
                    <span className="text-rose-800 bg-rose-50 px-2.5 py-1 rounded-md font-medium inline-block border border-rose-200">
                      ✕ Yêu cầu đổi trả bị từ chối: {order.returnRequest.adminNote || 'Không thỏa điều kiện đổi trả'}.
                    </span>
                  )
                ) : (
                  <span className="text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md font-medium inline-block">
                    Đơn hàng đã hoàn thành. Quý khách được quyền yêu cầu đổi trả miễn phí trong vòng 30 ngày.
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto flex-wrap justify-end">
                {normStatus === "DELIVERED" && !order.returnRequest && (
                  <Button
                    size="sm"
                    className="font-bold text-xs rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-xs cursor-pointer h-9 px-4"
                    startContent={<FaArrowRotateLeft className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setReturnModalOrder(order);
                      setSelectedReturnReason(RETURN_REASONS[0]);
                      setCustomReturnText("");
                      setBankName("Vietcombank");
                      setBankAccount("");
                      setAccountHolder(order.shippingAddress?.fullName || order.customer?.fullName || "");
                    }}
                  >
                    Yêu cầu Đổi trả / Hoàn hàng
                  </Button>
                )}
                {canCancel ? (
                  <Button
                    size="sm"
                    color="danger"
                    variant="bordered"
                    className="font-bold text-xs rounded-xl border-rose-300 text-rose-600 hover:bg-rose-50 cursor-pointer h-9 px-4"
                    startContent={<FaXmark className="w-3.5 h-3.5" />}
                    onClick={() => {
                      setCancelModalOrder(order);
                      setSelectedReason(CANCEL_REASONS[0]);
                      setCustomReasonText("");
                    }}
                  >
                    Hủy đơn hàng
                  </Button>
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
                      <Button
                        size="sm"
                        variant="bordered"
                        isDisabled
                        className="font-bold text-xs rounded-xl border-gray-200 text-gray-400 bg-gray-50 h-9 px-4 cursor-not-allowed pointer-events-none"
                        startContent={<FaXmark className="w-3.5 h-3.5 text-gray-400" />}
                      >
                        Hủy đơn hàng
                      </Button>
                    </div>
                  </Tooltip>
                ) : null}
                <Button
                  as={Link}
                  href="/contact"
                  size="sm"
                  variant="light"
                  className="font-medium text-xs text-gray-600 h-9"
                >
                  Liên hệ hỗ trợ
                </Button>
              </div>
            </div>
          </div>
        );
      })}
      </div>

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
                      name="cancel_reason"
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

      {/* Return & Refund Order Modal */}
      {returnModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <FaArrowRotateLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Chính Sách Đổi Trả 30 Ngày</span>
              </div>
              <h3 className="text-base font-extrabold text-gray-900">
                Yêu cầu Đổi trả / Hoàn hàng #{returnModalOrder.orderNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Vui lòng cung cấp lý do đổi trả và thông tin tài khoản nhận tiền hoàn. Đội ngũ CSKH SportX sẽ duyệt và hướng dẫn bạn đóng gói gửi hàng.
              </p>
            </div>

            {/* Select Return Reason */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                1. Lý do bạn muốn đổi trả:
              </label>
              <div className="space-y-1.5">
                {RETURN_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                      selectedReturnReason === reason
                        ? "bg-amber-50 border-amber-400 text-amber-900 font-semibold"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="return_reason"
                      value={reason}
                      checked={selectedReturnReason === reason}
                      onChange={() => setSelectedReturnReason(reason)}
                      className="text-amber-600 focus:ring-amber-500"
                    />
                    <span>{reason}</span>
                  </label>
                ))}
              </div>

              <div>
                <textarea
                  rows={2}
                  placeholder="Mô tả chi tiết tình trạng hàng hoặc kích cỡ size muốn đổi..."
                  value={customReturnText}
                  onChange={(e) => setCustomReturnText(e.target.value)}
                  className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            </div>

            {/* Bank Info for Refund */}
            <div className="space-y-2.5 pt-2 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FaBuildingColumns className="w-3.5 h-3.5 text-amber-600" /> 2. Thông tin tài khoản nhận hoàn tiền:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Ngân hàng:</label>
                  <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:bg-white focus:outline-none"
                  >
                    <option value="Vietcombank">Vietcombank</option>
                    <option value="MB Bank">MB Bank</option>
                    <option value="Techcombank">Techcombank</option>
                    <option value="VPBank">VPBank</option>
                    <option value="ACB">ACB</option>
                    <option value="Agribank">Agribank</option>
                    <option value="TPBank">TPBank</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 block mb-1">Số tài khoản ngân hàng nhận tiền hoàn:</label>
                  <input
                    type="text"
                    placeholder="VD: 0398802022..."
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-mono focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-gray-500 block mb-1">Tên chủ tài khoản (Viết in hoa không dấu):</label>
                <input
                  type="text"
                  placeholder="VD: NGUYEN VAN A"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                  className="w-full p-2 bg-gray-50 border border-gray-200 rounded-xl font-semibold uppercase focus:bg-white focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center p-2.5 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs">
                <span className="text-amber-800 font-medium">Số tiền hoàn trả dự kiến:</span>
                <span className="font-extrabold text-amber-900 text-sm">
                  {returnModalOrder.totalAmount?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
              <Button
                size="sm"
                variant="light"
                className="font-bold text-xs"
                onClick={() => setReturnModalOrder(null)}
                isDisabled={isSubmittingReturn}
              >
                Hủy bỏ
              </Button>
              <Button
                size="sm"
                className="font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-xs cursor-pointer px-5"
                onClick={handleConfirmReturnOrder}
                isLoading={isSubmittingReturn}
              >
                Gửi yêu cầu đổi trả
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="max-w-5xl mx-auto p-12 text-center text-gray-500">Đang tải tra cứu đơn hàng...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
