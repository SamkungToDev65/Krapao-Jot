"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  X,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Wallet,
  FileText,
  UploadCloud,
  Check,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  Briefcase,
  Sparkles,
  TrendingUp,
  Laptop,
  Trash2,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { TransactionType } from "@/lib/types";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  Utensils,
  Car,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  Briefcase,
  Sparkles,
  TrendingUp,
  Laptop,
  CreditCard,
};

const QUICK_AMOUNTS = [100, 300, 500, 1000];

export function QuickAddModal({ isOpen, onClose }: QuickAddModalProps) {
  const { accounts, creditCards, categories, addTransaction } = useFinance();

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [paymentType, setPaymentType] = useState<"account" | "card">("account");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState<string>("");
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [slipFileName, setSlipFileName] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isExpense = type === "expense";

  // Dynamic categories based on transaction type
  const currentCategories = useMemo(
    () => categories.filter((c) => c.type === (isExpense ? "expense" : "income")),
    [categories, isExpense]
  );

  // Switch category selection when type changes
  useEffect(() => {
    if (currentCategories.length > 0) {
      const exists = currentCategories.some((c) => c.id === selectedCategoryId);
      if (!exists) {
        setSelectedCategoryId(currentCategories[0].id);
      }
    }
  }, [currentCategories, selectedCategoryId]);

  // Set initial accounts / cards
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      if (accounts.length > 0 && !selectedAccountId) setSelectedAccountId(accounts[0].id);
      if (creditCards.length > 0 && !selectedCardId) setSelectedCardId(creditCards[0].id);
    }
  }, [isOpen, accounts, creditCards, selectedAccountId, selectedCardId]);

  if (!isOpen) return null;

  const handleQuickAdd = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + val).toString());
    setErrorMsg(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSlipFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => setSlipPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeSlip = () => {
    setSlipPreview(null);
    setSlipFileName(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setErrorMsg("กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)");
      return;
    }

    const category = currentCategories.find((c) => c.id === selectedCategoryId) || currentCategories[0];
    const isCard = isExpense && paymentType === "card";

    addTransaction({
      type,
      amount: num,
      accountId: isCard ? (accounts[0]?.id ?? "") : (selectedAccountId || (accounts[0]?.id ?? "")),
      creditCardId: isCard ? selectedCardId : undefined,
      categoryId: category?.id ?? "cat-1",
      categoryName: category?.name ?? "ทั่วไป",
      categoryIcon: category?.icon ?? "Utensils",
      date,
      note: note.trim() || undefined,
      slipUrl: slipPreview || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setAmount("");
      setNote("");
      removeSlip();
      setErrorMsg(null);
      onClose();
    }, 450);
  };

  const activeCategory = currentCategories.find((c) => c.id === selectedCategoryId) || currentCategories[0];
  const selectedCard = creditCards.find((c) => c.id === selectedCardId);
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Segment */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface)]">
          <div className="flex items-center gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Transaction Entry
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[var(--fg-primary)]">
                บันทึกรายการธุรกรรม
              </h2>
            </div>

            {/* Type Switcher Segmented Control */}
            <div className="flex items-center p-1 bg-[var(--bg-canvas)] rounded-xl border border-[var(--border-subtle)] ml-2 sm:ml-4">
              <button
                type="button"
                onClick={() => {
                  setType("expense");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-lg text-xs transition-all cursor-pointer outline-none focus:outline-none ${
                  isExpense
                    ? "bg-rose-600 text-white shadow-xs shadow-rose-600/30"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5" />
                <span>รายจ่าย</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setType("income");
                  setErrorMsg(null);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 font-bold rounded-lg text-xs transition-all cursor-pointer outline-none focus:outline-none ${
                  !isExpense
                    ? "bg-emerald-600 text-white shadow-xs shadow-emerald-600/30"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>รายรับ</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
            aria-label="ปิดหน้าต่าง"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body - 2 Column Layout with noValidate */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[var(--border-subtle)]"
        >
          {/* Left Panel: Amount Display & Realtime Summary (5 cols) */}
          <div className="md:col-span-5 p-5 sm:p-6 flex flex-col justify-between bg-[var(--bg-canvas)]/50">
            <div className="space-y-5">
              {/* Amount Input Card */}
              <div
                className={`p-4 rounded-2xl bg-[var(--bg-surface)] border transition-all ${
                  errorMsg
                    ? "border-rose-500 ring-2 ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                    จำนวนเงิน ({isExpense ? "ยอดจ่าย" : "ยอดรับ"})
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isExpense
                        ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? "THB (-)" : "THB (+)"}
                  </span>
                </div>

                <div className="mt-2 relative flex items-baseline">
                  <span
                    className={`text-3xl sm:text-4xl font-extrabold mr-2 transition-colors ${
                      isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    inputMode="decimal"
                    autoFocus
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      if (errorMsg) setErrorMsg(null);
                    }}
                    className={`w-full text-3xl sm:text-4xl font-black bg-transparent focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 tabular-nums transition-colors ${
                      isExpense
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-rose-200/50 dark:border-rose-900/40 text-xs text-rose-500 dark:text-rose-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Quick Amount Buttons */}
              <div>
                <span className="text-xs text-[var(--fg-muted)] block mb-2 font-semibold">
                  เพิ่มยอดด่วน
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {QUICK_AMOUNTS.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleQuickAdd(val)}
                      className={`py-2 text-xs font-bold rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer active:scale-95 outline-none focus:outline-none ${
                        isExpense
                          ? "hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400 text-[var(--fg-primary)]"
                          : "hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 text-[var(--fg-primary)]"
                      }`}
                    >
                      +{val.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-1.5 border-b border-[var(--border-subtle)]">
                  <span className="text-[var(--fg-muted)] font-medium">สถานะรายการ</span>
                  <span
                    className={`font-bold ${
                      isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {isExpense ? "บันทึกรายจ่าย" : "บันทึกรายรับ"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)] font-medium">หมวดหมู่</span>
                  <span className="font-bold text-[var(--fg-primary)]">
                    {activeCategory?.name || "ไม่ได้ระบุ"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[var(--fg-muted)] font-medium">ช่องทาง</span>
                  <span className="font-bold text-[var(--fg-primary)]">
                    {isExpense && paymentType === "card"
                      ? selectedCard?.name || "บัตรเครดิต"
                      : selectedAccount?.name || "กระเป๋าเงิน"}
                  </span>
                </div>
              </div>
            </div>

            {/* Desktop Primary Submit Button */}
            <div className="hidden md:block mt-6 pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="submit"
                disabled={isSuccess}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer outline-none focus:outline-none ${
                  isSuccess
                    ? "bg-emerald-600 shadow-emerald-600/30"
                    : isExpense
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>บันทึกสำเร็จเรียบร้อย</span>
                  </>
                ) : (
                  <span>ยืนยันการบันทึกรายการ</span>
                )}
              </button>
            </div>
          </div>

          {/* Right Panel: Fields, Details & Dropzone (7 cols) */}
          <div className="md:col-span-7 p-5 sm:p-6 space-y-5">
            {/* 1. Category Selection Pills */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold text-[var(--fg-primary)]">
                  เลือกหมวดหมู่ธุรกรรม
                </label>
                <span className="text-[11px] text-[var(--fg-muted)]">
                  {currentCategories.length} หมวดหมู่
                </span>
              </div>

              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                {currentCategories.map((cat) => {
                  const Icon = CATEGORY_ICON_MAP[cat.icon] || Utensils;
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer outline-none focus:outline-none ${
                        isSelected
                          ? isExpense
                            ? "border-rose-600 bg-rose-600 text-white shadow-xs"
                            : "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                          : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-secondary)] hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-white/20 text-white" : ""
                        }`}
                        style={{
                          backgroundColor: isSelected ? undefined : `${cat.color}20`,
                          color: isSelected ? undefined : cat.color,
                        }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Payment Source Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[var(--fg-primary)]">
                  {isExpense ? "ช่องทางจ่ายเงิน" : "เข้ากระเป๋า / บัญชี"}
                </label>
                {isExpense && creditCards.length > 0 && (
                  <div className="flex bg-[var(--bg-canvas)] p-0.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPaymentType("account")}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer outline-none focus:outline-none ${
                        paymentType === "account"
                          ? "bg-[var(--bg-surface)] text-[var(--fg-primary)] font-bold shadow-xs"
                          : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                      }`}
                    >
                      เงินสด / บัญชี
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentType("card")}
                      className={`px-3 py-1 rounded-lg transition cursor-pointer outline-none focus:outline-none ${
                        paymentType === "card"
                          ? "bg-[var(--bg-surface)] text-rose-600 dark:text-rose-400 font-bold shadow-xs"
                          : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                      }`}
                    >
                      บัตรเครดิต
                    </button>
                  </div>
                )}
              </div>

              {isExpense && paymentType === "card" ? (
                <div className="relative flex items-center">
                  <CreditCard className="w-4 h-4 text-rose-500 absolute left-3.5 pointer-events-none" />
                  <select
                    value={selectedCardId}
                    onChange={(e) => setSelectedCardId(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition cursor-pointer"
                  >
                    {creditCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.name} (•••• {card.lastFourDigits})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="relative flex items-center">
                  <Wallet className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <select
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition cursor-pointer"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.type === "cash" ? "เงินสด" : "บัญชี"}) — ฿{acc.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* 3. Date & Note Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <ThaiDatePicker
                  label="วันที่ทำรายการ"
                  value={date}
                  onChange={setDate}
                  showBuddhistEra={true}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--fg-primary)] mb-1.5">
                  รายละเอียด / โน้ตกำกับ
                </label>
                <div className="relative flex items-center">
                  <FileText className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="เช่น ข้าวกลางวัน, ค่าไฟ, เงินเดือน"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full h-11 pl-10 pr-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--fg-primary)] placeholder:text-zinc-400 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                  />
                </div>
              </div>
            </div>

            {/* 4. Dropzone Box */}
            <div>
              <label className="block text-xs font-bold text-[var(--fg-primary)] mb-2">
                แนบรูปสลิป / หลักฐานการทำรายการ
              </label>

              {!slipPreview ? (
                <label
                  className={`relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-[var(--border-subtle)] rounded-2xl bg-[var(--bg-canvas)] transition-all cursor-pointer group ${
                    isExpense ? "hover:border-rose-400" : "hover:border-emerald-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform ${
                      isExpense
                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--fg-primary)]">
                    คลิกเพื่ออัปโหลดสลิป หรือลากไฟล์มาวางที่นี่
                  </span>
                  <span className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                    รองรับไฟล์ JPG, PNG, WEBP (ไม่บังคับ)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slipPreview} alt="Slip Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[var(--fg-primary)] truncate max-w-[180px] sm:max-w-xs">
                        {slipFileName || "หลักฐานการทำรายการ"}
                      </p>
                      <span
                        className={`text-[11px] font-medium inline-flex items-center gap-1 mt-0.5 ${
                          isExpense
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        <Check className="w-3 h-3" /> พร้อมแนบเข้ากับรายการ
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-[var(--fg-secondary)] hover:text-[var(--fg-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] cursor-pointer transition outline-none focus:outline-none">
                      เปลี่ยน
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={removeSlip}
                      className="p-1.5 text-[var(--fg-muted)] hover:text-rose-600 rounded-lg hover:bg-rose-500/10 transition cursor-pointer outline-none focus:outline-none"
                      title="ลบสลิป"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile-only bottom submit button */}
            <div className="md:hidden pt-4 border-t border-[var(--border-subtle)]">
              <button
                type="submit"
                disabled={isSuccess}
                className={`w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-sm transition-all active:scale-98 cursor-pointer outline-none focus:outline-none ${
                  isSuccess
                    ? "bg-emerald-600 shadow-emerald-600/30"
                    : isExpense
                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>บันทึกสำเร็จเรียบร้อย</span>
                  </>
                ) : (
                  <span>ยืนยันการบันทึกรายการ</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}