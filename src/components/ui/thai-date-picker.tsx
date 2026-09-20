"use client";

import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import { Thai } from "flatpickr/dist/l10n/th.js";
import { Calendar } from "lucide-react";
import "flatpickr/dist/flatpickr.min.css";

export interface ThaiDatePickerProps {
  value: string; // ISO "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  error?: string;
  showBuddhistEra?: boolean;
  showShortcuts?: boolean;
  accentColor?: "emerald" | "rose";
  className?: string;
}

export function ThaiDatePicker({
  value,
  onChange,
  label,
  placeholder = "เลือกวันที่",
  minDate,
  maxDate,
  disabled = false,
  error,
  showBuddhistEra = true,
  accentColor = "emerald",
  className = "",
}: ThaiDatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const fpInstanceRef = useRef<flatpickr.Instance | null>(null);

  const isRose = accentColor === "rose";

  useEffect(() => {
    if (!inputRef.current) return;

    const activeBorderClass = isRose
      ? "hover:border-rose-400 dark:hover:border-rose-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
      : "hover:border-emerald-400 dark:hover:border-emerald-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";

    // Initialize flatpickr with strict Thai specification and disableMobile: true
    const instance = flatpickr(inputRef.current, {
      locale: Thai,
      dateFormat: "Y-m-d",
      altInput: true,
      altFormat: "j F Y",
      altInputClass: `w-full h-11 py-2.5 pl-10 pr-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-medium text-[var(--fg-primary)] border outline-none focus:outline-none transition-all cursor-pointer select-none shadow-2xs ${
        error
          ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
          : `border-[var(--border-subtle)] ${activeBorderClass}`
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`,
      disableMobile: true,
      static: true,
      defaultDate: value || undefined,
      minDate: minDate || undefined,
      maxDate: maxDate || undefined,
      prevArrow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>`,
      nextArrow: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`,
      formatDate: (dateObj: Date, formatStr: string) => {
        if (showBuddhistEra && (formatStr === "j F Y" || formatStr === "altFormat")) {
          const day = dateObj.getDate();
          const month = Thai.months.longhand[dateObj.getMonth()];
          const yearBE = dateObj.getFullYear() + 543;
          return `${day} ${month} ${yearBE}`;
        }
        return flatpickr.formatDate(dateObj, formatStr);
      },
      parseDate: (dateStr: string, formatStr: string) => {
        if (typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          const [y, m, d] = dateStr.split("-").map(Number);
          return new Date(y, m - 1, d);
        }
        return flatpickr.parseDate(dateStr, formatStr) as Date;
      },
      onChange: (_selectedDates, dateStr) => {
        if (dateStr) {
          onChange(dateStr);
        }
      },
    });

    fpInstanceRef.current = instance;

    return () => {
      instance.destroy();
    };
  }, [error, disabled, minDate, maxDate, showBuddhistEra, isRose]);

  // Sync external value changes to flatpickr
  useEffect(() => {
    if (fpInstanceRef.current && value) {
      if (fpInstanceRef.current.input.value !== value) {
        fpInstanceRef.current.setDate(value, false);
      }
    }
  }, [value]);

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-[var(--fg-primary)]">
          {label}
        </label>
      )}

      <div className="relative w-full group">
        <div
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 ${
            isRose ? "group-focus-within:text-rose-500" : "group-focus-within:text-emerald-500"
          } pointer-events-none z-10 transition-colors`}
        >
          <Calendar className="w-4 h-4" />
        </div>
        <input
          ref={inputRef}
          defaultValue={value}
          placeholder={placeholder}
          disabled={disabled}
          style={{ display: "none" }}
        />
      </div>

      {error && (
        <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
          {error}
        </p>
      )}
    </div>
  );
}
