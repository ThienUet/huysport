import { useState, useEffect } from "react";
import AdminLayout from "@/layouts/admin-layout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/api";
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
  const queryClient = useQueryClient();
  const toast = useToastStore();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [isSaved, setIsSaved] = useState(false);

  // Fetch settings from Backend
  const { data: serverSettings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: settingsService.get,
  });

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

  const [momoActive, setMomoActive] = useState(true);
  const [momoPartnerCode, setMomoPartnerCode] = useState("MOMOSPORTX");
  const [momoApiKey, setMomoApiKey] = useState("sec_momo_894102938472910");

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
      if (serverSettings.momoEnabled !== undefined) setMomoActive(serverSettings.momoEnabled);
      if (serverSettings.codEnabled !== undefined) setCodActive(serverSettings.codEnabled);
      if (serverSettings.shippingFeeDefault) setDefaultShippingFee(serverSettings.shippingFeeDefault);
      if (serverSettings.freeShippingThreshold) setFreeShippingThreshold(serverSettings.freeShippingThreshold);
    }
  }, [serverSettings]);

  // Update Settings Mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["system-settings"] });
      setIsSaved(true);
      toast.success("Thành công", "Đã lưu cài đặt hệ thống SportX");
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: (err: any) => toast.error("Lỗi", err.message),
  });

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
      momoEnabled: momoActive,
      momoPartnerCode,
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
                Settings & Configurations
              </h1>
              <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                System v2.4
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Manage store profile, payment gateway credentials, shipping logistics, and security policies.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 animate-in fade-in">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                Settings Saved Successfully!
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              Save Changes
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
            General Store Information
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
            Payment Gateways (VNPAY / MoMo / COD)
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
            Shipping & Carriers
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
            Security & Alerts
          </button>
        </div>

        {/* Tab 1: General Store Information */}
        {activeTab === "general" && (
          <form onSubmit={handleSave} className="space-y-5 animate-in fade-in duration-150">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Store Profile Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Store Legal Name *
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
                    Primary Store Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold text-slate-800 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                  >
                    <option value="USD">USD ($) - United States Dollar</option>
                    <option value="VND">VND (₫) - Vietnamese Dong</option>
                    <option value="EUR">EUR (€) - Euro</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official Support Email
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
                    Customer Hotline Phone
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
                  Store Operating Timezone
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
                  Headquarter Physical Address
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
                    <h3 className="font-bold text-sm text-slate-900">VNPAY Payment Gateway</h3>
                    <p className="text-xs text-slate-400">QR Code, Domestic ATM & Visa/Mastercard</p>
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
                    {vnpayActive ? "Active" : "Disabled"}
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
                    Merchant ID (TMN Code)
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
                    Hash Secret Key
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
                  Enable Test Sandbox Environment (Testing Mode)
                </label>
              </div>
            </div>

            {/* MoMo Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 flex items-center justify-center font-bold text-xs">
                    MoMo
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">MoMo E-Wallet</h3>
                    <p className="text-xs text-slate-400">Direct wallet auto-debit & QR scan</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      momoActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {momoActive ? "Active" : "Disabled"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setMomoActive(!momoActive)}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      momoActive ? "bg-pink-600" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                        momoActive ? "left-6" : "left-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Partner Code</label>
                  <input
                    type="text"
                    value={momoPartnerCode}
                    onChange={(e) => setMomoPartnerCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 font-mono text-xs font-bold text-pink-600 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">API Access Key</label>
                  <input
                    type="password"
                    value={momoApiKey}
                    onChange={(e) => setMomoApiKey(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 font-mono text-xs font-bold rounded-xl border border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* COD Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xl">
                  💵
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Cash on Delivery (COD)</h3>
                  <p className="text-xs text-slate-400">Collect payment upon door delivery</p>
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
                Shipping Rules & Thresholds
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Free Shipping Threshold ($)
                  </label>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-xs font-bold rounded-xl border border-slate-200"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Orders above this qualify for free freight</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Standard Flat Rate Shipping Fee ($)
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
                  Active Courier Partners
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
                Admin Security & Automated Inventory Alerts
              </h3>

              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="font-bold text-xs text-slate-900">Two-Factor Authentication (2FA)</div>
                  <div className="text-[11px] text-slate-500">Require authenticator code on admin sign in</div>
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
                    Low Stock Alert Recipient Email
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
                    Critical Stock Threshold Level
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
