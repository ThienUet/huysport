"use client";

import React, { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Card, CardBody } from "@heroui/react";
import {
  FaCheck,
  FaArrowRight,
  FaQrcode,
  FaCopy,
  FaHouse,
  FaBoxOpen,
  FaTruckFast,
  FaCircleCheck,
} from "react-icons/fa6";
import confetti from "canvas-confetti";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("orderNumber") || "#ORD-2026-0001";
  const method = searchParams.get("method") || "COD";
  const total = Number(searchParams.get("total") || 0);

  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}
  }, []);

  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 bg-gray-50 min-h-screen">
      {/* Success Badge Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
          <FaCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            Đặt Hàng Thành Công
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Cảm Ơn Bạn Đã Mua Sắm Tại SportX!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Mã đơn hàng của bạn là <strong className="text-emerald-600 font-mono">{orderNumber}</strong>. Chúng tôi đã gửi thông tin xác nhận đến email của bạn.
          </p>
        </div>
      </div>

      {/* VietQR Bank Transfer Box if Bank Transfer */}
      {method === "BANK_TRANSFER" && (
        <Card className="bg-emerald-50 border border-emerald-200 shadow-sm rounded-xl">
          <CardBody className="p-6 space-y-4 text-xs">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <FaQrcode className="w-4 h-4 text-emerald-700" />
              <span>Hướng Dẫn Chuyển Khoản Ngân Hàng (VietQR)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* QR Image */}
              <div className="flex flex-col items-center p-4 bg-white rounded-xl border border-emerald-200 shadow-sm">
                <img
                  src={`https://api.vietqr.io/image/970422-0398802022-compact2.png?amount=${total || 450000}&addInfo=${encodeURIComponent(orderNumber)}&accountName=DINH%20CONG%20HUNG`}
                  alt="VietQR Payment"
                  className="w-48 h-48 object-contain"
                />
                <span className="text-[10px] text-gray-400 mt-2 font-mono">Quét mã VietQR bằng App Ngân hàng</span>
              </div>

              {/* Bank Details */}
              <div className="space-y-2.5 text-gray-700">
                <div className="p-2.5 rounded-lg bg-white border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Ngân hàng:</span>
                    <strong className="text-gray-900">MB Bank (Quân Đội)</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Số tài khoản:</span>
                    <strong className="text-gray-900 font-mono text-sm">0398802022</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard("0398802022")}
                    className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FaCopy className="w-3 h-3" /> Sao chép
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Chủ tài khoản:</span>
                    <strong className="text-gray-900 uppercase">ĐINH CÔNG HÙNG</strong>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-emerald-100 flex justify-between items-center">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Nội dung chuyển khoản:</span>
                    <strong className="text-emerald-600 font-mono">{orderNumber}</strong>
                  </div>
                  <button
                    onClick={() => copyToClipboard(orderNumber)}
                    className="text-emerald-700 font-bold text-[11px] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FaCopy className="w-3 h-3" /> {copied ? "Đã chép!" : "Sao chép"}
                  </button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Order Status Tracker Steps */}
      <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <h3 className="font-bold text-sm text-gray-900">Tiến Trình Xử Lý Đơn Hàng</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold space-y-1">
            <div className="text-emerald-600 font-bold flex items-center gap-1.5">
              <FaCircleCheck className="w-3.5 h-3.5" /> 1. Tiếp Nhận
            </div>
            <p className="text-[11px] text-emerald-700 font-normal">Hệ thống đã ghi nhận đơn</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-600 space-y-1 shadow-sm">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <FaBoxOpen className="w-3.5 h-3.5 text-gray-500" /> 2. Đóng Gói
            </div>
            <p className="text-[11px] text-gray-400 font-normal">Kiểm tra size & chuẩn bị hàng</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-600 space-y-1 shadow-sm">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <FaTruckFast className="w-3.5 h-3.5 text-gray-500" /> 3. Vận Chuyển
            </div>
            <p className="text-[11px] text-gray-400 font-normal">Bàn giao đơn vị giao vận</p>
          </div>
          <div className="p-3 rounded-lg bg-white border border-gray-200 text-gray-600 space-y-1 shadow-sm">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <FaCircleCheck className="w-3.5 h-3.5 text-gray-400" /> 4. Hoàn Thành
            </div>
            <p className="text-[11px] text-gray-400 font-normal">Giao tận tay quý khách</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Button
          color="primary"
          size="lg"
          className="font-bold text-xs rounded-full h-11 px-8 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          endContent={<FaArrowRight className="w-3.5 h-3.5" />}
          as={Link}
          href={`/orders?search=${encodeURIComponent(orderNumber)}`}
        >
          Theo Dõi Trạng Thái Đơn Hàng
        </Button>
        <Button
          variant="bordered"
          size="lg"
          className="font-bold text-xs rounded-lg h-11 px-6 border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
          startContent={<FaHouse className="w-3.5 h-3.5" />}
          as={Link}
          href="/"
        >
          Trở Về Trang Chủ
        </Button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8 text-center text-gray-400">Đang tải...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
