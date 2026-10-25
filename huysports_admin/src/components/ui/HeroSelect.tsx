import React from "react";
import { Select, ListBox } from "@heroui/react";
import { ChevronDown, Check } from "lucide-react";

export interface HeroSelectOption {
  key: string;
  label: React.ReactNode;
  textValue?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface HeroSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: HeroSelectOption[];
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  icon?: React.ReactNode;
  "aria-label"?: string;
  isDisabled?: boolean;
  size?: "sm" | "md";
}

export function HeroSelect({
  value,
  onChange,
  options,
  placeholder = "Chọn...",
  className = "",
  triggerClassName = "",
  popoverClassName = "",
  icon,
  "aria-label": ariaLabel,
  isDisabled = false,
  size = "md",
}: HeroSelectProps) {
  const currentOption = options.find((opt) => opt.key === value);

  return (
    <div className={`relative inline-block min-w-fit ${className}`}>
      <Select
        selectedKey={value || undefined}
        onSelectionChange={(key) => {
          if (key !== null && key !== undefined) {
            onChange(String(key));
          }
        }}
        isDisabled={isDisabled}
        aria-label={ariaLabel || placeholder}
        className="w-full"
      >
        <Select.Trigger
          className={`w-full flex items-center justify-between gap-2 text-left rounded-xl border border-slate-200 bg-white font-bold text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50/50 transition cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${
            size === "sm"
              ? "!px-3 text-xs h-9"
              : "!px-3.5 text-xs h-10"
          } ${triggerClassName}`}
        >
          <div className="flex items-center gap-1.5 truncate flex-1 min-w-0 pr-1">
            {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
            <Select.Value className="truncate font-bold text-slate-700 block min-w-0">
              {() => (
                <span className="flex items-center gap-1.5 truncate">
                  {currentOption?.icon && (
                    <span className="shrink-0">{currentOption.icon}</span>
                  )}
                  <span className="truncate">
                    {currentOption ? currentOption.label : placeholder}
                  </span>
                </span>
              )}
            </Select.Value>
          </div>
          <Select.Indicator className="!static !inset-auto !m-0 !p-0 shrink-0 text-slate-400 transition-transform duration-200 pointer-events-none flex items-center justify-center">
            <ChevronDown className={`${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} stroke-[2.2]`} />
          </Select.Indicator>
        </Select.Trigger>

        <Select.Popover
          className={`z-50 min-w-[180px] bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100 ${popoverClassName}`}
        >
          <ListBox className="space-y-0.5 focus:outline-none">
            {options.map((opt) => {
              const isSelected = opt.key === value;
              return (
                <ListBox.Item
                  key={opt.key}
                  id={opt.key}
                  textValue={opt.textValue || (typeof opt.label === "string" ? opt.label : opt.key)}
                  className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition select-none ${
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-bold"
                      : "text-slate-700 hover:bg-slate-100/80 hover:text-slate-900"
                  } ${opt.disabled ? "opacity-40 cursor-not-allowed pointer-events-none" : ""}`}
                >
                  <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1.5" />
                  )}
                </ListBox.Item>
              );
            })}
          </ListBox>
        </Select.Popover>
      </Select>
    </div>
  );
}
