"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, Input, Textarea } from "@heroui/react";
import {
  FaShieldHalved,
  FaCreditCard,
  FaTruckFast,
  FaArrowRight,
  FaCircleCheck,
  FaCircleExclamation,
  FaQrcode,
  FaBoxOpen,
  FaTicket,
  FaTrashCan,
  FaArrowUpRightFromSquare,
  FaRotate,
  FaXmark,
  FaHourglassHalf,
  FaBagShopping,
  FaBolt,
} from "react-icons/fa6";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useValidateCoupon, useCreateOrder } from "@/hooks";
import { api } from "@/services/api";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isBuyNow = searchParams.get("mode") === "buy_now";

  const {
    items,
    buyNowItem,
    clearBuyNowItem,
    coupon,
    discountAmount,
    setCoupon,
    removeCoupon,
    removeSelectedItems,
    getSelectedItems,
    getSubtotal,
    getShippingFee,
    getTotal,
  } = useCartStore();
  const { user } = useAuthStore();

  const checkoutItems = isBuyNow ? (buyNowItem ? [buyNowItem] : []) : getSelectedItems();

  const subtotal = isBuyNow
    ? checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
    : getSubtotal(true);
  const shippingFee = subtotal === 0 ? 0 : subtotal >= 500000 ? 0 : 30000;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  const finalizeOrderCompletion = () => {
    if (isBuyNow) {
      clearBuyNowItem();
    } else {
      removeSelectedItems();
    }
    removeCoupon();
  };

  const validateCouponMutation = useValidateCoupon();
  const createOrderMutation = useCreateOrder();

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponInput).trim();
    if (!code) return;

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    try {
      const res = await validateCouponMutation.mutateAsync({ code, orderValue: subtotal });
      if (res.success && res.coupon) {
        setCoupon(res.coupon, res.discountAmount);
        setCouponSuccess(res.message);
        setCouponInput("");
      } else {
        setCouponError(res.message);
      }
    } catch (err: any) {
      setCouponError(err.message || "Không thể áp dụng mã ưu đãi lúc này.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess("");
    setCouponError("");
  };

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState("Hà Nội");
  const [district, setDistrict] = useState("Sơn Tây");
  const [ward, setWard] = useState("Xuân Khanh");
  const [addressLine, setAddressLine] = useState(user?.address || "Số 12, Đường Hữu Nghị");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY">("COD");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // VNPAY Popup & Background Tab state
  const [isVnpayWaiting, setIsVnpayWaiting] = useState(false);
  const [vnpayPendingOrder, setVnpayPendingOrder] = useState<{
    orderNumber: string;
    total: number;
    paymentUrl: string;
  } | null>(null);
  const [vnpayPopupBlocked, setVnpayPopupBlocked] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);

  const popupRef = useRef<Window | null>(null);
  const popupCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const openVnpayPopup = (
    url: string,
    orderData: { orderNumber: string; total: number; paymentUrl: string }
  ) => {
    const width = 840;
    const height = 760;
    const left = typeof window !== "undefined" ? window.screenX + (window.outerWidth - width) / 2 : 100;
    const top = typeof window !== "undefined" ? window.screenY + (window.outerHeight - height) / 2 : 100;

    const popup = window.open(
      url,
      "VnpayPaymentWindow",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,status=no,resizable=yes`
    );

    popupRef.current = popup;
    setVnpayPendingOrder(orderData);
    setIsVnpayWaiting(true);

    if (!popup || popup.closed || typeof popup.closed === "undefined") {
      setVnpayPopupBlocked(true);
    } else {
      setVnpayPopupBlocked(false);
      try {
        popup.focus();
      } catch {}
    }
  };

  useEffect(() => {
    if (!isVnpayWaiting) return;

    const onPaymentSuccess = (orderNumber: string, orderTotal?: number, vnpResponseCode?: string) => {
      setIsVnpayWaiting(false);
      setVnpayPendingOrder(null);
      if (popupCheckIntervalRef.current) clearInterval(popupCheckIntervalRef.current);
      if (popupRef.current && !popupRef.current.closed) {
        try {
          popupRef.current.close();
        } catch {}
      }
      finalizeOrderCompletion();
      const cleanNum = (orderNumber || vnpayPendingOrder?.orderNumber || "").replace(/^#/, "").trim();
      router.push(
        `/order-success?orderNumber=${encodeURIComponent(cleanNum)}&method=VNPAY&total=${orderTotal || total}&vnp_ResponseCode=${vnpResponseCode || "00"}`
      );
    };

    const onPaymentFailure = (msg?: string) => {
      setIsVnpayWaiting(false);
      setVnpayPendingOrder(null);
      if (popupCheckIntervalRef.current) clearInterval(popupCheckIntervalRef.current);
      if (popupRef.current && !popupRef.current.closed) {
        try {
          popupRef.current.close();
        } catch {}
      }
      setErrorMessage(
        msg || "Giao dịch thanh toán VNPAY không thành công hoặc bạn đã hủy giao dịch. Đơn hàng đã được lưu, bạn có thể thử lại."
      );
    };

    // 1. Listen via postMessage (if window.opener is still active)
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "VNPAY_PAYMENT_CALLBACK") {
        const { success, orderNumber, total: orderTotal, vnpResponseCode } = event.data;
        if (success) {
          onPaymentSuccess(orderNumber, orderTotal, vnpResponseCode);
        } else {
          onPaymentFailure();
        }
      }
    };
    window.addEventListener("message", handleMessage);

    // 2. Listen via BroadcastChannel (Works 100% across tabs/windows of same origin even if opener is null)
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== "undefined") {
        bc = new BroadcastChannel("VNPAY_PAYMENT_CHANNEL");
        bc.onmessage = (event) => {
          if (event.data?.type === "VNPAY_PAYMENT_CALLBACK") {
            const { success, orderNumber, total: orderTotal, vnpResponseCode } = event.data;
            if (success) {
              onPaymentSuccess(orderNumber, orderTotal, vnpResponseCode);
            } else {
              onPaymentFailure();
            }
          }
        };
      }
    } catch (e) {
      console.error("BroadcastChannel init error:", e);
    }

    // 3. Listen via localStorage Storage Event (Triggers immediately across tabs on same origin)
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "vnpay_payment_sync" && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          if (data?.type === "VNPAY_PAYMENT_CALLBACK") {
            try {
              localStorage.removeItem("vnpay_payment_sync");
            } catch {}
            if (data.success) {
              onPaymentSuccess(data.orderNumber, data.total, data.vnpResponseCode);
            } else {
              onPaymentFailure();
            }
          }
        } catch {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 4. Background polling: Poll backend order status every 1.5s in case callback updated DB directly
    popupCheckIntervalRef.current = setInterval(async () => {
      if (!vnpayPendingOrder) return;

      try {
        const trackRes = await api.get(`/orders?search=${vnpayPendingOrder.orderNumber}`);
        const orderList = trackRes?.data?.data || trackRes?.data;
        const cleanRef = vnpayPendingOrder.orderNumber.replace(/^#/, "");
        const order = Array.isArray(orderList)
          ? orderList.find((o: any) => o.orderNumber === cleanRef || o.orderNumber === `#${cleanRef}`)
          : null;

        if (order && (order.paymentStatus === "Paid" || order.fulfillmentStatus === "Processing")) {
          onPaymentSuccess(vnpayPendingOrder.orderNumber, vnpayPendingOrder.total, "00");
          return;
        }
      } catch {}

      // If user closed the popup window manually
      if (popupRef.current && popupRef.current.closed) {
        if (popupCheckIntervalRef.current) clearInterval(popupCheckIntervalRef.current);
        setIsVnpayWaiting(false);
        setErrorMessage("Cửa sổ thanh toán VNPAY đã bị đóng. Bạn có thể mở lại cửa sổ thanh toán hoặc chọn phương thức khác.");
      }
    }, 1500);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      if (bc) {
        try {
          bc.close();
        } catch {}
      }
      if (popupCheckIntervalRef.current) clearInterval(popupCheckIntervalRef.current);
    };
  }, [isVnpayWaiting, vnpayPendingOrder, router, total]);

  const handleCheckVnpayStatusManual = async () => {
    if (!vnpayPendingOrder) return;
    setIsCheckingPayment(true);
    try {
      const res = await api.get(`/orders?search=${vnpayPendingOrder.orderNumber}`);
      const orderList = res?.data?.data || res?.data;
      const cleanRef = vnpayPendingOrder.orderNumber.replace(/^#/, "");
      const order = Array.isArray(orderList)
        ? orderList.find((o: any) => o.orderNumber === cleanRef || o.orderNumber === `#${cleanRef}`)
        : null;

      if (order && (order.paymentStatus === "Paid" || order.fulfillmentStatus === "Processing")) {
        setIsVnpayWaiting(false);
        finalizeOrderCompletion();
        const cleanNum = (vnpayPendingOrder.orderNumber || "").replace(/^#/, "").trim();
        router.push(
          `/order-success?orderNumber=${encodeURIComponent(cleanNum)}&method=VNPAY&total=${vnpayPendingOrder.total}&vnp_ResponseCode=00`
        );
      } else {
        setErrorMessage("Chưa ghi nhận kết quả thanh toán thành công từ VNPAY. Vui lòng hoàn tất giao dịch tại cửa sổ thanh toán.");
      }
    } catch {
      setErrorMessage("Chưa thể kiểm tra trạng thái đơn hàng lúc này.");
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handleCancelVnpayPayment = () => {
    if (popupRef.current && !popupRef.current.closed) {
      try {
        popupRef.current.close();
      } catch {}
    }
    if (popupCheckIntervalRef.current) {
      clearInterval(popupCheckIntervalRef.current);
    }
    setIsVnpayWaiting(false);
    setErrorMessage("Bạn đã hủy phiên thanh toán VNPAY. Đơn hàng vẫn được lưu trong hệ thống, bạn có thể thanh toán lại bất cứ lúc nào.");
  };

  const hasOutOfStockItems = checkoutItems.some((i) => (i.maxStock ?? 0) <= 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !addressLine) {
      setErrorMessage("Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc!");
      return;
    }

    if (checkoutItems.length === 0) {
      setErrorMessage(
        isBuyNow
          ? "Không tìm thấy thông tin sản phẩm mua ngay!"
          : "Chưa có sản phẩm nào được chọn trong giỏ hàng để thanh toán!"
      );
      return;
    }

    if (hasOutOfStockItems) {
      setErrorMessage("Trong các sản phẩm thanh toán có sản phẩm hiện đã tạm hết hàng trong kho!");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const orderPayload = {
        customer: {
          id: user?.id,
          fullName,
          email,
          phone,
        },
        shippingAddress: {
          fullName,
          phone,
          email,
          city,
          district,
          ward,
          addressLine,
          note,
        },
        items: checkoutItems.map((item) => ({
          productId: item.productId,
          productName: item.productName,
          productImage: item.productImage,
          sku: item.sku,
          size: item.size,
          color: item.color,
          price: item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shippingFee,
        discountAmount,
        couponCode: coupon?.code,
        totalAmount: total,
        paymentMethod,
        notes: note,
      };

      const res = await createOrderMutation.mutateAsync(orderPayload);

      if (res.success && res.data) {
        const orderNumber = res.data.orderNumber;

        if (paymentMethod === "VNPAY" && res.paymentUrl) {
          openVnpayPopup(res.paymentUrl, {
            orderNumber,
            total,
            paymentUrl: res.paymentUrl,
          });
        } else {
          finalizeOrderCompletion();
          const cleanNum = (orderNumber || "").replace(/^#/, "").trim();
          router.push(`/order-success?orderNumber=${encodeURIComponent(cleanNum)}&method=${paymentMethod}&total=${total}`);
        }
      } else {
        setErrorMessage("Không thể tạo đơn hàng. Vui lòng thử lại!");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi tạo đơn hàng!");
    } finally {
      setIsLoading(false);
    }
  };

  if (checkoutItems.length === 0 && !isVnpayWaiting) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <FaBoxOpen className="w-12 h-12 mx-auto text-gray-400" />
        <h2 className="text-xl font-bold text-gray-800">
          {isBuyNow ? "Không có sản phẩm mua ngay" : "Chưa chọn sản phẩm thanh toán"}
        </h2>
        <p className="text-xs text-gray-500">
          {isBuyNow
            ? "Vui lòng chọn size/màu và bấm Mua Ngay tại trang chi tiết sản phẩm."
            : "Vui lòng vào giỏ hàng và chọn các sản phẩm bạn muốn thanh toán."}
        </p>
        <div className="flex justify-center gap-3 pt-2">
          {!isBuyNow && (
            <Button as={Link} href="/cart" variant="bordered" className="rounded-full">
              Về Giỏ Hàng
            </Button>
          )}
          <Button as={Link} href="/products" className="bg-emerald-600 text-white rounded-full">
            Xem Danh Mục Sản Phẩm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Quy Trình Đặt Hàng An Toàn
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Thông Tin Thanh Toán & Giao Hàng
        </h1>
      </div>

      {/* Shopee-style Buy Now Notification Banner */}
      {isBuyNow && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
              <FaBolt className="w-2.5 h-2.5" /> Mua Ngay
            </span>
            <span className="text-emerald-950 font-semibold">
              Đơn hàng mua nhanh riêng biệt (không ảnh hưởng tới các sản phẩm đang lưu trong giỏ hàng của bạn).
            </span>
          </div>
          <Link href="/cart" className="text-emerald-700 font-bold hover:underline whitespace-nowrap flex items-center gap-1">
            <FaBagShopping className="w-3.5 h-3.5" /> Xem giỏ hàng ({items.length})
          </Link>
        </div>
      )}

      {hasOutOfStockItems && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FaCircleExclamation className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>
              {isBuyNow
                ? "Sản phẩm mua ngay này tạm hết hàng trong kho. Vui lòng chọn sản phẩm khác!"
                : "Có sản phẩm bạn đã chọn tạm hết hàng trong kho. Vui lòng quay lại giỏ hàng để cập nhật!"}
            </span>
          </div>
          <Button
            as={Link}
            href={isBuyNow ? "/products" : "/cart"}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs whitespace-nowrap self-start sm:self-center"
          >
            {isBuyNow ? "Xem sản phẩm khác" : "Quay lại giỏ hàng"}
          </Button>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-2 border border-red-200">
          <FaCircleExclamation className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Customer Info & Shipping (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Form Box */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <FaTruckFast className="w-4 h-4 text-emerald-600" /> 1. Địa Chỉ Nhận Hàng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên người nhận"
                placeholder="Nguyễn Văn A"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                isRequired
                size="sm"
                classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
              />
              <Input
                label="Số điện thoại liên hệ"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                isRequired
                size="sm"
                classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
              />
            </div>

            <Input
              label="Email nhận thông tin đơn hàng"
              placeholder="email@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              size="sm"
              classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Tỉnh / Thành phố"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                isRequired
                size="sm"
                classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
              />
              <Input
                label="Quận / Huyện"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                isRequired
                size="sm"
                classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
              />
              <Input
                label="Phường / Xã"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
                isRequired
                size="sm"
                classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
              />
            </div>

            <Input
              label="Địa chỉ cụ thể (Số nhà, tên đường, tòa nhà)"
              placeholder="VD: Số 25 ngõ 120 Xuân Khanh"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              isRequired
              size="sm"
              classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
            />

            <Textarea
              label="Ghi chú đơn hàng (Tùy chọn)"
              placeholder="Giao giờ hành chính, gọi trước khi đến..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              size="sm"
              classNames={{ inputWrapper: "border-gray-200 focus-within:!border-emerald-500 rounded-lg" }}
            />
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
              <FaCreditCard className="w-4 h-4 text-emerald-600" /> 2. Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              
              {/* COD */}
              <label
                className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "COD"
                    ? "border-emerald-600 bg-emerald-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("COD")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-gray-900">Thanh toán khi nhận hàng (COD)</div>
                    <div className="text-[11px] text-gray-500">Khách hàng kiểm tra hàng và thanh toán tiền mặt cho shipper</div>
                  </div>
                </div>
                <FaTruckFast className="w-4 h-4 text-gray-400" />
              </label>

              {/* VNPAY */}
              <label
                className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "VNPAY"
                    ? "border-emerald-600 bg-emerald-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("VNPAY")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                      Cổng thanh toán trực tuyến VNPAY Sandbox
                      <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">Online</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Quét mã VNPAY-QR hoặc dùng thẻ ATM/Visa/MasterCard qua cổng VNPAY</div>
                  </div>
                </div>
                <FaQrcode className="w-4 h-4 text-emerald-600" />
              </label>
            </div>
          </div>

        </div>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold text-base text-gray-900">
              {isBuyNow ? "Đơn Hàng Mua Ngay (1 sản phẩm)" : `Đơn Hàng (${checkoutItems.length} món)`}
            </h3>

            {/* List of items preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
              {checkoutItems.map((item) => (
                <div key={item.sku} className="pt-2 first:pt-0 flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 border border-gray-200 overflow-hidden">
                    <img
                      src={
                        item.productImage && (item.productImage.startsWith("http") || item.productImage.startsWith("/"))
                          ? item.productImage
                          : "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"
                      }
                      alt={item.productName}
                      className={`w-full h-full object-cover ${item.maxStock <= 0 ? "grayscale-[30%]" : ""}`}
                    />
                    {item.maxStock <= 0 && (
                      <span className="absolute inset-0 bg-slate-900/60 text-white text-[8px] font-bold flex items-center justify-center text-center p-0.5">
                        Hết
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-gray-900 truncate">{item.productName}</h5>
                    <div className="text-[11px] text-gray-400">
                      {item.size} • {item.color} • x{item.quantity}
                    </div>
                    {item.maxStock <= 0 && (
                      <span className="text-[10px] text-rose-600 font-bold">
                        Đã tạm hết hàng
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-gray-900">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="pt-4 border-t border-gray-200 space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FaTicket className="w-3.5 h-3.5 text-emerald-600" /> Mã Giảm Giá / Voucher Ưu Đãi
              </label>

              {coupon ? (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">
                        {coupon.code}
                      </span>
                      <span className="font-bold text-emerald-700">
                        -{(discountAmount || 0).toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    {coupon.description && (
                      <p className="text-[11px] text-emerald-600 mt-1">{coupon.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Gỡ mã giảm giá"
                  >
                    <FaTrashCan className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã ưu đãi (VD: SPORTX10, SUMMER50K...)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleApplyCoupon();
                        }
                      }}
                      className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-emerald-500"
                    />
                    <Button
                      type="button"
                      size="sm"
                      isLoading={isApplyingCoupon}
                      onClick={() => handleApplyCoupon()}
                      className="bg-emerald-600 text-white font-bold text-xs rounded-lg px-4 cursor-pointer hover:bg-emerald-700"
                    >
                      Áp Dụng
                    </Button>
                  </div>

                  {/* Quick Coupon Suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-gray-400">Gợi ý mã:</span>
                    {["SPORTX10", "SUMMER50K", "FREESHIP"].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => handleApplyCoupon(code)}
                        className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded transition cursor-pointer"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] font-medium text-rose-600 flex items-center gap-1">
                  <FaCircleExclamation className="w-3 h-3 shrink-0" /> {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                  <FaCircleCheck className="w-3 h-3 shrink-0" /> {couponSuccess}
                </p>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 text-xs pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span className="font-bold text-gray-900">{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : `${shippingFee.toLocaleString("vi-VN")}đ`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Mã giảm giá ({coupon?.code}):</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Tổng thanh toán:</span>
                <span className="text-2xl text-emerald-600">{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              color="primary"
              size="lg"
              isDisabled={isLoading || hasOutOfStockItems}
              className={`w-full font-bold text-xs h-12 rounded-full shadow-md transition ${
                hasOutOfStockItems
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              }`}
              endContent={<FaArrowRight className="w-3.5 h-3.5" />}
              isLoading={isLoading}
            >
              {hasOutOfStockItems ? "Vui lòng xóa sản phẩm hết hàng" : `Đặt Hàng (${total.toLocaleString("vi-VN")}đ)`}
            </Button>

            <div className="p-3 rounded-xl bg-white border border-gray-200 text-[11px] text-gray-500 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-700 font-bold">
                <FaShieldHalved className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cam kết bảo vệ quyền lợi người mua:</span>
              </div>
              <p>Hỗ trợ kiểm tra hàng trước khi thanh toán. Đổi size miễn phí trong vòng 30 ngày.</p>
            </div>

          </div>
        </div>

        {/* VNPAY Popup Processing Modal Overlay */}
        {isVnpayWaiting && vnpayPendingOrder && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
              {/* Animated Header */}
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-blue-500/15 animate-ping" />
                <div className="w-16 h-16 rounded-full border-3 border-blue-100 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-md">
                  <FaCreditCard className="w-4 h-4" />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                  Cổng thanh toán VNPAY Sandbox
                </span>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Đang chờ thanh toán tại cửa sổ VNPAY...
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Cửa sổ thanh toán đã được mở riêng biệt. Vui lòng quét mã QR hoặc nhập thông tin thẻ test tại cửa sổ đó để hoàn tất giao dịch.
                </p>
              </div>

              {/* Order Brief Info */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-xs space-y-2 text-left">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mã đơn hàng:</span>
                  <span className="font-mono font-bold text-gray-900">{vnpayPendingOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Số tiền thanh toán:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {vnpayPendingOrder.total.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200/60 text-[11px]">
                  <span className="text-gray-400">Trạng thái:</span>
                  <span className="text-amber-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    Chờ bạn hoàn tất trên popup
                  </span>
                </div>
              </div>

              {/* Popup Blocked Warning if detected */}
              {vnpayPopupBlocked && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left space-y-2.5">
                  <p className="font-semibold flex items-center gap-1.5">
                    <FaCircleExclamation className="w-4 h-4 text-amber-600 shrink-0" />
                    Trình duyệt đang chặn mở cửa sổ bật lên tự động.
                  </p>
                  <Button
                    size="sm"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl h-9 cursor-pointer"
                    onClick={() => openVnpayPopup(vnpayPendingOrder.paymentUrl, vnpayPendingOrder)}
                  >
                    Bấm vào đây để mở cửa sổ thanh toán
                  </Button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="flex gap-2">
                  <Button
                    className="flex-1 font-bold text-xs h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
                    onClick={() => {
                      if (popupRef.current && !popupRef.current.closed) {
                        try {
                          popupRef.current.focus();
                        } catch {
                          openVnpayPopup(vnpayPendingOrder.paymentUrl, vnpayPendingOrder);
                        }
                      } else {
                        openVnpayPopup(vnpayPendingOrder.paymentUrl, vnpayPendingOrder);
                      }
                    }}
                    startContent={<FaArrowUpRightFromSquare className="w-3 h-3" />}
                  >
                    Mở lại cửa sổ VNPAY
                  </Button>
                  <Button
                    variant="bordered"
                    className="font-bold text-xs h-10 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
                    isLoading={isCheckingPayment}
                    onClick={handleCheckVnpayStatusManual}
                    startContent={<FaRotate className="w-3 h-3" />}
                  >
                    Kiểm tra kết quả
                  </Button>
                </div>

                <Button
                  variant="light"
                  size="sm"
                  className="w-full text-xs text-gray-400 hover:text-rose-600 font-semibold cursor-pointer"
                  onClick={handleCancelVnpayPayment}
                >
                  Hủy phiên thanh toán này & chọn lại phương thức
                </Button>
              </div>
            </div>
          </div>
        )}

      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="flex items-center gap-3 text-emerald-600 font-medium text-sm">
            <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            Đang tải thông tin đơn hàng...
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
