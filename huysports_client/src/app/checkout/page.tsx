"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea } from "@heroui/react";
import {
  FaShieldHalved,
  FaCreditCard,
  FaTruckFast,
  FaArrowRight,
  FaCircleCheck,
  FaCircleExclamation,
  FaQrcode,
  FaWallet,
  FaBuildingColumns,
  FaBoxOpen,
} from "react-icons/fa6";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { orderService } from "@/services/orderService";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, coupon, discountAmount, clearCart, getSubtotal, getShippingFee, getTotal } = useCartStore();
  const { user } = useAuthStore();

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();

  // Form State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [city, setCity] = useState("Hà Nội");
  const [district, setDistrict] = useState("Sơn Tây");
  const [ward, setWard] = useState("Xuân Khanh");
  const [addressLine, setAddressLine] = useState(user?.address || "Số 12, Đường Hữu Nghị");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER">("COD");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !email || !addressLine) {
      setErrorMessage("Vui lòng điền đầy đủ các thông tin giao hàng bắt buộc!");
      return;
    }

    if (items.length === 0) {
      setErrorMessage("Giỏ hàng của bạn đang trống!");
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
        items: items.map((item) => ({
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

      const res = await orderService.createOrder(orderPayload);

      if (res.success && res.data) {
        const orderNumber = res.data.orderNumber;
        clearCart();

        if (paymentMethod === "VNPAY" && res.paymentUrl) {
          window.location.href = res.paymentUrl;
        } else {
          router.push(`/order-success?orderNumber=${orderNumber}&method=${paymentMethod}&total=${total}`);
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

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <FaBoxOpen className="w-12 h-12 mx-auto text-gray-400" />
        <h2 className="text-xl font-bold text-gray-800">Không có sản phẩm để thanh toán</h2>
        <Button as={Link} href="/products" className="bg-emerald-600 text-white rounded-full">
          Xem Danh Mục Sản Phẩm
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Quy Trình Đặt Hàng An Toàn
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Thông Tin Thanh Toán & Giao Hàng
        </h1>
      </div>

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
                      Cổng thanh toán VNPAY QR / Thẻ ATM
                      <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">Ưu tiên</span>
                    </div>
                    <div className="text-[11px] text-gray-500">Quét mã VNPAY-QR hoặc dùng thẻ ATM/Visa/MasterCard</div>
                  </div>
                </div>
                <FaQrcode className="w-4 h-4 text-emerald-600" />
              </label>

              {/* MOMO */}
              <label
                className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "MOMO"
                    ? "border-emerald-600 bg-emerald-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("MOMO")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "MOMO"}
                    onChange={() => setPaymentMethod("MOMO")}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-gray-900">Ví điện tử MoMo</div>
                    <div className="text-[11px] text-gray-500">Thanh toán bảo mật tức thì qua ứng dụng MoMo</div>
                  </div>
                </div>
                <FaWallet className="w-4 h-4 text-emerald-600" />
              </label>

              {/* BANK TRANSFER */}
              <label
                className={`p-4 rounded-xl border-2 flex items-center justify-between cursor-pointer transition ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-emerald-600 bg-emerald-50 shadow-sm"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setPaymentMethod("BANK_TRANSFER")}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={() => setPaymentMethod("BANK_TRANSFER")}
                    className="w-4 h-4 text-emerald-600 accent-emerald-600"
                  />
                  <div>
                    <div className="font-bold text-xs text-gray-900">Chuyển khoản Ngân hàng (VietQR)</div>
                    <div className="text-[11px] text-gray-500">Quét mã QR chuyển khoản chính xác tới tài khoản cửa hàng</div>
                  </div>
                </div>
                <FaBuildingColumns className="w-4 h-4 text-emerald-600" />
              </label>

            </div>
          </div>

        </div>

        {/* Right: Order Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-6 sticky top-28">
            <h3 className="font-bold text-base text-gray-900">Đơn Hàng ({items.length} món)</h3>

            {/* List of items preview */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
              {items.map((item) => (
                <div key={item.sku} className="pt-2 first:pt-0 flex items-center gap-3 text-xs">
                  <img
                    src={item.productImage || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"}
                    alt={item.productName}
                    className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0 border border-gray-200"
                  />
                  <div className="min-w-0 flex-1">
                    <h5 className="font-bold text-gray-900 truncate">{item.productName}</h5>
                    <div className="text-[11px] text-gray-400">
                      {item.size} • {item.color} • x{item.quantity}
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">
                    {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                  </div>
                </div>
              ))}
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
              className="w-full font-bold text-xs h-12 rounded-full shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
              endContent={<FaArrowRight className="w-3.5 h-3.5" />}
              isLoading={isLoading}
            >
              Đặt Hàng ({total.toLocaleString("vi-VN")}đ)
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

      </form>
    </div>
  );
}
