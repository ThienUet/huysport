"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input, Spinner } from "@heroui/react";
import {
  FaMagnifyingGlass,
  FaXmark,
  FaFutbol,
  FaPersonRunning,
  FaDumbbell,
  FaTag,
  FaArrowRight,
  FaFire,
  FaBoxOpen,
} from "react-icons/fa6";
import { GiShuttlecock } from "react-icons/gi";
import { useDebounce, useSearchProducts } from "@/hooks";
import { useFilterStore } from "@/stores/useFilterStore";
import { formatCurrency } from "@/utils/formatUtils";
import { Product } from "@/types";

interface ClientSearchProps {
  isMobile?: boolean;
  onCloseMobileMenu?: () => void;
}

const POPULAR_KEYWORDS = [
  "Giày bóng đá",
  "Áo chạy bộ",
  "Đồ tập gym",
  "Vợt cầu lông",
  "Tất chống trượt",
];

export default function ClientSearch({ isMobile = false, onCloseMobileMenu }: ClientSearchProps) {
  const router = useRouter();
  const { setSearch, setSport } = useFilterStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search by 300ms
  const debouncedSearch = useDebounce(searchTerm.trim(), 300);

  // Custom React Query hook
  const { data: searchResults = [], isLoading, isFetching } = useSearchProducts(debouncedSearch);

  // Handle hotkey Ctrl+K / Cmd+K
  useEffect(() => {
    if (isMobile) return;
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
  }, [isMobile]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (product: Product) => {
    setIsOpen(false);
    onCloseMobileMenu?.();
    router.push(`/products/${product.id}`);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchTerm.trim()) {
      setSearch(searchTerm.trim());
      setIsOpen(false);
      onCloseMobileMenu?.();
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSelectKeyword = (keyword: string) => {
    setSearchTerm(keyword);
    setSearch(keyword);
    setIsOpen(false);
    onCloseMobileMenu?.();
    router.push(`/products?search=${encodeURIComponent(keyword)}`);
  };

  const handleSelectSport = (sportName: string) => {
    setSport(sportName);
    setIsOpen(false);
    onCloseMobileMenu?.();
    router.push(`/products?sport=${encodeURIComponent(sportName)}`);
  };

  const handleClear = () => {
    setSearchTerm("");
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? "w-full" : "w-full min-w-[200px]"}`}>
      {/* Search Input Form */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Input
          ref={inputRef}
          aria-label="Tìm kiếm sản phẩm thể thao"
          title="Tìm kiếm sản phẩm (Ctrl + K)"
          type="text"
          placeholder={isMobile ? "Tìm kiếm sản phẩm..." : "Tìm kiếm sản phẩm..."}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
          endContent={
            (isLoading && debouncedSearch) || searchTerm ? (
              <div className="flex items-center gap-1.5 shrink-0">
                {isLoading && debouncedSearch && (
                  <Spinner size="sm" color="success" className="scale-75" />
                )}
                {searchTerm && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer transition rounded-full hover:bg-gray-200"
                    title="Xóa tìm kiếm"
                    aria-label="Xóa nội dung tìm kiếm"
                  >
                    <FaXmark className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : null
          }
          size="sm"
          radius={isMobile ? "lg" : "full"}
          classNames={{
            inputWrapper:
              "bg-gray-100 hover:bg-gray-100/90 focus-within:!bg-white focus-within:ring-2 focus-within:ring-emerald-500 border border-transparent focus-within:border-emerald-500 shadow-none transition-all h-9.5",
            input: "text-xs",
          }}
        />
      </form>

      {/* Floating Instant Search Dropdown (Like Admin GlobalSearch) */}
      {isOpen && (
        <div
          className={`absolute ${
            isMobile
              ? "left-0 right-0 max-h-[360px]"
              : "right-0 lg:left-0 lg:right-auto w-[340px] lg:w-[400px] max-w-[calc(100vw-2rem)] max-h-[460px]"
          } top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200/90 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col`}
        >
          {/* State 1: Input empty - Quick Suggestions & Trending Categories */}
          {!debouncedSearch && (
            <div className="p-3.5 space-y-3">
              {/* Popular Keywords */}
              <div>
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FaFire className="w-3 h-3 text-rose-500" />
                  <span>Tìm kiếm phổ biến</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_KEYWORDS.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => handleSelectKeyword(kw)}
                      className="px-2.5 py-1 text-xs rounded-full bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 text-gray-700 font-medium transition cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Sport Categories */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Khám phá theo môn
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectSport("Bóng đá")}
                    className="p-2 rounded-xl border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50/50 text-left transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <FaFutbol className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-emerald-700">Bóng Đá</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSport("Chạy bộ")}
                    className="p-2 rounded-xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50/50 text-left transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FaPersonRunning className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-blue-700">Chạy Bộ</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSport("Gym / Fitness")}
                    className="p-2 rounded-xl border border-gray-100 hover:border-amber-300 hover:bg-amber-50/50 text-left transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                      <FaDumbbell className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-amber-700">Gym & Fitness</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectSport("Cầu lông")}
                    className="p-2 rounded-xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 text-left transition flex items-center gap-2 group cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                      <GiShuttlecock className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-gray-700 group-hover:text-purple-700">Cầu Lông</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* State 2: When user is typing - Results Area */}
          {debouncedSearch && (
            <>
              {/* Header result bar */}
              <div className="px-3.5 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between text-xs text-gray-500 font-medium shrink-0">
                <span>
                  Kết quả cho <strong className="text-gray-900">&ldquo;{debouncedSearch}&rdquo;</strong>
                </span>
                {isFetching ? (
                  <span className="text-emerald-600 font-bold flex items-center gap-1 text-[11px]">
                    <Spinner size="sm" color="success" className="scale-60" /> Đang tìm...
                  </span>
                ) : (
                  <span className="text-gray-400 text-[11px] font-bold">
                    {searchResults.length} sản phẩm
                  </span>
                )}
              </div>

              {/* Scrollable list */}
              <div className="overflow-y-auto flex-1 p-1.5 divide-y divide-gray-50">
                {/* Products List */}
                {searchResults.length > 0 ? (
                  searchResults.slice(0, 6).map((product) => {
                    const hasValidImage =
                      product.images?.[0] &&
                      (product.images[0].startsWith("http") || product.images[0].startsWith("/"));
                    const imageUrl = hasValidImage
                      ? product.images[0]
                      : "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500";

                    return (
                      <div
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="p-2 rounded-xl hover:bg-emerald-50/60 cursor-pointer transition flex items-center justify-between gap-3 group"
                      >
                        {/* Thumbnail & Title */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-11 h-11 rounded-lg object-cover bg-gray-100 border border-gray-200 shrink-0 group-hover:scale-105 transition-transform"
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs text-gray-900 truncate group-hover:text-emerald-700 transition">
                              {product.name}
                            </h5>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-gray-500">
                              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-medium text-[10px]">
                                {product.brand || "SportX"}
                              </span>
                              <span>•</span>
                              <span>{product.sport || product.category}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Stock status */}
                        <div className="text-right shrink-0">
                          <div className="text-xs font-black text-emerald-600">
                            {formatCurrency(product.price)}
                          </div>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <div className="text-[10px] text-gray-400 line-through">
                              {formatCurrency(product.originalPrice)}
                            </div>
                          )}
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full inline-block mt-0.5 ${
                              product.stock > 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : !isLoading ? (
                  /* Empty state */
                  <div className="py-8 px-4 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
                      <FaBoxOpen className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-gray-800">
                      Không tìm thấy sản phẩm nào
                    </div>
                    <p className="text-[11px] text-gray-500 max-w-[240px] mx-auto leading-relaxed">
                      Thử tìm kiếm với từ khóa phổ biến như &ldquo;giày bóng đá&rdquo;, &ldquo;áo chạy bộ&rdquo;, &ldquo;đồ gym&rdquo;...
                    </p>
                  </div>
                ) : null}
              </div>

              {/* Footer View All button */}
              {searchResults.length > 0 && (
                <div className="p-2 border-t border-gray-100 bg-gray-50/70 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="w-full py-2 px-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-gray-200/80 hover:border-emerald-300 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Xem tất cả kết quả cho &ldquo;{debouncedSearch}&rdquo;</span>
                    <FaArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
