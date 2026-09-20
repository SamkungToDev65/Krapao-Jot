"use client";

import React, { useState, useEffect } from "react";
import { Edit2, X } from "lucide-react";
import { InvestmentHolding } from "@/lib/types";
import { PlatformBadgeIcon } from "./investment-presets";

interface EditInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: InvestmentHolding | null;
  onUpdateHolding: (id: string, partial: Partial<InvestmentHolding>) => void;
}

export function EditInvestmentModal({
  isOpen,
  onClose,
  holding,
  onUpdateHolding,
}: EditInvestmentModalProps) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [exchangeRate, setExchangeRate] = useState("35.5");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (holding) {
      setSymbol(holding.symbol);
      setName(holding.name);
      setUnits(String(holding.units));
      setAvgBuyPrice(String(holding.avgBuyPrice));
      setCurrentPrice(String(holding.currentPrice));
      setExchangeRate(String(holding.exchangeRate || 35.5));
      setNote(holding.note || "");
      setErrors({});
    }
  }, [holding]);

  if (!isOpen || !holding) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!symbol.trim()) newErrors.symbol = "กรุณาระบุสัญลักษณ์";
    if (!name.trim()) newErrors.name = "กรุณาระบุชื่อสินทรัพย์";

    const numUnits = parseFloat(units);
    if (isNaN(numUnits) || numUnits <= 0) newErrors.units = "กรุณาระบุจำนวนหน่วยที่มากกว่า 0";

    const numBuyPrice = parseFloat(avgBuyPrice);
    if (isNaN(numBuyPrice) || numBuyPrice <= 0) newErrors.avgBuyPrice = "กรุณาระบุราคาต้นทุน";

    const numCurrentPrice = parseFloat(currentPrice);
    if (isNaN(numCurrentPrice) || numCurrentPrice < 0) newErrors.currentPrice = "ราคาตลาดต้องมากกว่าหรือเท่ากับ 0";

    const numRate = parseFloat(exchangeRate);
    if (holding.currency === "USD" && (isNaN(numRate) || numRate <= 0)) {
      newErrors.exchangeRate = "กรุณาระบุอัตราแลกเปลี่ยน";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdateHolding(holding.id, {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      units: numUnits,
      avgBuyPrice: numBuyPrice,
      currentPrice: numCurrentPrice,
      exchangeRate: holding.currency === "USD" ? numRate : 1,
      note: note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <PlatformBadgeIcon platform={holding.platform} size={28} className="rounded-lg shadow-2xs" />
            <div>
              <h3 className="text-sm font-extrabold text-[var(--fg-primary)] tracking-tight">
                แก้ไขข้อมูลสินทรัพย์
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                {holding.symbol} • {holding.platformName || holding.platform}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer outline-none focus:outline-none"
            aria-label="ปิดหน้าต่าง"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-4 text-xs font-medium [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                สัญลักษณ์ / ตัวย่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  if (errors.symbol) setErrors({ ...errors, symbol: "" });
                }}
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-bold text-[var(--fg-primary)] border uppercase outline-none focus:outline-none transition-all ${
                  errors.symbol
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.symbol && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.symbol}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                ชื่อสินทรัพย์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                  errors.name
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                จำนวนหน่วยที่ถือ (Units) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={units}
                onChange={(e) => {
                  setUnits(e.target.value);
                  if (errors.units) setErrors({ ...errors, units: "" });
                }}
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                  errors.units
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.units && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.units}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                ต้นทุนเฉลี่ยต่อหน่วย ({holding.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={avgBuyPrice}
                onChange={(e) => {
                  setAvgBuyPrice(e.target.value);
                  if (errors.avgBuyPrice) setErrors({ ...errors, avgBuyPrice: "" });
                }}
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                  errors.avgBuyPrice
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.avgBuyPrice && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.avgBuyPrice}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                ราคาตลาดปัจจุบัน ({holding.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={currentPrice}
                onChange={(e) => {
                  setCurrentPrice(e.target.value);
                  if (errors.currentPrice) setErrors({ ...errors, currentPrice: "" });
                }}
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                  errors.currentPrice
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.currentPrice && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.currentPrice}</p>
              )}
            </div>

            {holding.currency === "USD" && (
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                  อัตราแลกเปลี่ยน (บาท/USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              บันทึกช่วยจำ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="หมายเหตุเพิ่มเติม"
              className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer outline-none focus:outline-none"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
