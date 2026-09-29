import React from "react";
import { create } from "zustand";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration || 3500;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  success: (title, message) => get().showToast({ type: "success", title, message }),
  error: (title, message) => get().showToast({ type: "error", title, message }),
  info: (title, message) => get().showToast({ type: "info", title, message }),
  warning: (title, message) => get().showToast({ type: "warning", title, message }),
}));

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = "bg-white border-slate-200 text-slate-800";
        let icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;

        if (toast.type === "success") {
          bg = "bg-emerald-50/95 border-emerald-200 text-emerald-950";
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
        } else if (toast.type === "error") {
          bg = "bg-rose-50/95 border-rose-200 text-rose-950";
          icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
        } else if (toast.type === "warning") {
          bg = "bg-amber-50/95 border-amber-200 text-amber-950";
          icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-xl border flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${bg}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold leading-snug">{toast.title}</div>
              {toast.message && (
                <div className="text-[11px] opacity-80 mt-0.5 leading-relaxed">{toast.message}</div>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:opacity-70 rounded-lg shrink-0"
            >
              <X className="w-3.5 h-3.5 opacity-50" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
