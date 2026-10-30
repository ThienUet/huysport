"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Chip,
  Tabs,
  Tab,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "@heroui/react";
import {
  FaStar,
  FaBagShopping,
  FaBolt,
  FaShieldHalved,
  FaTruckFast,
  FaRotateLeft,
  FaCircleCheck,
  FaCircleExclamation,
  FaPlus,
  FaMinus,
  FaChevronRight,
  FaRulerCombined,
  FaBell,
  FaFire,
} from "react-icons/fa6";
import { useProduct, useProducts } from "@/hooks";
import { useCartStore } from "@/stores/useCartStore";
import AISizeAdvisorModal from "@/components/products/AISizeAdvisorModal";
import ProductCard from "@/components/products/ProductCard";
import { Product, ProductVariant } from "@/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;
  const { addItem, setIsCartDrawerOpen, setBuyNowItem } = useCartStore();

  // Fetch product detail and related products via custom hooks
  const { data: productData, isLoading, isError } = useProduct(productId);
  const { data: allProductsData } = useProducts();

  const product: Product | undefined = productData?.data;
  const relatedProducts: Product[] = (allProductsData?.data || []).filter((p) => p.id !== productId).slice(0, 4);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  React.useEffect(() => {
    setSelectedImageIndex(0);
  }, [productId]);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState(false);

  // Out of stock notification modal state
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyContact, setNotifyContact] = useState("");
  const [notifySubmitted, setNotifySubmitted] = useState(false);

  // Entire product out of stock check
  const isEntireProductOutOfStock = useMemo(() => {
    if (!product) return true;
    if (product.variants && product.variants.length > 0) {
      return product.variants.every((v) => (v.stock ?? 0) <= 0);
    }
    return (product.stock ?? 0) <= 0;
  }, [product]);

  // Available unique sizes and colors
  const availableSizes = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return ["S", "M", "L", "XL", "2XL"];
    const sizes = Array.from(new Set(product.variants.map((v) => v.size)));
    return sizes.length > 0 ? sizes : ["S", "M", "L", "XL", "2XL"];
  }, [product]);

  const availableColors = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return ["Mặc định"];
    const colors = Array.from(new Set(product.variants.map((v) => v.color)));
    return colors.length > 0 ? colors : ["Mặc định"];
  }, [product]);

  // Check if a specific color has 0 total stock across all its sizes
  const isColorOutOfStock = useMemo(() => {
    return (col: string) => {
      if (!product?.variants || product.variants.length === 0) return (product?.stock ?? 0) <= 0;
      const variantsForColor = product.variants.filter((v) => v.color === col || (!v.color && col === "Mặc định"));
      return variantsForColor.length > 0 && variantsForColor.every((v) => (v.stock ?? 0) <= 0);
    };
  }, [product]);

  // Set default size & color on load - prioritize IN-STOCK variant!
  React.useEffect(() => {
    if (!product) return;

    if (product.variants && product.variants.length > 0) {
      if (!selectedSize && !selectedColor) {
        const inStockVar = product.variants.find((v) => (v.stock ?? 0) > 0);
        if (inStockVar) {
          setSelectedSize(inStockVar.size);
          setSelectedColor(inStockVar.color || "Mặc định");
          return;
        }
      }
    }

    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [product, availableSizes, availableColors, selectedSize, selectedColor]);

  // Handle color change with smart size auto-switch if currently selected size is out of stock in new color
  const handleSelectColor = (newColor: string) => {
    setSelectedColor(newColor);
    if (product?.variants) {
      const stockInCurrentSize = product.variants.find(
        (v) => v.size === selectedSize && (v.color === newColor || (!v.color && newColor === "Mặc định"))
      )?.stock ?? 0;

      if (stockInCurrentSize <= 0) {
        const firstAvailableInNewColor = product.variants.find(
          (v) => (v.color === newColor || (!v.color && newColor === "Mặc định")) && (v.stock ?? 0) > 0
        );
        if (firstAvailableInNewColor) {
          setSelectedSize(firstAvailableInNewColor.size);
        }
      }
    }
  };

  // Current matched variant
  const currentVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    // 1. Exact match on both size AND color
    const exact = product.variants.find(
      (v) =>
        v.size === selectedSize &&
        (!selectedColor || selectedColor === "Mặc định" || v.color === selectedColor)
    );
    if (exact) return exact;

    // 2. If color is default, match by size
    if (!selectedColor || selectedColor === "Mặc định") {
      const sizeMatch = product.variants.find((v) => v.size === selectedSize);
      if (sizeMatch) return sizeMatch;
    }

    return undefined;
  }, [product, selectedSize, selectedColor]);

  // Current stock strictly evaluated: 0 if no variant or variant out of stock
  const currentStock = useMemo(() => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      return currentVariant ? (currentVariant.stock ?? 0) : 0;
    }
    return product.stock ?? 0;
  }, [product, currentVariant]);

  const currentPrice = useMemo(() => {
    if (!product) return 250000;
    if (
      currentVariant?.price &&
      currentVariant.price !== 250000 &&
      currentVariant.price !== product.originalPrice &&
      currentVariant.price !== product.basePrice
    ) {
      return currentVariant.price;
    }
    return product.price ?? 250000;
  }, [product, currentVariant]);

  // Auto-adjust quantity when currentStock changes
  React.useEffect(() => {
    if (currentStock <= 0) {
      setQuantity(0);
    } else if (quantity === 0 || quantity > currentStock) {
      setQuantity(1);
    }
  }, [currentStock]);

  // Helper to check stock of a size under currently selected color
  const getStockForSize = (sz: string) => {
    if (!product?.variants || product.variants.length === 0) return product?.stock ?? 0;
    const v = product.variants.find(
      (item) =>
        item.size === sz &&
        (!selectedColor || selectedColor === "Mặc định" || item.color === selectedColor)
    );
    return v ? (v.stock ?? 0) : 0;
  };

  const handleAddToCart = () => {
    if (!product) return;

    addItem(
      {
        productId: product.id,
        productName: product.name,
        productImage: product.images?.[selectedImageIndex] || product.images?.[0] || "",
        sku: currentVariant?.sku || `${product.sku}-${selectedSize}`,
        size: selectedSize || "L",
        color: selectedColor || "Mặc định",
        price: currentPrice,
        maxStock: currentStock,
      },
      quantity
    );

    setAddedSuccessMessage(true);
    setTimeout(() => setAddedSuccessMessage(false), 3000);
  };

  const handleBuyNow = () => {
    if (!product) return;

    // Shopee-style: Create a dedicated 1-item purchase without polluting or clearing the main cart!
    setBuyNowItem({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[selectedImageIndex] || product.images?.[0] || "",
      sku: currentVariant?.sku || `${product.sku}-${selectedSize}`,
      size: selectedSize || "L",
      color: selectedColor || "Mặc định",
      price: currentPrice,
      quantity: quantity,
      maxStock: currentStock,
      selected: true,
    });

    setIsCartDrawerOpen(false);
    router.push("/checkout?mode=buy_now");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-slate-200 rounded" />
          <div className="h-4 w-4 bg-slate-200 rounded" />
          <div className="h-4 w-24 bg-slate-200 rounded" />
          <div className="h-4 w-4 bg-slate-200 rounded" />
          <div className="h-4 w-40 bg-slate-200 rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          <div className="space-y-4">
            <div className="aspect-square w-full rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-200/80" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-xl bg-slate-100 border border-slate-200" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-emerald-100 rounded-md" />
                <div className="h-5 w-28 bg-slate-100 rounded-md" />
              </div>
              <div className="h-8 w-4/5 bg-slate-200 rounded-lg" />
              <div className="h-4 w-36 bg-slate-100 rounded" />
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="h-7 w-36 bg-emerald-200/70 rounded-md" />
              <div className="h-4 w-48 bg-slate-200 rounded" />
            </div>
            <div className="space-y-2.5">
              <div className="h-4 w-28 bg-slate-200 rounded" />
              <div className="flex gap-2">
                {["S", "M", "L", "XL", "2XL"].map((s) => (
                  <div key={s} className="h-10 w-14 rounded-lg bg-slate-100 border border-slate-200" />
                ))}
              </div>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <div className="h-12 flex-1 rounded-full bg-slate-200" />
              <div className="h-12 flex-1 rounded-full bg-emerald-200/70" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Không tìm thấy thông tin sản phẩm!</h2>
        <Button as={Link} href="/products" className="bg-emerald-600 text-white rounded-full font-semibold px-6">
          Quay Lại Cửa Hàng
        </Button>
      </div>
    );
  }

  const images = product.images?.length > 0 ? product.images : ["https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-400">
        <Link href="/" className="hover:text-emerald-600 transition">Trang chủ</Link>
        <FaChevronRight className="w-2.5 h-2.5" />
        <Link href={`/products?sport=${encodeURIComponent(product.sport || product.category)}`} className="hover:text-emerald-600 transition">
          {product.sport || product.category}
        </Link>
        <FaChevronRight className="w-2.5 h-2.5" />
        <span className="font-medium text-gray-700 truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        
        {/* Left: Image Gallery */}
        <div className="lg:col-span-5 space-y-3">
          <div className="aspect-square w-full rounded-xl overflow-hidden bg-gray-50 border border-gray-200 relative">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.name}
              className={`w-full h-full object-cover transition-all ${
                isEntireProductOutOfStock ? "grayscale-[20%]" : ""
              }`}
            />
            {product.discountPercent && product.discountPercent > 0 && !isEntireProductOutOfStock && (
              <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-md z-10">
                -{product.discountPercent}%
              </span>
            )}
            {isEntireProductOutOfStock && (
              <div className="absolute top-3 left-3 z-10">
                <span className="bg-slate-900/90 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 backdrop-blur-xs">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  Tạm hết hàng
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-emerald-600"
                      : "border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details */}
        <div className="lg:col-span-7 space-y-5">
          {/* Entire product out of stock notification */}
          {isEntireProductOutOfStock && (
            <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1 shadow-xs animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <FaCircleExclamation className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Sản phẩm này hiện đang Tạm hết hàng trên toàn hệ thống</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                SportX đang nhập thêm lô hàng mới. Quý khách có thể bấm <strong>"Báo Tôi Khi Có Hàng"</strong> để nhận thông báo ưu tiên ngay khi hàng về kho.
              </p>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.brand || "SportX Pro"} · {product.sport || product.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <FaCircleCheck className="w-3.5 h-3.5" /> Hàng chính hãng 100%
              </span>
              <span className="text-gray-200">|</span>
              <span className="text-gray-500 font-medium flex items-center gap-1">
                <FaTruckFast className="w-3.5 h-3.5 text-blue-500" /> Giao hàng toàn quốc
              </span>
            </div>
          </div>

          {/* Price & Stock Box */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-baseline justify-between sm:justify-start gap-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {currentPrice.toLocaleString("vi-VN")}đ
            </div>
            {product.originalPrice && product.originalPrice > currentPrice && (
              <div className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </div>
            )}
            <Chip
              size="sm"
              color={
                isEntireProductOutOfStock || currentStock <= 0
                  ? "danger"
                  : currentStock <= 5
                  ? "warning"
                  : "success"
              }
              variant="flat"
              className="font-bold text-xs ml-auto"
            >
              {isEntireProductOutOfStock
                ? "Tạm hết hàng"
                : currentStock <= 0
                ? "Size này tạm hết hàng"
                : currentStock <= 5
                ? `Chỉ còn ${currentStock} cái`
                : `Còn hàng (${currentStock})`}
            </Chip>
          </div>

          {/* Color Selector */}
          {availableColors.length > 0 && availableColors[0] !== "Mặc định" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900">
                Màu sắc: <span className="text-emerald-600 font-extrabold">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((col) => {
                  const outOfStockCol = isColorOutOfStock(col);
                  const isSelected = selectedColor === col;
                  return (
                    <button
                      key={col}
                      onClick={() => handleSelectColor(col)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                          : outOfStockCol
                          ? "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300 opacity-60"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <span>{col}</span>
                      {outOfStockCol && !isSelected && (
                        <span className="text-[10px] text-rose-500 font-normal">(Hết)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-gray-900">
                Kích cỡ: <span className="font-extrabold">{selectedSize}</span>
              </label>
              <button
                onClick={() => setIsSizeModalOpen(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                <FaRulerCombined className="w-3 h-3" /> Hướng dẫn chọn size
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {availableSizes.map((sz) => {
                const szStock = getStockForSize(sz);
                const isSelected = selectedSize === sz;
                const isSzOutOfStock = szStock <= 0;
                return (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[58px] py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      isSelected
                        ? isSzOutOfStock
                          ? "bg-rose-50 text-rose-700 border-rose-300 ring-2 ring-rose-400/40 shadow-xs"
                          : "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : isSzOutOfStock
                        ? "bg-gray-50 text-gray-400 border-gray-200 hover:border-gray-300 opacity-60"
                        : "bg-white text-gray-800 border-gray-200 hover:border-emerald-400 hover:text-emerald-700"
                    }`}
                  >
                    <span className={isSzOutOfStock && !isSelected ? "line-through" : ""}>{sz}</span>
                    <span
                      className={`text-[9px] font-medium leading-none ${
                        isSelected
                          ? isSzOutOfStock
                            ? "text-rose-600 font-bold"
                            : "text-emerald-100"
                          : isSzOutOfStock
                          ? "text-rose-500 font-medium"
                          : "text-gray-400"
                      }`}
                    >
                      {isSzOutOfStock ? "Tạm hết" : `Còn ${szStock}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Variant Stock Warning / Alert */}
          {currentStock <= 0 ? (
            <div className="p-3.5 rounded-xl bg-rose-50/90 border border-rose-200 text-rose-900 text-xs font-medium space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-rose-800">
                <FaCircleExclamation className="w-4 h-4 text-rose-600 shrink-0" />
                <span>
                  Phân loại {selectedColor && selectedColor !== "Mặc định" ? `màu ${selectedColor} - ` : ""}size {selectedSize} hiện đang tạm hết hàng
                </span>
              </div>
              <p className="text-[11px] text-rose-700 leading-relaxed">
                Bạn có thể chọn kích cỡ hoặc màu sắc khác còn hàng, hoặc nhấn nút bên dưới để nhận thông báo ưu tiên ngay khi có hàng về lại kho.
              </p>
            </div>
          ) : currentStock <= 5 ? (
            <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs font-semibold flex items-center gap-1.5 animate-pulse">
              <FaFire className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>Chỉ còn duy nhất {currentStock} sản phẩm trong kho! Hãy đặt ngay trước khi hết hàng.</span>
            </div>
          ) : null}

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            {currentStock > 0 ? (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-900">Số lượng:</span>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-gray-100 transition text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    <FaMinus className="w-2.5 h-2.5" />
                  </button>
                  <span className="px-4 text-sm font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-2.5 hover:bg-gray-100 transition text-gray-600 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={quantity >= currentStock}
                  >
                    <FaPlus className="w-2.5 h-2.5" />
                  </button>
                </div>
                {currentStock <= 5 && (
                  <span className="text-xs text-amber-600 font-semibold animate-pulse">
                    Còn {currentStock} cái cuối cùng!
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold bg-rose-50/70 px-3 py-2.5 rounded-xl border border-rose-100">
                <FaCircleExclamation className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                <span>Số lượng đặt mua: Không khả dụng (Phân loại này hiện đang tạm hết hàng)</span>
              </div>
            )}

            {/* Success message */}
            {addedSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-2 font-medium">
                <FaCircleCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Đã thêm {quantity} sản phẩm vào giỏ hàng!
              </div>
            )}

            {/* Action Buttons */}
            {currentStock <= 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="font-bold text-sm h-12 rounded-full bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm cursor-pointer"
                  startContent={<FaBell className="w-4 h-4 text-amber-400" />}
                  onPress={() => setIsNotifyModalOpen(true)}
                >
                  Báo Tôi Khi Có Hàng
                </Button>
                <Button
                  as={Link}
                  href="/products"
                  size="lg"
                  variant="bordered"
                  className="font-bold text-sm h-12 rounded-full border-2 border-gray-300 text-gray-800 hover:bg-gray-50 transition"
                >
                  Xem Mẫu Tương Tự
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="bordered"
                  className="font-bold text-sm h-12 rounded-full border-2 border-gray-300 text-gray-900 hover:bg-gray-50 cursor-pointer transition"
                  startContent={<FaBagShopping className="w-4 h-4" />}
                  onPress={handleAddToCart}
                >
                  Thêm Vào Giỏ
                </Button>
                <Button
                  size="lg"
                  className="font-bold text-sm h-12 rounded-full text-white bg-emerald-600 hover:bg-emerald-700 cursor-pointer transition"
                  startContent={<FaBolt className="w-4 h-4" />}
                  onPress={handleBuyNow}
                >
                  Mua Ngay
                </Button>
              </div>
            )}
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-2 p-3 sm:p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-xs sm:text-[11px] text-gray-600 sm:text-gray-500">
            <div className="flex items-center gap-2 sm:gap-1.5">
              <FaTruckFast className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
              <span>Freeship từ 500K</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-1.5">
              <FaShieldHalved className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
              <span>100% Chính hãng</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-1.5">
              <FaRotateLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
              <span>Đổi size 30 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description & Specs (100% from DB) */}
      <div className="pt-8 border-t border-gray-200">
        <Tabs
          aria-label="Product Information"
          variant="underlined"
          classNames={{
            cursor: "bg-emerald-600",
            tabContent: "group-data-[selected=true]:text-emerald-600",
          }}
        >
          <Tab key="desc" title="Mô Tả Sản Phẩm">
            <div className="py-6 max-w-none text-sm leading-relaxed text-gray-700">
              {product.description ? (
                <div className="whitespace-pre-line leading-relaxed text-gray-700 bg-gray-50/60 p-5 rounded-2xl border border-gray-100">
                  {product.description}
                </div>
              ) : (
                <p className="text-gray-400 italic">Chưa có thông tin mô tả chi tiết cho sản phẩm này.</p>
              )}
            </div>
          </Tab>

          <Tab key="specs" title="Thông Số Chi Tiết">
            <div className="py-6 max-w-xl">
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white text-sm">
                <div className="grid grid-cols-2 p-3.5">
                  <span className="text-gray-500">Mã SKU:</span>
                  <span className="font-mono font-bold text-gray-900">{product.sku}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-gray-50">
                  <span className="text-gray-500">Môn thể thao:</span>
                  <span className="font-semibold text-gray-900">{product.sport || product.category}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="text-gray-500">Thương hiệu:</span>
                  <span className="font-semibold text-gray-900">{product.brand || "SportX Pro"}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-gray-50">
                  <span className="text-gray-500">Kích cỡ sẵn có:</span>
                  <span className="font-semibold text-gray-900">{availableSizes.join(", ")}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="text-gray-500">Màu sắc:</span>
                  <span className="font-semibold text-gray-900">
                    {availableColors.filter((c) => c !== "Mặc định").join(", ") || "Tiêu chuẩn"}
                  </span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-gray-50">
                  <span className="text-gray-500">Tồn kho hệ thống:</span>
                  <span className="font-semibold text-gray-900">
                    {product.stock > 0 ? `${product.stock} sản phẩm` : "Tạm hết hàng"}
                  </span>
                </div>
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-gray-200 space-y-6">
          <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">Sản Phẩm Tương Tự</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onOpenSizeAdvisor={() => {
                  setIsSizeModalOpen(true);
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* AI Size Advisor Modal */}
      <AISizeAdvisorModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        product={product}
        onSelectSize={(size) => setSelectedSize(size)}
      />

      {/* Notify When In Stock Modal */}
      <Modal
        isOpen={isNotifyModalOpen}
        onClose={() => {
          setIsNotifyModalOpen(false);
          setNotifySubmitted(false);
        }}
        size="md"
        placement="center"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FaBell className="w-5 h-5 text-amber-500" />
                  <span className="font-extrabold text-base text-gray-900">
                    Báo tôi khi có hàng
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-normal">
                  {product.name} ({selectedColor !== "Mặc định" ? `màu ${selectedColor}, ` : ""}size {selectedSize})
                </p>
              </ModalHeader>

              <ModalBody className="py-4">
                {notifySubmitted ? (
                  <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium space-y-1 text-center">
                    <div className="flex items-center justify-center gap-1.5 font-bold text-emerald-700 text-sm">
                      <FaCircleCheck className="w-4 h-4 text-emerald-600" />
                      Đăng ký thành công!
                    </div>
                    <p className="text-[11px] text-emerald-600">
                      SportX sẽ thông báo cho bạn ngay khi phân loại này có hàng lại. Cảm ơn bạn đã quan tâm!
                    </p>
                  </div>
                ) : (
                  <form
                    id="notify-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!notifyContact.trim()) return;
                      setNotifySubmitted(true);
                      setTimeout(() => {
                        setIsNotifyModalOpen(false);
                        setNotifySubmitted(false);
                        setNotifyContact("");
                      }, 2500);
                    }}
                    className="space-y-3"
                  >
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Để lại Email hoặc Số điện thoại của bạn, chúng tôi sẽ tự động gửi thông báo ưu tiên ngay khi sản phẩm này được nhập bổ sung kho:
                    </p>
                    <div>
                      <Input
                        type="text"
                        placeholder="Email hoặc Số điện thoại nhận thông báo..."
                        value={notifyContact}
                        onChange={(e) => setNotifyContact(e.target.value)}
                        required
                        size="md"
                        radius="lg"
                        className="text-xs"
                      />
                    </div>
                  </form>
                )}
              </ModalBody>

              <ModalFooter className="border-t border-gray-100 pt-3">
                <Button
                  variant="light"
                  size="sm"
                  onPress={onClose}
                  className="font-medium text-xs text-gray-600"
                >
                  Đóng
                </Button>
                {!notifySubmitted && (
                  <Button
                    type="submit"
                    form="notify-form"
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Xác nhận nhận tin
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
