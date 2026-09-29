import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore, UserRole } from "@/store/useAuthStore";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, user, hasRole } = useAuthStore();

  if (!isAuthenticated || !user) {
    // Redirect to login page preserving attempted destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Truy cập bị giới hạn</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tài khoản của bạn có vai trò <strong className="text-slate-800 uppercase font-bold">{user.role}</strong> không có đủ quyền hạn để truy cập vào phân khu này. Vui lòng liên hệ Quản trị viên tối cao (Super Admin).
          </p>
          <div className="pt-2">
            <a
              href="/"
              className="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition"
            >
              Trở về Trang Tổng Quan
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
