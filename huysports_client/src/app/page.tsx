"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Input } from "@heroui/react";
import {
  FaFutbol,
  FaPersonRunning,
  FaDumbbell,
  FaFire,
  FaClock,
  FaShieldHalved,
  FaTruckFast,
  FaRotateLeft,
  FaRulerCombined,
  FaArrowRight,
  FaChevronRight,
  FaStar,
  FaCheck,
  FaBolt,
  FaAward,
  FaEnvelope,
} from "react-icons/fa6";
import { GiShuttlecock } from "react-icons/gi";
import { useProducts } from "@/hooks";
import ProductCard from "@/components/products/ProductCard";
import ProductCardSkeleton from "@/components/products/ProductCardSkeleton";
import AISizeAdvisorModal from "@/components/products/AISizeAdvisorModal";
import { Product } from "@/types";
import { useFilterStore } from "@/stores/useFilterStore";

export default function HomePage() {
  const [selectedProductForSize, setSelectedProductForSize] = useState<Product | null>(null);
  const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [emailSubscribe, setEmailSubscribe] = useState("");
  const [subscribedSuccess, setSubscribedSuccess] = useState(false);
  const { setSport } = useFilterStore();

  // Flash Sale Countdown
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 20 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Products
  const { data: productsData, isLoading } = useProducts();

  const allProducts: Product[] = productsData?.data || [];
  const flashSaleProducts = allProducts.filter((p) => p.discountPercent && p.discountPercent > 0).slice(0, 4);
  
  const filteredProducts = activeTab === "all" 
    ? allProducts.slice(0, 8) 
    : allProducts.filter((p) => p.sport?.toLowerCase().includes(activeTab.toLowerCase())).slice(0, 8);

  const categories = [
    {
      name: "Bóng Đá",
      sport: "Bóng đá",
      tag: "Áo đấu, quần thi đấu, tất",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop",
      icon: <FaFutbol className="w-5 h-5" />,
    },
    {
      name: "Chạy Bộ",
      sport: "Chạy bộ",
      tag: "Áo singlet, quần short",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=400&fit=crop",
      icon: <FaPersonRunning className="w-5 h-5" />,
    },
    {
      name: "Gym & Fitness",
      sport: "Gym / Fitness",
      tag: "Áo tank top, đồ co giãn",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&h=400&fit=crop",
      icon: <FaDumbbell className="w-5 h-5" />,
    },
    {
      name: "Cầu Lông",
      sport: "Cầu lông",
      tag: "Áo thấm hút, co giãn",
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop",
      icon: <GiShuttlecock className="w-5 h-5" />,
    },
  ];

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailSubscribe.trim()) {
      setSubscribedSuccess(true);
      setEmailSubscribe("");
    }
  };

  return (
    <div className="pb-16">
      {/* 1. Hero Banner — Full-width image like Coolmate */}
      <section className="relative h-[420px] sm:h-[500px] lg:h-[560px] overflow-hidden bg-gray-900">
        <img
          src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1600&h=800&fit=crop"
          alt="SportX Collection"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gray-900/40" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center text-center">
          <span className="inline-block bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Bộ sưu tập 2026
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight max-w-3xl">
            THỜI TRANG THỂ THAO <br className="hidden sm:inline" />
            CHUYÊN NGHIỆP
          </h1>
          <p className="text-base sm:text-lg text-gray-200 mt-4 max-w-xl leading-relaxed">
            Chất liệu cao cấp, thiết kế chuẩn form dáng người Việt
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
            <Button
              size="lg"
              className="font-bold text-sm h-12 px-8 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              endContent={<FaArrowRight className="w-3.5 h-3.5" />}
              as={Link}
              href="/products"
            >
              Khám Phá Ngay
            </Button>
            <Button
              size="lg"
              className="font-semibold text-sm h-12 px-6 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/30"
              startContent={<FaRulerCombined className="w-3.5 h-3.5" />}
              onPress={() => {
                setSelectedProductForSize(allProducts[0] || null);
                setIsSizeModalOpen(true);
              }}
            >
              Tìm Size Chuẩn
            </Button>
          </div>
        </div>
      </section>

      {/* 2. Trust & Service Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaTruckFast className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Freeship 500K</h4>
              <p className="text-[11px] text-gray-400">Giao hàng toàn quốc</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaShieldHalved className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Chính Hãng</h4>
              <p className="text-[11px] text-gray-400">100% cam kết chất lượng</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaRotateLeft className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Đổi Trả 30 Ngày</h4>
              <p className="text-[11px] text-gray-400">Đổi size tận nơi</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <FaRulerCombined className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-900">Tư Vấn Size</h4>
              <p className="text-[11px] text-gray-400">AI gợi ý chuẩn xác</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Category Strip — Coolmate style horizontal scroll */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Danh Mục Thể Thao
          </h2>
          <Link
            href="/products"
            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Tất cả <FaChevronRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?sport=${encodeURIComponent(cat.sport)}`}
              onClick={() => setSport(cat.sport)}
              className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gray-900/30 group-hover:bg-gray-900/40 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="flex items-center gap-2 text-white">
                  {cat.icon}
                  <h3 className="text-base font-bold">{cat.name}</h3>
                </div>
                <p className="text-xs text-gray-200 mt-1">{cat.tag}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Flash Sale Section */}
      {(isLoading || flashSaleProducts.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FaFire className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Flash Sale</h2>
                  <p className="text-xs text-gray-400">Ưu đãi có hạn — giảm đến 40%</p>
                </div>
              </div>

              {/* Countdown */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <FaClock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500 mr-1">Kết thúc:</span>
                <div className="flex items-center gap-1">
                  <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md font-mono min-w-[32px] text-center">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="text-gray-400 font-bold">:</span>
                  <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md font-mono min-w-[32px] text-center">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="text-gray-400 font-bold">:</span>
                  <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md font-mono min-w-[32px] text-center">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {isLoading ? (
                [1, 2, 3, 4].map((i) => <ProductCardSkeleton key={i} />)
              ) : (
                flashSaleProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    product={prod}
                    onOpenSizeAdvisor={(p) => {
                      setSelectedProductForSize(p);
                      setIsSizeModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. Featured Products with Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
            Sản Phẩm Nổi Bật
          </h2>

          {/* Tabs — underline style */}
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
            {[
              { key: "all", label: "Tất cả" },
              { key: "bóng đá", label: "Bóng đá" },
              { key: "chạy bộ", label: "Chạy bộ" },
              { key: "gym", label: "Gym" },
              { key: "cầu lông", label: "Cầu lông" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                  activeTab === tab.key
                    ? "text-emerald-600 border-emerald-600"
                    : "text-gray-400 border-transparent hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
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

        {/* View All Button */}
        <div className="text-center mt-8">
          <Button
            as={Link}
            href="/products"
            size="lg"
            variant="bordered"
            className="font-semibold text-sm h-11 px-8 rounded-full border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors"
          >
            Xem Tất Cả Sản Phẩm
          </Button>
        </div>
      </section>

      {/* 6. Fabric Technology — Light bg */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Công nghệ vải
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
              Chất Lượng Thể Thao Đỉnh Cao
            </h2>
            <p className="text-sm text-gray-500 mt-2 max-w-xl mx-auto">
              Tối ưu hóa khả năng thoát nhiệt, kiểm soát mồ hôi và nâng cao sự tự do vận động.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <FaBolt className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Max-Breathe Mesh</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Hàng triệu lỗ thoáng khí siêu nhỏ giúp tản nhiệt tức thì khi vận động cường độ cao.</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <FaAward className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">4D-Flex Co Giãn</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Sợi Spandex cao cấp co giãn 4 hướng, không biến dạng sau nhiều lần giặt.</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <FaShieldHalved className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">Kháng Khuẩn Ion</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Xử lý phân tử bạc ức chế 99% vi khuẩn gây mùi, giữ cơ thể luôn thoải mái.</p>
            </div>

            <div className="p-6 rounded-xl bg-gray-50 border border-gray-100 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <FaCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-sm text-gray-900 mb-1">May Phẳng Flatlock</h4>
              <p className="text-xs text-gray-500 leading-relaxed">Đường may ép sát loại bỏ hoàn toàn ma sát gây kích ứng da khi chạy hoặc tập.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Size Finder Guide */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <FaRulerCombined className="w-3.5 h-3.5" />
                Hướng dẫn chọn size
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                Chọn Đúng Size, <br />
                <span className="text-emerald-600">Chuẩn Form Người Việt</span>
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-lg">
                Hệ thống tính toán dựa trên chiều cao, cân nặng và form dáng mong muốn giúp bạn yên tâm mua sắm.
              </p>
              <Button
                className="font-bold text-sm h-11 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                startContent={<FaRulerCombined className="w-3.5 h-3.5" />}
                onPress={() => {
                  setSelectedProductForSize(allProducts[0] || null);
                  setIsSizeModalOpen(true);
                }}
              >
                Mở Công Cụ Chọn Size
              </Button>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <div className="text-sm font-bold text-gray-900 mb-4">Bảng size tham khảo (Nam / Nữ):</div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { size: "S", height: "1m55-1m65", weight: "48-58kg" },
                  { size: "M", height: "1m65-1m72", weight: "58-66kg" },
                  { size: "L", height: "1m70-1m78", weight: "67-75kg" },
                  { size: "XL", height: "1m75-1m85", weight: "76-88kg" },
                ].map((s) => (
                  <div key={s.size} className="text-center p-3 rounded-lg bg-white border border-gray-200">
                    <div className="font-bold text-gray-900 text-sm">{s.size}</div>
                    <div className="text-[10px] text-gray-400 mt-0.5">{s.height}</div>
                    <div className="text-[10px] text-gray-400">{s.weight}</div>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 text-center mt-3">
                Hỗ trợ đổi size miễn phí trong vòng 30 ngày
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews */}
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
              Khách Hàng Nói Gì
            </h2>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
              <FaStar className="w-4 h-4 text-amber-400" />
              4.9/5.0
              <span className="text-gray-400 font-normal">(2,400+ đánh giá)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                initials: "TQ", name: "Trần Minh Quân", location: "Hà Nội", color: "bg-emerald-600",
                text: "Áo bóng đá SportX mặc rất nhẹ và thoáng khí. Mình cao 1m73 nặng 68kg chọn size L mặc vừa in, thi đấu rất thoải mái.",
                product: "Áo Đấu CLB Pro Match Kit",
              },
              {
                initials: "HL", name: "Hoàng Văn Long", location: "Đà Nẵng", color: "bg-gray-900",
                text: "Quần short chạy bộ có túi lót tiện lợi, vải nhẹ tênh không bị bết dính mồ hôi khi chạy đường dài 10km.",
                product: "Quần Short Chạy Bộ Marathon Pro",
              },
              {
                initials: "NT", name: "Nguyễn Thu Trang", location: "TP.HCM", color: "bg-emerald-500",
                text: "Đồ tập gym co giãn 4 chiều cực kỳ êm ái, nâng đỡ tốt khi tập Squat hay Deadlift. Shop đóng gói cẩn thận.",
                product: "Bộ Đồ Tập Gym & Yoga Nữ Pro",
              },
            ].map((review, idx) => (
              <div key={idx} className="p-5 rounded-xl bg-gray-50 border border-gray-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-full ${review.color} text-white font-bold text-xs flex items-center justify-center`}>
                      {review.initials}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{review.name}</div>
                      <div className="text-[11px] text-gray-400">{review.location}</div>
                    </div>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar key={s} className="w-3 h-3" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  &ldquo;{review.text}&rdquo;
                </p>
                <div className="text-xs font-semibold text-emerald-600">
                  Đã mua: {review.product}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. Newsletter — Emerald bg */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-emerald-600 rounded-xl p-8 sm:p-10 text-center text-white">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <FaEnvelope className="w-5 h-5" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold">
            Nhận Voucher Giảm 10%
          </h3>
          <p className="text-sm text-emerald-100 mt-1 max-w-md mx-auto">
            Đăng ký email để nhận ưu đãi độc quyền cho đơn hàng đầu tiên.
          </p>

          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex gap-2 mt-6">
            <Input
              type="email"
              placeholder="Nhập email của bạn..."
              value={emailSubscribe}
              onChange={(e) => setEmailSubscribe(e.target.value)}
              size="sm"
              radius="full"
              classNames={{
                inputWrapper: "bg-white/20 border border-white/30 text-white placeholder:text-emerald-200",
                input: "text-sm text-white placeholder:text-emerald-200",
              }}
              required
            />
            <Button
              type="submit"
              size="sm"
              className="bg-white text-emerald-700 font-bold px-5 rounded-full shrink-0 hover:bg-gray-100"
            >
              Đăng Ký
            </Button>
          </form>

          {subscribedSuccess && (
            <div className="mt-4 p-3 rounded-lg bg-white/20 text-white text-sm font-semibold max-w-md mx-auto">
              Cảm ơn bạn! Dùng mã <strong>SPORTX10</strong> khi thanh toán để được giảm 10%.
            </div>
          )}
        </div>
      </section>

      {/* AI Size Advisor Modal */}
      <AISizeAdvisorModal
        isOpen={isSizeModalOpen}
        onClose={() => setIsSizeModalOpen(false)}
        product={selectedProductForSize}
      />
    </div>
  );
}
