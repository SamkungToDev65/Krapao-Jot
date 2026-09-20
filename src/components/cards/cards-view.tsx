"use client";

import React, { useState } from "react";
import { 
  CreditCard as CardIcon, 
  Plus, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Wallet, 
  X,
  Sparkles,
  ArrowRight,
  Building2,
  Hash,
  Clock,
  Trash2,
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  UploadCloud,
  Check
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { formatCurrency, getDaysUntil } from "@/lib/utils";
import { CreditCard } from "@/lib/types";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";
import { 
  POPULAR_BANKS, 
  POPULAR_CREDIT_CARDS, 
  QUICK_LIMIT_PRESETS, 
  findCardPreset, 
  PopularCreditCardPreset 
} from "@/lib/credit-card-presets";

const DAYS_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1);

/**
 * High-Precision Metallic & FinTech Credit Card Mockup Component
 */
export function CreditCardMockup({
  bank,
  name,
  lastFourDigits,
  preset,
  customColor,
  creditLimit,
  statementDay,
  dueDay,
  className = "",
}: {
  bank: string;
  name: string;
  lastFourDigits: string;
  preset?: PopularCreditCardPreset;
  customColor?: string;
  creditLimit?: number;
  statementDay?: number;
  dueDay?: number;
  className?: string;
}) {
  const activePreset = preset || findCardPreset(name, bank);
  const gradient = activePreset?.gradient || `linear-gradient(135deg, ${customColor || "#1E293B"} 0%, #090D16 100%)`;
  const isSilver = activePreset?.styleCategory === "silver";
  const isGold = activePreset?.styleCategory === "gold";
  const textColor = isSilver || isGold ? "text-slate-900" : "text-white";
  const network = activePreset?.network || "visa";

  return (
    <div
      className={`rounded-2xl p-5 relative shadow-xl overflow-hidden transition-all select-none border border-white/10 ${className}`}
      style={{ background: gradient }}
    >
      {/* Metallic Brushed / Gloss Shimmer Effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/15 via-transparent to-black/20 pointer-events-none" />
      {isSilver && (
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform rotate-45 pointer-events-none opacity-60" />
      )}
      {activePreset?.accentColor && activePreset.accentColor !== "#FFFFFF" && (
        <div
          className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full blur-2xl opacity-40 pointer-events-none"
          style={{ backgroundColor: activePreset.accentColor }}
        />
      )}

      {/* Top row: Bank name & EMV Chip */}
      <div className="flex items-center justify-between relative z-10 mb-6">
        <div>
          <span className={`text-[11px] font-black uppercase tracking-widest ${textColor} opacity-90 drop-shadow-xs`}>
            {bank || "KRAPAO JOT"}
          </span>
          {activePreset?.mood && (
            <p className={`text-[9px] font-medium ${textColor} opacity-65 tracking-tight`}>
              {activePreset.mood.split("&")[0]}
            </p>
          )}
        </div>

        {/* Realistic EMV Smart Chip */}
        <div className="w-10 h-7 rounded-md bg-gradient-to-br from-[#F6D365] via-[#E2B857] to-[#B88728] border border-amber-200/60 flex items-center justify-center shadow-md relative overflow-hidden">
          <div className="w-8 h-5 border border-amber-900/35 rounded-xs grid grid-cols-2 gap-0.5 p-0.5">
            <div className="border-r border-b border-amber-900/30" />
            <div className="border-b border-amber-900/30" />
            <div className="border-r border-amber-900/30" />
            <div className="" />
          </div>
          {/* Contactless waves symbol on chip */}
          <div className="absolute right-1 bottom-1 text-[8px] opacity-40 font-mono">))</div>
        </div>
      </div>

      {/* Center: Card Name & Digits */}
      <div className="relative z-10 space-y-1 mb-6">
        <p className={`text-sm font-bold tracking-wide truncate ${textColor} drop-shadow-xs`}>
          {name || "Credit Card"}
        </p>
        <p className={`text-base font-mono tracking-widest font-semibold ${textColor} opacity-95 drop-shadow-xs`}>
          •••• •••• •••• {lastFourDigits ? lastFourDigits.slice(-4) : "8849"}
        </p>
      </div>

      {/* Bottom row: Cycle / Limit badges & Network Logo */}
      <div className="flex items-end justify-between relative z-10 pt-1">
        <div className="space-y-0.5">
          {statementDay && dueDay && (
            <span className={`text-[10px] font-medium block ${textColor} opacity-80`}>
              ตัดรอบ {statementDay} • จ่าย {dueDay}
            </span>
          )}
          {creditLimit !== undefined && (
            <span className={`text-[11px] font-bold block ${textColor} opacity-95`}>
              วงเงิน {formatCurrency(creditLimit)}
            </span>
          )}
        </div>

        {/* Network Logo Badge */}
        <div className="flex items-center">
          {network === "mastercard" && (
            <div className="flex -space-x-2.5 items-center drop-shadow-md">
              <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-95" />
              <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-90" />
            </div>
          )}
          {network === "visa" && (
            <span className={`font-black italic text-base tracking-wider ${isSilver || isGold ? "text-[#1A1F71]" : "text-white"} font-serif drop-shadow-md`}>
              VISA
            </span>
          )}
          {network === "unionpay" && (
            <div className="px-2 py-0.5 rounded bg-white/20 backdrop-blur-xs border border-white/20">
              <span className="text-[10px] font-black tracking-wider text-amber-300">
                PROUD
              </span>
            </div>
          )}
          {network === "jcb" && (
            <span className="font-extrabold text-xs tracking-wider text-blue-400 drop-shadow-md">
              JCB
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function CardsView() {
  const { creditCards, accounts, payCreditCard, addCreditCard, deleteCreditCard, categories, addTransaction } = useFinance();
  const [payingCard, setPayingCard] = useState<CreditCard | null>(null);
  const [selectedPayAccount, setSelectedPayAccount] = useState<string>("");
  const [payAmount, setPayAmount] = useState<string>("");
  const [payCardError, setPayCardError] = useState<string | null>(null);

  // Swipe Card Modal State
  const [swipingCard, setSwipingCard] = useState<CreditCard | null>(null);
  const [swipeAmount, setSwipeAmount] = useState<string>("");
  const [swipeCategoryId, setSwipeCategoryId] = useState<string>("");
  const [swipeDate, setSwipeDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [swipeNote, setSwipeNote] = useState<string>("");
  const [swipeSlipPreview, setSwipeSlipPreview] = useState<string | null>(null);
  const [swipeSlipFileName, setSwipeSlipFileName] = useState<string | null>(null);
  const [swipeError, setSwipeError] = useState<string | null>(null);
  const [isSwipeSuccess, setIsSwipeSuccess] = useState(false);

  // Add Card Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>("KTC (กรุงไทย)");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("ktc-platinum-mc");
  const [newDigits, setNewDigits] = useState("8849");
  const [newLimit, setNewLimit] = useState("100000");
  const [newStatementDay, setNewStatementDay] = useState("17");
  const [newDueDay, setNewDueDay] = useState("2");
  const [addCardErrors, setAddCardErrors] = useState<Record<string, string>>({});

  // Delete Card Confirmation State
  const [cardToDelete, setCardToDelete] = useState<CreditCard | null>(null);

  const bankAccounts = accounts.filter((a) => a.type === "bank" || a.type === "cash");

  // Selected Preset object
  const currentPreset = POPULAR_CREDIT_CARDS.find((c) => c.id === selectedPresetId) || POPULAR_CREDIT_CARDS[0];

  // Cards filtered by selected bank
  const filteredCardsOfBank = POPULAR_CREDIT_CARDS.filter((c) => c.bank === selectedBank);

  const handleSelectPreset = (preset: PopularCreditCardPreset) => {
    setSelectedPresetId(preset.id);
    setSelectedBank(preset.bank);
    setNewStatementDay(preset.statementDay.toString());
    setNewDueDay(preset.dueDay.toString());
    if (addCardErrors.preset) {
      setAddCardErrors((p) => ({ ...p, preset: "" }));
    }
  };

  const handleBankChange = (bank: string) => {
    setSelectedBank(bank);
    const firstCard = POPULAR_CREDIT_CARDS.find((c) => c.bank === bank);
    if (firstCard) {
      handleSelectPreset(firstCard);
    }
  };

  const handleOpenPay = (card: CreditCard) => {
    setPayingCard(card);
    setPayAmount(card.currentBalance.toString());
    setPayCardError(null);
    if (bankAccounts.length > 0) {
      setSelectedPayAccount(bankAccounts[0].id);
    }
  };

  const handleOpenSwipe = (card: CreditCard) => {
    setSwipingCard(card);
    setSwipeAmount("");
    setSwipeError(null);
    setSwipeDate(new Date().toISOString().split("T")[0]);
    setSwipeNote("");
    setSwipeSlipPreview(null);
    setSwipeSlipFileName(null);
    const expenseCategories = categories.filter((c) => c.type === "expense");
    if (expenseCategories.length > 0) {
      setSwipeCategoryId(expenseCategories[0].id);
    }
  };

  const handleSwipeQuickAdd = (val: number) => {
    const current = parseFloat(swipeAmount) || 0;
    setSwipeAmount((current + val).toString());
    setSwipeError(null);
  };

  const handleSwipeImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSwipeSlipFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setSwipeSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeSwipeSlip = () => {
    setSwipeSlipPreview(null);
    setSwipeSlipFileName(null);
  };

  const handleConfirmSwipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swipingCard) return;

    const num = parseFloat(swipeAmount);
    if (isNaN(num) || num <= 0) {
      setSwipeError("กรุณากรอกจำนวนเงินที่ถูกต้อง (มากกว่า 0 บาท)");
      return;
    }

    const availableCredit = swipingCard.creditLimit - swipingCard.currentBalance;
    if (num > availableCredit) {
      setSwipeError(`ยอดรูดบัตรเกินวงเงินคงเหลือ (วงเงินคงเหลือ ฿${availableCredit.toLocaleString()})`);
      return;
    }

    const expenseCategories = categories.filter((c) => c.type === "expense");
    const category = expenseCategories.find((c) => c.id === swipeCategoryId) || expenseCategories[0];

    addTransaction({
      type: "expense",
      amount: num,
      accountId: "",
      creditCardId: swipingCard.id,
      categoryId: category?.id ?? "cat-1",
      categoryName: category?.name ?? "ทั่วไป",
      categoryIcon: category?.icon ?? "CreditCard",
      date: swipeDate,
      note: swipeNote.trim() || undefined,
      slipUrl: swipeSlipPreview || undefined,
    });

    setIsSwipeSuccess(true);
    setTimeout(() => {
      setIsSwipeSuccess(false);
      setSwipingCard(null);
      setSwipeAmount("");
      setSwipeNote("");
      removeSwipeSlip();
      setSwipeError(null);
    }, 450);
  };

  const handleConfirmPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingCard || !selectedPayAccount) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      setPayCardError("กรุณากรอกยอดเงินที่ถูกต้อง (มากกว่า 0 บาท)");
      return;
    }

    payCreditCard(payingCard.id, selectedPayAccount, amount);
    setPayingCard(null);
    setPayCardError(null);
  };

  const handleAddCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!currentPreset) errors.preset = "กรุณาเลือกรุ่นบัตรเครดิต";
    const cleanDigits = newDigits.replace(/\D/g, "");
    if (!cleanDigits || cleanDigits.length < 4) errors.digits = "กรุณากรอกเลขท้าย 4 หลัก";
    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit <= 0) errors.limit = "กรุณาเลือกวงเงินบัตร";

    if (Object.keys(errors).length > 0) {
      setAddCardErrors(errors);
      return;
    }

    if (!currentPreset) return;

    addCreditCard({
      name: currentPreset.name,
      bank: currentPreset.bank,
      lastFourDigits: cleanDigits.slice(-4),
      creditLimit: limit,
      currentBalance: 0,
      statementDay: parseInt(newStatementDay) || currentPreset.statementDay,
      dueDay: parseInt(newDueDay) || currentPreset.dueDay,
      cardColor: currentPreset.cardColor,
      isPaidThisMonth: true,
    });

    setIsAddOpen(false);
    setAddCardErrors({});
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--fg-primary)] tracking-tight">
            บัตรเครดิต & รอบบิล
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            จัดการยอดค้างชำระ วงเงินคงเหลือ และวันครบกำหนดชำระของทุกสถาบันการเงิน
          </p>
        </div>
        <button
          onClick={() => {
            setIsAddOpen(true);
            setAddCardErrors({});
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มบัตรเครดิต</span>
        </button>
      </div>

      {/* Cards Visual Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map((card) => {
          const { label } = getDaysUntil(card.dueDay);
          const availableCredit = Math.max(0, card.creditLimit - card.currentBalance);
          const usagePercent = Math.min(100, Math.round((card.currentBalance / card.creditLimit) * 100));
          const preset = findCardPreset(card.name, card.bank);

          return (
            <div
              key={card.id}
              className="rounded-3xl p-6 shadow-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex flex-col justify-between relative overflow-hidden group transition-all"
            >
              {/* Card Delete Action on Top Right */}
              <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setCardToDelete(card)}
                  className="w-8 h-8 rounded-xl bg-black/40 hover:bg-rose-600 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-md"
                  title="ลบบัตรนี้"
                  aria-label="ลบบัตรนี้"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Realistic Metallic Credit Card Mockup */}
              <CreditCardMockup
                bank={card.bank}
                name={card.name}
                lastFourDigits={card.lastFourDigits}
                preset={preset}
                customColor={card.cardColor}
                creditLimit={card.creditLimit}
                statementDay={card.statementDay}
                dueDay={card.dueDay}
                className="mb-5"
              />

              {/* Billing Cycle Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-[var(--border-subtle)]">
                  <div>
                    <span className="text-[var(--fg-muted)] block">วันตัดรอบบิล</span>
                    <span className="font-bold text-[var(--fg-primary)]">วันที่ {card.statementDay} ของเดือน</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[var(--fg-muted)] block">วันครบกำหนดชำระ</span>
                    <span className="font-bold text-rose-500">วันที่ {card.dueDay} ({label})</span>
                  </div>
                </div>

                {/* Balance & Limit */}
                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[var(--fg-muted)]">ยอดที่ต้องชำระ</span>
                    <span className="text-xl font-black text-[var(--fg-primary)]">
                      {formatCurrency(card.currentBalance)}
                    </span>
                  </div>

                  {/* Usage Progress Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        usagePercent > 80 ? "bg-rose-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-[var(--fg-muted)]">
                    <span>ใช้วงเงินไปแล้ว {usagePercent}%</span>
                    <span>วงเงินคงเหลือ {formatCurrency(availableCredit)}</span>
                  </div>
                </div>

                {/* Card Action Buttons (รูดบัตร & ชำระยอดบิล) */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => handleOpenSwipe(card)}
                    className="py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/20 active:scale-98 outline-none focus:outline-none"
                  >
                    <CardIcon className="w-4 h-4 shrink-0" />
                    <span className="truncate">รูดบัตร</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenPay(card)}
                    disabled={card.currentBalance <= 0 || card.isPaidThisMonth}
                    className={`py-3 px-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer outline-none focus:outline-none ${
                      card.isPaidThisMonth || card.currentBalance <= 0
                        ? "bg-slate-100 dark:bg-slate-800 text-[var(--fg-muted)] cursor-not-allowed"
                        : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/20 active:scale-98"
                    }`}
                  >
                    {card.isPaidThisMonth || card.currentBalance <= 0 ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">ชำระแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 shrink-0" />
                        <span className="truncate">ชำระยอดบิล</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pay Credit Card Modal */}
      {payingCard && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setPayingCard(null)}
        >
          <div 
            className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div>
                <h3 className="text-base font-bold text-[var(--fg-primary)]">
                  ชำระยอดบิลบัตรเครดิต
                </h3>
                <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                  บันทึกการตัดเงินจากบัญชีเพื่อชำระหนี้บัตรเครดิต
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPayingCard(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form noValidate onSubmit={handleConfirmPay} className="space-y-4">
              <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fg-muted)]">บัตรที่เลือก</p>
                    <p className="text-sm font-bold text-[var(--fg-primary)]">
                      {payingCard.name} (••{payingCard.lastFourDigits})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--fg-muted)]">ยอดค้างชำระ</p>
                  <p className="text-sm text-rose-500 font-bold">
                    {formatCurrency(payingCard.currentBalance)}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  ชำระจากบัญชีธนาคาร
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                    <Wallet className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedPayAccount}
                    onChange={(e) => setSelectedPayAccount(e.target.value)}
                    className="w-full h-11 py-2.5 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                  >
                    {bankAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} (คงเหลือ {formatCurrency(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  จำนวนเงินที่ต้องการชำระ (บาท)
                </label>
                <div className="relative flex items-center group">
                  <span className="absolute left-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold pointer-events-none z-10">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={payAmount}
                    onChange={(e) => {
                      setPayAmount(e.target.value);
                      if (payCardError) setPayCardError(null);
                    }}
                    className={`w-full h-11 py-2.5 pl-8 pr-3.5 rounded-xl bg-[var(--bg-canvas)] text-base font-bold text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                      payCardError
                        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                </div>
                {payCardError && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {payCardError}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayingCard(null)}
                  className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 outline-none focus:outline-none"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันการชำระเงิน</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Swipe Credit Card Modal */}
      {swipingCard && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSwipingCard(null)}
        >
          <div
            className="w-full max-w-lg bg-[var(--bg-surface)] border border-purple-500/30 rounded-3xl p-6 shadow-2xl space-y-5 my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                  <CardIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">
                    บันทึกรายการรูดบัตรเครดิต
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                    บันทึกค่าใช้จ่ายผ่านวงเงินบัตร (ไม่หักเงินในบัญชีธนาคาร)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSwipingCard(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form noValidate onSubmit={handleConfirmSwipe} className="space-y-4">
              {/* Card Summary Badge */}
              <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-sm">
                    <CardIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--fg-muted)] font-medium">บัตรที่ใช้รูด</p>
                    <p className="text-sm font-bold text-[var(--fg-primary)]">
                      {swipingCard.name} (•••• {swipingCard.lastFourDigits})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[var(--fg-muted)]">วงเงินคงเหลือ</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-extrabold">
                    ฿{(swipingCard.creditLimit - swipingCard.currentBalance).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Amount Input */}
              <div
                className={`p-4 rounded-2xl bg-[var(--bg-canvas)] border transition-all ${
                  swipeError
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                    จำนวนเงินที่รูด (บาท) <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                    CREDIT CARD (-)
                  </span>
                </div>

                <div className="mt-2 relative flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-extrabold mr-2 text-purple-600 dark:text-purple-400">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0.00"
                    value={swipeAmount}
                    onChange={(e) => {
                      setSwipeAmount(e.target.value);
                      if (swipeError) setSwipeError(null);
                    }}
                    className="w-full text-3xl sm:text-4xl font-black bg-transparent focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 tabular-nums text-purple-600 dark:text-purple-400"
                  />
                </div>

                {swipeError && (
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-rose-200/50 dark:border-rose-900/40 text-xs text-rose-500 dark:text-rose-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{swipeError}</span>
                  </div>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2">
                {[100, 300, 500, 1000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleSwipeQuickAdd(val)}
                    className="py-1.5 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-all cursor-pointer active:scale-95 text-[var(--fg-primary)] outline-none focus:outline-none"
                  >
                    +{val.toLocaleString()}
                  </button>
                ))}
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  หมวดหมู่ค่าใช้จ่าย
                </label>
                <select
                  value={swipeCategoryId}
                  onChange={(e) => setSwipeCategoryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition cursor-pointer"
                >
                  {categories
                    .filter((c) => c.type === "expense")
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Date & Merchant Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <ThaiDatePicker
                    label="วันที่ทำรายการ"
                    value={swipeDate}
                    onChange={setSwipeDate}
                    showBuddhistEra={true}
                    accentColor="rose"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                    ร้านค้า / รายละเอียด
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เซ็นทรัล, ช้อปปี้, ร้านอาหาร"
                    value={swipeNote}
                    onChange={(e) => setSwipeNote(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--fg-primary)] placeholder:text-zinc-400 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition"
                  />
                </div>
              </div>

              {/* Slip / Receipt Upload */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  แนบสลิป / สลิปรูดบัตร (ไม่บังคับ)
                </label>
                {!swipeSlipPreview ? (
                  <label className="relative flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-canvas)] hover:border-purple-400 transition cursor-pointer group">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--fg-primary)]">
                      <UploadCloud className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                      <span>คลิกเพื่อแนบสลิปการรูดบัตร</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSwipeImageUpload}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)]">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="relative w-9 h-9 rounded-lg overflow-hidden border border-[var(--border-subtle)] shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={swipeSlipPreview} alt="Slip" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-semibold text-[var(--fg-primary)] truncate">
                        {swipeSlipFileName || "สลิปรูดบัตร"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeSwipeSlip}
                      className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer outline-none focus:outline-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSwipingCard(null)}
                  className="py-3 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSwipeSuccess}
                  className="py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-1.5 outline-none focus:outline-none"
                >
                  {isSwipeSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>บันทึกสำเร็จ</span>
                    </>
                  ) : (
                    <>
                      <CardIcon className="w-4 h-4" />
                      <span>ยืนยันการรูดบัตร</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= ADD NEW CREDIT CARD MODAL (NO MANUAL TYPING) ================= */}
      {isAddOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsAddOpen(false)}
        >
          <div 
            className="w-full max-w-4xl lg:max-w-5xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90dvh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Sticky / Pinned at top) */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <CardIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--fg-primary)]">
                    เพิ่มบัตรเครดิตใหม่
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--fg-muted)]">
                    เลือกจากบัตรเครดิตยอดนิยมของธนาคารไทย เพื่อความแม่นยำสูงสุด
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2-Column Responsive Body */}
            <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]">
              {/* Left Column: Live UI Mockup & Card Specs (5 cols) */}
              <div className="md:col-span-5 p-5 sm:p-6 bg-[var(--bg-canvas)]/50 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--fg-muted)]">
                    <span>หน้าตาบัตรจำลอง (Live UI Mockup)</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {currentPreset.mood}
                    </span>
                  </div>

                  <div className="w-full max-w-sm mx-auto transition-transform duration-200 hover:scale-[1.01]">
                    <CreditCardMockup
                      bank={currentPreset.bank}
                      name={currentPreset.name}
                      lastFourDigits={newDigits}
                      preset={currentPreset}
                      creditLimit={parseFloat(newLimit) || 100000}
                      statementDay={parseInt(newStatementDay) || currentPreset.statementDay}
                      dueDay={parseInt(newDueDay) || currentPreset.dueDay}
                    />
                  </div>

                  {/* Card Details Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--fg-muted)]">สถาบันการเงิน</span>
                      <span className="font-bold text-[var(--fg-primary)]">{currentPreset.bank}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--fg-muted)]">เครือข่ายบัตร</span>
                      <span className="font-bold text-[var(--fg-primary)] uppercase">{currentPreset.network}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--fg-muted)]">รอบบิล & กำหนดชำระ</span>
                      <span className="font-bold text-[var(--fg-primary)]">ตัด {newStatementDay} • จ่าย {newDueDay}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-1.5 border-t border-[var(--border-subtle)]">
                      <span className="text-[var(--fg-muted)]">วงเงินที่ระบุ</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(parseFloat(newLimit) || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[var(--fg-muted)] leading-relaxed hidden md:block">
                  {currentPreset.description}
                </p>
              </div>

              {/* Right Column: Form Inputs (7 cols) */}
              <form noValidate onSubmit={handleAddCardSubmit} className="md:col-span-7 p-5 sm:p-6 flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  {/* STEP 1: ธนาคารผู้ออกบัตร */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                      1. เลือกสถาบันการเงิน / ธนาคาร
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <select
                        value={selectedBank}
                        onChange={(e) => handleBankChange(e.target.value)}
                        className="w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                      >
                        {POPULAR_BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* STEP 2: เลือกรุ่นบัตรเครดิตยอดนิยม */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                      2. เลือกรุ่นบัตรเครดิตยอดนิยม
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                        <CardIcon className="w-4 h-4" />
                      </div>
                      <select
                        value={selectedPresetId}
                        onChange={(e) => {
                          const found = POPULAR_CREDIT_CARDS.find((c) => c.id === e.target.value);
                          if (found) handleSelectPreset(found);
                        }}
                        className={`w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] border transition-all cursor-pointer shadow-2xs outline-none focus:outline-none ${
                          addCardErrors.preset
                            ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      >
                        {filteredCardsOfBank.map((card) => (
                          <option key={card.id} value={card.id}>
                            {card.name} ({card.network.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                    {addCardErrors.preset && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                        {addCardErrors.preset}
                      </p>
                    )}
                  </div>

                  {/* STEP 3: วงเงินบัตรเครดิต */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-[var(--fg-primary)]">
                        3. วงเงินบัตรเครดิตที่ได้รับอนุมัติ (บาท)
                      </label>
                      <div className="flex items-center gap-1.5">
                        {parseFloat(newLimit) < 30000 && parseFloat(newLimit) > 0 && (
                          <span className="text-[10px] text-zinc-600 dark:text-zinc-400 font-semibold bg-zinc-500/10 px-2 py-0.5 rounded-md border border-zinc-500/20">
                            ระบุเอง (&lt; 30k)
                          </span>
                        )}
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(parseFloat(newLimit) || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Limit Buttons */}
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {QUICK_LIMIT_PRESETS.map((amt) => {
                        const isSelected = newLimit === amt.toString();
                        return (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setNewLimit(amt.toString());
                              if (addCardErrors.limit) setAddCardErrors((p) => ({ ...p, limit: "" }));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer border outline-none focus:outline-none ${
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs scale-102"
                                : "bg-[var(--bg-canvas)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)] hover:border-slate-400"
                            }`}
                          >
                            {formatCurrency(amt)}
                          </button>
                        );
                      })}
                    </div>

                    {/* Editable input field */}
                    <div className="relative flex items-center group">
                      <span className="absolute left-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold pointer-events-none z-10">
                        ฿
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        placeholder="เช่น 15000 หรือพิมพ์วงเงินที่ต้องการเอง"
                        value={newLimit}
                        onChange={(e) => {
                          setNewLimit(e.target.value);
                          if (addCardErrors.limit) setAddCardErrors((p) => ({ ...p, limit: "" }));
                        }}
                        className={`w-full h-10 sm:h-11 py-2 pl-8 pr-4 rounded-xl bg-[var(--bg-canvas)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                          addCardErrors.limit
                            ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                    </div>
                    {addCardErrors.limit && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                        {addCardErrors.limit}
                      </p>
                    )}
                  </div>

                  {/* STEP 4: รอบบิล */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                        วันตัดรอบบิล
                      </label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <select
                          value={newStatementDay}
                          onChange={(e) => setNewStatementDay(e.target.value)}
                          className="w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-medium text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                        >
                          {DAYS_OPTIONS.map((d) => (
                            <option key={d} value={d.toString()}>
                              วันที่ {d} ของเดือน
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                        วันครบกำหนดชำระ
                      </label>
                      <div className="relative flex items-center group">
                        <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                          <Clock className="w-4 h-4" />
                        </div>
                        <select
                          value={newDueDay}
                          onChange={(e) => setNewDueDay(e.target.value)}
                          className="w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-medium text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                        >
                          {DAYS_OPTIONS.map((d) => (
                            <option key={d} value={d.toString()}>
                              วันที่ {d} ของเดือน
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* STEP 5: เลขท้าย 4 หลัก */}
                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                      เลขท้าย 4 หลักบนบัตร
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                        <Hash className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="8849"
                        value={newDigits}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          setNewDigits(val);
                          if (addCardErrors.digits) setAddCardErrors((p) => ({ ...p, digits: "" }));
                        }}
                        className={`w-full h-10 sm:h-11 py-2 pl-10 pr-24 rounded-xl bg-[var(--bg-canvas)] text-xs sm:text-sm font-bold tracking-widest text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                          addCardErrors.digits
                            ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const random4 = Math.floor(1000 + Math.random() * 9000).toString();
                          setNewDigits(random4);
                          if (addCardErrors.digits) setAddCardErrors((p) => ({ ...p, digits: "" }));
                        }}
                        className="absolute right-2 text-[11px] font-semibold px-2.5 py-1 sm:py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--fg-muted)] hover:text-emerald-500 transition-colors cursor-pointer outline-none focus:outline-none"
                      >
                        สุ่ม 4 หลัก
                      </button>
                    </div>
                    {addCardErrors.digits && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                        {addCardErrors.digits}
                      </p>
                    )}
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-[var(--border-subtle)] mt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 outline-none focus:outline-none"
                  >
                    <Plus className="w-4 h-4" />
                    <span>บันทึกบัตรเครดิต</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= DELETE CARD CONFIRMATION DIALOG ================= */}
      {cardToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setCardToDelete(null)}
        >
          <div 
            className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4 my-auto max-h-[90dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-[var(--fg-primary)]">
                ยืนยันการลบบัตรเครดิต?
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
                คุณต้องการลบบัตร <strong className="text-[var(--fg-primary)] font-semibold">"{cardToDelete.name}"</strong> (••{cardToDelete.lastFourDigits}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCardToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCreditCard(cardToDelete.id);
                  setCardToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95 outline-none focus:outline-none"
              >
                ลบบัตรเครดิต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
