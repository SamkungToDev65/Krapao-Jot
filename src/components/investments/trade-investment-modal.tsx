"use client";

import React, { useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Coins, X } from "lucide-react";
import { Account, InvestmentHolding, InvestmentTradeType } from "@/lib/types";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";
import { formatCurrency } from "@/lib/utils";
import { PlatformBadgeIcon } from "./investment-presets";

interface TradeInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: InvestmentHolding | null;
  accounts: Account[];
  onRecordTrade: (
    holdingId: string,
    trade: {
      type: InvestmentTradeType;
      units: number;
      pricePerUnit: number;
      date: string;
      fromAccountId?: string;
      note?: string;
    },
    syncAccount: boolean
  ) => void;
}

export function TradeInvestmentModal({
  isOpen,
  onClose,
  holding,
  accounts,
  onRecordTrade,
}: TradeInvestmentModalProps) {
  const [tradeType, setTradeType] = useState<InvestmentTradeType>("buy");
  const [units, setUnits] = useState("");
  const [pricePerUnit, setPricePerUnit] = useState(
    holding?.currentPrice ? String(holding.currentPrice) : ""
  );
  const [tradeDate, setTradeDate] = useState(new Date().toISOString().split("T")[0]);
  const [syncAccount, setSyncAccount] = useState(false);
  const [accountId, setAccountId] = useState(accounts[0]?.id || "");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen || !holding) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const numUnits = parseFloat(units);
    if (isNaN(numUnits) || numUnits <= 0) {
      newErrors.units = "กรุณาระบุจำนวนหน่วยที่ถูกต้อง";
    } else if (tradeType === "sell" && numUnits > holding.units) {
      newErrors.units = `ไม่สามารถขายเกินจำนวนที่ถือครองได้ (${holding.units} หน่วย)`;
    }

    const numPrice = parseFloat(pricePerUnit);
    if (isNaN(numPrice) || numPrice <= 0) {
      newErrors.pricePerUnit = "กรุณาระบุราคาต่อหน่วย";
    }

    if (!tradeDate) {
      newErrors.tradeDate = "กรุณาระบุวันที่ทำรายการ";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onRecordTrade(
      holding.id,
      {
        type: tradeType,
        units: numUnits,
        pricePerUnit: numPrice,
        date: tradeDate,
        fromAccountId: syncAccount ? accountId : undefined,
        note: note.trim() || undefined,
      },
      syncAccount
    );

    // Reset and close
    setUnits("");
    setNote("");
    setErrors({});
    onClose();
  };

  const calculatedTotal = (parseFloat(units) || 0) * (parseFloat(pricePerUnit) || 0);
  const exchangeRate = holding.currency === "USD" ? Number(holding.exchangeRate) || 35.5 : 1;
  const thbTotal = calculatedTotal * exchangeRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <PlatformBadgeIcon platform={holding.platform} size={28} className="rounded-lg shadow-2xs" />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-[var(--fg-primary)] tracking-tight">
                  บันทึกรายการ {holding.symbol}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[var(--fg-muted)] border border-[var(--border-subtle)]">
                  {holding.platformName || holding.platform}
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)]">
                ถือครองปัจจุบัน {holding.units} หน่วย • ต้นทุนเฉลี่ย {holding.avgBuyPrice} {holding.currency}
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
          {/* Trade Type Switch */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setTradeType("buy")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer outline-none focus:outline-none ${
                tradeType === "buy"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
              }`}
            >
              <ArrowDownLeft size={16} />
              <span>ซื้อเพิ่ม / DCA (Buy)</span>
            </button>
            <button
              type="button"
              onClick={() => setTradeType("sell")}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer outline-none focus:outline-none ${
                tradeType === "sell"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
              }`}
            >
              <ArrowUpRight size={16} />
              <span>ขายออก / Take Profit (Sell)</span>
            </button>
          </div>

          {/* Units & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                จำนวนหน่วยที่จะ{tradeType === "buy" ? "ซื้อ" : "ขาย"} <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={units}
                onChange={(e) => {
                  setUnits(e.target.value);
                  if (errors.units) setErrors({ ...errors, units: "" });
                }}
                placeholder={`เช่น 1, 0.5 (ถืออยู่ ${holding.units})`}
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
                ราคาต่อหน่วยที่ทำรายการ ({holding.currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={pricePerUnit}
                onChange={(e) => {
                  setPricePerUnit(e.target.value);
                  if (errors.pricePerUnit) setErrors({ ...errors, pricePerUnit: "" });
                }}
                placeholder={String(holding.currentPrice || holding.avgBuyPrice)}
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                  errors.pricePerUnit
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.pricePerUnit && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.pricePerUnit}</p>
              )}
            </div>
          </div>

          {/* Trade Amount Calculation Summary */}
          {calculatedTotal > 0 && (
            <div className="p-3.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[var(--fg-muted)]">
                  มูลค่ารายการ ({tradeType === "buy" ? "ยอดเงินที่ต้องจ่าย" : "ยอดเงินที่ได้รับ"})
                </span>
                <p className="text-sm font-extrabold text-[var(--fg-primary)]">
                  {calculatedTotal.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
                  {holding.currency}
                </p>
              </div>
              {holding.currency === "USD" && (
                <div className="text-right">
                  <span className="text-[11px] text-[var(--fg-muted)]">แปลงเป็นเงินบาท (~35.5)</span>
                  <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(thbTotal)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Trade Date */}
          <div>
            <ThaiDatePicker
              value={tradeDate}
              onChange={(d) => setTradeDate(d)}
              label="วันที่ทำรายการ *"
              error={errors.tradeDate}
            />
          </div>

          {/* Sync Account Checkbox */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={syncAccount}
                onChange={(e) => setSyncAccount(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer outline-none"
              />
              <span className="text-xs font-semibold text-[var(--fg-primary)]">
                {tradeType === "buy"
                  ? "ตัดยอดเงินออกจากกระเป๋า/บัญชีธนาคารในระบบ"
                  : "นำเงินจากการขายเข้ากระเป๋า/บัญชีธนาคารในระบบ"}
              </span>
            </label>

            {syncAccount && (
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                  เลือกบัญชี
                </label>
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-[var(--bg-canvas)] text-xs font-medium text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (คงเหลือ ฿{acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              บันทึกช่วยจำ
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น DCA รายเดือน, ขายทำกำไรเป้าหมายแรก"
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
              className={`px-5 py-2.5 rounded-xl active:scale-95 text-white font-bold text-xs shadow-md transition-all cursor-pointer outline-none focus:outline-none ${
                tradeType === "buy"
                  ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20"
                  : "bg-rose-600 hover:bg-rose-500 shadow-rose-600/20"
              }`}
            >
              {tradeType === "buy" ? "บันทึกการซื้อ (Buy)" : "บันทึกการขาย (Sell)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
