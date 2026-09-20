"use client";

import React, { useState } from "react";
import { TrendingUp, X, DollarSign } from "lucide-react";
import { Account, InvestmentAssetType, InvestmentHolding, InvestmentPlatform } from "@/lib/types";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";
import { INVESTMENT_PLATFORMS, ASSET_TYPE_CONFIG, PlatformBadgeIcon } from "./investment-presets";

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddHolding: (
    data: Omit<InvestmentHolding, "id" | "updatedAt">,
    deductAccount: boolean,
    accountId?: string
  ) => void;
}

export function AddInvestmentModal({
  isOpen,
  onClose,
  accounts,
  onAddHolding,
}: AddInvestmentModalProps) {
  const [platform, setPlatform] = useState<InvestmentPlatform>("dime");
  const [assetType, setAssetType] = useState<InvestmentAssetType>("us_stock");
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [units, setUnits] = useState("");
  const [avgBuyPrice, setAvgBuyPrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [currency, setCurrency] = useState<"THB" | "USD">("USD");
  const [exchangeRate, setExchangeRate] = useState("35.5");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [fromAccountId, setFromAccountId] = useState(accounts[0]?.id || "");
  const [deductAccount, setDeductAccount] = useState(false);
  const [note, setNote] = useState("");

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handlePlatformChange = (pId: InvestmentPlatform) => {
    setPlatform(pId);
    const found = INVESTMENT_PLATFORMS.find((p) => p.id === pId);
    if (found) {
      setCurrency(found.defaultCurrency);
      if (found.supportedAssets.length > 0 && !found.supportedAssets.includes(assetType)) {
        setAssetType(found.supportedAssets[0]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!symbol.trim()) {
      newErrors.symbol = "กรุณาระบุสัญลักษณ์หรือชื่อย่อ (เช่น NVDA, BTC, VOO)";
    }
    if (!name.trim()) {
      newErrors.name = "กรุณาระบุชื่อสินทรัพย์";
    }

    const numUnits = parseFloat(units);
    if (isNaN(numUnits) || numUnits <= 0) {
      newErrors.units = "กรุณาระบุจำนวนหน่วยที่มากกว่า 0";
    }

    const numBuyPrice = parseFloat(avgBuyPrice);
    if (isNaN(numBuyPrice) || numBuyPrice <= 0) {
      newErrors.avgBuyPrice = "กรุณาระบุราคาต้นทุนเฉลี่ย";
    }

    const numCurrentPrice = currentPrice.trim() ? parseFloat(currentPrice) : numBuyPrice;
    if (isNaN(numCurrentPrice) || numCurrentPrice < 0) {
      newErrors.currentPrice = "ราคาตลาดต้องเป็นตัวเลขที่ถูกต้อง";
    }

    const numRate = parseFloat(exchangeRate);
    if (currency === "USD" && (isNaN(numRate) || numRate <= 0)) {
      newErrors.exchangeRate = "กรุณาระบุอัตราแลกเปลี่ยน USD/THB";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const platformPreset = INVESTMENT_PLATFORMS.find((p) => p.id === platform);

    onAddHolding(
      {
        symbol: symbol.trim().toUpperCase(),
        name: name.trim(),
        platform,
        platformName: platformPreset?.name || platform,
        assetType,
        units: numUnits,
        avgBuyPrice: numBuyPrice,
        currentPrice: numCurrentPrice,
        currency,
        exchangeRate: currency === "USD" ? numRate : 1,
        note: note.trim() || undefined,
      },
      deductAccount,
      fromAccountId || undefined
    );

    setSymbol("");
    setName("");
    setUnits("");
    setAvgBuyPrice("");
    setCurrentPrice("");
    setNote("");
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--fg-primary)]">
                เพิ่มสินทรัพย์เข้าพอร์ต
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                Dime, Binance, Bitkub, InnovestX หรือพอร์ตลงทุนอื่นๆ
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
          {/* 1. Platform Selection */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
              แพลตฟอร์ม / โบรกเกอร์ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {INVESTMENT_PLATFORMS.map((p) => {
                const isSelected = platform === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePlatformChange(p.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-center cursor-pointer outline-none focus:outline-none ${isSelected
                        ? "border-emerald-500 bg-emerald-500/10 text-[var(--fg-primary)] ring-1 ring-emerald-500/30"
                        : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                  >
                    <PlatformBadgeIcon platform={p.id} size={24} className="mb-1 rounded-md" />
                    <span className="text-[11px] font-bold truncate max-w-full">
                      {p.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Asset Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
              ประเภทสินทรัพย์ <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(ASSET_TYPE_CONFIG) as InvestmentAssetType[]).map((typeKey) => {
                const conf = ASSET_TYPE_CONFIG[typeKey];
                const isSelected = assetType === typeKey;
                return (
                  <button
                    key={typeKey}
                    type="button"
                    onClick={() => setAssetType(typeKey)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 outline-none focus:outline-none ${isSelected
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-[var(--bg-canvas)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)]"
                      }`}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: isSelected ? "#FFFFFF" : conf.dotColor }}
                    />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Symbol & Asset Name */}
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
                placeholder="เช่น NVDA, BTC, VOO, PTT"
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-bold text-[var(--fg-primary)] border uppercase outline-none focus:outline-none transition-all ${errors.symbol
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
                ชื่อสินทรัพย์ / บริษัท <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: "" });
                }}
                placeholder="เช่น Nvidia, Bitcoin, Vanguard S&P 500"
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${errors.name
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.name}</p>
              )}
            </div>
          </div>

          {/* 4. Units & Buy Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                จำนวนหน่วยที่ถือ (Units / Shares) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={units}
                onChange={(e) => {
                  setUnits(e.target.value);
                  if (errors.units) setErrors({ ...errors, units: "" });
                }}
                placeholder="เช่น 10, 0.05, 1.25"
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${errors.units
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
                ราคาต้นทุนเฉลี่ยต่อหน่วย ({currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={avgBuyPrice}
                onChange={(e) => {
                  setAvgBuyPrice(e.target.value);
                  if (!currentPrice) setCurrentPrice(e.target.value);
                  if (errors.avgBuyPrice) setErrors({ ...errors, avgBuyPrice: "" });
                }}
                placeholder="0.00"
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${errors.avgBuyPrice
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
              />
              {errors.avgBuyPrice && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.avgBuyPrice}</p>
              )}
            </div>
          </div>

          {/* 5. Current Price & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                ราคาตลาดปัจจุบัน ({currency})
              </label>
              <input
                type="number"
                step="any"
                value={currentPrice}
                onChange={(e) => {
                  setCurrentPrice(e.target.value);
                  if (errors.currentPrice) setErrors({ ...errors, currentPrice: "" });
                }}
                placeholder="หากเว้นว่างจะใช้ราคาต้นทุน"
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${errors.currentPrice
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
              />
              {errors.currentPrice && (
                <p className="text-xs text-rose-500 mt-1 font-medium">{errors.currentPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                สกุลเงินที่เทรด
              </label>
              <div className="grid grid-cols-2 gap-2 h-10">
                <button
                  type="button"
                  onClick={() => setCurrency("THB")}
                  className={`rounded-xl border font-bold text-xs transition-all cursor-pointer outline-none focus:outline-none ${currency === "THB"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
                    }`}
                >
                  THB (บาทไทย)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`rounded-xl border font-bold text-xs transition-all cursor-pointer outline-none focus:outline-none ${currency === "USD"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
                    }`}
                >
                  USD (ดอลลาร์)
                </button>
              </div>
            </div>
          </div>

          {/* 6. Exchange Rate if USD */}
          {currency === "USD" && (
            <div className="p-3 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-blue-500" />
                <span className="text-xs font-semibold text-[var(--fg-primary)]">
                  อัตราแลกเปลี่ยน USD เป็น THB
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--fg-muted)] font-mono">1 USD =</span>
                <input
                  type="number"
                  step="0.01"
                  value={exchangeRate}
                  onChange={(e) => setExchangeRate(e.target.value)}
                  className="w-24 h-9 px-2.5 rounded-lg bg-[var(--bg-surface)] text-xs font-bold text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 text-center"
                />
                <span className="text-xs text-[var(--fg-muted)]">บาท</span>
              </div>
            </div>
          )}

          {/* 7. Purchase Date */}
          <div>
            <ThaiDatePicker
              value={purchaseDate}
              onChange={(d) => setPurchaseDate(d)}
              label="วันที่เริ่มซื้อสินทรัพย์"
            />
          </div>

          {/* 8. Deduct Account Checkbox */}
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={deductAccount}
                onChange={(e) => setDeductAccount(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer outline-none"
              />
              <span className="text-xs font-semibold text-[var(--fg-primary)]">
                ตัดยอดเงินต้นออกจากบัญชีธนาคารจริงใน Krapao Jot
              </span>
            </label>

            {deductAccount && (
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                  เลือกบัญชีที่จะตัดเงิน
                </label>
                <select
                  value={fromAccountId}
                  onChange={(e) => setFromAccountId(e.target.value)}
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

          {/* 9. Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              บันทึกช่วยจำ (Note)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="เช่น DCA ออมระยะยาว 5 ปี, สภาพคล่องสูง"
              className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Footer Actions */}
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
              บันทึกเข้าพอร์ต
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}