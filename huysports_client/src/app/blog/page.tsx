"use client";

import React from "react";
// import Link from "next/link";
import { Card, CardBody, Chip } from "@heroui/react";
import { FaCalendar, FaUser, FaArrowRight } from "react-icons/fa6";

export default function BlogPage() {
  const articles = [
    {
      id: "1",
      title: "Bí quyết chọn size quần áo bóng đá vừa vặn và tôn dáng chuẩn vận động viên",
      category: "Tư Vấn Chọn Size",
      date: "20/09/2026",
      author: "Ban Biên Tập SportX",
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800",
      excerpt: "Mặc áo bóng đá quá rộng khiến bạn chậm chạp khi bứt tốc, trong khi quá chật sẽ cản trở cử động. Hãy cùng SportX khám phá cách chọn size áo đấu chuẩn xác nhất kết hợp cùng trợ lý AI.",
    },
    {
      id: "2",
      title: "Top 5 chất liệu vải thể thao thoáng khí, kháng khuẩn tốt nhất năm 2026",
      category: "Công Nghệ Thể Thao",
      date: "18/09/2026",
      author: "Chuyên Gia Thể Lực",
      image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800",
      excerpt: "Tìm hiểu về công nghệ sợi Polyester Aeroready, Spandex co giãn 4 chiều và công nghệ khử mùi ion bạc đang dẫn đầu ngành thời trang thể thao chuyên nghiệp.",
    },
    {
      id: "3",
      title: "Hướng dẫn bảo quản quần áo thể thao không bị phai màu và bong tróc số in",
      category: "Mẹo Vặt & Cẩm Nang",
      date: "15/09/2026",
      author: "SportX Care",
      image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800",
      excerpt: "Giặt nước lạnh, lộn trái khi phơi và tránh ủi nhiệt trực tiếp lên decal in là những nguyên tắc vàng giúp bộ đồ thi đấu của bạn luôn bền đẹp như mới.",
    },
  ];

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Kiến Thức & Cẩm Nang Thể Thao
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Góc Chia Sẻ Kinh Nghiệm SportX
        </h1>
        <p className="text-sm text-gray-500">
          Cập nhật xu hướng thời trang thể thao, mẹo chọn size chuẩn và bí quyết tập luyện hiệu quả.
        </p>
      </div>

      {/* Featured Blog */}
      <Card className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition duration-300">
        <CardBody className="p-0 sm:flex-row flex-col">
          <div className="sm:w-2/3 aspect-[16/9] sm:aspect-auto overflow-hidden bg-gray-100 relative">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="p-6 sm:w-1/3 flex flex-col justify-center gap-4">
            <Chip size="sm" className="bg-emerald-50 text-emerald-700 rounded-md font-bold text-xs">
              {featured.category}
            </Chip>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><FaCalendar className="w-3.5 h-3.5" /> {featured.date}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><FaUser className="w-3.5 h-3.5" /> {featured.author}</span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 hover:text-emerald-600 transition">
                {featured.title}
              </h3>
              <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                {featured.excerpt}
              </p>
            </div>
            <div className="pt-4 border-t border-gray-100">
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 group-hover:underline cursor-pointer">
                Đọc tiếp <FaArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {rest.map((art) => (
          <Card key={art.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full">
            <CardBody className="p-0 flex flex-col h-full">
              <div className="aspect-[16/10] w-full overflow-hidden bg-gray-100 relative">
                <img
                  src={art.image}
                  alt={art.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <Chip size="sm" className="absolute top-3 left-3 bg-emerald-50 text-emerald-700 rounded-md font-bold text-[10px]">
                  {art.category}
                </Chip>
              </div>

              <div className="p-5 flex flex-col justify-between flex-1 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><FaCalendar className="w-3.5 h-3.5" /> {art.date}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><FaUser className="w-3.5 h-3.5" /> {art.author}</span>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 line-clamp-2 hover:text-emerald-600 transition">
                    {art.title}
                  </h3>

                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 group-hover:underline cursor-pointer">
                    Đọc tiếp <FaArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
