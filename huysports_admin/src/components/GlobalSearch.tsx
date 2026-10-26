import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDebounce, useGlobalSearch } from "@/hooks";
import {
  Search,
  X,
  Loader2,
  Package,
  ShoppingBag,
  Users,
  Sparkles,
  Command,
} from "lucide-react";

const formatCurrency = (val: number | string) => {
  const num = typeof val === "string" ? parseFloat(val.replace(/[^0-9.-]+/g, "")) : val;
  if (!isNaN(num) && num >= 1000) {
    return `${Math.round(num).toLocaleString("vi-VN")}đ`;
  }
  if (!isNaN(num)) return `$${num.toFixed(2)}`;
  return String(val);
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"all" | "products" | "orders" | "customers">("all");

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce the search term by 300ms
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  // Query search endpoint via React Query hook
  const { data: searchResults, isFetching } = useGlobalSearch(debouncedSearch);

  // Handle hotkey Ctrl+K / Cmd+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const handleSelectProduct = (product: any) => {
    setIsOpen(false);
    navigate(`/products?search=${encodeURIComponent(product.title || product.sku)}`);
  };

  const handleSelectOrder = (order: any) => {
    setIsOpen(false);
    navigate(`/orders?search=${encodeURIComponent(order.orderNumber)}`);
  };

  const handleSelectCustomer = (customer: any) => {
    setIsOpen(false);
    navigate(`/customers?search=${encodeURIComponent(customer.fullName || customer.phone)}`);
  };

  const counts = searchResults?.counts || { products: 0, orders: 0, customers: 0, total: 0 };
  const products = searchResults?.products || [];
  const orders = searchResults?.orders || [];
  const customers = searchResults?.customers || [];

  const hasResults = counts.total > 0;
  const showEmptyState = debouncedSearch.length > 0 && !isFetching && !hasResults;
  const isMac = typeof navigator !== "undefined" && /(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent);

  return (
    <div className="relative w-full max-w-lg">
      {/* Search Input Box */}
      <div className="relative flex items-center group">
        <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Tìm sản phẩm, đơn hàng, khách hàng..."
          className="w-full h-10 pl-10 pr-16 bg-slate-100/70 hover:bg-slate-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-normal focus:shadow-xs outline-none"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isFetching ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200/90 px-1.5 py-0.5 rounded-md shadow-2xs select-none pointer-events-none">
              {isMac ? (
                <>
                  <Command className="w-2.5 h-2.5" />
                  <span>K</span>
                </>
              ) : (
                <>
                  <span>Ctrl</span>
                  <span>K</span>
                </>
              )}
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 max-h-[540px] flex flex-col"
        >
          {/* Quick suggestions when query is empty */}
          {!debouncedSearch && (
            <div className="p-4 space-y-4">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Gợi ý tìm kiếm phổ biến
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Nike Mercurial",
                    "Adidas Ultraboost",
                    "SPX-9821",
                    "Jane Cooper",
                    "Vợt Yonex",
                    "Bóng đá",
                  ].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchTerm(tag)}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Lối tắt điều hướng nhanh
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/products");
                    }}
                    className="p-2.5 rounded-xl border border-slate-200/70 hover:border-blue-400 hover:bg-blue-50/50 text-left transition group"
                  >
                    <Package className="w-4 h-4 text-blue-600 mb-1" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700">
                      Kho sản phẩm
                    </div>
                    <div className="text-[10px] text-slate-400">Xem danh mục</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/orders");
                    }}
                    className="p-2.5 rounded-xl border border-slate-200/70 hover:border-emerald-400 hover:bg-emerald-50/50 text-left transition group"
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-600 mb-1" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      Đơn hàng
                    </div>
                    <div className="text-[10px] text-slate-400">Xử lý giao dịch</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      navigate("/customers");
                    }}
                    className="p-2.5 rounded-xl border border-slate-200/70 hover:border-indigo-400 hover:bg-indigo-50/50 text-left transition group"
                  >
                    <Users className="w-4 h-4 text-indigo-600 mb-1" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                      Khách hàng
                    </div>
                    <div className="text-[10px] text-slate-400">Hồ sơ người mua</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Header with Category Tabs */}
          {debouncedSearch && (
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1 overflow-x-auto text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeCategory === "all"
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  Tất cả ({counts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("products")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeCategory === "products"
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  Sản phẩm ({counts.products})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("orders")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeCategory === "orders"
                      ? "bg-emerald-600 text-white"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  Đơn hàng ({counts.orders})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("customers")}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    activeCategory === "customers"
                      ? "bg-indigo-600 text-white"
                      : "text-slate-600 hover:bg-slate-200/70"
                  }`}
                >
                  Khách hàng ({counts.customers})
                </button>
              </div>

              {isFetching && (
                <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-1 shrink-0">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Đang tìm...
                </span>
              )}
            </div>
          )}

          {/* Results Scroll Area */}
          {debouncedSearch && (
            <div className="overflow-y-auto flex-1 divide-y divide-slate-100 p-2">
              {/* 1. Products Section */}
              {(activeCategory === "all" || activeCategory === "products") && products.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-blue-600">
                      <Package className="w-3.5 h-3.5" />
                      Sản phẩm ({products.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/products?search=${encodeURIComponent(debouncedSearch)}`);
                      }}
                      className="text-[10px] text-blue-600 hover:underline normal-case font-bold"
                    >
                      Xem trang quản lý &rarr;
                    </button>
                  </div>

                  <div className="space-y-1">
                    {products.map((p) => {
                      const isImage =
                        p.thumbnail &&
                        (p.thumbnail.startsWith("http") || p.thumbnail.startsWith("/"));
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleSelectProduct(p)}
                          className="p-2 rounded-xl hover:bg-blue-50/60 cursor-pointer transition flex items-center justify-between gap-3 group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/60">
                              {isImage ? (
                                <img
                                  src={p.thumbnail}
                                  alt={p.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-base">{p.thumbnail || "👟"}</span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                                {p.title}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span className="font-mono font-semibold bg-slate-100 px-1 rounded">
                                  {p.sku}
                                </span>
                                <span>{p.category}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-extrabold text-blue-600">
                              {formatCurrency(p.discountPrice || p.basePrice)}
                            </div>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                p.totalStock > 20
                                  ? "bg-emerald-50 text-emerald-700"
                                  : p.totalStock > 0
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {p.totalStock > 0 ? `Còn ${p.totalStock} sp` : "Hết hàng"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Orders Section */}
              {(activeCategory === "all" || activeCategory === "orders") && orders.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-emerald-600">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Đơn hàng ({orders.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/orders?search=${encodeURIComponent(debouncedSearch)}`);
                      }}
                      className="text-[10px] text-emerald-600 hover:underline normal-case font-bold"
                    >
                      Xem trang đơn hàng &rarr;
                    </button>
                  </div>

                  <div className="space-y-1">
                    {orders.map((o) => (
                      <div
                        key={o.id}
                        onClick={() => handleSelectOrder(o)}
                        className="p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                            📦
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="text-blue-600 group-hover:underline">
                                #{o.orderNumber}
                              </span>
                              <span className="text-slate-400 font-normal">•</span>
                              <span className="truncate">{o.customer?.name}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {o.customer?.phone}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="text-xs font-extrabold text-slate-900">
                            {formatCurrency(o.totalAmount)}
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              o.fulfillmentStatus === "Completed"
                                ? "bg-emerald-50 text-emerald-700"
                                : o.fulfillmentStatus === "Shipping"
                                ? "bg-blue-50 text-blue-700"
                                : o.fulfillmentStatus === "Processing"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {o.fulfillmentStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Customers Section */}
              {(activeCategory === "all" || activeCategory === "customers") && customers.length > 0 && (
                <div className="py-2">
                  <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2.5 mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-indigo-600">
                      <Users className="w-3.5 h-3.5" />
                      Khách hàng ({customers.length})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        navigate(`/customers?search=${encodeURIComponent(debouncedSearch)}`);
                      }}
                      className="text-[10px] text-indigo-600 hover:underline normal-case font-bold"
                    >
                      Xem trang khách hàng &rarr;
                    </button>
                  </div>

                  <div className="space-y-1">
                    {customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="p-2 rounded-xl hover:bg-indigo-50/60 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              c.avatarBg || "bg-indigo-100 text-indigo-700"
                            }`}
                          >
                            {c.avatar || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-slate-900 truncate group-hover:text-indigo-600 transition">
                              {c.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              {c.email} • {c.phone}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                              c.tier === "VIP"
                                ? "bg-amber-100 text-amber-800"
                                : c.tier === "Loyal"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {c.tier || "Mới"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {showEmptyState && (
                <div className="py-8 px-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Search className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-800">
                    Không tìm thấy kết quả nào khớp với "{debouncedSearch}"
                  </div>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    Vui lòng kiểm tra lại chính tả hoặc thử tìm kiếm theo mã đơn, mã SKU, số điện thoại hoặc tên ngắn hơn.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Footer Information */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 font-medium flex items-center justify-between shrink-0">
            <span>
              Nhấn <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-bold">Esc</kbd> để đóng
            </span>
            <span className="text-blue-600 font-bold">SportX Instant Search v2.0</span>
          </div>
        </div>
      )}
    </div>
  );
}
