import React from "react";
import { Dropdown } from "@heroui/react";

export interface HeroDropdownItem {
  key: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "default" | "danger";
  disabled?: boolean;
}

export interface HeroDropdownProps {
  trigger: React.ReactNode;
  items: HeroDropdownItem[];
  onAction: (key: string) => void;
  title?: string;
  className?: string;
  popoverClassName?: string;
  placement?: "bottom" | "bottom start" | "bottom end" | "top" | "top start" | "top end";
  "aria-label"?: string;
}

export function HeroDropdown({
  trigger,
  items,
  onAction,
  title,
  className = "",
  popoverClassName = "",
  placement = "bottom end",
  "aria-label": ariaLabel,
}: HeroDropdownProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <Dropdown>
        <Dropdown.Trigger className="focus:outline-none">
          {trigger}
        </Dropdown.Trigger>
        <Dropdown.Popover
          placement={placement}
          className={`z-50 min-w-[200px] bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${popoverClassName}`}
        >
          {title && (
            <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider select-none">
              {title}
            </div>
          )}
          <Dropdown.Menu
            aria-label={ariaLabel || title || "Menu"}
            onAction={(key) => onAction(String(key))}
            className="space-y-0.5 focus:outline-none"
          >
            {items.map((item) => (
              <Dropdown.Item
                key={item.key}
                id={item.key}
                textValue={typeof item.label === "string" ? item.label : item.key}
                className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-xl transition cursor-pointer select-none ${
                  item.variant === "danger"
                    ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                    : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                } ${item.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </div>
  );
}
