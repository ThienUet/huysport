"use client";

import React from "react";
import Link from "next/link";
import { Card, CardBody, Button } from "@heroui/react";
import { FaStar, FaPlus, FaRulerCombined } from "react-icons/fa6";
import { Product } from "@/types";
import { useCartStore } from "@/stores/useCartStore";

interface ProductCardProps {
  product: Product;
  onOpenSizeAdvisor?: (product: Product) => void;
}

export default function ProductCard({ product, onOpenSizeAdvisor }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const variant = product.variants?.[0] || {
      sku: `${product.sku}-DEFAULT`,
      size: "L",
      color: "Mặc định",
      price: product.price,
      stock: product.stock,
    };

    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.images?.[0] || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500",
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      price: variant.price || product.price,
      maxStock: variant.stock || product.stock,
    });
  };

  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const originalPrice = product.originalPrice || (hasDiscount ? Math.round(product.price / (1 - (product.discountPercent || 0) / 100)) : null);

  return (
    <Card
      as={Link}
      href={`/products/${product.id}`}
      isPressable
      className="group bg-white border border-gray-200 hover:shadow-md transition-all duration-300 rounded-xl overflow-hidden text-left flex flex-col h-full"
    >
      <CardBody className="p-0 flex flex-col h-full overflow-hidden">
        {/* Product Image Container */}
        <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden rounded-t-xl flex items-center justify-center">
          <img
            src={product.images?.[0] || "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=500"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {hasDiscount && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                -{product.discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Mới
              </span>
            )}
          </div>

          {/* Sport Category Pill */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md">
              {product.sport || product.category}
            </span>
          </div>

          {/* Subtle Hover Action Buttons */}
          <div className="absolute inset-x-3 bottom-0 translate-y-full opacity-0 group-hover:translate-y-[-12px] group-hover:opacity-100 transition-all duration-300 ease-out flex gap-2 z-10">
            {onOpenSizeAdvisor && (
              <Button
                size="sm"
                className="flex-1 bg-white text-gray-900 border border-gray-200 font-medium text-[11px] h-9 rounded-full hover:bg-gray-50"
                startContent={<FaRulerCombined className="w-3 h-3 text-emerald-600" />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onOpenSizeAdvisor(product);
                }}
              >
                Tư vấn size
              </Button>
            )}
            <Button
              size="sm"
              isIconOnly
              className="h-9 w-9 min-w-[36px] rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
              onClick={handleQuickAdd}
              aria-label="Thêm nhanh vào giỏ"
            >
              <FaPlus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-3.5 flex flex-col justify-between flex-1 gap-2 bg-white">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider font-medium">{product.brand || "SportX Pro"}</span>
              <div className="flex items-center gap-1 text-gray-700 font-medium">
                <FaStar className="w-3 h-3 text-amber-400" />
                <span className="text-[11px]">{product.rating || 5.0}</span>
                <span className="text-gray-400 text-[10px]">({product.reviewCount || 18})</span>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-gray-900 hover:text-emerald-600 line-clamp-2 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* Pricing & Size Availability */}
          <div className="pt-2 border-t border-gray-100 flex items-baseline justify-between gap-2 mt-auto">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base font-bold text-gray-900">
                {product.price?.toLocaleString("vi-VN")}đ
              </span>
              {originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {originalPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>

            <span className="text-[10px] bg-gray-100 text-gray-500 font-medium px-1.5 py-0.5 rounded-md shrink-0">
              {product.variants?.length ? `${product.variants.length} size` : "S-2XL"}
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
