"use client";

import React from "react";
import Link from "next/link";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
} from "@heroui/react";
import {
  FaBagShopping,
  FaTrashCan,
  FaPlus,
  FaMinus,
  FaArrowRight,
  FaTruckFast,
  FaCircleExclamation,
} from "react-icons/fa6";
import { useCartStore } from "@/stores/useCartStore";

export default function CartDrawer() {
  const {
    items,
    coupon,
    discountAmount,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    removeItem,
    updateQuantity,
    getSubtotal,
    getShippingFee,
    getTotal,
  } = useCartStore();

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();
  const freeShipThreshold = 500000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShipThreshold) * 100));
  const hasOutOfStockItems = items.some((i) => (i.maxStock ?? 0) <= 0);

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onOpenChange={setIsCartDrawerOpen}
      placement="right"
      size="md"
    >
      <DrawerContent className="bg-white text-gray-900">
        {(onClose) => (
          <>
            <DrawerHeader className="border-b border-gray-100 flex items-center justify-between pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                  <FaBagShopping className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900">Giỏ Hàng Của Bạn</h3>
                  <p className="text-xs text-gray-500 font-normal">({items.length} loại sản phẩm)</p>
                </div>
              </div>
            </DrawerHeader>

            <DrawerBody className="p-4 space-y-4">
              {/* Free Shipping Progress Bar */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <FaTruckFast className="w-3.5 h-3.5 text-emerald-600" />
                    {subtotal >= freeShipThreshold ? (
                      "Bạn đã được MIỄN PHÍ VẬN CHUYỂN!"
                    ) : (
                      <>Mua thêm <strong className="font-bold">{(freeShipThreshold - subtotal).toLocaleString("vi-VN")}đ</strong> để Freeship</>
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

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-emerald-600">
                    <FaBagShopping className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-gray-800 text-base">Giỏ hàng của bạn đang trống</h4>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">
                    Hãy dạo qua cửa hàng và chọn những bộ trang phục thể thao ưng ý nhất nhé!
                  </p>
                  <Button
                    className="mt-2 font-semibold text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded-full"
                    onPress={() => setIsCartDrawerOpen(false)}
                    as={Link}
                    href="/products"
                  >
                    Khám Phá Sản Phẩm Ngay
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {hasOutOfStockItems && (
                    <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium flex items-center gap-2">
                      <FaCircleExclamation className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Trong giỏ có sản phẩm tạm hết hàng. Vui lòng xóa trước khi thanh toán.</span>
                    </div>
                  )}

                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div key={item.sku} className="pt-3 first:pt-0 flex gap-3">
                        <div className="relative w-18 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200">
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
                            <span className="absolute inset-0 bg-slate-900/40 text-white text-[9px] font-bold flex items-center justify-center text-center p-1 leading-tight">
                              Hết hàng
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="font-bold text-xs text-gray-900 line-clamp-2">
                                {item.productName}
                              </h4>
                              <button
                                onClick={() => removeItem(item.sku)}
                                className="text-gray-400 hover:text-red-500 transition p-1 cursor-pointer"
                                title="Xóa khỏi giỏ"
                              >
                                <FaTrashCan className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded-md font-medium text-gray-800">Size: {item.size}</span>
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded-md font-medium text-gray-800">Màu: {item.color}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                              <button
                                onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                                className="p-1 hover:bg-gray-200 transition text-gray-600 cursor-pointer"
                                title="Giảm số lượng"
                              >
                                <FaMinus className="w-2.5 h-2.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-gray-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                disabled={item.quantity >= item.maxStock || item.maxStock <= 0}
                                className="p-1 hover:bg-gray-200 transition text-gray-600 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                title={item.maxStock <= 0 ? "Sản phẩm tạm hết hàng" : item.quantity >= item.maxStock ? "Đã đạt số lượng tồn kho tối đa" : "Tăng số lượng"}
                              >
                                <FaPlus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-xs text-emerald-600">
                                {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                              </div>
                              {item.maxStock <= 0 ? (
                                <span className="text-[9px] font-bold text-rose-600">
                                  Tạm hết hàng
                                </span>
                              ) : item.quantity >= item.maxStock ? (
                                <span className="text-[9px] font-bold text-amber-600">
                                  Tối đa kho ({item.maxStock})
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </DrawerBody>

            {items.length > 0 && (
              <DrawerFooter className="border-t border-gray-100 flex-col gap-3 pt-4">
                <div className="space-y-1.5 w-full text-xs">
                  <div className="flex justify-between text-gray-500">
                    <span>Tạm tính:</span>
                    <span className="font-semibold text-gray-800">{subtotal.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Phí vận chuyển:</span>
                    <span className="font-semibold text-gray-800">
                      {shippingFee === 0 ? <span className="text-emerald-600 font-bold">Miễn phí</span> : `${shippingFee.toLocaleString("vi-VN")}đ`}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Mã giảm giá ({coupon?.code}):</span>
                      <span>-{discountAmount.toLocaleString("vi-VN")}đ</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                    <span>Tổng thanh toán:</span>
                    <span className="text-emerald-600 text-base">{total.toLocaleString("vi-VN")}đ</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full pt-1">
                  <Button
                    variant="bordered"
                    className="font-bold text-xs h-10 rounded-lg border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    onPress={() => setIsCartDrawerOpen(false)}
                    as={Link}
                    href="/cart"
                  >
                    Xem Giỏ Hàng
                  </Button>
                  <Button
                    isDisabled={hasOutOfStockItems}
                    className={`font-bold text-xs h-10 rounded-full shadow-md ${
                      hasOutOfStockItems
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                    }`}
                    endContent={<FaArrowRight className="w-3.5 h-3.5" />}
                    onPress={() => !hasOutOfStockItems && setIsCartDrawerOpen(false)}
                    as={Link}
                    href={hasOutOfStockItems ? "#" : "/checkout"}
                  >
                    {hasOutOfStockItems ? "Có SP Hết Hàng" : "Thanh Toán"}
                  </Button>
                </div>
              </DrawerFooter>
            )}
          </>
        )}
      </DrawerContent>
    </Drawer>
  );
}

