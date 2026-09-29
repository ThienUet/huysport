import React from "react";
import {
  FaHeartPulse,
  FaShieldHalved,
  FaAward,
  FaHeart,
  FaGraduationCap,
} from "react-icons/fa6";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Intro Banner */}
      <div className="text-center space-y-4 max-w-2xl mx-auto bg-emerald-600 p-8 rounded-xl text-white shadow-md">
        <div className="w-14 h-14 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <FaHeartPulse className="w-7 h-7" />
        </div>
        <span className="text-xs font-bold text-emerald-100 uppercase tracking-widest">
          Giới Thiệu Hệ Thống SportX
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
          Tiên Phong Ứng Dụng Trí Tuệ Nhân Tạo Vào Mua Sắm Thể Thao
        </h1>
        <p className="text-sm text-emerald-50 leading-relaxed">
          SportX là nền tảng thương mại điện tử chuyên cung cấp trang phục thể thao chính hãng cao cấp, kết hợp công nghệ AI Chatbot tư vấn kích cỡ chuẩn xác và thanh toán trực tuyến bảo mật.
        </p>
      </div>

      {/* Thesis Info Box */}
      <div className="p-6 rounded-xl bg-gray-900 text-white border border-gray-800 space-y-3">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <FaGraduationCap className="w-4 h-4" /> Đồ Án Tốt Nghiệp Đại Học Chuyên Ngành Công Nghệ Thông Tin
        </div>
        <h3 className="text-lg font-bold text-white">
          Đề tài: "Xây dựng website thương mại điện tử kinh doanh quần áo thể thao tích hợp Chatbot hỗ trợ tư vấn sản phẩm và thanh toán trực tuyến"
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-gray-300 border-t border-gray-800">
          <div>
            <span className="text-gray-500 block">Sinh viên thực hiện:</span>
            <strong className="text-white">Đinh Công Hùng</strong> (MSSV: 2200932)
          </div>
          <div>
            <span className="text-gray-500 block">Giảng viên hướng dẫn:</span>
            <strong className="text-white">ThS. Phạm Hồng Long</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Trường đào tạo:</span>
            <strong className="text-white">Trường ĐH Công Nghiệp Việt - Hung</strong>
          </div>
        </div>
      </div>

      {/* Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
        <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <FaShieldHalved className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">100% Hàng Chính Hãng</h4>
          <p className="text-gray-500 leading-relaxed">
            Cam kết chất lượng sợi vải thể thao cao cấp, đường may bền bỉ và nguồn gốc xuất xứ minh bạch.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <FaAward className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">AI Size Recommendation</h4>
          <p className="text-gray-500 leading-relaxed">
            Thuật toán tư vấn kích cỡ đa chiều giúp loại bỏ 95% tình trạng đổi trả vì mua nhầm size.
          </p>
        </div>

        <div className="p-6 rounded-xl bg-white border border-gray-200 space-y-3 hover:shadow-md transition">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <FaHeart className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-gray-900">Khách Hàng Là Trung Tâm</h4>
          <p className="text-gray-500 leading-relaxed">
            Hỗ trợ đổi trả miễn phí trong 30 ngày, giao hàng toàn quốc và chăm sóc khách hàng 24/7.
          </p>
        </div>
      </div>
    </div>
  );
}
