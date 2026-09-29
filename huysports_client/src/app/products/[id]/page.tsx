"use client";

import React, { useState, use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Button,
  Chip,
  Tabs,
  Tab,
} from "@heroui/react";
import {
  FaStar,
  FaBagShopping,
  FaBolt,
  FaShieldHalved,
  FaTruckFast,
  FaRotateLeft,
  FaCircleCheck,
  FaPlus,
  FaMinus,
  FaChevronRight,
  FaRulerCombined,
} from "react-icons/fa6";
import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { useCartStore } from "@/stores/useCartStore";
import AISizeAdvisorModal from "@/components/products/AISizeAdvisorModal";
import ProductCard from "@/components/products/ProductCard";
import { Product, ProductVariant } from "@/types";

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const productId = resolvedParams.id;
  const { addItem, setIsCartDrawerOpen } = useCartStore();

  // Fetch product detail
  const { data: productData, isLoading, isError } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.getProductById(productId),
  });

  // Fetch related products
  const { data: allProductsData } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => productService.getProducts(),
  });

  const product: Product | undefined = productData?.data;
  const relatedProducts: Product[] = (allProductsData?.data || []).filter((p) => p.id !== productId).slice(0, 4);

  // Gallery state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variant selection state
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [addedSuccessMessage, setAddedSuccessMessage] = useState(false);

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

  // Set default size & color on load
  React.useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0]);
    }
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0]);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor]);

  // Current matched variant
  const currentVariant: ProductVariant | undefined = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;
    return (
      product.variants.find((v) => v.size === selectedSize && v.color === selectedColor) ||
      product.variants.find((v) => v.size === selectedSize) ||
      product.variants[0]
    );
  }, [product, selectedSize, selectedColor]);

  const currentStock = currentVariant?.stock ?? product?.stock ?? 15;
  const currentPrice = currentVariant?.price ?? product?.price ?? 250000;

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
    handleAddToCart();
    setIsCartDrawerOpen(false);
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 rounded-lg w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-100 rounded-lg w-1/3 animate-pulse" />
            <div className="h-24 bg-gray-100 rounded-xl animate-pulse" />
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
              className="w-full h-full object-cover"
            />
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="absolute top-3 left-3 bg-red-500 text-white font-bold text-[11px] px-2.5 py-0.5 rounded-md">
                -{product.discountPercent}%
              </span>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                {product.brand || "SportX Pro"} · {product.gender}
              </span>
              <span className="text-xs text-gray-400 font-mono">SKU: {product.sku}</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <FaStar className="w-3.5 h-3.5" />
                <span>{product.rating || 5.0}</span>
                <span className="text-gray-400 font-normal">({product.reviewCount || 24} đánh giá)</span>
              </div>
              <span className="text-gray-200">|</span>
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <FaCircleCheck className="w-3.5 h-3.5" /> Đã bán {product.reviewCount ? product.reviewCount * 7 : 150}+
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-baseline justify-between sm:justify-start gap-4">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {currentPrice.toLocaleString("vi-VN")}đ
            </div>
            {product.originalPrice && product.originalPrice > currentPrice && (
              <div className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString("vi-VN")}đ
              </div>
            )}
            <Chip size="sm" color="success" variant="flat" className="font-semibold text-xs ml-auto">
              {currentStock > 0 ? `Còn ${currentStock} cái` : "Tạm hết hàng"}
            </Chip>
          </div>

          {/* Color Selector */}
          {availableColors.length > 0 && availableColors[0] !== "Mặc định" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-900">
                Màu sắc: <span className="text-emerald-600">{selectedColor}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((col) => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      selectedColor === col
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {col}
                  </button>
                ))}
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
              {availableSizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[48px] py-2.5 px-3.5 rounded-lg font-bold text-xs border transition-colors cursor-pointer ${
                    selectedSize === sz
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Actions */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-900">Số lượng:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-gray-100 transition text-gray-600 cursor-pointer"
                  disabled={quantity <= 1}
                >
                  <FaMinus className="w-2.5 h-2.5" />
                </button>
                <span className="px-4 text-sm font-bold text-gray-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="p-2.5 hover:bg-gray-100 transition text-gray-600 cursor-pointer"
                  disabled={quantity >= currentStock}
                >
                  <FaPlus className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Success message */}
            {addedSuccessMessage && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs flex items-center gap-2 font-medium">
                <FaCircleCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Đã thêm {quantity} sản phẩm vào giỏ hàng!
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                variant="bordered"
                className="font-bold text-sm h-12 rounded-full border-2 border-gray-300 text-gray-900 hover:bg-gray-50"
                startContent={<FaBagShopping className="w-4 h-4" />}
                onPress={handleAddToCart}
                isDisabled={currentStock === 0}
              >
                Thêm Vào Giỏ
              </Button>
              <Button
                size="lg"
                className="font-bold text-sm h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                startContent={<FaBolt className="w-4 h-4" />}
                onPress={handleBuyNow}
                isDisabled={currentStock === 0}
              >
                Mua Ngay
              </Button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-3 gap-2 p-3.5 rounded-xl bg-gray-50 border border-gray-100 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <FaTruckFast className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Freeship từ 500K</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaShieldHalved className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>100% Chính hãng</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FaRotateLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Đổi size 30 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Specs, Reviews */}
      <div className="pt-8 border-t border-gray-200">
        <Tabs
          aria-label="Product Information"
          variant="underlined"
          classNames={{
            cursor: "bg-emerald-600",
            tabContent: "group-data-[selected=true]:text-emerald-600",
          }}
        >
          <Tab key="desc" title="Mô Tả Chi Tiết">
            <div className="py-6 max-w-none text-sm leading-relaxed text-gray-600 space-y-4">
              <p>{product.description}</p>
              <h4 className="text-sm font-bold text-gray-900 mt-4">Đặc điểm nổi bật:</h4>
              <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-600">
                <li>Chất liệu thể thao cao cấp, co giãn 4 chiều và thoáng khí tối đa.</li>
                <li>Công nghệ dệt kháng khuẩn, khử mùi hôi hiệu quả trong suốt buổi tập.</li>
                <li>Đường may phẳng Flatlock không gây cọ xát hay kích ứng da.</li>
                <li>Kiểu dáng năng động, hiện đại phù hợp cả tập luyện lẫn mặc thường ngày.</li>
              </ul>
            </div>
          </Tab>

          <Tab key="specs" title="Thông Số Kỹ Thuật">
            <div className="py-6 max-w-xl">
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white text-sm">
                <div className="grid grid-cols-2 p-3.5">
                  <span className="text-gray-500">Môn thể thao:</span>
                  <span className="font-semibold text-gray-900">{product.sport || product.category}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-gray-50">
                  <span className="text-gray-500">Đối tượng:</span>
                  <span className="font-semibold text-gray-900">{product.gender}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="text-gray-500">Thương hiệu:</span>
                  <span className="font-semibold text-gray-900">{product.brand || "SportX Pro"}</span>
                </div>
                <div className="grid grid-cols-2 p-3.5 bg-gray-50">
                  <span className="text-gray-500">Chất liệu:</span>
                  <span className="font-semibold text-gray-900">100% Polyester Aeroready</span>
                </div>
                <div className="grid grid-cols-2 p-3.5">
                  <span className="text-gray-500">Xuất xứ:</span>
                  <span className="font-semibold text-gray-900">Việt Nam</span>
                </div>
              </div>
            </div>
          </Tab>

          <Tab key="reviews" title={`Đánh Giá (${product.reviewCount || 24})`}>
            <div className="py-6 space-y-4 max-w-2xl">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                <div>
                  <div className="text-2xl font-extrabold text-gray-900">{product.rating || 5.0} / 5.0</div>
                  <div className="text-xs text-gray-500">Dựa trên {product.reviewCount || 24} đánh giá</div>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} className="w-4 h-4" />
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <div className="font-bold text-gray-900">Trần Minh Quân (Hà Nội)</div>
                  <span className="text-xs text-gray-400">2 ngày trước</span>
                </div>
                <div className="flex text-amber-400 gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar key={s} className="w-3 h-3" />
                  ))}
                </div>
                <p className="text-gray-600">
                  Áo mặc rất mát, form chuẩn theo AI tư vấn (mình cao 1m73 nặng 68kg chọn size L vừa in). Vải thấm mồ hôi nhanh!
                </p>
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
    </div>
  );
}
