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
  FaFire,
  FaTruckFast,
  FaHeadset,
  FaArrowRight,
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

  // Sync local search when store changes
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

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

  const handleAllProducts = () => {
    setSport("all");
    router.push("/products");
    setIsMobileMenuOpen(false);
  };

  const cartCount = isMounted ? getItemCount() : 0;
  const isUserAuth = isMounted && isAuthenticated && user;

  const sportsList = [
    {
      name: "Bóng đá",
      label: "Bóng Đá",
      desc: "Giày đinh sân cỏ, áo thi đấu, tất vớ",
      icon: FaFutbol,
      bgColor: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "Chạy bộ",
      label: "Chạy Bộ",
      desc: "Giày running êm ái, áo quần thoáng khí",
      icon: FaPersonRunning,
      bgColor: "bg-blue-50 text-blue-600",
    },
    {
      name: "Gym / Fitness",
      label: "Gym & Fitness",
      desc: "Đồ tập co giãn 4 chiều, găng tay, tạ tay",
      icon: FaDumbbell,
      bgColor: "bg-amber-50 text-amber-600",
    },
    {
      name: "Cầu lông",
      label: "Cầu Lông",
      desc: "Vợt chuyên nghiệp, giày bám thảm, balo",
      icon: GiShuttlecock,
      bgColor: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <>
      {/* 1. Top Utility Banner Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-2 px-4 border-b border-slate-800 select-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left Promo Badges */}
          <div className="flex items-center gap-3 text-[11px] sm:text-xs">
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <FaTruckFast className="w-3.5 h-3.5" />
              <span>Freeship đơn từ 500K</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-slate-300">
              Giảm 10% đơn đầu tiên với mã <strong className="text-white font-bold">SPORTX10</strong>
            </span>
            <span className="text-slate-700 hidden md:inline">•</span>
            <span className="hidden md:inline text-slate-400">Đổi trả linh hoạt trong 7 ngày</span>
          </div>

          {/* Right Quick Support Contact */}
          <div className="flex items-center gap-4 text-[11px]">
            <a
              href="tel:0398802022"
              className="hover:text-white transition-colors flex items-center gap-1.5 text-slate-300 font-medium"
              title="Gọi hotline hỗ trợ"
            >
              <FaPhone className="w-3 h-3 text-emerald-400" />
              <span>Hotline: <strong className="text-white font-semibold">0398.802.022</strong></span>
            </a>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <FaHeadset className="w-3 h-3 text-emerald-400" />
              <span>Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <img
                src="/logo-256.png"
                alt="HuySport Logo"
                className="w-10 h-10 object-contain rounded-full shadow-xs group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <div className="flex items-baseline leading-none">
                  <span className="text-lg font-black tracking-tight text-gray-900">HUY</span>
                  <span className="text-lg font-black tracking-tight text-emerald-600">SPORT</span>
                </div>
                <span className="text-[9px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">
                  Đồ Thể Thao
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links (Scientific & Clean) */}
            <nav className="hidden lg:flex items-center gap-1 text-[13.5px] font-semibold text-gray-700">
              {/* Trang Chủ */}
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/"
                    ? "text-emerald-600 font-bold bg-emerald-50/70"
                    : "hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                Trang Chủ
              </Link>

              {/* Dropdown Môn Thể Thao (Grouped cleanly) */}
              <Dropdown placement="bottom-start" className="min-w-[300px]">
                <DropdownTrigger>
                  <button
                    type="button"
                    aria-label="Danh mục môn thể thao"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-700 hover:text-emerald-600 hover:bg-gray-50 transition-colors cursor-pointer group focus:outline-none"
                  >
                    <span>Môn Thể Thao</span>
                    <FaChevronDown className="w-2.5 h-2.5 text-gray-400 group-hover:text-emerald-600 transition-transform group-aria-expanded:rotate-180" />
                  </button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Danh sách môn thể thao"
                  onAction={(key) => {
                    if (key === "all") {
                      handleAllProducts();
                    } else {
                      navigateToSport(key as string);
                    }
                  }}
                  className="p-1.5"
                >
                  <DropdownItem
                    key="Bóng đá"
                    textValue="Bóng Đá"
                    startContent={
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600">
                        <FaFutbol className="w-4 h-4" />
                      </div>
                    }
                    description="Giày đinh sân cỏ, áo thi đấu, tất vớ"
                    className="py-2"
                  >
                    <span className="font-bold text-gray-800 text-xs">Bóng Đá</span>
                  </DropdownItem>

                  <DropdownItem
                    key="Chạy bộ"
                    textValue="Chạy Bộ"
                    startContent={
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 text-blue-600">
                        <FaPersonRunning className="w-4 h-4" />
                      </div>
                    }
                    description="Giày running êm ái, áo quần thoáng khí"
                    className="py-2"
                  >
                    <span className="font-bold text-gray-800 text-xs">Chạy Bộ</span>
                  </DropdownItem>

                  <DropdownItem
                    key="Gym / Fitness"
                    textValue="Gym & Fitness"
                    startContent={
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-amber-50 text-amber-600">
                        <FaDumbbell className="w-4 h-4" />
                      </div>
                    }
                    description="Đồ tập co giãn 4 chiều, găng tay, tạ tay"
                    className="py-2"
                  >
                    <span className="font-bold text-gray-800 text-xs">Gym & Fitness</span>
                  </DropdownItem>

                  <DropdownItem
                    key="Cầu lông"
                    textValue="Cầu Lông"
                    startContent={
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-purple-50 text-purple-600">
                        <GiShuttlecock className="w-4 h-4" />
                      </div>
                    }
                    description="Vợt chuyên nghiệp, giày bám thảm, balo"
                    className="py-2"
                  >
                    <span className="font-bold text-gray-800 text-xs">Cầu Lông</span>
                  </DropdownItem>

                  <DropdownItem
                    key="all"
                    textValue="Xem tất cả môn thể thao"
                    className="border-t border-gray-100 mt-1 pt-2.5"
                    startContent={
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-700 flex items-center justify-center shrink-0">
                        <FaTag className="w-3.5 h-3.5" />
                      </div>
                    }
                    description="Xem tất cả trang phục & dụng cụ thể thao"
                  >
                    <span className="font-bold text-emerald-600 text-xs flex items-center gap-1.5">
                      Xem tất cả môn thể thao <FaArrowRight className="w-2.5 h-2.5" />
                    </span>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>

              {/* Tất Cả Sản Phẩm */}
              <Link
                href="/products"
                onClick={() => setSport("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/products"
                    ? "text-emerald-600 font-bold bg-emerald-50/70"
                    : "hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                Sản Phẩm
              </Link>

              {/* Khuyến Mãi Hot */}
              <Link
                href="/products"
                onClick={() => setSport("all")}
                className="px-3 py-1.5 rounded-lg transition-colors hover:bg-rose-50 flex items-center gap-1.5 group"
              >
                <FaFire className="w-3.5 h-3.5 text-rose-500 group-hover:scale-110 transition-transform" />
                <span className="text-gray-700 group-hover:text-rose-600">Ưu Đãi Hot</span>
                <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  Sale
                </span>
              </Link>

              {/* Tra Cứu Đơn Hàng */}
              <Link
                href="/orders"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  pathname === "/orders"
                    ? "text-emerald-600 font-bold bg-emerald-50/70"
                    : "hover:text-emerald-600 hover:bg-gray-50"
                }`}
              >
                <FaBox className="w-3 h-3 text-gray-400" />
                <span>Tra Cứu Đơn</span>
              </Link>
            </nav>

            {/* Desktop Balanced Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative">
              <Input
                aria-label="Tìm kiếm sản phẩm"
                type="text"
                placeholder="Tìm giày, quần áo, phụ kiện..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
                endContent={
                  localSearch ? (
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSearch("");
                        setSearch("");
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                      title="Xóa tìm kiếm"
                    >
                      <FaXmark className="w-3 h-3" />
                    </button>
                  ) : null
                }
                size="sm"
                radius="full"
                classNames={{
                  inputWrapper:
                    "bg-gray-100/90 hover:bg-gray-100 focus-within:!bg-white focus-within:ring-2 focus-within:ring-emerald-500 border border-transparent focus-within:border-emerald-500 shadow-none transition-all h-9",
                  input: "text-xs",
                }}
              />
            </form>

            {/* Right Action Icons (Cart & Account) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              
              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 sm:p-2.5 rounded-full hover:bg-gray-100 text-gray-700 hover:text-emerald-600 transition flex items-center justify-center cursor-pointer group"
                aria-label="Giỏ hàng của bạn"
                title="Giỏ hàng"
              >
                <FaBagShopping className="w-5 h-5 transition-transform group-hover:scale-105" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full h-4.5 min-w-[18px] px-1 flex items-center justify-center ring-2 ring-white shadow-xs animate-in zoom-in-75 duration-150">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>

              {/* User Dropdown / Login Button */}
              {isUserAuth ? (
                <Dropdown placement="bottom-end">
                  <DropdownTrigger>
                    <button
                      type="button"
                      aria-label="Menu tài khoản cá nhân"
                      className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition cursor-pointer focus:outline-none"
                    >
                      <Avatar
                        size="sm"
                        name={user?.fullName || "User"}
                        className="bg-emerald-600 text-white font-bold text-xs w-7 h-7 shrink-0"
                      />
                      <span className="hidden sm:inline text-xs font-semibold text-gray-800 max-w-[105px] truncate">
                        {user?.fullName?.split(" ").slice(-1)[0] || user?.fullName}
                      </span>
                      <FaChevronDown className="w-2.5 h-2.5 text-gray-400 hidden sm:inline" />
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
                    <DropdownItem
                      key="account"
                      textValue="Tài khoản cá nhân"
                      startContent={<FaUserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    >
                      Tài khoản & Đơn mua
                    </DropdownItem>
                    <DropdownItem
                      key="track"
                      textValue="Tra cứu đơn hàng"
                      startContent={<FaBox className="w-3.5 h-3.5 text-blue-600" />}
                    >
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
                    className="font-semibold text-xs px-3.5 h-8.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
                    startContent={<FaUser className="w-3 h-3" />}
                  >
                    Đăng Nhập
                  </Button>
                </Link>
              )}

              {/* Mobile Hamburger Toggle */}
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-gray-700 hover:bg-gray-100 cursor-pointer transition focus:outline-none"
                aria-label="Menu"
              >
                {isMobileMenuOpen ? <FaXmark className="w-5 h-5" /> : <FaBars className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* 3. Mobile Navigation Drawer (Structured & Scientific) */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3.5 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit}>
              <Input
                aria-label="Tìm kiếm sản phẩm thể thao"
                type="text"
                placeholder="Tìm sản phẩm thể thao..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                startContent={<FaMagnifyingGlass className="w-3.5 h-3.5 text-gray-400" />}
                endContent={
                  localSearch ? (
                    <button
                      type="button"
                      onClick={() => setLocalSearch("")}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <FaXmark className="w-3 h-3" />
                    </button>
                  ) : null
                }
                size="sm"
                radius="lg"
                classNames={{
                  inputWrapper: "bg-gray-100 border-none h-10",
                  input: "text-xs",
                }}
              />
            </form>

            {/* Sport Categories Grid (Touch-friendly 2 columns) */}
            <div>
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                Môn Thể Thao
              </div>
              <div className="grid grid-cols-2 gap-2">
                {sportsList.map((sport) => {
                  const SportIcon = sport.icon;
                  return (
                    <button
                      key={sport.name}
                      onClick={() => navigateToSport(sport.name)}
                      className="p-2.5 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-emerald-50 hover:border-emerald-200 text-left transition flex items-center gap-2.5 cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${sport.bgColor}`}>
                        <SportIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs text-gray-800">{sport.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Core Navigation Links */}
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-1 text-xs font-semibold">
              <button
                type="button"
                onClick={handleAllProducts}
                className="py-2.5 px-3 rounded-lg text-emerald-600 font-bold hover:bg-emerald-50 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FaTag className="w-4 h-4" />
                  <span>Tất Cả Sản Phẩm</span>
                </div>
                <FaArrowRight className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setSport("all");
                  router.push("/products");
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-lg text-rose-600 hover:bg-rose-50 flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FaFire className="w-4 h-4 text-rose-500" />
                  <span>Ưu Đãi / Khuyến Mãi Hot</span>
                </div>
                <span className="bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                  Sale
                </span>
              </button>

              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaBox className="w-4 h-4 text-gray-400" />
                <span>Tra cứu đơn hàng</span>
              </Link>

              <a
                href="tel:0398802022"
                className="py-2.5 px-3 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                <FaPhone className="w-4 h-4 text-emerald-500" />
                <span>Hotline: 0398.802.022</span>
              </a>
            </div>

            {/* User Account / Auth Section */}
            <div className="pt-2 border-t border-gray-100">
              {isUserAuth ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
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
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/auth/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button fullWidth size="sm" className="bg-emerald-600 text-white font-semibold text-xs rounded-xl h-9">
                      Đăng Nhập
                    </Button>
                  </Link>
                  <Link href="/auth/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button fullWidth size="sm" variant="bordered" className="font-semibold text-xs rounded-xl h-9 border-gray-300">
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
