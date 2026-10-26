import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { HeroSelect } from "@/components/ui/HeroSelect";
import { useSystemSettings, useUpdateSettings } from "@/hooks";
import { useToastStore } from "@/store/useToastStore";
import {
  Save,
  Check,
  Building2,
  CreditCard,
  Truck,
  Shield,
  Globe,
  Mail,
  Phone,
} from "lucide-react";

type SettingsTab = "general" | "payments" | "shipping" | "security";

export default function SettingsPage() {
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [isSaved, setIsSaved] = useState(false);

  // Fetch settings from Backend using custom hook
  const { data: serverSettings } = useSystemSettings();

  // General Settings State
  const [storeName, setStoreName] = useState("SportX Vietnam Co., Ltd.");
  const [contactEmail, setContactEmail] = useState("support@sportx.store");
  const [contactPhone, setContactPhone] = useState("+84 28 7300 8888");
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("GMT+07:00 (Bangkok, Hanoi, Jakarta)");
  const [storeAddress, setStoreAddress] = useState(
    "Bitexco Financial Tower, Level 14, District 1, Ho Chi Minh City"
  );

  // Payment Gateway Settings State
  const [vnpayActive, setVnpayActive] = useState(true);
  const [vnpayMerchantId, setVnpayMerchantId] = useState("SPORTXVN01");
  const [vnpaySecretHash, setVnpaySecretHash] = useState("9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d");
  const [vnpaySandbox, setVnpaySandbox] = useState(true);

  const [codActive, setCodActive] = useState(true);

  // Shipping Settings State
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(150);
  const [defaultShippingFee, setDefaultShippingFee] = useState(5.0);
  const [activeCarriers, setActiveCarriers] = useState(["GHTK", "GHN", "SportX Express"]);

  // Security & Notification State
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [lowStockAlertEmail, setLowStockAlertEmail] = useState("inventory@sportx.store");
  const [lowStockThreshold, setLowStockThreshold] = useState(15);

  // Synchronize state when server data is loaded
  useEffect(() => {
    if (serverSettings) {
      if (serverSettings.storeName) setStoreName(serverSettings.storeName);
      if (serverSettings.storeEmail) setContactEmail(serverSettings.storeEmail);
      if (serverSettings.storePhone) setContactPhone(serverSettings.storePhone);
      if (serverSettings.storeAddress) setStoreAddress(serverSettings.storeAddress);
      if (serverSettings.vnpayEnabled !== undefined) setVnpayActive(serverSettings.vnpayEnabled);
      if (serverSettings.vnpayTmnCode) setVnpayMerchantId(serverSettings.vnpayTmnCode);
      if (serverSettings.codEnabled !== undefined) setCodActive(serverSettings.codEnabled);
      if (serverSettings.shippingFeeDefault) setDefaultShippingFee(serverSettings.shippingFeeDefault);
      if (serverSettings.freeShippingThreshold) setFreeShippingThreshold(serverSettings.freeShippingThreshold);
    }
  }, [serverSettings]);

  // Update Settings Mutation using custom hook
  const baseUpdateSettings = useUpdateSettings();
  const updateSettingsMutation = {
    ...baseUpdateSettings,
    mutate: (payload: any) =>
      baseUpdateSettings.mutate(payload, {
        onSuccess: () => {
          setIsSaved(true);
          toast.success("Thành công", "Đã lưu cài đặt hệ thống SportX");
          setTimeout(() => setIsSaved(false), 3000);
        },
        onError: (err: any) => toast.error("Lỗi", err.message),
      }),
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate({
      storeName,
      storeEmail: contactEmail,
      storePhone: contactPhone,
      storeAddress,
      currency,
      shippingFeeDefault: Number(defaultShippingFee),
      freeShippingThreshold: Number(freeShippingThreshold),
      vnpayEnabled: vnpayActive,
      vnpayTmnCode: vnpayMerchantId,
      vnpayHashSecret: vnpaySecretHash,
      codEnabled: codActive,
    });
  };

  const toggleCarrier = (carrier: string) => {
    setActiveCarriers((prev) =>
      prev.includes(carrier) ? prev.filter((c) => c !== carrier) : [...prev, carrier]
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Cài đặt & Cấu hình hệ thống
              </h1>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                Hệ thống v2.4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Quản lý thông tin cửa hàng, cổng thanh toán, đơn vị vận chuyển và chính sách bảo mật.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Đã lưu cài đặt thành công!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Lưu thay đổi
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200/80 pb-px overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("general")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === "general"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <Building2 className="w-4 h-4" />
            Thông tin chung cửa hàng
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === "payments"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Cổng thanh toán (VNPAY / COD)
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === "shipping"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <Truck className="w-4 h-4" />
            Vận chuyển & Giao nhận
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition -mb-px whitespace-nowrap ${
              activeTab === "security"
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl"
            }`}
          >
            <Shield className="w-4 h-4" />
            Bảo mật & Cảnh báo
          </button>
        </div>

        {/* Tab 1: General Store Information */}
        {activeTab === "general" && (
          <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Hồ sơ & Thông tin liên hệ
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tên doanh nghiệp / Cửa hàng *
                  </label>
                  <input
                    type="text"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Đơn vị tiền tệ chính
                  </label>
                  <HeroSelect
                    value={currency}
                    onChange={setCurrency}
                    options={[
                      { key: "VND", label: "VND (₫) - Đồng Việt Nam" },
                      { key: "USD", label: "USD ($) - Đô la Mỹ" },
                      { key: "EUR", label: "EUR (€) - Đồng Euro" },
                    ]}
                    className="w-full"
                    triggerClassName="w-full bg-slate-50 py-2.5"
                    aria-label="Chọn đơn vị tiền tệ chính"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email hỗ trợ khách hàng
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hotline chăm sóc khách hàng
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Múi giờ vận hành hệ thống
                </label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa chỉ trụ sở / Kho chính
                </label>
                <textarea
                  rows={2}
                  value={storeAddress}
                  onChange={(e) => setStoreAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </form>
        )}

        {/* Tab 2: Payment Gateways */}
        {activeTab === "payments" && (
          <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-150">
            {/* VNPAY Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                    VNPAY
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Cổng thanh toán VNPAY</h3>
                    <p className="text-xs text-slate-400">Quét mã VNPAY-QR, Thẻ ATM nội địa & Thẻ quốc tế</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      vnpayActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {vnpayActive ? "Đang bật" : "Tạm tắt"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVnpayActive(!vnpayActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      vnpayActive ? "bg-blue-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        vnpayActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mã định danh Merchant (TMN Code)
                  </label>
                  <input
                    type="text"
                    value={vnpayMerchantId}
                    onChange={(e) => setVnpayMerchantId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 font-mono text-xs font-bold text-blue-600 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Khóa bí mật tạo chuỗi băm (Hash Secret)
                  </label>
                  <input
                    type="password"
                    value={vnpaySecretHash}
                    onChange={(e) => setVnpaySecretHash(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 font-mono text-xs font-bold rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 text-xs">
                <input
                  type="checkbox"
                  id="vnpay-sandbox"
                  checked={vnpaySandbox}
                  onChange={(e) => setVnpaySandbox(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="vnpay-sandbox" className="text-slate-600 font-medium cursor-pointer">
                  Kích hoạt môi trường thử nghiệm Sandbox (Chế độ test không cần đăng ký doanh nghiệp)
                </label>
              </div>
            </div>

            {/* COD Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl">
                  💵
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Thanh toán khi nhận hàng (COD)</h3>
                  <p className="text-xs text-slate-400">Thu tiền mặt trực tiếp khi giao hàng tận nơi</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCodActive(!codActive)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                  codActive ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                    codActive ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Shipping & Carriers */}
        {activeTab === "shipping" && (
          <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Truck className="w-4 h-4 text-blue-600" />
                Quy định phí vận chuyển & Đơn vị giao nhận
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hạn mức miễn phí vận chuyển (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Đơn hàng có giá trị cao hơn mức này sẽ được miễn phí giao hàng</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Phí vận chuyển tiêu chuẩn (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={defaultShippingFee}
                    onChange={(e) => setDefaultShippingFee(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Đối tác vận chuyển đang liên kết
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["GHTK", "GHN", "Viettel Post", "SportX Express"].map((carrier) => {
                    const isSelected = activeCarriers.includes(carrier);
                    return (
                      <button
                        type="button"
                        key={carrier}
                        onClick={() => toggleCarrier(carrier)}
                        className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                          isSelected
                            ? "bg-blue-50 border-blue-400 text-blue-900 shadow-xs"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                        }`}
                      >
                        <span>{carrier}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Tab 4: Security & Alerts */}
        {activeTab === "security" && (
          <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Bảo mật tài khoản quản trị & Cảnh báo tồn kho tự động
              </h3>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">Xác thực hai yếu tố (2FA)</div>
                  <div className="text-[11px] text-slate-500">Yêu cầu mã xác thực OTP khi quản trị viên đăng nhập</div>
                </div>
                <button
                  type="button"
                  onClick={() => setTwoFactorAuth(!twoFactorAuth)}
                  className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                    twoFactorAuth ? "bg-blue-600" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                      twoFactorAuth ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email nhận thông báo hàng sắp hết
                  </label>
                  <input
                    type="email"
                    value={lowStockAlertEmail}
                    onChange={(e) => setLowStockAlertEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-medium rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngưỡng tồn kho tối thiểu cảnh báo
                  </label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
