"use client";

import React, { useState } from "react";
import { Button, Input, Textarea } from "@heroui/react";
import { FaLocationDot, FaPhone, FaEnvelope, FaPaperPlane, FaCircleCheck } from "react-icons/fa6";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">
          Kết Nối Với SportX
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Liên Hệ & Hỗ Trợ Khách Hàng
        </h1>
        <p className="text-sm text-gray-500">
          Chúng tôi luôn sẵn sàng lắng nghe mọi ý kiến đóng góp và thắc mắc của quý khách.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 space-y-6">
            <h3 className="text-lg font-bold text-gray-900">Thông Tin Trụ Sở</h3>
            
            <div className="space-y-6 text-sm text-gray-600">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FaLocationDot className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-900 block font-bold mb-1">Địa chỉ:</strong>
                  Xuân Khanh, Sơn Tây, Hà Nội<br/>
                  (Trường Đại học Công Nghiệp Việt - Hung)
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FaPhone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-900 block font-bold mb-1">Hotline tư vấn:</strong>
                  0398.802.022 (Đinh Công Hùng)
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-gray-900 block font-bold mb-1">Email hỗ trợ:</strong>
                  support@sportx.store<br/>
                  dinhconghung1512@gmail.com
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 text-sm text-gray-500">
              <strong className="text-gray-900 font-bold">Thời gian làm việc:</strong><br />
              Thứ Hai - Chủ Nhật: 08:00 - 22:00<br/>
              (Hệ thống AI Chatbot hỗ trợ 24/7).
            </div>
          </div>
          
          <div className="w-full h-48 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400">
             <FaLocationDot className="w-8 h-8 opacity-50" />
             <span className="ml-2 font-bold text-sm">Bản đồ đang cập nhật</span>
          </div>
        </div>

        {/* Form Column (7 cols) */}
        <div className="lg:col-span-7 bg-white p-8 rounded-xl border border-gray-200 space-y-6">
          <h3 className="font-bold text-xl text-gray-900">Gửi Tin Nhắn Cho Chúng Tôi</h3>

          {submitted ? (
            <div className="p-8 rounded-xl bg-emerald-50 border border-emerald-100 text-center space-y-3">
              <FaCircleCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-lg text-emerald-900">Gửi liên hệ thành công!</h4>
              <p className="text-sm text-emerald-700">
                Cảm ơn bạn. Đội ngũ SportX sẽ phản hồi trong vòng 24 giờ làm việc.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input 
                  label="Họ và tên của bạn" 
                  placeholder="Nguyễn Văn A" 
                  isRequired 
                  size="md" 
                  radius="lg"
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />
                <Input 
                  label="Số điện thoại" 
                  placeholder="0912345678" 
                  isRequired 
                  size="md" 
                  radius="lg"
                  classNames={{ inputWrapper: "bg-gray-50" }}
                />
              </div>
              <Input 
                label="Địa chỉ Email" 
                placeholder="email@domain.com" 
                type="email" 
                isRequired 
                size="md" 
                radius="lg"
                classNames={{ inputWrapper: "bg-gray-50" }}
              />
              <Textarea 
                label="Nội dung cần hỗ trợ / Góp ý" 
                placeholder="Nhập câu hỏi của bạn tại đây..." 
                isRequired 
                size="md" 
                minRows={4} 
                radius="lg"
                classNames={{ inputWrapper: "bg-gray-50" }}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-emerald-600 text-white font-bold text-sm h-12 rounded-full shadow-md hover:bg-emerald-700 transition" 
                endContent={<FaPaperPlane className="w-4 h-4" />}
              >
                Gửi Tin Nhắn
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
