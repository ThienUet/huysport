import type { Metadata } from "next";
import { Providers } from "@/providers/providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import AIChatbotWidget from "@/components/chatbot/AIChatbotWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "HuySport | Thời Trang Thể Thao Chuyên Nghiệp",
  description: "Cửa hàng trực tuyến quần áo thể thao chính hãng HuySport — Bóng đá, Chạy bộ, Gym, Cầu lông. Tích hợp AI Chatbot tư vấn chuẩn size và thanh toán trực tuyến.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo-icon.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CartDrawer />
          <AIChatbotWidget />
        </Providers>
      </body>
    </html>
  );
}
