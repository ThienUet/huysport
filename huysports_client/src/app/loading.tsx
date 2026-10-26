import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
      {/* SportX Glowing Animated Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse wave */}
        <div className="absolute w-20 h-20 rounded-full bg-emerald-500/15 animate-ping" />
        
        {/* Spinning track ring */}
        <div className="w-16 h-16 rounded-full border-3 border-emerald-100 border-t-emerald-600 animate-spin" />

        {/* Center SportX icon badge */}
        <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center shadow-md">
          <span className="text-white font-black text-sm tracking-tight italic">
            SX<span className="text-emerald-400">.</span>
          </span>
        </div>
      </div>

      {/* Loading text and subtitle */}
      <div className="text-center space-y-1">
        <h3 className="text-sm font-bold text-slate-800 tracking-wide">
          Đang tải dữ liệu...
        </h3>
        <p className="text-xs text-slate-400 font-medium animate-pulse">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}
