"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Input, Button, Chip } from "@heroui/react";
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
} from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/orderService";
import { Order } from "@/types";

function OrdersContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(initialSearch);
  const [submittedQuery, setSubmittedQuery] = useState(initialSearch);

  useEffect(() => {
    if (initialSearch) {
      setSearchInput(initialSearch);
      setSubmittedQuery(initialSearch);
    }
  }, [initialSearch]);

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders", "track", submittedQuery],
    queryFn: () => orderService.trackOrderByCode(submittedQuery),
    enabled: !!submittedQuery,
  });

  const orders: Order[] = ordersData?.data || [];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSubmittedQuery(searchInput.trim());
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
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
          Nhập mã đơn hàng (VD: <strong>#ORD-2026-0001</strong>) hoặc số điện thoại đặt hàng để kiểm tra tiến trình giao hàng.
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

      {/* Results Section */}
      <div className="space-y-6">
        {isLoading && (
          <div className="text-center py-12 text-xs text-gray-500 space-y-2">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p>Đang tìm kiếm thông tin đơn hàng...</p>
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

        {orders.map((order) => (
          <div
            key={order.id || order.orderNumber}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden space-y-6 p-6"
          >
            {/* Order Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-gray-900 font-mono">
                    {order.orderNumber}
                  </span>
                  {getStatusBadge(order.fulfillmentStatus)}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                  <FaCalendarDays className="w-3.5 h-3.5" />
                  <span>Ngày đặt: {new Date(order.createdAt).toLocaleDateString("vi-VN")}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block">Tổng thanh toán:</span>
                <span className="text-xl font-bold text-emerald-600">
                  {order.totalAmount?.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </div>

            {/* Timeline Steps */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold flex items-center gap-1.5">
                <FaCircleCheck className="w-3.5 h-3.5 text-emerald-600" /> 1. Đã Nhận Đơn
              </div>
              <div className={`p-3 rounded-lg border font-bold flex items-center gap-1.5 ${
                order.fulfillmentStatus !== "PENDING"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}>
                <FaBoxOpen className="w-3.5 h-3.5" /> 2. Đang Đóng Gói
              </div>
              <div className={`p-3 rounded-lg border font-bold flex items-center gap-1.5 ${
                order.fulfillmentStatus === "SHIPPING" || order.fulfillmentStatus === "DELIVERED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}>
                <FaTruckFast className="w-3.5 h-3.5" /> 3. Đang Giao Hàng
              </div>
              <div className={`p-3 rounded-lg border font-bold flex items-center gap-1.5 ${
                order.fulfillmentStatus === "DELIVERED"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-gray-50 border-gray-200 text-gray-400"
              }`}>
                <FaCircleCheck className="w-3.5 h-3.5" /> 4. Đã Giao Hàng
              </div>
            </div>

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
                        src={item.productImage || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"}
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
          </div>
        ))}
      </div>
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
