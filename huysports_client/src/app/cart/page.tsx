"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import {
  FaBagShopping,
  FaTrashCan,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaTicket,
  FaShieldHalved,
  FaCircleCheck,
  FaCircleExclamation,
  FaTruckFast,
} from "react-icons/fa6";
import { useCartStore } from "@/stores/useCartStore";
import { couponService } from "@/services/couponService";

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    coupon,
    discountAmount,
    setCoupon,
    removeCoupon,
    getSubtotal,
    getShippingFee,
    getTotal,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();
  const freeShipThreshold = 500000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
  const hasOutOfStockItems = items.some((i) => (i.maxStock ?? 0) <= 0);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    setIsApplyingCoupon(true);
    setCouponError("");
    setCouponSuccess("");

    const res = await couponService.validateCoupon(couponInput.trim(), subtotal);
    setIsApplyingCoupon(false);

    if (res.success && res.coupon) {
      setCoupon(res.coupon, res.discountAmount);
      setCouponSuccess(res.message);
      setCouponInput("");
    } else {
      setCouponError(res.message);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <FaBagShopping className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng của bạn đang trống</h1>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Hãy khám phá các mẫu áo đấu, giày chạy bộ và đồ tập thể thao mới nhất tại SportX nhé!
          </p>
        </div>
        <Button
          color="primary"
          size="lg"
          className="font-bold text-xs rounded-full h-11 px-8 shadow-md bg-emerald-600 hover:bg-emerald-700"
          as={Link}
          href="/products"
        >
          Khám Phá Cửa Hàng Ngay
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Quản Lý Đơn Hàng
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Giỏ Hàng Của Bạn</h1>
        </div>
        <Button
          size="sm"
          variant="light"
          color="danger"
          className="text-xs font-semibold rounded-lg"
          startContent={<FaTrashCan className="w-3 h-3" />}
          onPress={clearCart}
        >
          Xóa Tất Cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Cart Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Free Shipping Notification */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <FaTruckFast className="w-4 h-4 text-emerald-600" />
                {subtotal >= freeShipThreshold ? (
                  "Đơn hàng của bạn đã đủ điều kiện MIỄN PHÍ VẬN CHUYỂN toàn quốc!"
                ) : (
                  <>Mua thêm <strong>{(freeShipThreshold - subtotal).toLocaleString("vi-VN")}đ</strong> để được Miễn phí giao hàng</>
                )}
              </span>
              <span className="font-bold text-emerald-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-emerald-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {hasOutOfStockItems && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <FaCircleExclamation className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Trong giỏ hàng có sản phẩm hiện đã hết hàng trong kho. Vui lòng xóa các sản phẩm hết hàng để tiến hành thanh toán.</span>
            </div>
          )}

          {/* Table of Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.sku} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-20 h-20 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
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
                        <span className="absolute inset-0 bg-slate-900/50 text-white text-[9px] font-bold flex items-center justify-center text-center p-1 leading-tight">
                          Hết hàng
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <Link
                        href={`/products/${item.productId}`}
                        className="font-bold text-sm text-gray-900 hover:text-emerald-600 transition line-clamp-1"
                      >
                        {item.productName}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold text-gray-800">Size: {item.size}</span>
                        <span className="bg-gray-100 px-2 py-0.5 rounded-md font-semibold text-gray-800">Màu: {item.color}</span>
                      </div>
                      <div className="text-xs font-bold text-emerald-600 sm:hidden">
                        {item.price.toLocaleString("vi-VN")}đ
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6 self-end sm:self-center">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-bold text-gray-900">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </div>
                      <div className="text-[11px] text-gray-400">
                        {item.price.toLocaleString("vi-VN")}đ / cái
                      </div>
                    </div>

                    {/* Quantity Control */}
                    <div className="flex flex-col items-end gap-1">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50 hover:border-emerald-500 transition-colors">
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                          className="p-2 hover:bg-gray-200 transition text-gray-700 cursor-pointer hover:text-emerald-600"
                          title="Giảm số lượng"
                        >
                          <FaMinus className="w-2.5 h-2.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock || item.maxStock <= 0}
                          className="p-2 hover:bg-gray-200 transition text-gray-700 cursor-pointer hover:text-emerald-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title={item.maxStock <= 0 ? "Sản phẩm tạm hết hàng" : item.quantity >= item.maxStock ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"}
                        >
                          <FaPlus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      {item.maxStock <= 0 ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          Tạm hết hàng
                        </span>
                      ) : item.quantity >= item.maxStock ? (
                        <span className="text-[10px] font-bold text-amber-600">
                          Tối đa: {item.maxStock} cái
                        </span>
                      ) : null}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeItem(item.sku)}
                      className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition cursor-pointer"
                      title="Xóa sản phẩm"
                    >
                      <FaTrashCan className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Order Summary & Coupon (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <h3 className="font-bold text-base text-gray-900">Tóm Tắt Đơn Hàng</h3>

            {/* Coupon Input Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <FaTicket className="w-3.5 h-3.5 text-emerald-600" /> Mã Giảm Giá / Voucher:
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Nhập mã"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  size="sm"
                  radius="lg"
                  classNames={{
                    inputWrapper: "bg-white border border-gray-200 hover:border-emerald-500 focus-within:!border-emerald-500 uppercase font-mono font-bold text-xs",
                  }}
                />
                <Button
                  type="submit"
                  color="primary"
                  size="sm"
                  className="font-bold text-xs rounded-lg px-4 bg-gray-900 hover:bg-gray-800 text-white"
                  isLoading={isApplyingCoupon}
                >
                  Áp Dụng
                </Button>
              </div>

              {couponSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-1.5">
                  <FaCircleCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                  <span>{couponSuccess}</span>
                </div>
              )}
              {couponError && (
                <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold flex items-center gap-1.5">
                  <FaCircleExclamation className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}

              {coupon && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-emerald-900">Mã: {coupon.code}</span>
                    <p className="text-[11px] text-emerald-600">Đã giảm {discountAmount.toLocaleString("vi-VN")}đ</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs font-semibold text-red-500 hover:underline cursor-pointer"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              )}
            </form>

            {/* Price Calculations */}
            <div className="space-y-2.5 text-xs pt-4 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-bold text-gray-900">{subtotal.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-gray-900">
                  {shippingFee === 0 ? <span className="text-emerald-600">Miễn phí</span> : `${shippingFee.toLocaleString("vi-VN")}đ`}
                </span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Giảm giá khuyến mãi:</span>
                  <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-gray-900 pt-3 border-t border-gray-200">
                <span>Tổng cộng:</span>
                <span className="text-xl text-emerald-600">{total.toLocaleString("vi-VN")}đ</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Button
              color="primary"
              size="lg"
              isDisabled={hasOutOfStockItems}
              className={`w-full font-bold text-xs h-12 rounded-full shadow-md transition ${
                hasOutOfStockItems
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
              }`}
              endContent={<FaArrowRight className="w-3.5 h-3.5" />}
              as={Link}
              href={hasOutOfStockItems ? "#" : "/checkout"}
            >
              {hasOutOfStockItems ? "Có Sản Phẩm Hết Hàng Trong Giỏ" : "Tiến hành thanh toán"}
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
              <FaShieldHalved className="w-3.5 h-3.5 text-emerald-600" />
              <span>Thanh toán bảo mật 100% qua cổng kiểm duyệt</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
