import React from "react";
import Link from "next/link";
import {
  FaTruckFast,
  FaShieldHalved,
  FaRotateLeft,
  FaRulerCombined,
  FaMapLocationDot,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaInstagram
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-14 pb-8 border-t border-gray-800 mt-16">
      {/* Service Highlights */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-gray-800">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-800">
          <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-4 lg:pr-4 pt-4 lg:pt-0">
            <FaTruckFast className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Giao hàng toàn quốc</h4>
              <p className="text-sm text-gray-500 mt-1">Miễn phí cho đơn từ 500K</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-4 lg:px-4 pt-4 lg:pt-0">
            <FaShieldHalved className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Chính hãng 100%</h4>
              <p className="text-sm text-gray-500 mt-1">Cam kết nguồn gốc xuất xứ</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-4 lg:px-4 pt-4 lg:pt-0">
            <FaRotateLeft className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Đổi trả 30 ngày</h4>
              <p className="text-sm text-gray-500 mt-1">Hỗ trợ đổi trả dễ dàng</p>
            </div>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center lg:items-start text-center lg:text-left gap-4 lg:pl-4 pt-4 lg:pt-0">
            <FaRulerCombined className="w-8 h-8 text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-white text-sm">Tư vấn chuẩn size</h4>
              <p className="text-sm text-gray-500 mt-1">Gợi ý kích cỡ vừa vặn</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo-256.png"
                alt="HuySport Logo"
                className="w-10 h-10 object-contain rounded-full bg-white p-0.5"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="text-lg font-black tracking-tight text-white">HUY</span>
                  <span className="text-lg font-black tracking-tight text-emerald-400">SPORT</span>
                </div>
                <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">Đồ Thể Thao</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 pr-4">
              Thời trang thể thao chuyên nghiệp
            </p>
            <div className="space-y-2 text-sm text-gray-400 pt-2">
              <div className="flex items-center gap-2">
                <FaMapLocationDot className="w-4 h-4 text-gray-500 shrink-0" />
                <span>Xuân Khanh, Sơn Tây, Hà Nội</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone className="w-4 h-4 text-gray-500 shrink-0" />
                <span>0398.802.022</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="w-4 h-4 text-gray-500 shrink-0" />
                <span>support@sportx.store</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-3">
               <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-white transition-colors">
                  <FaFacebook className="w-5 h-5"/>
               </a>
               <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-white transition-colors">
                  <FaInstagram className="w-5 h-5"/>
               </a>
            </div>
          </div>

          {/* Về SportX */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Về SportX</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">Giới thiệu</Link></li>
              <li><Link href="/blog" className="text-gray-400 hover:text-white transition-colors text-sm">Blog</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">Liên hệ</Link></li>
            </ul>
          </div>

          {/* Chính Sách */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Chính Sách</h4>
            <ul className="space-y-3">
              <li><Link href="/policy/returns" className="text-gray-400 hover:text-white transition-colors text-sm">Đổi trả</Link></li>
              <li><Link href="/policy/shipping" className="text-gray-400 hover:text-white transition-colors text-sm">Vận chuyển</Link></li>
              <li><Link href="/policy/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">Bảo mật</Link></li>
            </ul>
          </div>

          {/* Hỗ Trợ */}
          <div>
            <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Hỗ Trợ</h4>
            <ul className="space-y-3">
              <li><Link href="/guide/shopping" className="text-gray-400 hover:text-white transition-colors text-sm">Hướng dẫn mua hàng</Link></li>
              <li><Link href="/guide/size" className="text-gray-400 hover:text-white transition-colors text-sm">Hướng dẫn chọn size</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2026 SportX. Đinh Công Hùng — MSSV: 2200932
          </p>
          <div className="flex items-center gap-2">
             <span className="px-3 py-1.5 rounded bg-gray-800/50 text-gray-400 text-[11px] font-medium border border-gray-800 tracking-wider">VNPAY</span>
             <span className="px-3 py-1.5 rounded bg-gray-800/50 text-gray-400 text-[11px] font-medium border border-gray-800 tracking-wider">MOMO</span>
             <span className="px-3 py-1.5 rounded bg-gray-800/50 text-gray-400 text-[11px] font-medium border border-gray-800 tracking-wider">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
