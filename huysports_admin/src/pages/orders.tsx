import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import AdminLayout from "@/layouts/admin-layout";
import { useToastStore } from "@/store/useToastStore";
import { useDebounce, useOrders, useUpdateOrderStatus, useProcessReturn } from "@/hooks";
import {
  Search,
  Calendar,
  Eye,
  X,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Copy,
  Printer,
  RotateCcw,
  PackageCheck,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import { exportToCSV, exportToExcel, ReportSection } from "@/utils/exportUtils";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { HeroDropdown } from "@/components/ui/HeroDropdown";
import { formatDateTime } from "@/utils/formatUtils";
import { TableSkeletonRows } from "@/components/ui/LoadingSkeletons";

export type StatusTab = "all" | "pending_approval" | "processing" | "shipping" | "completed" | "returns" | "canceled";

export interface ReturnRequest {
  reason: string;
  detailedReason?: string;
  bankName?: string;
  bankAccount?: string;
  accountHolder?: string;
  refundAmount: number;
  status: "Pending" | "Approved" | "Rejected" | "Completed";
  adminNote?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  size: string;
  color: string;
  colorHex: string;
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  dateTime: string;
  createdAt?: string;
  updatedAt?: string;
  customer: {
    id?: string;
    name: string;
    phone: string;
    email: string;
    avatar: string;
    address: string;
  };
  items: OrderItem[];
  subtotal?: number;
  shippingFee?: number;
  discountAmount?: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: "VNPAY" | "COD";
  paymentStatus: "Paid" | "Unpaid";
  fulfillmentStatus: "Pending Approval" | "Processing" | "Shipping" | "Completed" | "Canceled";
  shippingCarrier?: string;
  trackingCode?: string;
  cancelReason?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  failedDeliveryAttempts?: number;
  returnRequest?: ReturnRequest;
  transactionDetails?: {
    gateway: "VNPAY" | "COD";
    transactionCode: string;
    timestamp: string;
    bankCode?: string;
    responseMessage?: string;
  };
  note?: string;
}

// Helper to format currency nicely (VND)
const formatCurrency = (val: number) => {
  if (!val || val <= 0) return "0đ";
  let num = val;
  if (num < 1000) num = num * 1000;
  return `${Math.round(num).toLocaleString("vi-VN")}đ`;
};

const removeVietnameseTones = (str: string) => {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim();
};

export default function OrdersPage() {
  const toast = useToastStore();
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(urlSearch);

  useEffect(() => {
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [urlSearch]);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [dateRange, setDateRange] = useState("01 Sep 2026 - 23 Sep 2026");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Modal states for order workflow
  const [printModalOrder, setPrintModalOrder] = useState<Order | null>(null);
  const [dispatchModalOrder, setDispatchModalOrder] = useState<Order | null>(null);
  const [dispatchCarrier, setDispatchCarrier] = useState<string>("GHTK");
  const [dispatchTracking, setDispatchTracking] = useState<string>("");
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReasonInput, setCancelReasonInput] = useState<string>("Khách yêu cầu hủy / Sai thông tin");

  // Return & refund admin action modal state
  const [returnActionModal, setReturnActionModal] = useState<{
    order: Order;
    action: "approve" | "reject" | "complete";
  } | null>(null);
  const [returnAdminNote, setReturnAdminNote] = useState<string>("");

  // Fetch orders with custom React Query hook
  const { data: orders = [], isLoading } = useOrders({
    status: activeTab !== "all" ? activeTab : undefined,
    paymentMethod: paymentMethodFilter !== "all" ? paymentMethodFilter : undefined,
  });

  const baseUpdateStatus = useUpdateOrderStatus();
  const updateStatusMutation = {
    ...baseUpdateStatus,
    mutate: (payload: any, options?: any) => {
      baseUpdateStatus.mutate(payload, {
        onSuccess: (updatedOrder: any, variables: any) => {
          setSelectedOrder(updatedOrder);
          if (variables.fulfillmentStatus === "Canceled") {
            toast.success(
              "Hủy đơn / Hoàn kho thành công",
              `Đã chuyển trạng thái đơn #${updatedOrder.orderNumber} sang Đã hủy & hoàn lại số lượng tồn kho`
            );
          } else if (variables.fulfillmentStatus === "Processing") {
            toast.success(
              "Duyệt đơn thành công",
              `Đơn #${updatedOrder.orderNumber} chuyển sang Đang đóng gói & chuẩn bị in phiếu xuất kho`
            );
          } else if (variables.fulfillmentStatus === "Shipping") {
            toast.success(
              "Bàn giao vận chuyển thành công",
              `Đơn #${updatedOrder.orderNumber} đã bàn giao cho ${variables.shippingCarrier || "GHTK"}`
            );
          } else if (variables.fulfillmentStatus === "Completed") {
            toast.success(
              "Giao hàng thành công",
              `Đơn #${updatedOrder.orderNumber} đã hoàn tất và thu tiền đủ.`
            );
          } else {
            toast.success("Thành công", `Đã cập nhật trạng thái đơn #${updatedOrder.orderNumber}`);
          }
          options?.onSuccess?.(updatedOrder, variables);
        },
        onError: (err: any) => {
          toast.error("Lỗi", err.message || "Không thể cập nhật đơn hàng");
          options?.onError?.(err);
        },
      });
    },
  };

  const baseProcessReturn = useProcessReturn();
  const processReturnMutation = {
    ...baseProcessReturn,
    mutate: (payload: any, options?: any) => {
      baseProcessReturn.mutate(payload, {
        onSuccess: (updated: any) => {
          if (selectedOrder && (selectedOrder.id === updated.id || selectedOrder.orderNumber === updated.orderNumber)) {
            setSelectedOrder(updated);
          }
          toast.success(
            "Thành công",
            updated.returnRequest?.status === "Approved"
              ? "Đã duyệt yêu cầu đổi trả / hoàn hàng"
              : updated.returnRequest?.status === "Rejected"
              ? "Đã từ chối yêu cầu đổi trả"
              : "Đã xác nhận nhận hàng hoàn & tự động nhập lại kho"
          );
          setReturnActionModal(null);
          options?.onSuccess?.(updated);
        },
        onError: (err: any) => {
          toast.error("Lỗi", err.message || "Không thể xử lý yêu cầu hoàn trả");
          options?.onError?.(err);
        },
      });
    },
  };

  // Tab counters dynamically calculated
  const tabCounts = useMemo(() => {
    return {
      all: orders.length,
      pending_approval: orders.filter((o: Order) => o.fulfillmentStatus === "Pending Approval").length,
      processing: orders.filter((o: Order) => o.fulfillmentStatus === "Processing").length,
      shipping: orders.filter((o: Order) => o.fulfillmentStatus === "Shipping").length,
      completed: orders.filter((o: Order) => o.fulfillmentStatus === "Completed").length,
      returns: orders.filter((o: Order) => !!o.returnRequest).length,
      canceled: orders.filter((o: Order) => o.fulfillmentStatus === "Canceled").length,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order: Order) => {
      // Tab filter
      if (activeTab === "pending_approval" && order.fulfillmentStatus !== "Pending Approval") {
        return false;
      }
      if (activeTab === "processing" && order.fulfillmentStatus !== "Processing") {
        return false;
      }
      if (activeTab === "shipping" && order.fulfillmentStatus !== "Shipping") {
        return false;
      }
      if (activeTab === "completed" && order.fulfillmentStatus !== "Completed") {
        return false;
      }
      if (activeTab === "returns" && !order.returnRequest) {
        return false;
      }
      if (activeTab === "canceled" && order.fulfillmentStatus !== "Canceled") {
        return false;
      }

      // Search query (Order ID or phone number or customer name or items)
      const normQuery = removeVietnameseTones(debouncedSearch);
      const lowerQuery = debouncedSearch.toLowerCase();
      const cleanPhoneQuery = debouncedSearch.replace(/\s+/g, "");

      const matchesSearch =
        !normQuery ||
        order.orderNumber.toLowerCase().includes(lowerQuery) ||
        order.customer.phone.replace(/\s+/g, "").includes(cleanPhoneQuery) ||
        removeVietnameseTones(order.customer.name).includes(normQuery) ||
        order.customer.name.toLowerCase().includes(lowerQuery) ||
        order.items.some((item) => removeVietnameseTones(item.name).includes(normQuery));

      if (!matchesSearch) return false;

      // Payment method filter
      if (paymentMethodFilter !== "all" && order.paymentMethod !== paymentMethodFilter) {
        return false;
      }

      return true;
    });
  }, [orders, activeTab, debouncedSearch, paymentMethodFilter]);


  // Copy transaction code
  const handleCopyTransaction = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getFulfillmentBadge = (status: Order["fulfillmentStatus"]) => {
    switch (status) {
      case "Pending Approval":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
            <Clock className="w-3 h-3 animate-pulse" />
            Chờ duyệt
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-800 border border-yellow-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping" />
            Đang xử lý
          </span>
        );
      case "Shipping":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
            <Truck className="w-3 h-3" />
            Đang giao
          </span>
        );
      case "Completed":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn thành
          </span>
        );
      case "Canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
            <XCircle className="w-3 h-3" />
            Đã hủy
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const handleBulkPrintInvoices = () => {
    if (filteredOrders.length === 0) {
      toast.error("Không có đơn hàng", "Không có đơn hàng nào trong danh sách để in.");
      return;
    }

    const printWin = window.open("", "_blank", "width=1000,height=800");
    if (!printWin) {
      toast.error("Bị chặn Popup", "Vui lòng cho phép popup để mở trang in hóa đơn.");
      return;
    }

    let invoicesHtml = "";
    filteredOrders.forEach((ord: Order) => {
      invoicesHtml += `
        <div class="invoice-page">
          <div class="invoice-header">
            <div>
              <div class="brand">SPORT<span>X</span></div>
              <p class="subtitle">PHIẾU XUẤT KHO KIÊM HÓA ĐƠN GIAO HÀNG</p>
            </div>
            <div class="meta">
              <div>Mã đơn: <strong>${ord.orderNumber}</strong></div>
              <div>Ngày đặt: ${formatDateTime(ord.dateTime || (ord as any).createdAt)}</div>
              <div>Trạng thái: ${ord.fulfillmentStatus}</div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <h4>THÔNG TIN NGƯỜI GỬI</h4>
              <p><strong>Cửa Hàng Thể Thao SportX Việt Nam</strong></p>
              <p>Hotline: 0398 802 022 - CSKH: support@sportx.store</p>
              <p>Kho hàng: Xuân Khanh, Sơn Tây, TP. Hà Nội</p>
            </div>
            <div class="info-box">
              <h4>THÔNG TIN NGƯỜI NHẬN</h4>
              <p><strong>${ord.customer?.name || "Khách Hàng"}</strong></p>
              <p>Điện thoại: ${ord.customer?.phone || "Chưa cập nhật"}</p>
              <p>Địa chỉ: ${ord.customer?.address || (ord as any).shippingAddress?.addressLine || "Chưa cập nhật"}</p>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">STT</th>
                <th>Sản phẩm / Quy cách</th>
                <th style="width: 70px; text-align: center;">Size</th>
                <th style="width: 70px; text-align: center;">Màu</th>
                <th style="width: 60px; text-align: center;">SL</th>
                <th style="width: 110px; text-align: right;">Đơn giá</th>
                <th style="width: 120px; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${ord.items
                .map(
                  (item: OrderItem, itemIdx: number) => `
                <tr>
                  <td style="text-align: center;">${itemIdx + 1}</td>
                  <td><strong>${item.name}</strong></td>
                  <td style="text-align: center;">${item.size || "-"}</td>
                  <td style="text-align: center;">${item.color || "-"}</td>
                  <td style="text-align: center;"><strong>${item.qty}</strong></td>
                  <td style="text-align: right;">${item.unitPrice?.toLocaleString("vi-VN")}đ</td>
                  <td style="text-align: right;"><strong>${(item.unitPrice * item.qty).toLocaleString("vi-VN")}đ</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="payment-note">
              <p>Phương thức thanh toán: <strong>${ord.paymentMethod}</strong></p>
              <p>Trạng thái thanh toán: <strong>${ord.paymentStatus}</strong></p>
              <p>Đơn vị vận chuyển: <strong>${ord.shippingCarrier || "Giao Hàng Nhanh / ViettelPost"}</strong></p>
            </div>
            <div class="amount-box">
              <div class="amount-row"><span>Tạm tính hàng:</span> <span>${ord.items.reduce((sum: number, it: any) => sum + it.unitPrice * it.qty, 0).toLocaleString("vi-VN")}đ</span></div>
              <div class="amount-row"><span>Phí vận chuyển:</span> <span>${((ord as any).shippingFee || 30000).toLocaleString("vi-VN")}đ</span></div>
              ${(ord as any).discountAmount ? `<div class="amount-row"><span>Giảm giá:</span> <span>-${(ord as any).discountAmount.toLocaleString("vi-VN")}đ</span></div>` : ""}
              <div class="amount-total"><span>TỔNG TIỀN PHẢI THU:</span> <span>${ord.totalAmount?.toLocaleString("vi-VN")}đ</span></div>
            </div>
          </div>

          <div class="signatures">
            <div>
              <p><strong>Người Đóng Gói</strong></p>
              <p class="sig-space">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p><strong>Nhân Viên Giao Hàng</strong></p>
              <p class="sig-space">(Ký, ghi rõ họ tên)</p>
            </div>
            <div>
              <p><strong>Người Nhận Hàng</strong></p>
              <p class="sig-space">(Ký, ghi rõ họ tên)</p>
            </div>
          </div>
        </div>
      `;
    });

    const printDoc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>In Hóa Đơn Hàng Loạt (${filteredOrders.length} đơn) - SportX</title>
        <style>
          @page { size: A4; margin: 12mm 15mm 15mm 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 12px; color: #0f172a; margin: 0; padding: 20px; line-height: 1.4; }
          .invoice-page { page-break-after: always; margin-bottom: 30px; border-bottom: 2px dashed #cbd5e1; padding-bottom: 30px; }
          .invoice-page:last-child { page-break-after: auto; border-bottom: none; }
          .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
          .brand { font-size: 22px; font-weight: 900; color: #059669; }
          .brand span { color: #0f172a; }
          .subtitle { font-size: 11px; font-weight: 700; color: #475569; margin: 2px 0 0 0; letter-spacing: 0.5px; }
          .meta { text-align: right; font-size: 11px; color: #334155; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px 12px; font-size: 11px; }
          .info-box h4 { margin: 0 0 6px 0; font-size: 11px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
          .info-box p { margin: 2px 0; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          .items-table th { background: #0f172a; color: white; padding: 7px 10px; font-size: 11px; text-align: left; }
          .items-table td { padding: 6px 10px; border: 1px solid #e2e8f0; font-size: 11.5px; }
          .items-table tr:nth-child(even) { background: #f8fafc; }
          .totals-section { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; }
          .payment-note { font-size: 11px; color: #475569; }
          .payment-note p { margin: 2px 0; }
          .amount-box { width: 280px; font-size: 11px; }
          .amount-row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #e2e8f0; }
          .amount-total { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; font-weight: 900; color: #059669; border-top: 2px solid #0f172a; margin-top: 4px; }
          .signatures { display: flex; justify-content: space-between; text-align: center; margin-top: 20px; }
          .signatures div { width: 160px; font-size: 11px; }
          .sig-space { margin-top: 50px; border-top: 1px dashed #cbd5e1; padding-top: 4px; color: #64748b; }
          .no-print { background: #ecfdf5; border: 1px solid #a7f3d0; padding: 10px 16px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .btn-print { background: #059669; color: white; border: none; padding: 6px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; }
            .invoice-page { border-bottom: none; padding-bottom: 0; margin-bottom: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <span>Đã tạo ${filteredOrders.length} hóa đơn xuất kho sẵn sàng in hoặc lưu PDF.</span>
          <button class="btn-print" onclick="window.print()">In Tất Cả Hóa Đơn</button>
        </div>
        ${invoicesHtml}
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 400);
          };
        </script>
      </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(printDoc);
    printWin.document.close();
    toast.success("Mở bản in thành công", `Đang chuẩn bị in ${filteredOrders.length} hóa đơn.`);
  };

  const handleExportOrders = (format: "excel" | "csv") => {
    if (filteredOrders.length === 0) {
      toast.error("Không có đơn hàng", "Không có đơn hàng nào trong danh sách để xuất.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const headers = [
      "Mã đơn hàng",
      "Khách hàng",
      "Số điện thoại",
      "Địa chỉ giao hàng",
      "Ngày đặt",
      "PT Thanh toán",
      "TT Thanh toán",
      "TT Giao hàng",
      "Đơn vị VC",
      "Tổng tiền (VNĐ)",
      "Chi tiết sản phẩm",
    ];

    const rows = filteredOrders.map((o: Order) => [
      o.orderNumber,
      o.customer?.name || "",
      o.customer?.phone || "",
      o.customer?.address || ((o as any).shippingAddress ? `${(o as any).shippingAddress.addressLine || ""}, ${(o as any).shippingAddress.city || ""}` : "Chưa cập nhật"),
      formatDateTime(o.dateTime || o.createdAt),
      o.paymentMethod,
      o.paymentStatus,
      o.fulfillmentStatus,
      o.shippingCarrier || "Chưa gán",
      `${o.totalAmount?.toLocaleString("vi-VN")}đ`,
      o.items.map((i: any) => `${i.name} (x${i.qty}, size ${i.size || "-"})`).join("; "),
    ]);

    if (format === "excel") {
      const sections: ReportSection[] = [
        {
          title: `Danh Sách Đơn Hàng (${filteredOrders.length} đơn)`,
          description: `Bộ lọc tab: ${activeTab.toUpperCase()} | Tìm kiếm: "${debouncedSearch || "Tất cả"}"`,
          headers,
          rows,
        },
      ];
      exportToExcel(`DonHang_SportX_${todayStr}`, "BÁO CÁO DANH SÁCH ĐƠN HÀNG SPORTX", sections, todayStr);
      toast.success("Xuất file Excel thành công", `File DonHang_SportX_${todayStr}.xls đã tải xuống.`);
    } else {
      exportToCSV(`DonHang_SportX_${todayStr}`, headers, rows);
      toast.success("Xuất file CSV thành công", `File DonHang_SportX_${todayStr}.csv đã tải xuống.`);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Title & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Quản lý Đơn hàng & Thanh toán
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Theo dõi đơn đặt hàng, giao dịch cổng thanh toán và quy trình xử lý đơn hàng thể thao.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Orders Dropdown (HeroUI) */}
            <HeroDropdown
              title="Chọn định dạng"
              trigger={
                <button
                  type="button"
                  className="h-9 px-3.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition inline-flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Xuất file đơn hàng
                </button>
              }
              items={[
                {
                  key: "excel",
                  label: "Bảng tính Excel (.xls)",
                  icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
                },
                {
                  key: "csv",
                  label: "Dữ liệu thô CSV (.csv)",
                  icon: <Download className="w-4 h-4 text-blue-500" />,
                },
              ]}
              onAction={(key) => handleExportOrders(key as "excel" | "csv")}
            />

            <button
              onClick={handleBulkPrintInvoices}
              className="h-9 px-3.5 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition inline-flex items-center justify-center gap-2 shadow-2xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              In hóa đơn ({filteredOrders.length})
            </button>
          </div>
        </div>

        {/* 1. Top Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Tất cả đơn</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "all" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {tabCounts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("pending_approval")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "pending_approval"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Chờ duyệt</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "pending_approval"
                  ? "bg-amber-700 text-white"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {tabCounts.pending_approval}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("processing")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "processing"
                ? "bg-amber-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Đang đóng gói</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "processing"
                  ? "bg-amber-700 text-white"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {tabCounts.processing}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "shipping"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Đang giao</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "shipping" ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-800"
              }`}
            >
              {tabCounts.shipping}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "completed"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Hoàn thành</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "completed" ? "bg-teal-700 text-white" : "bg-teal-100 text-teal-800"
              }`}
            >
              {tabCounts.completed}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("returns")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "returns"
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Đổi trả / Hoàn hàng</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "returns" ? "bg-purple-700 text-white" : "bg-purple-100 text-purple-800"
              }`}
            >
              {tabCounts.returns}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("canceled")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-2 cursor-pointer ${
              activeTab === "canceled"
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span>Đã hủy / Hoàn tiền</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] ${
                activeTab === "canceled" ? "bg-rose-700 text-white" : "bg-rose-100 text-rose-800"
              }`}
            >
              {tabCounts.canceled}
            </span>
          </button>
        </div>

        {/* 2. Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn (#SPX-...), SĐT, Tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded transition"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Date Picker & Payment Method Filter (HeroUI) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker */}
            <HeroSelect
              value={dateRange}
              onChange={setDateRange}
              size="sm"
              icon={<Calendar className="w-3.5 h-3.5" />}
              options={[
                { key: "01 Sep 2026 - 23 Sep 2026", label: "Tháng này" },
                { key: "Today", label: "Hôm nay" },
                { key: "This Week", label: "Tuần này" },
                { key: "Last 30 Days", label: "30 ngày qua" },
              ]}
              aria-label="Khoảng thời gian"
            />

            {/* Payment Method Filter */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
              <span>Hình thức:</span>
              <HeroSelect
                value={paymentMethodFilter}
                onChange={setPaymentMethodFilter}
                size="sm"
                options={[
                  { key: "all", label: "Tất cả hình thức" },
                  { key: "VNPAY", label: "🔹 VNPAY Sandbox (Online)" },
                  { key: "COD", label: "💵 COD (Nhận hàng thanh toán)" },
                ]}
                aria-label="Lọc hình thức thanh toán"
              />
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || paymentMethodFilter !== "all" || activeTab !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setPaymentMethodFilter("all");
                  setActiveTab("all");
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                title="Đặt lại bộ lọc"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3. Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200/80">
                  <th className="py-3.5 px-5 whitespace-nowrap">Mã đơn</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Thời gian</th>
                  <th className="py-3.5 px-5 whitespace-nowrap min-w-[180px]">Khách hàng</th>
                  <th className="py-3.5 px-5 text-center whitespace-nowrap">Số lượng</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Tổng tiền</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Hình thức TT</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Trạng thái TT</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Vận chuyển</th>
                  <th className="py-3.5 px-5 text-right whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                {isLoading ? (
                  <TableSkeletonRows cols={9} rows={6} />
                ) : filteredOrders.length > 0 ? (
                  filteredOrders.map((order: Order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-50/70 transition group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      {/* Order ID */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className="font-mono font-bold text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg"
                          title={`Mã đơn hàng: #${order.orderNumber}`}
                        >
                          #{order.orderNumber}
                        </span>
                      </td>

                      {/* Date & Time */}
                      <td className="py-4 px-5 text-slate-500 font-medium whitespace-nowrap">
                        {formatDateTime(order.dateTime || order.createdAt)}
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {order.customer.avatar}
                          </div>
                          <div className="min-w-0 max-w-[160px]">
                            <div
                              className="font-bold text-slate-900 leading-tight truncate cursor-help"
                              title={order.customer.name}
                            >
                              {order.customer.name}
                            </div>
                            <div
                              className="text-[11px] text-slate-400 font-mono truncate"
                              title={`SĐT: ${order.customer.phone}`}
                            >
                              {order.customer.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Items Count */}
                      <td className="py-4 px-5 text-center whitespace-nowrap">
                        <span
                          className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md text-[11px]"
                          title={`${order.items.map((i) => `${i.name} (x${i.qty})`).join(", ")}`}
                        >
                          {order.items.reduce((sum: number, item: OrderItem) => sum + item.qty, 0)} món
                        </span>
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <span
                          className="font-extrabold text-sm text-slate-900"
                          title={`Tổng thanh toán: ${formatCurrency(order.totalAmount)}`}
                        >
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>

                      {/* Payment Method Badge */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {order.paymentMethod === "VNPAY" && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-50 text-blue-800 border border-blue-200/60 whitespace-nowrap"
                            title="Thanh toán trực tuyến qua cổng VNPAY"
                          >
                            <span className="w-2 h-2 rounded-sm bg-blue-600 rotate-45 inline-block" />
                            VNPAY
                          </span>
                        )}
                        {order.paymentMethod === "COD" && (
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap"
                            title="Thanh toán tiền mặt khi nhận hàng (COD)"
                          >
                            💵 COD
                          </span>
                        )}
                      </td>

                      {/* Payment Status */}
                      <td className="py-4 px-5">
                        {order.paymentStatus === "Paid" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                            <Check className="w-3 h-3" />
                            Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/50">
                            <Clock className="w-3 h-3" />
                            Chưa thanh toán
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {order.returnRequest ? (
                          order.returnRequest.status === "Pending" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200" title={`Lý do: ${order.returnRequest.reason}`}>
                              <RotateCcw className="w-3.5 h-3.5 text-purple-600 animate-spin" />
                              Chờ duyệt hoàn
                            </span>
                          ) : order.returnRequest.status === "Approved" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                              Đã duyệt hoàn
                            </span>
                          ) : order.returnRequest.status === "Completed" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Đã hoàn hàng
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Từ chối hoàn
                            </span>
                          )
                        ) : (
                          getFulfillmentBadge(order.fulfillmentStatus)
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {order.fulfillmentStatus === "Pending Approval" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  fulfillmentStatus: "Processing",
                                });
                                setPrintModalOrder(order);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Duyệt đơn và mở phiếu xuất kho"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Duyệt đơn
                            </button>
                          )}

                          {order.fulfillmentStatus === "Processing" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDispatchModalOrder(order);
                                setDispatchCarrier("GHTK");
                                setDispatchTracking(`GHTK-${order.orderNumber.replace(/[^0-9]/g, "") || Math.floor(100000 + Math.random() * 900000)}`);
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Bàn giao đơn vị vận chuyển"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              Giao hàng
                            </button>
                          )}

                          {order.fulfillmentStatus === "Shipping" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatusMutation.mutate({
                                  id: order.id,
                                  fulfillmentStatus: "Completed",
                                  paymentStatus: "Paid",
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] transition inline-flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Xác nhận khách đã nhận & thanh toán đủ"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Đã giao
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(order);
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs transition inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Xem chi tiết
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Bar */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>
              Hiển thị {filteredOrders.length} trên {tabCounts[activeTab]} đơn hàng
            </span>
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition disabled:opacity-50 cursor-pointer"
                disabled
              >
                Trước
              </button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-bold transition cursor-pointer">
                Sau
              </button>
            </div>
          </div>
        </div>

        {/* 4. Side Panel / Modal ("Order Detail View") */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            {/* Backdrop */}
            <div
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over panel */}
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
                {/* Panel Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono">
                      #{selectedOrder.orderNumber.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-slate-900">
                          Đơn hàng #{selectedOrder.orderNumber}
                        </h2>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedOrder.paymentStatus === "Paid"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {selectedOrder.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-medium">
                        Đặt lúc: {formatDateTime(selectedOrder.dateTime || selectedOrder.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Panel Body Content */}
                <div className="p-6 space-y-6 flex-1 text-xs">
                  {/* Tiến trình & Thao tác xử lý đơn */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200/90 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                        Tiến trình & Thao tác xử lý đơn:
                      </span>
                      {getFulfillmentBadge(selectedOrder.fulfillmentStatus)}
                    </div>

                    {/* 1. Chờ duyệt (Pending Approval) */}
                    {selectedOrder.fulfillmentStatus === "Pending Approval" && (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs text-slate-600 font-medium">
                          Đơn hàng mới từ khách hàng đang chờ nhân viên kiểm tra, duyệt đơn và in phiếu xuất kho.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              updateStatusMutation.mutate({
                                id: selectedOrder.id,
                                fulfillmentStatus: "Processing",
                              });
                              setPrintModalOrder(selectedOrder);
                            }}
                            className="flex-1 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Duyệt đơn & In phiếu xuất kho
                          </button>
                          <button
                            onClick={() => {
                              setCancelModalOrder(selectedOrder);
                              setCancelReasonInput("Khách yêu cầu hủy / Sai thông tin");
                            }}
                            className="py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy đơn
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 2. Đang đóng gói / Xử lý (Processing) */}
                    {selectedOrder.fulfillmentStatus === "Processing" && (
                      <div className="space-y-2 pt-1">
                        <p className="text-xs text-slate-600 font-medium">
                          Kho đang đóng gói hàng. Khi đóng gói xong, bấm bàn giao cho đơn vị vận chuyển.
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setDispatchModalOrder(selectedOrder);
                              setDispatchCarrier("GHTK");
                              setDispatchTracking(`GHTK-${selectedOrder.orderNumber.replace(/[^0-9]/g, "") || Math.floor(100000 + Math.random() * 900000)}`);
                            }}
                            className="flex-1 py-2 px-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <Truck className="w-4 h-4" />
                            Bàn giao vận chuyển (GHTK / ViettelPost)
                          </button>
                          <button
                            onClick={() => setPrintModalOrder(selectedOrder)}
                            className="py-2 px-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                            title="In lại phiếu xuất kho"
                          >
                            <Printer className="w-4 h-4" />
                            In phiếu
                          </button>
                          <button
                            onClick={() => {
                              setCancelModalOrder(selectedOrder);
                              setCancelReasonInput("Hủy đơn trong quá trình đóng gói");
                            }}
                            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            Hủy
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. Đang giao hàng (Shipping) */}
                    {selectedOrder.fulfillmentStatus === "Shipping" && (
                      <div className="space-y-2.5 pt-1">
                        <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-blue-900 text-[11px] font-medium flex flex-wrap items-center justify-between gap-1">
                          <span>Đơn vị: <strong>{selectedOrder.shippingCarrier || "GHTK (Giao Hàng Tiết Kiệm)"}</strong></span>
                          <span>Vận đơn: <strong className="font-mono">{selectedOrder.trackingCode || "Chưa có"}</strong></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: selectedOrder.id,
                                fulfillmentStatus: "Completed",
                                paymentStatus: "Paid",
                              })
                            }
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            Khách đã nhận & Thanh toán đủ
                          </button>
                          <button
                            onClick={() => {
                              setCancelModalOrder(selectedOrder);
                              setCancelReasonInput("Giao hàng thất bại 3 lần / Khách từ chối nhận (Hoàn kho)");
                            }}
                            className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Giao thất bại / Hoàn kho
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 4. Giao thành công (Completed) */}
                    {selectedOrder.fulfillmentStatus === "Completed" && (
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Đơn hàng đã giao thành công và hoàn tất thanh toán.
                        </span>
                        <button
                          onClick={() => setPrintModalOrder(selectedOrder)}
                          className="px-2.5 py-1 bg-white border border-emerald-300 text-emerald-800 rounded-lg text-[11px] font-bold hover:bg-emerald-100 transition cursor-pointer"
                        >
                          In hóa đơn
                        </button>
                      </div>
                    )}

                    {/* Return Request Management Card */}
                    {selectedOrder.returnRequest && (
                      <div className="p-4 bg-purple-50/80 rounded-2xl border border-purple-200 text-purple-900 text-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold flex items-center gap-1.5 text-purple-900">
                            <RotateCcw className="w-4 h-4 text-purple-600" />
                            Yêu cầu Đổi trả / Hoàn hàng:
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              selectedOrder.returnRequest.status === "Pending"
                                ? "bg-amber-100 text-amber-800 border border-amber-200"
                                : selectedOrder.returnRequest.status === "Approved"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : selectedOrder.returnRequest.status === "Completed"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                            }`}
                          >
                            {selectedOrder.returnRequest.status === "Pending" && "Chờ duyệt"}
                            {selectedOrder.returnRequest.status === "Approved" && "Đã duyệt - Chờ nhận hàng"}
                            {selectedOrder.returnRequest.status === "Completed" && "Đã nhận hàng & Hoàn kho"}
                            {selectedOrder.returnRequest.status === "Rejected" && "Đã từ chối"}
                          </span>
                        </div>

                        <div className="bg-white/90 p-3 rounded-xl border border-purple-100 text-xs space-y-1.5 shadow-2xs">
                          <p>
                            Lý do: <strong>{selectedOrder.returnRequest.reason}</strong>
                          </p>
                          {selectedOrder.returnRequest.detailedReason && (
                            <p className="text-slate-500 italic text-[11px]">
                              "{selectedOrder.returnRequest.detailedReason}"
                            </p>
                          )}
                          {selectedOrder.returnRequest.bankAccount && (
                            <div className="p-2 bg-slate-50 rounded-lg text-[11px] text-slate-700 font-medium">
                              <span className="text-slate-400 block text-[10px]">Tài khoản nhận hoàn tiền:</span>
                              <strong>{selectedOrder.returnRequest.bankAccount}</strong> ({selectedOrder.returnRequest.bankName}) — {selectedOrder.returnRequest.accountHolder}
                            </div>
                          )}
                          <p className="text-slate-700 font-bold pt-1">
                            Tiền hoàn dự kiến: <strong className="text-purple-700 font-extrabold text-sm">{formatCurrency(selectedOrder.returnRequest.refundAmount || selectedOrder.totalAmount)}</strong>
                          </p>
                          {selectedOrder.returnRequest.adminNote && (
                            <p className="text-slate-600 text-[11px] pt-1 border-t border-purple-100">
                              Phản hồi của shop: <strong>{selectedOrder.returnRequest.adminNote}</strong>
                            </p>
                          )}
                        </div>

                        {/* Return Action Buttons */}
                        {selectedOrder.returnRequest.status === "Pending" && (
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              onClick={() => {
                                setReturnAdminNote("Yêu cầu hoàn trả đã được duyệt. Quý khách vui lòng đóng gói hàng và gửi về địa chỉ shop (Số 12 Hữu Nghị, Xuân Khanh, Sơn Tây, Hà Nội).");
                                setReturnActionModal({ order: selectedOrder, action: "approve" });
                              }}
                              className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              Duyệt hoàn hàng
                            </button>
                            <button
                              onClick={() => {
                                setReturnAdminNote("Yêu cầu hoàn trả không đáp ứng điều kiện đổi trả của cửa hàng.");
                                setReturnActionModal({ order: selectedOrder, action: "reject" });
                              }}
                              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              Từ chối
                            </button>
                          </div>
                        )}

                        {selectedOrder.returnRequest.status === "Approved" && (
                          <button
                            onClick={() => {
                              setReturnAdminNote("Shop đã nhận được kiện hàng hoàn trả, kiểm tra chất lượng đạt yêu cầu và đã hoàn tất hoàn tiền cho khách.");
                              setReturnActionModal({ order: selectedOrder, action: "complete" });
                            }}
                            className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <PackageCheck className="w-4 h-4" />
                            Xác nhận đã nhận hàng hoàn & Nhập kho
                          </button>
                        )}
                      </div>
                    )}

                    {/* 5. Đã hủy / Hoàn kho (Canceled) */}
                    {selectedOrder.fulfillmentStatus === "Canceled" && (
                      <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-900 text-xs font-medium space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          Đơn hàng đã hủy & hoàn kho số lượng sản phẩm
                        </div>
                        <p className="text-slate-600 text-[11px]">
                          Lý do: <strong>{selectedOrder.cancelReason || "Khách yêu cầu hủy / Giao hàng thất bại"}</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer & Shipping Address */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" /> Thông tin khách hàng & Địa chỉ nhận
                    </h3>
                    <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">
                          {selectedOrder.customer.name}
                        </span>
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded">
                          Giao hàng tiêu chuẩn
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono font-bold text-slate-800">
                          {selectedOrder.customer.phone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{selectedOrder.customer.email}</span>
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-slate-700 leading-relaxed font-medium">
                        {selectedOrder.customer.address}
                      </div>
                    </div>
                  </div>

                  {/* Product Items List Purchased */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Sản phẩm đặt mua (
                      {selectedOrder.items.length})
                    </h3>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="p-3.5 flex items-center gap-3.5 hover:bg-slate-50">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                            {item.thumbnail && (item.thumbnail.startsWith("http") || item.thumbnail.startsWith("/")) ? (
                              <img
                                src={item.thumbnail}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                }}
                              />
                            ) : (
                              <span className="text-2xl">{item.thumbnail || "👟"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate text-xs sm:text-sm" title={item.name}>
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span className="font-bold bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                                Size: {item.size}
                              </span>
                              <span className="flex items-center gap-1">
                                <span
                                  className="w-2 h-2 rounded-full inline-block"
                                  style={{ backgroundColor: item.colorHex }}
                                />
                                {item.color}
                              </span>
                              <span>• SL: <strong className="text-slate-800">{item.qty}</strong></span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-extrabold text-sm text-slate-900">
                              {formatCurrency(item.unitPrice * item.qty)}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {formatCurrency(item.unitPrice)} / cái
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Transaction History Details */}
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" /> Chi tiết giao dịch thanh toán
                    </h3>
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-medium">Cổng thanh toán:</span>
                        <span className="font-extrabold text-slate-900">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>

                      {selectedOrder.transactionDetails ? (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Mã giao dịch:</span>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                {selectedOrder.transactionDetails.transactionCode}
                              </span>
                              <button
                                onClick={() =>
                                  handleCopyTransaction(
                                    selectedOrder.transactionDetails!.transactionCode
                                  )
                                }
                                className="p-1 hover:bg-slate-200 rounded text-slate-500 transition cursor-pointer"
                                title="Sao chép mã giao dịch"
                              >
                                {copiedCode ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Thời gian ghi nhận:</span>
                            <span className="font-medium text-slate-700">
                              {formatDateTime(selectedOrder.transactionDetails.timestamp)}
                            </span>
                          </div>

                          {selectedOrder.transactionDetails.bankCode && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 font-medium">Ngân hàng / Kênh:</span>
                              <span className="font-semibold text-slate-800">
                                {selectedOrder.transactionDetails.bankCode}
                              </span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 font-medium">Trạng thái phản hồi:</span>
                            <span className="font-bold text-emerald-600">
                              {selectedOrder.transactionDetails.responseMessage}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-amber-700 bg-amber-50 p-2.5 rounded-xl text-center font-medium">
                          Thanh toán khi nhận hàng (COD) — Bưu tá sẽ thu tiền khi giao hàng thành công.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Summary Totals */}
                  <div className="border-t border-slate-100 pt-3 space-y-2">
                    <div className="flex justify-between text-slate-500">
                      <span>Tạm tính</span>
                      <span>
                        {formatCurrency(
                          selectedOrder.subtotal ||
                            (selectedOrder.totalAmount + (selectedOrder.discountAmount || 0))
                        )}
                      </span>
                    </div>
                    {selectedOrder.discountAmount && selectedOrder.discountAmount > 0 ? (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>
                          Mã ưu đãi {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}
                        </span>
                        <span>-{formatCurrency(selectedOrder.discountAmount)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-slate-500">
                      <span>Phí vận chuyển</span>
                      <span>
                        {selectedOrder.shippingFee && selectedOrder.shippingFee > 0
                          ? formatCurrency(selectedOrder.shippingFee)
                          : <span className="text-emerald-600 font-bold">Miễn phí (SportX Prime)</span>}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                      <span>Tổng thanh toán</span>
                      <span className="text-blue-600 text-base">
                        {formatCurrency(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Panel Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 sticky bottom-0">
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      setPrintModalOrder(selectedOrder);
                    }}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    In phiếu xuất kho
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 1: PHIẾU XUẤT KHO KIÊM VẬN CHUYỂN (PRINT PACKING SLIP) */}
        {/* ========================================================= */}
        {printModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Phiếu xuất kho & Vận chuyển #{printModalOrder.orderNumber}
                  </h3>
                </div>
                <button
                  onClick={() => setPrintModalOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable slip area */}
              <div id="packing-slip-printable" className="p-6 border border-slate-300 rounded-xl bg-white space-y-4 text-xs font-sans">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">SPORTX VIỆT NAM</h2>
                    <p className="text-[11px] text-slate-500 font-medium">Hệ thống phân phối đồ thể thao chính hãng</p>
                    <p className="text-[11px] text-slate-500">Hotline: 0398.802.022 • Website: sportx.store</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase text-slate-900 block">PHIẾU XUẤT KHO</span>
                    <span className="font-mono text-sm font-extrabold text-blue-600 block">#{printModalOrder.orderNumber}</span>
                    <span className="text-[10px] text-slate-400">Ngày tạo: {formatDateTime(printModalOrder.dateTime || printModalOrder.createdAt)}</span>
                  </div>
                </div>

                {/* Sender & Receiver Info */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-3 text-[11px]">
                  <div>
                    <span className="font-bold text-slate-800 uppercase block mb-1">Người gửi:</span>
                    <p className="font-semibold text-slate-900">Kho Tổng SportX Logistics</p>
                    <p className="text-slate-600">Sơn Tây, Hà Nội, Việt Nam</p>
                    <p className="text-slate-600">SĐT: 0398.802.022</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 uppercase block mb-1">Người nhận:</span>
                    <p className="font-extrabold text-slate-900">{printModalOrder.customer.name}</p>
                    <p className="font-semibold text-slate-800">SĐT: {printModalOrder.customer.phone}</p>
                    <p className="text-slate-600 leading-tight">{printModalOrder.customer.address}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse border border-slate-200 text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                        <th className="p-2 border border-slate-200 w-8 text-center whitespace-nowrap">STT</th>
                        <th className="p-2 border border-slate-200 whitespace-nowrap">Tên sản phẩm</th>
                        <th className="p-2 border border-slate-200 w-24 whitespace-nowrap">Size / Màu</th>
                        <th className="p-2 border border-slate-200 w-12 text-center whitespace-nowrap">SL</th>
                        <th className="p-2 border border-slate-200 w-24 text-right whitespace-nowrap">Đơn giá</th>
                        <th className="p-2 border border-slate-200 w-24 text-right whitespace-nowrap">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {printModalOrder.items.map((it, idx) => (
                        <tr key={it.id || idx}>
                          <td className="p-2 border border-slate-200 text-center font-bold whitespace-nowrap">{idx + 1}</td>
                          <td className="p-2 border border-slate-200 font-bold text-slate-900 whitespace-nowrap max-w-[200px] truncate" title={it.name}>{it.name}</td>
                          <td className="p-2 border border-slate-200 text-slate-600 font-semibold whitespace-nowrap">{it.size} - {it.color}</td>
                          <td className="p-2 border border-slate-200 text-center font-extrabold text-blue-600 whitespace-nowrap">{it.qty}</td>
                          <td className="p-2 border border-slate-200 text-right whitespace-nowrap">{formatCurrency(it.unitPrice)}</td>
                          <td className="p-2 border border-slate-200 text-right font-extrabold whitespace-nowrap">{formatCurrency(it.unitPrice * it.qty)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Summary */}
                <div className="flex justify-between items-end border-t border-slate-200 pt-3">
                  <div className="text-[11px] text-slate-500 space-y-1">
                    <p>Hình thức: <strong>{printModalOrder.paymentMethod}</strong> ({printModalOrder.paymentStatus === "Paid" ? "Đã thanh toán" : "Chưa thanh toán"})</p>
                    <p className="italic font-medium">Khách hàng được quyền kiểm tra hàng trước khi thanh toán.</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">Số tiền cần thu (COD):</span>
                    <span className="text-lg font-black text-rose-600 block">
                      {printModalOrder.paymentMethod === "COD" && printModalOrder.paymentStatus !== "Paid"
                        ? formatCurrency(printModalOrder.totalAmount)
                        : "0đ (Đã thanh toán Online)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setPrintModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  In phiếu ngay
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 2: BÀN GIAO VẬN CHUYỂN (GHTK / VIETTELPOST) */}
        {/* ========================================================= */}
        {dispatchModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Bàn giao đơn vị vận chuyển
                  </h3>
                </div>
                <button
                  onClick={() => setDispatchModalOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500">
                Chuyển đơn hàng <strong>#{dispatchModalOrder.orderNumber}</strong> sang trạng thái <strong>Đang giao hàng (Shipping)</strong> để đối tác tiến hành giao hàng.
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Đơn vị vận chuyển đối tác:
                  </label>
                  <HeroSelect
                    value={dispatchCarrier}
                    onChange={(carrier) => {
                      setDispatchCarrier(carrier);
                      setDispatchTracking(`${carrier.slice(0, 4).toUpperCase()}-${dispatchModalOrder.orderNumber.replace(/[^0-9]/g, "") || Math.floor(100000 + Math.random() * 900000)}`);
                    }}
                    options={[
                      { key: "GHTK", label: "GHTK (Giao Hàng Tiết Kiệm)" },
                      { key: "ViettelPost", label: "ViettelPost (Bưu chính Viettel)" },
                      { key: "J&T Express", label: "J&T Express" },
                      { key: "Shopee Xpress", label: "Shopee Xpress" },
                    ]}
                    className="w-full"
                    triggerClassName="w-full bg-slate-50"
                    aria-label="Chọn đơn vị vận chuyển"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Mã vận đơn bưu tá:
                  </label>
                  <input
                    type="text"
                    value={dispatchTracking}
                    onChange={(e) => setDispatchTracking(e.target.value)}
                    placeholder="VD: GHTK-8821901"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({
                      id: dispatchModalOrder.id,
                      fulfillmentStatus: "Shipping",
                      shippingCarrier: dispatchCarrier,
                      trackingCode: dispatchTracking,
                    });
                    setDispatchModalOrder(null);
                  }}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận bàn giao
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 3: HỦY ĐƠN / GIAO THẤT BẠI (HOÀN KHO) */}
        {/* ========================================================= */}
        {cancelModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-rose-600">
                  <RotateCcw className="w-5 h-5" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Xác nhận Hủy đơn / Hoàn kho
                  </h3>
                </div>
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Đơn hàng <strong>#{cancelModalOrder.orderNumber}</strong> sẽ chuyển sang trạng thái <strong>Đã hủy (Canceled)</strong> và hệ thống sẽ <strong>tự động hoàn trả tồn kho</strong> cho các sản phẩm trong đơn.
                </p>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Lý do hủy đơn / hoàn hàng:
                  </label>
                  <HeroSelect
                    value={cancelReasonInput}
                    onChange={setCancelReasonInput}
                    options={[
                      { key: "Khách yêu cầu hủy / Sai thông tin", label: "Khách yêu cầu hủy / Sai thông tin" },
                      { key: "Giao hàng thất bại 3 lần / Khách từ chối nhận (Hoàn kho)", label: "Giao hàng thất bại 3 lần / Khách từ chối nhận (Hoàn kho)" },
                      { key: "Hàng bị lỗi trong quá trình đóng gói", label: "Hàng bị lỗi trong quá trình đóng gói" },
                      { key: "Không liên lạc được với khách hàng", label: "Không liên lạc được với khách hàng" },
                    ]}
                    className="w-full"
                    triggerClassName="w-full bg-slate-50"
                    aria-label="Chọn lý do hủy đơn"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setCancelModalOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => {
                    updateStatusMutation.mutate({
                      id: cancelModalOrder.id,
                      fulfillmentStatus: "Canceled",
                      cancelReason: cancelReasonInput,
                    });
                    setCancelModalOrder(null);
                  }}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Xác nhận Hủy & Hoàn kho
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* MODAL 4: XỬ LÝ YÊU CẦU ĐỔI TRẢ / HOÀN HÀNG */}
        {/* ========================================================= */}
        {returnActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  {returnActionModal.action === "approve" && (
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                  {returnActionModal.action === "reject" && (
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
                      <XCircle className="w-4 h-4" />
                    </div>
                  )}
                  {returnActionModal.action === "complete" && (
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <PackageCheck className="w-4 h-4" />
                    </div>
                  )}
                  <h3 className="font-extrabold text-base text-slate-900">
                    {returnActionModal.action === "approve" && "Duyệt yêu cầu hoàn trả"}
                    {returnActionModal.action === "reject" && "Từ chối yêu cầu hoàn trả"}
                    {returnActionModal.action === "complete" && "Xác nhận nhận hàng & Nhập kho"}
                  </h3>
                </div>
                <button
                  onClick={() => setReturnActionModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5">
                <p>
                  Đơn hàng: <strong>#{returnActionModal.order.orderNumber}</strong> ({returnActionModal.order.customer.name})
                </p>
                <div className="p-2.5 bg-slate-50 rounded-xl text-slate-700 space-y-1">
                  <p>
                    Lý do khách gửi: <strong>{returnActionModal.order.returnRequest?.reason}</strong>
                  </p>
                  {returnActionModal.order.returnRequest?.bankAccount && (
                    <p className="text-[11px] text-slate-500">
                      STK hoàn tiền: <strong>{returnActionModal.order.returnRequest.bankAccount}</strong> ({returnActionModal.order.returnRequest.bankName}) — {returnActionModal.order.returnRequest.accountHolder}
                    </p>
                  )}
                  {returnActionModal.action === "complete" && (
                    <p className="text-emerald-700 font-bold pt-1 border-t border-slate-200">
                      Hệ thống sẽ tự động hoàn trả số lượng tồn kho ({returnActionModal.order.items.length} món) vào kho hàng!
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Ghi chú / Lời nhắn phản hồi cho khách:
                  </label>
                  <textarea
                    rows={3}
                    value={returnAdminNote}
                    onChange={(e) => setReturnAdminNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Nhập ghi chú cho khách hàng..."
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setReturnActionModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
                  disabled={processReturnMutation.isPending}
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={() => {
                    processReturnMutation.mutate({
                      id: returnActionModal.order.id,
                      payload: {
                        action: returnActionModal.action,
                        adminNote: returnAdminNote,
                      },
                    });
                  }}
                  disabled={processReturnMutation.isPending}
                  className={`px-5 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer text-white ${
                    returnActionModal.action === "reject"
                      ? "bg-rose-600 hover:bg-rose-700 shadow-rose-500/20"
                      : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  <Check className="w-4 h-4" />
                  {returnActionModal.action === "approve" && "Xác nhận duyệt"}
                  {returnActionModal.action === "reject" && "Xác nhận từ chối"}
                  {returnActionModal.action === "complete" && "Xác nhận nhập kho & Hoàn tất"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
