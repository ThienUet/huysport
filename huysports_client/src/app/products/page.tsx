"use client";

import React, { useState, useEffect, useMemo, Suspense, memo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Input,
  Button,
  Slider,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
} from "@heroui/react";
import {
  FaMagnifyingGlass,
  FaSliders,
  FaRotateLeft,
  FaRulerCombined,
  FaCheck,
} from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import ProductCard from "@/components/products/ProductCard";
import AISizeAdvisorModal from "@/components/products/AISizeAdvisorModal";
import { Product } from "@/types";
import { useFilterStore } from "@/stores/useFilterStore";

const sportsList = ["all", "Bóng đá", "Chạy bộ", "Gym / Fitness", "Cầu lông"];
const gendersList = ["all", "Nam", "Nữ", "Unisex"];
const sizesList = ["all", "S", "M", "L", "XL", "2XL"];
const brandsList = ["all", "Nike", "Adidas", "Puma", "SportX Pro"];

interface FilterSidebarProps {
  sport: string;
  setSport: (s: string) => void;
  gender: string;
  setGender: (g: string) => void;
  size: string;
  setSize: (sz: string) => void;
  brand: string;
  setBrand: (b: string) => void;
  minPrice: number;
  maxPrice: number;
  setPriceRange: (min: number, max: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  resetFilters: () => void;
  onOpenSizeAdvisor: () => void;
  onCloseMobileDrawer?: () => void;
}

// Standalone memoized sidebar so dragging slider NEVER causes component recreation
const FilterSidebar = memo(function FilterSidebar({
  sport,
  setSport,
  gender,
  setGender,
  size,
  setSize,
  brand,
  setBrand,
  minPrice,
  maxPrice,
  setPriceRange,
  inStockOnly,
  setInStockOnly,
  resetFilters,
  onOpenSizeAdvisor,
  onCloseMobileDrawer,
}: FilterSidebarProps) {
  // Local state for smooth, instant slider feedback without lagging parent
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);

  useEffect(() => {
    setLocalMaxPrice(maxPrice);
  }, [maxPrice]);

  const pricePresets = [
    { label: "Tất cả", value: 3000000 },
    { label: "< 500K", value: 500000 },
    { label: "< 1 Triệu", value: 1000000 },
    { label: "< 2 Triệu", value: 2000000 },
  ];

  return (
    <div className="space-y-6 text-xs text-gray-800">
      <div className="flex items-center justify-between pb-3 border-b border-gray-100">
        <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
          <FaSliders className="w-4 h-4 text-gray-600" /> Bộ Lọc
        </h3>
        <button
          onClick={resetFilters}
          className="text-[11px] text-gray-400 hover:text-gray-900 font-semibold flex items-center gap-1 cursor-pointer"
        >
          <FaRotateLeft className="w-3 h-3" /> Đặt lại
        </button>
      </div>

      {/* Sport */}
      <div className="space-y-2">
        <label className="font-bold text-gray-900 block text-xs">Môn Thể Thao:</label>
        <div className="flex flex-col gap-1">
          {sportsList.map((s) => (
            <button
              key={s}
              onClick={() => {
                setSport(s);
                onCloseMobileDrawer?.();
              }}
              className={`px-3 py-2 rounded-lg text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                sport === s
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <span>{s === "all" ? "Tất cả môn thể thao" : s}</span>
              {sport === s && <FaCheck className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="font-bold text-gray-900 block text-xs">Đối Tượng:</label>
        <div className="grid grid-cols-2 gap-1.5">
          {gendersList.map((g) => (
            <button
              key={g}
              onClick={() => setGender(g)}
              className={`py-2 text-center rounded-lg font-semibold border transition-colors cursor-pointer ${
                gender === g
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {g === "all" ? "Tất cả" : g}
            </button>
          ))}
        </div>
      </div>

      {/* Size */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center">
          <label className="font-bold text-gray-900 text-xs">Kích Cỡ (Size):</label>
          <button
            onClick={onOpenSizeAdvisor}
            className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <FaRulerCombined className="w-3 h-3" /> Hướng dẫn size
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {sizesList.map((sz) => (
            <button
              key={sz}
              onClick={() => setSize(sz)}
              className={`py-2 text-center rounded-lg font-bold border transition-colors cursor-pointer ${
                size === sz
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {sz === "all" ? "Tất cả" : sz}
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="font-bold text-gray-900 block text-xs">Thương Hiệu:</label>
        <div className="flex flex-col gap-1">
          {brandsList.map((b) => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`px-3 py-1.5 rounded-lg text-left font-medium transition-colors flex items-center justify-between cursor-pointer ${
                brand === b
                  ? "bg-emerald-50 text-emerald-700 font-bold"
                  : "hover:bg-gray-50 text-gray-600"
              }`}
            >
              <span>{b === "all" ? "Tất cả thương hiệu" : b}</span>
              {brand === b && <FaCheck className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex justify-between items-center text-xs">
          <label className="font-bold text-gray-900">Mức Giá Tối Đa:</label>
          <span className="font-extrabold text-sm text-emerald-600">
            {localMaxPrice.toLocaleString("vi-VN")}đ
          </span>
        </div>

        {/* Smooth Slider */}
        <div className="px-1 py-1">
          <Slider
            size="sm"
            step={25000}
            minValue={100000}
            maxValue={3000000}
            value={localMaxPrice}
            onChange={(val) => {
              const num = Array.isArray(val) ? val[0] : (val as number);
              setLocalMaxPrice(num);
            }}
            onChangeEnd={(val) => {
              const num = Array.isArray(val) ? val[0] : (val as number);
              setLocalMaxPrice(num);
              setPriceRange(minPrice, num);
            }}
            className="max-w-md touch-none"
            classNames={{
              filler: "bg-emerald-600",
              thumb: "bg-emerald-600 border-2 border-white shadow-md cursor-grab active:cursor-grabbing",
              track: "bg-gray-200",
            }}
          />
        </div>

        <div className="flex justify-between text-[10px] text-gray-400 font-medium">
          <span>100.000đ</span>
          <span>3.000.000đ</span>
        </div>

        {/* Quick Price Preset Chips */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {pricePresets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => {
                setLocalMaxPrice(preset.value);
                setPriceRange(minPrice, preset.value);
              }}
              className={`py-1.5 px-2 text-[11px] rounded-md font-semibold border transition-colors cursor-pointer ${
                maxPrice === preset.value
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300 font-bold"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Status Filter */}
      <div className="space-y-2 pt-2 border-t border-gray-100">
        <label className="font-bold text-gray-900 block text-xs">Tình Trạng Kho Hàng:</label>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => setInStockOnly(false)}
            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
              !inStockOnly
                ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>Tất cả sản phẩm</span>
            {!inStockOnly && <FaCheck className="w-3 h-3 text-emerald-600" />}
          </button>
          <button
            onClick={() => setInStockOnly(true)}
            className={`text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
              inStockOnly
                ? "bg-emerald-50 text-emerald-700 font-bold border border-emerald-200"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>Chỉ xem còn hàng</span>
            {inStockOnly && <FaCheck className="w-3 h-3 text-emerald-600" />}
          </button>
        </div>
      </div>
    </div>
  );
});

function ProductsContent() {
  const searchParams = useSearchParams();
  const {
    category,
    sport,
    gender,
    brand,
    size,
    minPrice,
    maxPrice,
    search,
    sort,
    inStockOnly,
    setCategory,
    setSport,
    setGender,
    setBrand,
    setSize,
    setPriceRange,
    setSearch,
    setSort,
    setInStockOnly,
    resetFilters,
  } = useFilterStore();

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);

  // Sync URL search params on mount
  useEffect(() => {
    const sportParam = searchParams.get("sport");
    const categoryParam = searchParams.get("category");
    const searchParam = searchParams.get("search");

    if (sportParam) setSport(sportParam);
    if (categoryParam) setCategory(categoryParam);
    if (searchParam) setSearch(searchParam);
  }, [searchParams, setSport, setCategory, setSearch]);

  // Fetch all products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ["products", "catalog"],
    queryFn: () => productService.getProducts(),
  });

  const products: Product[] = productsData?.data || [];

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (sport !== "all" && p.sport !== sport && p.category !== sport) return false;
        if (gender !== "all" && p.gender !== gender && p.gender !== "Unisex") return false;
        if (brand !== "all" && p.brand !== brand) return false;
        if (size !== "all") {
          const hasSize = p.variants?.some((v) => v.size.toUpperCase() === size.toUpperCase() && v.stock > 0);
          if (!hasSize) return false;
        }
        if (inStockOnly) {
          const isOutOfStock =
            (p.stock ?? 0) <= 0 ||
            (Boolean(p.variants && p.variants.length > 0 && p.variants.every((v) => (v.stock ?? 0) <= 0)));
          if (isOutOfStock) return false;
        }
        if (p.price < minPrice || p.price > maxPrice) return false;
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchName = p.name.toLowerCase().includes(q);
          const matchSku = p.sku.toLowerCase().includes(q);
          const matchDesc = p.description?.toLowerCase().includes(q);
          if (!matchName && !matchSku && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        if (sort === "discount") return (b.discountPercent || 0) - (a.discountPercent || 0);
        return 0;
      });
  }, [products, sport, gender, brand, size, minPrice, maxPrice, search, sort, inStockOnly]);

  const handleOpenSizeAdvisor = () => {
    setSelectedProductForSize(products[0] || null);
    setIsSizeModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            {sport === "all" ? "Tất Cả Sản Phẩm" : sport}
          </h1>
          <span className="text-xs font-medium text-gray-500">
            Tìm thấy <strong className="text-gray-900">{filteredProducts.length}</strong> sản phẩm
          </span>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex-1 min-w-[200px] sm:min-w-[240px] max-w-md">
          <Input
            type="text"
            placeholder="Tìm sản phẩm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400" />}
            size="sm"
            radius="lg"
            isClearable
            onClear={() => setSearch("")}
            classNames={{
              inputWrapper: "bg-gray-50 border-none",
            }}
          />
        </div>

        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <Button
            className="lg:hidden font-semibold text-xs rounded-lg flex-1 sm:flex-none"
            variant="flat"
            size="sm"
            startContent={<FaSliders className="w-3.5 h-3.5" />}
            onPress={() => setIsMobileFilterOpen(true)}
          >
            Bộ Lọc
          </Button>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 hidden sm:inline">Sắp xếp:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-medium rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="featured">Nổi bật</option>
              <option value="price-asc">Giá: Thấp - Cao</option>
              <option value="price-desc">Giá: Cao - Thấp</option>
              <option value="rating">Đánh giá cao nhất</option>
              <option value="discount">Khuyến mãi nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block bg-white p-5 rounded-xl border border-gray-200 sticky top-24">
          <FilterSidebar
            sport={sport}
            setSport={setSport}
            gender={gender}
            setGender={setGender}
            size={size}
            setSize={setSize}
            brand={brand}
            setBrand={setBrand}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setPriceRange={setPriceRange}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            resetFilters={resetFilters}
            onOpenSizeAdvisor={handleOpenSizeAdvisor}
          />
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-xl border border-gray-200 p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <FaMagnifyingGlass className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-bold text-gray-800">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm để khám phá thêm sản phẩm.
              </p>
              <Button
                size="sm"
                className="font-semibold text-xs rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-5"
                onPress={resetFilters}
              >
                Xóa Bộ Lọc
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  onOpenSizeAdvisor={(p) => {
                    setSelectedProductForSize(p);
                    setIsSizeModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onOpenChange={setIsMobileFilterOpen}
        placement="left"
        size="sm"
      >
        <DrawerContent className="bg-white p-4">
          {() => (
            <>
              <DrawerHeader className="border-b border-gray-100 pb-3">
                <h3 className="font-bold text-sm text-gray-900">Bộ Lọc Tìm Kiếm</h3>
              </DrawerHeader>
              <DrawerBody className="py-4">
                <FilterSidebar
                  sport={sport}
                  setSport={setSport}
                  gender={gender}
                  setGender={setGender}
                  size={size}
                  setSize={setSize}
                  brand={brand}
                  setBrand={setBrand}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  setPriceRange={setPriceRange}
                  inStockOnly={inStockOnly}
                  setInStockOnly={setInStockOnly}
                  resetFilters={resetFilters}
                  onOpenSizeAdvisor={handleOpenSizeAdvisor}
                  onCloseMobileDrawer={() => setIsMobileFilterOpen(false)}
                />
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* AI Size Advisor Modal */}
      <AISizeAdvisorModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        product={selectedProductForSize}
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto p-8 text-center text-gray-400">Đang tải danh mục sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
