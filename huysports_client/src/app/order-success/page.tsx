"use client";

import React, { useState, useEffect, Suspense } from "react";
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
  FaXmark,
  FaCircleExclamation,
} from "react-icons/fa6";
import confetti from "canvas-confetti";
import { useCancelOrder } from "@/hooks";
import { api } from "@/services/api";

const CANCEL_REASONS = [
  "Sai thông tin nhận hàng (địa chỉ, số điện thoại)",
  "Muốn thay đổi kích cỡ (size) hoặc màu sắc sản phẩm",
  "Đổi ý, không muốn mua nữa",
  "Tìm thấy giá tốt hơn ở nơi khác",
  "Đặt trùng đơn hàng",
  "Khác...",
];

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  // VNPAY Return Params
  const vnpResponseCode = searchParams.get("vnp_ResponseCode");
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const vnpAmount = searchParams.get("vnp_Amount");
  const vnpBankCode = searchParams.get("vnp_BankCode");
  const vnpTransactionNo = searchParams.get("vnp_TransactionNo");

  const isVnpayReturn = Boolean(vnpResponseCode);
  const isVnpaySuccess = vnpResponseCode === "00";

  const urlOrderNum = (searchParams.get("orderNumber") || "").replace(/^#/, "").trim();
  const vnpNum = (vnpTxnRef || searchParams.get("vnp_TxnRef") || "").replace(/^#/, "").trim();

  // Find most recent order from local storage if available as reliable backup
  let localOrderNum = "";
  if (typeof window !== "undefined") {
    try {
      const local = JSON.parse(localStorage.getItem("sportx_local_orders") || "[]");
      if (Array.isArray(local) && local.length > 0 && local[0]?.orderNumber) {
        localOrderNum = String(local[0].orderNumber).replace(/^#/, "").trim();
      }
    } catch {}
  }

  // Priority: URL orderNumber > vnpTxnRef > local storage latest order
  const cleanOrderNumber = urlOrderNum || vnpNum || localOrderNum || "SPX-6398";
  const orderNumber = `#${cleanOrderNumber}`;
  const method = isVnpayReturn ? "VNPAY" : searchParams.get("method") || "COD";
  const total = vnpAmount ? Number(vnpAmount) / 100 : Number(searchParams.get("total") || 0);

  useEffect(() => {
    if (!isVnpayReturn || isVnpaySuccess) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [isVnpayReturn, isVnpaySuccess]);

  const [copied, setCopied] = React.useState(false);
  const [isInsidePopup, setIsInsidePopup] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [customReasonText, setCustomReasonText] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const cancelOrderMutation = useCancelOrder();

  useEffect(() => {
    // Detect if this page is running inside the popup window
    const inPopup =
      typeof window !== "undefined" &&
      (Boolean(window.opener && window.opener !== window) ||
        window.name === "VnpayPaymentWindow" ||
        window.name === "VNPAY_PAYMENT_POPUP");
    setIsInsidePopup(inPopup);

    const callbackPayload = {
      type: "VNPAY_PAYMENT_CALLBACK",
      timestamp: Date.now(),
      success: isVnpaySuccess,
      orderNumber: cleanOrderNumber,
      total,
      vnpResponseCode,
      vnpTransactionNo,
      vnpBankCode,
    };

    if (isVnpayReturn) {
      // 1. Notify backend callback to update order status in database
      api
        .get(`/payment/vnpay/callback?${searchParams.toString()}`)
        .catch(() => {})
        .finally(() => {
          // 2. BroadcastChannel: Works across tabs/windows of same origin even if window.opener is null
          try {
            if (typeof BroadcastChannel !== "undefined") {
              const bc = new BroadcastChannel("VNPAY_PAYMENT_CHANNEL");
              bc.postMessage(callbackPayload);
              bc.close();
            }
          } catch (e) {
            console.error("BroadcastChannel error:", e);
          }

          // 3. localStorage Storage Event: Fires instantly in parent checkout tab
          try {
            localStorage.setItem("vnpay_payment_sync", JSON.stringify(callbackPayload));
          } catch (e) {
            console.error("localStorage sync error:", e);
          }

          // 4. window.opener.postMessage (if window.opener is still connected)
          try {
            if (window.opener && window.opener !== window) {
              window.opener.postMessage(callbackPayload, "*");
            }
          } catch (e) {
            console.error("window.opener postMessage error:", e);
          }

          // 5. If running inside popup window, auto-close after 600ms
          if (inPopup) {
            const closeTimer = setTimeout(() => {
              try {
                window.close();
              } catch {}
            }, 600);
            return () => clearTimeout(closeTimer);
          }
        });
    }
  }, [isVnpayReturn, isVnpaySuccess, orderNumber, total, vnpResponseCode, vnpTransactionNo, vnpBankCode, searchParams]);

  const handleCancelOrder = async () => {
    setIsCancelling(true);
    setCancelError("");
    const finalReason = selectedReason === "Khác..." ? (customReasonText.trim() || "Khách yêu cầu hủy đơn") : selectedReason;

    try {
      const cleanId = orderNumber.replace(/^#/, "");
      await cancelOrderMutation.mutateAsync({ id: cleanId, reason: finalReason });
      setIsCancelled(true);
      setIsCancelModalOpen(false);
    } catch (err: any) {
      setCancelError(err.message || "Không thể hủy đơn hàng lúc này. Vui lòng thử lại!");
    } finally {
      setIsCancelling(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInsidePopup && isVnpayReturn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
        <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-xl border border-gray-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl shadow-sm ${
              isVnpaySuccess ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {isVnpaySuccess ? <FaCircleCheck /> : <FaCircleExclamation />}
          </div>
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-gray-900">
              {isVnpaySuccess ? "Giao Dịch Thành Công!" : "Giao Dịch Chưa Hoàn Tất"}
            </h2>
            <p className="text-xs text-gray-500 font-mono">
              Đơn hàng: <strong className="text-gray-900">{orderNumber}</strong>
            </p>
          </div>
          <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100 leading-relaxed">
            Đang tự động đồng bộ kết quả về tab mua hàng SportX... Cửa sổ này sẽ đóng lại trong giây lát.
          </p>
          <Button
            size="sm"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl h-10 shadow-sm cursor-pointer"
            onClick={() => window.close()}
          >
            Đóng cửa sổ này
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8 bg-gray-50 min-h-screen">
      {/* Success Badge Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
          <FaCheck className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
            {isVnpayReturn && !isVnpaySuccess ? "Ghi Nhận Đơn Hàng" : "Đặt Hàng Thành Công"}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {isVnpayReturn && !isVnpaySuccess ? "Đơn Hàng Đang Chờ Thanh Toán" : "Cảm Ơn Bạn Đã Mua Sắm Tại SportX!"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Mã đơn hàng của bạn là <strong className="text-emerald-600 font-mono">{orderNumber}</strong>. Chúng tôi đã gửi thông tin xác nhận đến email của bạn.
          </p>
        </div>
      </div>

      {/* VNPAY Status Banner */}
      {isVnpayReturn && (
        <div
          className={`p-4 rounded-xl border text-xs space-y-2 ${
            isVnpaySuccess
              ? "bg-blue-50/80 border-blue-200 text-blue-900"
              : "bg-amber-50/80 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isVnpaySuccess ? (
              <>
                <FaCircleCheck className="w-4 h-4 text-emerald-600" />
                <span>Thanh toán VNPAY Sandbox thành công!</span>
              </>
            ) : (
              <>
                <FaCircleExclamation className="w-4 h-4 text-amber-600" />
                <span>Giao dịch VNPAY chưa hoàn tất (Mã kết quả: {vnpResponseCode})</span>
              </>
            )}
          </div>
          {isVnpaySuccess ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-blue-600">Ngân hàng:</span> <strong>{vnpBankCode || "NCB"}</strong>
              </div>
              <div>
                <span className="text-blue-600">Mã GD VNPAY:</span> <strong className="font-mono">{vnpTransactionNo || "N/A"}</strong>
              </div>
              <div>
                <span className="text-blue-600">Số tiền:</span> <strong>{total.toLocaleString("vi-VN")}đ</strong>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-amber-700">
              Giao dịch trực tuyến đã bị hủy hoặc chưa hoàn tất. Đơn hàng vẫn được lưu lại trong hệ thống ở trạng thái Chờ thanh toán. Bạn có thể kiểm tra trong mục Tra cứu đơn hàng.
            </p>
          )}
        </div>
      )}

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

      {/* Cancelled Banner if user just cancelled */}
      {isCancelled && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
          <FaCircleExclamation className="w-4 h-4 text-rose-600 shrink-0" />
          <span>Đơn hàng <strong>{orderNumber}</strong> đã được hủy thành công và hoàn lại số lượng tồn kho.</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
        <Button
          color="primary"
          size="lg"
          className="font-bold text-xs rounded-full h-11 px-8 shadow-md bg-emerald-600 hover:bg-emerald-700 text-white"
          endContent={<FaArrowRight className="w-3.5 h-3.5" />}
          as={Link}
          href={`/orders?search=${encodeURIComponent(cleanOrderNumber)}`}
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

      {/* Quick Cancel link on success page */}
      {!isCancelled && (
        <div className="text-center pt-2">
          <button
            type="button"
            onClick={() => setIsCancelModalOpen(true)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer inline-flex items-center gap-1.5"
          >
            <FaXmark className="w-3.5 h-3.5" />
            Bạn đặt nhầm thông tin hoặc muốn hủy đơn hàng này? Nhấn vào đây
          </button>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">
                Xác nhận hủy đơn hàng #{orderNumber}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Đơn hàng vừa đặt đang ở trạng thái <strong>Chờ xác nhận</strong>. Sau khi hủy, hệ thống sẽ tự động hoàn lại số lượng tồn kho cho các sản phẩm.
              </p>
            </div>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {cancelError}
              </div>
            )}

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
                onClick={() => setIsCancelModalOpen(false)}
                isDisabled={isCancelling}
              >
                Giữ đơn hàng
              </Button>
              <Button
                size="sm"
                color="danger"
                className="font-bold text-xs bg-rose-600 text-white rounded-full shadow-xs cursor-pointer"
                onClick={handleCancelOrder}
                isLoading={isCancelling}
              >
                Xác nhận hủy đơn
              </Button>
            </div>
          </div>
        </div>
      )}
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
