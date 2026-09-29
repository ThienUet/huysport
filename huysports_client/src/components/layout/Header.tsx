"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Button,
  Input,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import {
  FaFutbol,
  FaPersonRunning,
  FaDumbbell,
  FaBagShopping,
  FaMagnifyingGlass,
  FaUser,
  FaPhone,
  FaBars,
  FaXmark,
  FaRightFromBracket,
  FaBox,
  FaUserCheck,
  FaChevronDown,
  FaTag,
  FaNewspaper,
  FaCircleInfo,
  FaHeadset,
} from "react-icons/fa6";
import { GiShuttlecock } from "react-icons/gi";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useFilterStore } from "@/stores/useFilterStore";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { getItemCount, setIsCartDrawerOpen } = useCartStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { search, setSearch, setSport } = useFilterStore();
  
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearch(localSearch.trim());
      router.push(`/products?search=${encodeURIComponent(localSearch.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const navigateToSport = (sportName: string) => {
    setSport(sportName);
    router.push(`/products?sport=${encodeURIComponent(sportName)}`);
    setIsMobileMenuOpen(false);
  };

  const cartCount = isMounted ? getItemCount() : 0;
  const isUserAuth = isMounted && isAuthenticated && user;

  const navLinks = [
    { label: "Trang Chủ", href: "/" },
    { label: "Bóng Đá", action: () => navigateToSport("Bóng đá") },
    { label: "Chạy Bộ", action: () => navigateToSport("Chạy bộ") },
    { label: "Gym & Fitness", action: () => navigateToSport("Gym / Fitness") },
    { label: "Cầu Lông", action: () => navigateToSport("Cầu lông") },
    { label: "Sản Phẩm", href: "/products" },
    { label: "Cẩm Nang", href: "/blog" },
  ];

  return (
    <>
      {/* Top Banner Bar */}
      <div className="bg-emerald-600 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs">
            <span>Giảm 10% đơn đầu tiên với mã <strong className="font-bold">SPORTX10</strong> | Freeship từ 500K</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[11px]">
            <Link href="/orders" className="hover:text-gray-200 transition-colors flex items-center gap-1.5">
              <FaBox className="w-3 h-3" /> Tra cứu đơn hàng
            </Link>
            <span className="text-emerald-400">|</span>
            <div className="flex items-center gap-1.5">
              <FaPhone className="w-3 h-3" /> Hotline: <span className="font-semibold">0398.802.022</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4 sm:gap-8">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <img
                src="/logo-256.png"
                alt="HuySport Logo"
                className="w-10 h-10 object-contain rounded-full group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="text-lg font-black tracking-tight text-gray-900">HUY</span>
                  <span className="text-lg font-black tracking-tight text-emerald-600">SPORT</span>
                </div>
                <span className="text-[9px] font-bold text-gray-400 tracking-widest uppercase mt-0.5">Đồ Thể Thao</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-[14px] font-semibold text-gray-600">
              {navLinks.map((item, idx) => {
                if (item.href) {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={idx}
                      href={item.href}
                      className={`py-1 transition-colors ${
                        isActive
                          ? "text-emerald-600 font-bold border-b-2 border-emerald-600"
                          : "hover:text-emerald-600 border-b-2 border-transparent"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }
                return (
                  <button
                    key={idx}
                    onClick={item.action}
                    className="py-1 transition-colors cursor-pointer text-gray-600 font-semibold hover:text-emerald-600 border-b-2 border-transparent"
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400" />}
                size="sm"
                radius="full"
                classNames={{
                  inputWrapper: "bg-gray-100 hover:bg-gray-200 focus-within:!bg-white focus-within:ring-2 focus-within:ring-emerald-500 border-none shadow-none transition-all",
                  input: "text-xs",
                }}
              />
            </form>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cart Button */}
              <button
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2.5 rounded-full hover:bg-gray-100 transition text-gray-800 flex items-center justify-center cursor-pointer"
                aria-label="Giỏ hàng"
              >
                <FaBagShopping className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* User Dropdown / Login */}
              {isUserAuth ? (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 transition cursor-pointer focus:outline-none">
                      <Avatar
                        size="sm"
                        name={user?.fullName || "User"}
                        className="bg-emerald-600 text-white font-bold text-xs w-8 h-8"
                      />
                      <span className="hidden sm:inline text-xs font-semibold text-gray-800 max-w-[100px] truncate">
                        {user?.fullName?.split(" ").slice(-1)[0] || user?.fullName}
                      </span>
                      <FaChevronDown className="w-3 h-3 text-gray-400 hidden sm:inline" />
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="User Actions"
                    onAction={(key) => {
                      if (key === "account") router.push("/account");
                      if (key === "orders") router.push("/account");
                      if (key === "track") router.push("/orders");
                      if (key === "logout") logout();
                    }}
                  >
                    <DropdownItem key="profile" textValue="Hồ sơ" className="h-12 gap-2 opacity-100 cursor-default" isReadOnly>
                      <p className="font-bold text-xs text-gray-900">{user?.fullName}</p>
                      <p className="text-[11px] text-gray-500 truncate">{user?.email}</p>
                    </DropdownItem>
                    <DropdownItem key="account" textValue="Tài khoản cá nhân" startContent={<FaUserCheck className="w-3.5 h-3.5 text-gray-700" />}>
                      Tài khoản & Đơn mua
                    </DropdownItem>
                    <DropdownItem key="track" textValue="Tra cứu đơn hàng" startContent={<FaBox className="w-3.5 h-3.5 text-gray-700" />}>
                      Tra cứu đơn hàng
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      color="danger"
                      className="text-danger"
                      textValue="Đăng xuất"
                      startContent={<FaRightFromBracket className="w-3.5 h-3.5" />}
                    >
                      Đăng xuất
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              ) : (
                <Link href="/auth/login">
                  <Button
                    size="sm"
                    className="font-semibold text-xs px-4 h-8.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
                    startContent={<FaUser className="w-3 h-3" />}
                  >
                    Đăng Nhập
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer"
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-lg animate-fade-in">
            {/* Mobile Search */}
            <form onSubmit={handleSearchSubmit}>
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400" />}
                size="sm"
                radius="lg"
                classNames={{
                  inputWrapper: "bg-gray-100 border-none",
                }}
              />
            </form>

            {/* Sport Categories - Simple List */}
            <div className="flex flex-col gap-1 text-xs font-medium mt-4">
              <button
                onClick={() => navigateToSport("Bóng đá")}
                className="py-2.5 px-3 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition flex items-center gap-3"
              >
                <FaFutbol className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bóng Đá</span>
              </button>
              <button
                onClick={() => navigateToSport("Chạy bộ")}
                className="py-2.5 px-3 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition flex items-center gap-3"
              >
                <FaPersonRunning className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Chạy Bộ</span>
              </button>
              <button
                onClick={() => navigateToSport("Gym / Fitness")}
                className="py-2.5 px-3 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition flex items-center gap-3"
              >
                <FaDumbbell className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Gym & Fitness</span>
              </button>
              <button
                onClick={() => navigateToSport("Cầu lông")}
                className="py-2.5 px-3 rounded-lg text-left hover:bg-gray-50 text-gray-700 transition flex items-center gap-3"
              >
                <GiShuttlecock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cầu Lông</span>
              </button>
            </div>

            {/* Navigation links */}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1 text-xs font-medium">
              <Link
                href="/products"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-emerald-600 font-bold hover:bg-gray-50 flex items-center gap-3"
              >
                <FaTag className="w-4 h-4" />
                <span>Tất Cả Sản Phẩm</span>
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaBox className="w-4 h-4 text-gray-400" /> Tra cứu đơn hàng
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaNewspaper className="w-4 h-4 text-gray-400" /> Cẩm nang thể thao
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaCircleInfo className="w-4 h-4 text-gray-400" /> Về chúng tôi
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaHeadset className="w-4 h-4 text-gray-400" /> Liên hệ hỗ trợ
              </Link>
            </div>

            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-gray-100">
              {isUserAuth ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2.5">
                    <Avatar size="sm" name={user?.fullName || "User"} className="bg-emerald-600 text-white" />
                    <div>
                      <div className="text-xs font-bold text-gray-900">{user?.fullName}</div>
                      <div className="text-[10px] text-gray-500">{user?.email}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    color="danger"
                    variant="light"
                    onPress={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-xs font-semibold"
                  >
                    Đăng xuất
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button fullWidth size="sm" className="bg-emerald-600 text-white font-semibold text-xs rounded-full">
                      Đăng Nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button fullWidth size="sm" variant="flat" className="font-semibold text-xs rounded-full">
                      Đăng Ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
