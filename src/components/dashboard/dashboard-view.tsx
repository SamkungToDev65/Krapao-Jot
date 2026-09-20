"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  CreditCard,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Receipt,
  Plus,
  Sparkles,
  Building2,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Home,
  HeartPulse,
  Film,
  Briefcase,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  CircleDollarSign,
  ArrowRight,
  Landmark,
  LayoutGrid,
  List,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { MascotAvatar } from "@/components/profile/mascot-avatar";
import { formatCurrency, formatShortDate, getDaysUntil } from "@/lib/utils";
import { SubscriptionBrandIcon } from "@/components/subscriptions/subscription-catalog";
import { CreditCardMockup } from "@/components/cards/cards-view";
import { findCardPreset } from "@/lib/credit-card-presets";
import { getBankTheme } from "@/lib/bank-presets";

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

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

function getSubscriptionDaysLeft(dateStr: string): { days: number; isOverdue: boolean; label: string } {
  if (!dateStr) return { days: 0, isOverdue: false, label: "" };
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { days: Math.abs(diffDays), isOverdue: true, label: `เลยมา ${Math.abs(diffDays)} วัน` };
  } else if (diffDays === 0) {
    return { days: 0, isOverdue: false, label: "ตัดรอบวันนี้" };
  } else if (diffDays === 1) {
    return { days: 1, isOverdue: false, label: "พรุ่งนี้" };
  } else {
    return { days: diffDays, isOverdue: false, label: `อีก ${diffDays} วัน` };
  }
}

export function DashboardView({ onNavigate, onOpenQuickAdd }: DashboardViewProps) {
  const { summary, accounts, transactions, creditCards, subscriptions } = useFinance();
  const { profile, user, mascotConfig } = useAuth();
  const [selectedAccountIndex, setSelectedAccountIndex] = useState(0);
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);
  const [txViewMode, setTxViewMode] = useState<"grid" | "list">("grid");

  // Dynamic Thai Month & Year (พ.ศ.)
  const thaiDateString = useMemo(() => {
    return new Intl.DateTimeFormat("th-TH", {
      month: "long",
      year: "numeric",
    }).format(new Date());
  }, []);

  // Aggregate Balances & Net Liquidity
  const totalCashBalance = useMemo(() => {
    return accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
  }, [accounts]);

  const totalCardDebt = summary.totalCreditCardDebt || 0;

  const savingsRate = summary.totalIncome > 0
    ? Math.round((summary.netSavings / summary.totalIncome) * 100)
    : 0;

  const fullName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    "คุณผู้ใช้";
  const username =
    profile?.username ||
    user?.user_metadata?.username ||
    null;

  // Subscriptions Analytics
  const activeSubscriptions = useMemo(() => {
    return subscriptions.filter((s) => s.isActive);
  }, [subscriptions]);

  const nextUpcomingSub = useMemo(() => {
    if (activeSubscriptions.length === 0) return null;
    return [...activeSubscriptions].sort(
      (a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime()
    )[0];
  }, [activeSubscriptions]);

  const getLinkedPaymentInfo = (linkedId?: string) => {
    if (!linkedId) return null;
    const card = creditCards.find((c) => c.id === linkedId);
    if (card) return { name: card.name, isCard: true };
    const acc = accounts.find((a) => a.id === linkedId);
    if (acc) return { name: acc.name, isCard: false };
    return null;
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & QUICK ACTION                                              */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div
            onClick={() => onNavigate("profile")}
            className="cursor-pointer group relative shrink-0 transition-transform active:scale-95 hover:scale-105"
            title="คลิกเพื่อจัดการโปรไฟล์และปรับแต่งมาสคอต 3D"
          >
            <MascotAvatar
              config={mascotConfig}
              size="lg"
              rounded="2xl"
              className="group-hover:ring-2 group-hover:ring-emerald-500/50 transition-all shadow-xs"
            />
          </div>

          <div className="min-w-0 space-y-1">
            {/* User Identity & Subtitle Tag */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                สวัสดีคุณ {fullName}
              </span>
              {username && (
                <span className="text-[11px] font-mono font-medium text-[var(--fg-muted)] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800/90 border border-[var(--border-subtle)]">
                  @{username}
                </span>
              )}
              <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">•</span>
              <span className="text-xs text-[var(--fg-muted)] font-medium hidden sm:inline">
                {thaiDateString}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight">
              ภาพรวมสถานะการเงิน
            </h1>
            <p className="text-xs sm:text-sm text-[var(--fg-muted)] truncate">
              ติดตามกระแสเงินสด สภาพคล่องบัญชีธนาคาร และรอบบิลบัตรเครดิต
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>จดรายการด่วน</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. HERO 3-STAT CARDS (SAVINGS, INCOME, EXPENSE)                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Savings / Flow */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium mb-3">
            <span className="font-semibold">เงินออมสุทธิเดือนนี้</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
            {summary.netSavings >= 0 ? "+" : ""}
            {formatCurrency(summary.netSavings)}
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
            <span>อัตราการออม</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {savingsRate}% ของรายรับ
            </span>
          </div>
        </div>

        {/* Total Income */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium mb-3">
            <span className="font-semibold">รายรับสะสม</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight tabular-nums">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
            <span>แหล่งรายได้</span>
            <span className="font-medium text-[var(--fg-primary)]">
              เงินเดือน, โบนัส, ปันผล
            </span>
          </div>
        </div>

        {/* Total Expense */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden group hover:border-rose-500/50 transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium mb-3">
            <span className="font-semibold">รายจ่ายสะสม</span>
            <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-500 tracking-tight tabular-nums">
            {formatCurrency(summary.totalExpense)}
          </div>
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] mt-3 pt-2.5 border-t border-[var(--border-subtle)]">
            <span>เฉลี่ยต่อวัน</span>
            <span className="font-medium text-[var(--fg-primary)]">
              ~{formatCurrency(summary.totalExpense / 30)} / วัน
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WALLETS & BANK ACCOUNTS (CONTAINED CARD + HORIZONTAL SWIPER)            */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--fg-primary)] tracking-tight">
                กระเป๋าเงิน & บัญชีธนาคาร
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[var(--fg-muted)] font-medium">
              ยอดคงเหลือรวม {formatCurrency(totalCashBalance)}
            </span>
            <button
              onClick={() => onNavigate("settings")}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>จัดการบัญชี ({accounts.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Big Contained Card */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs relative">
          {accounts.length === 0 ? (
            <div className="py-12 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-center">
              <Building2 className="w-8 h-8 text-[var(--fg-muted)] mx-auto mb-2" />
              <p className="text-sm font-bold text-[var(--fg-primary)]">
                ยังไม่มีข้อมูลบัญชีหรือกระเป๋าเงิน
              </p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                เพิ่มบัญชีเพื่อติดตามกระแสเงินสดและยอดคงเหลือรวม
              </p>
              <button
                onClick={() => onNavigate("settings")}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                เพิ่มบัญชีใหม่
              </button>
            </div>
          ) : (
            <div className="relative group/carousel">
              {/* Navigation Floating Buttons */}
              {accounts.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("accounts-scroll-container");
                      if (el) el.scrollBy({ left: -280, behavior: "smooth" });
                    }}
                    className="absolute -left-2 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md shadow-md border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 active:scale-95 transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100"
                    title="เลื่อนซ้าย"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("accounts-scroll-container");
                      if (el) el.scrollBy({ left: 280, behavior: "smooth" });
                    }}
                    className="absolute -right-2 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-8 h-8 rounded-full bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md shadow-md border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 active:scale-95 transition-all cursor-pointer opacity-100 sm:opacity-0 sm:group-hover/carousel:opacity-100"
                    title="เลื่อนขวา"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Horizontal Swiper Track */}
              <div
                id="accounts-scroll-container"
                className="flex gap-4 overflow-x-auto py-1 px-0.5 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {accounts.map((acc, idx) => {
                  const theme = getBankTheme(acc.name, acc.color);
                  const ratio =
                    totalCashBalance > 0
                      ? Math.min(
                        100,
                        Math.max(
                          0,
                          Math.round((Number(acc.balance) / totalCashBalance) * 100)
                        )
                      )
                      : 0;

                  return (
                    <div
                      key={acc.id}
                      onClick={() => setSelectedAccountIndex(idx)}
                      className={`snap-start shrink-0 w-[84%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] relative p-5 rounded-2xl bg-gradient-to-br ${theme.gradient} border ${theme.borderGlow} shadow-md hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between overflow-hidden min-h-[160px] cursor-pointer`}
                    >
                      {/* Ambient Specular Highlight */}
                      <div className="absolute right-0 top-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />
                      <div className="absolute left-0 bottom-0 -ml-4 -mb-4 w-20 h-20 rounded-full bg-black/15 blur-lg pointer-events-none" />

                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-xs border border-white/10 ${theme.textColor}`}
                          >
                            {theme.badgeText}
                          </span>
                          <span
                            className={`text-[11px] font-medium ${theme.subtextColor} opacity-90`}
                          >
                            {acc.type === "cash"
                              ? "เงินสด"
                              : acc.type === "e_wallet"
                                ? "E-Wallet"
                                : "ออมทรัพย์"}
                          </span>
                        </div>

                        <h4
                          className={`text-base font-extrabold tracking-tight truncate ${theme.textColor}`}
                        >
                          {acc.name}
                        </h4>
                        <p
                          className={`text-[11px] font-mono mt-0.5 tracking-wider ${theme.subtextColor} opacity-80`}
                        >
                          {acc.accountNumber
                            ? `•••• ${acc.accountNumber.slice(-4)}`
                            : acc.type === "cash"
                              ? "กระเป๋าเงินสดหลัก"
                              : "กระเป๋าดิจิทัล"}
                        </p>
                      </div>

                      <div className="relative z-10 mt-4 pt-2.5 border-t border-white/15">
                        <div className="flex items-baseline justify-between">
                          <span className={`text-[10px] font-medium ${theme.subtextColor}`}>
                            ยอดเงินคงเหลือ
                          </span>
                          <span className={`text-[10px] font-bold ${theme.subtextColor}`}>
                            {ratio}% ของเงินสด
                          </span>
                        </div>
                        <p
                          className={`text-lg font-black tracking-tight ${theme.textColor} drop-shadow-xs tabular-nums mt-0.5`}
                        >
                          {formatCurrency(acc.balance)}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Shortcut Card: Add New Account */}
                <div
                  onClick={() => onNavigate("settings")}
                  className="snap-start shrink-0 w-[84%] sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-11px)] xl:w-[calc(25%-12px)] relative p-5 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] hover:border-emerald-500/50 bg-[var(--bg-canvas)] hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[160px] cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] group-hover:border-emerald-500/50 flex items-center justify-center text-[var(--fg-muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-xs mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[var(--fg-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                    เพิ่มบัญชีหรือกระเป๋าเงิน
                  </span>
                  <span className="text-[10px] text-[var(--fg-muted)] mt-0.5">
                    ธนาคาร, เงินสด, ดิจิทัล
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CREDIT CARDS & BILLING CYCLES                                          */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--fg-primary)] tracking-tight">
                บัตรเครดิต & รอบบิลชำระ
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-[var(--fg-muted)] font-medium">
              ยอดค้างชำระรวม {formatCurrency(totalCardDebt)}
            </span>
            <button
              onClick={() => onNavigate("cards")}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>จัดการบัตร ({creditCards.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {creditCards.length === 0 ? (
          <div className="py-12 rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-center">
            <CreditCard className="w-8 h-8 text-[var(--fg-muted)] mx-auto mb-2" />
            <p className="text-sm font-bold text-[var(--fg-primary)]">
              ยังไม่มีข้อมูลบัตรเครดิต
            </p>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">
              เพิ่มบัตรเครดิตเพื่อควบคุมวงเงินและป้องกันดอกเบี้ยรอบบิล
            </p>
            <button
              onClick={() => onNavigate("cards")}
              className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition shadow-xs cursor-pointer"
            >
              เพิ่มบัตรใหม่
            </button>
          </div>
        ) : (
          (() => {
            const activeCard = creditCards[selectedCardIndex] || creditCards[0];
            const { days, label } = getDaysUntil(activeCard.dueDay);
            const usagePercent = Math.min(
              100,
              Math.round((activeCard.currentBalance / activeCard.creditLimit) * 100)
            );
            const remainingLimit = Math.max(
              0,
              activeCard.creditLimit - activeCard.currentBalance
            );
            const isUrgent =
              !activeCard.isPaidThisMonth && days <= 5 && activeCard.currentBalance > 0;

            const handlePrev = (e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedCardIndex((prev) => (prev > 0 ? prev - 1 : creditCards.length - 1));
            };

            const handleNext = (e: React.MouseEvent) => {
              e.stopPropagation();
              setSelectedCardIndex((prev) => (prev < creditCards.length - 1 ? prev + 1 : 0));
            };

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs">
                {/* Left: Card Display with Navigation Controls */}
                <div className="lg:col-span-6 flex flex-col items-center justify-center">
                  <div className="relative w-full max-w-[340px] flex items-center justify-center">
                    {/* ปุ่มเลื่อนซ้าย */}
                    {creditCards.length > 1 && (
                      <button
                        type="button"
                        onClick={handlePrev}
                        className="absolute -left-3 sm:-left-5 z-40 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-md border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="บัตรก่อนหน้า"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                    )}

                    {/* Physical Stack Display */}
                    <div className="relative w-full aspect-[1.586/1] h-[190px] sm:h-[210px]">
                      {creditCards.map((card, index) => {
                        const preset = findCardPreset(card.name, card.bank);
                        const diff =
                          (index - selectedCardIndex + creditCards.length) %
                          creditCards.length;
                        const isVisible = diff >= 0 && diff <= 2;
                        if (!isVisible) return null;

                        const translateY = diff * 12;
                        const scale = 1 - diff * 0.04;
                        const zIndex = 30 - diff * 10;
                        const isTop = diff === 0;

                        return (
                          <div
                            key={card.id}
                            onClick={() => setSelectedCardIndex(index)}
                            style={
                              {
                                "--base-y": `${translateY}px`,
                                "--base-scale": scale,
                                zIndex,
                              } as React.CSSProperties
                            }
                            className={`absolute inset-x-0 top-0 aspect-[1.586/1] rounded-2xl cursor-pointer overflow-hidden
        [transform:translateY(var(--base-y))_scale(var(--base-scale))]
        transition-all duration-500 [transition-timing-function:cubic-bezier(0.34,1.56,0.64,1)]
        ${isTop
                                ? "shadow-xl ring-1 ring-black/10 dark:ring-white/15 hover:[transform:translateY(calc(var(--base-y)-12px))_scale(calc(var(--base-scale)*1.02))_rotate(-1.5deg)_rotateX(4deg)] hover:shadow-2xl hover:shadow-black/25 dark:hover:shadow-black/50"
                                : "opacity-80 hover:opacity-100 hover:[transform:translateY(calc(var(--base-y)-8px))_scale(var(--base-scale))_rotate(-0.8deg)] shadow-lg"
                              }`}
                          >
                            <CreditCardMockup
                              bank={card.bank}
                              name={card.name}
                              lastFourDigits={card.lastFourDigits}
                              preset={preset}
                              customColor={card.cardColor}
                              creditLimit={card.creditLimit}
                              statementDay={card.statementDay}
                              dueDay={card.dueDay}
                              className="w-full h-full pointer-events-none"
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* ปุ่มเลื่อนขวา */}
                    {creditCards.length > 1 && (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="absolute -right-3 sm:-right-5 z-40 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md shadow-md border border-zinc-200/80 dark:border-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-200 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                        title="บัตรถัดไป"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Pagination Dots Indicator */}
                  {creditCards.length > 1 && (
                    <div className="flex items-center justify-center gap-1.5 pt-12">
                      {creditCards.map((_, dotIdx) => (
                        <button
                          key={dotIdx}
                          onClick={() => setSelectedCardIndex(dotIdx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${selectedCardIndex === dotIdx
                            ? "w-6 bg-zinc-900 dark:bg-white"
                            : "w-1.5 bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                            }`}
                          aria-label={`ไปที่บัตรใบที่ ${dotIdx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Dynamic Financial Ledger Specs */}
                <div className="lg:col-span-6 space-y-6 lg:pl-4">
                  {/* Top: Card Details & Status Badge */}
                  <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
                    <div>
                      <span className="text-[11px] font-bold text-[var(--fg-muted)] uppercase tracking-wider">
                        บัตรที่เลือก ({selectedCardIndex + 1}/{creditCards.length})
                      </span>
                      <h4 className="text-base font-extrabold text-[var(--fg-primary)] mt-0.5">
                        {activeCard.name}
                      </h4>
                      <p className="text-xs text-[var(--fg-muted)] font-mono mt-0.5">
                        •••• •••• •••• {activeCard.lastFourDigits}
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold shrink-0 ${activeCard.isPaidThisMonth
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                        : isUrgent
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 animate-pulse"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                        }`}
                    >
                      {activeCard.isPaidThisMonth ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : isUrgent ? (
                        <AlertCircle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {activeCard.isPaidThisMonth ? "ชำระครบแล้ว" : label}
                    </span>
                  </div>

                  {/* Middle: Financial Metrics Strip */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                        ยอดที่ต้องชำระ
                      </span>
                      <div className="text-xl font-black text-[var(--fg-primary)] tabular-nums">
                        {formatCurrency(activeCard.currentBalance)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                        วงเงินคงเหลือ
                      </span>
                      <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                        {formatCurrency(remainingLimit)}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                        ตัดรอบ / ครบกำหนด
                      </span>
                      <div className="text-xs font-bold text-[var(--fg-primary)] pt-1">
                        ทุกวันที่ {activeCard.statementDay} / {activeCard.dueDay}
                      </div>
                    </div>
                  </div>

                  {/* Usage Progress Line */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs text-[var(--fg-muted)]">
                      <span>ใช้วงเงินไปแล้ว {usagePercent}%</span>
                      <span>วงเงินรวม {formatCurrency(activeCard.creditLimit)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${usagePercent > 80
                          ? "bg-rose-500"
                          : usagePercent > 50
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          }`}
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-1 flex items-center justify-end">
                    <button
                      onClick={() => onNavigate("cards")}
                      className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                    >
                      ดูรายการและบันทึกชำระบิล
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </section>

      {/* ========================================================================= */}
      {/* 6. RECURRING SUBSCRIPTIONS (FULL-WIDTH ENRICHED FINTECH PANEL)              */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="min-w-8 min-h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[var(--fg-primary)] tracking-tight">
                ค่าบริการรายเดือนและสมาชิก (Subscriptions & Recurring)
              </h3>
            </div>
          </div>

          <button
            onClick={() => onNavigate("subscriptions")}
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>จัดการ Subscriptions ({subscriptions.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Big Contained Card */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 shadow-xs space-y-6">
          {/* Subscriptions Overview Metric Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                ค่าบริการรวมต่อเดือน
              </span>
              <p className="text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight tabular-nums">
                {formatCurrency(summary.monthlySubscriptionTotal)}
              </p>
              <span className="text-[10px] text-[var(--fg-muted)] block">
                คำนวณเฉลี่ยรายเดือน
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                ประมาณการต่อปี
              </span>
              <p className="text-lg sm:text-xl font-black text-[var(--fg-primary)] tracking-tight tabular-nums">
                {formatCurrency(summary.monthlySubscriptionTotal * 12)}
              </p>
              <span className="text-[10px] text-[var(--fg-muted)] block">
                รวมรายจ่ายระยะยาว
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                บริการที่เปิดใช้งาน
              </span>
              <p className="text-lg sm:text-xl font-black text-[var(--fg-primary)] tracking-tight tabular-nums">
                {activeSubscriptions.length} <span className="text-xs font-medium text-[var(--fg-muted)]">/ {subscriptions.length} บริการ</span>
              </p>
              <span className="text-[10px] text-[var(--fg-muted)] block">
                {subscriptions.length - activeSubscriptions.length} บริการพักการใช้งาน
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] text-[var(--fg-muted)] font-medium">
                บิลถัดไปที่ใกล้ถึง
              </span>
              {nextUpcomingSub ? (
                <div>
                  <p className="text-sm font-black text-[var(--fg-primary)] truncate">
                    {nextUpcomingSub.name}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <Clock className="w-3 h-3" />
                    {getSubscriptionDaysLeft(nextUpcomingSub.nextBillingDate).label} ({formatCurrency(nextUpcomingSub.amount)})
                  </span>
                </div>
              ) : (
                <p className="text-xs text-[var(--fg-muted)] pt-1">ไม่มีบิลใกล้ถึง</p>
              )}
            </div>
          </div>

          {/* Subscriptions Grid List */}
          {subscriptions.length === 0 ? (
            <div className="py-12 rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-center">
              <Calendar className="w-8 h-8 text-[var(--fg-muted)] mx-auto mb-2" />
              <p className="text-sm font-bold text-[var(--fg-primary)]">
                ยังไม่มีรายการ Subscription ที่บันทึกไว้
              </p>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                เพิ่มบริการรายเดือน เช่น Netflix, Spotify, YouTube เพื่อควบคุมค่าใช้จ่ายคงที่
              </p>
              <button
                onClick={() => onNavigate("subscriptions")}
                className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                เพิ่มบริการแรก
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {subscriptions.map((sub) => {
                const daysInfo = getSubscriptionDaysLeft(sub.nextBillingDate);
                const paymentInfo = getLinkedPaymentInfo(sub.linkedAccountId);
                const isUrgent = sub.isActive && daysInfo.days <= 3 && !daysInfo.isOverdue;

                return (
                  <div
                    key={sub.id}
                    onClick={() => onNavigate("subscriptions")}
                    className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-sm ${sub.isActive
                      ? "bg-[var(--bg-canvas)] border-[var(--border-subtle)] hover:border-emerald-500/40"
                      : "bg-zinc-50/50 dark:bg-zinc-900/20 border-zinc-200/50 dark:border-zinc-800/50 opacity-60 hover:opacity-80"
                      }`}
                  >
                    <div>
                      {/* Top: Brand Icon + Status Chip */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <SubscriptionBrandIcon
                            name={sub.name}
                            iconKey={sub.icon}
                            color={sub.color}
                            className="w-9 h-9 rounded-xl shrink-0 shadow-2xs"
                            size={18}
                          />
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-[var(--fg-primary)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {sub.name}
                            </h4>
                            <span className="text-[10px] text-[var(--fg-muted)] font-medium block truncate">
                              {sub.category || "บริการดิจิทัล"}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${!sub.isActive
                            ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                            : isUrgent
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40"
                            }`}
                        >
                          {sub.isActive ? (sub.billingCycle === "monthly" ? "รายเดือน" : "รายปี") : "หยุดชั่วคราว"}
                        </span>
                      </div>

                      {/* Middle: Linked Account Info */}
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--fg-muted)] py-1">
                        {paymentInfo ? (
                          <>
                            {paymentInfo.isCard ? (
                              <CreditCard className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            ) : (
                              <Building2 className="w-3.5 h-3.5 shrink-0 text-zinc-500" />
                            )}
                            <span className="truncate">ตัดผ่าน: {paymentInfo.name}</span>
                          </>
                        ) : (
                          <>
                            <Wallet className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                            <span className="text-zinc-400">ยังไม่ผูกช่องทางชำระ</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Bottom: Renewal Date & Price */}
                    <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-end justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[var(--fg-muted)] block">รอบถัดไป</span>
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-[var(--fg-primary)]">
                          <span>{formatShortDate(sub.nextBillingDate)}</span>
                          {sub.isActive && (
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${isUrgent
                                ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                                : "text-[var(--fg-muted)]"
                                }`}
                            >
                              ({daysInfo.label})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-base font-black text-[var(--fg-primary)] tabular-nums tracking-tight">
                          {formatCurrency(sub.amount)}
                        </p>
                        <span className="text-[10px] text-[var(--fg-muted)] block">
                          /{sub.billingCycle === "monthly" ? "ด." : "ปี"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Add New Subscription Ghost Card */}
              <div
                onClick={() => onNavigate("subscriptions")}
                className="p-4 rounded-2xl border-2 border-dashed border-[var(--border-subtle)] hover:border-emerald-500/50 bg-[var(--bg-canvas)] hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 transition-all duration-200 flex flex-col items-center justify-center text-center min-h-[140px] cursor-pointer group"
              >
                <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] group-hover:border-emerald-500/50 flex items-center justify-center text-[var(--fg-muted)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors shadow-xs mb-1.5">
                  <Plus className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-[var(--fg-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  เพิ่มบริการใหม่
                </span>
                <span className="text-[10px] text-[var(--fg-muted)] mt-0.5">
                  บันทึกค่าใช้จ่ายคงที่
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. RECENT TRANSACTIONS FEED                                               */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* RECENT TRANSACTIONS (GRID / LIST TOGGLE WITH FINTECH CARD UI)             */}
      {/* ========================================================================= */}
      <section className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center font-bold shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-950 dark:text-white tracking-tight">
                รายการล่าสุด
              </h3>
            </div>
          </div>

          {/* Controls & Nav Link */}
          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigate("transactions")}
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>ประวัติทั้งหมด ({transactions.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Outer Container */}
        <div className="rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 sm:p-6 shadow-xs">
          {transactions.length === 0 ? (
            <div className="py-12 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 text-center">
              <Receipt className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                ยังไม่มีรายการธุรกรรมที่บันทึกไว้
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                เริ่มจดบันทึกรายรับหรือรายจ่ายเพื่อติดตามกระแสเงินสด
              </p>
              <button
                onClick={onOpenQuickAdd}
                className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                จดรายการแรก
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* View Switcher: ชิดขวา ขนาดกะทัดรัด ไม่ยืดเต็ม */}
              <div className="flex items-center justify-end">
                <span className="text-xs text-zinc-400 mr-2">มุมมอง: </span>
                <div className="inline-flex items-center p-0.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setTxViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${txViewMode === "list"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    title="มุมมองรายการ (List View)"
                    aria-label="List view"
                  >
                    <List className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setTxViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${txViewMode === "grid"
                      ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-semibold"
                      : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                      }`}
                    title="มุมมองตาราง (Grid View)"
                    aria-label="Grid view"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {txViewMode === "grid" ? (
                /* Grid View Mode */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {transactions.slice(0, 6).map((tx) => {
                    const IconComponent = CATEGORY_ICON_MAP[tx.categoryIcon] || Receipt;
                    const isIncome = tx.type === "income";
                    const isTransfer = tx.type === "transfer";
                    const accountLabel = tx.creditCardId
                      ? creditCards.find((c) => c.id === tx.creditCardId)?.name || "บัตรเครดิต"
                      : accounts.find((a) => a.id === tx.accountId)?.name || "กระเป๋าเงิน";

                    return (
                      <div
                        key={tx.id}
                        onClick={() => onNavigate("transactions")}
                        className="p-4 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/50 border border-zinc-200/70 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs transition-all duration-200 group cursor-pointer flex flex-col justify-between min-h-[145px]"
                      >
                        <div>
                          {/* Card Top: Icon & Category/Type Badges */}
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isIncome
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : isTransfer
                                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                }`}
                            >
                              <IconComponent className="w-4.5 h-4.5" />
                            </div>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isIncome
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40"
                                : isTransfer
                                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40"
                                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40"
                                }`}
                            >
                              {isIncome ? "รายรับ" : isTransfer ? "โอนย้าย" : "รายจ่าย"}
                            </span>
                          </div>

                          {/* Note / Category & Account Route */}
                          <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {tx.note || tx.categoryName}
                          </p>
                          <p className="text-[11px] text-zinc-400 mt-0.5 truncate flex items-center gap-1.5">
                            <span className="font-medium text-zinc-500 dark:text-zinc-400">{tx.categoryName}</span>
                            <span>•</span>
                            <span className="font-mono text-zinc-400">{accountLabel}</span>
                          </p>
                        </div>

                        {/* Card Bottom: Date & Tabular Amount */}
                        <div className="mt-3.5 pt-2.5 border-t border-zinc-200/70 dark:border-zinc-800/80 flex items-baseline justify-between gap-2">
                          <span className="text-[10.5px] text-zinc-400 font-medium">
                            {formatShortDate(tx.date)}
                          </span>
                          <p
                            className={`text-base font-black tracking-tight tabular-nums ${isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isTransfer
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-rose-600 dark:text-rose-400"
                              }`}
                          >
                            {isIncome ? "+" : isTransfer ? "" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* List View Mode */
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800/70">
                  {transactions.slice(0, 6).map((tx) => {
                    const IconComponent = CATEGORY_ICON_MAP[tx.categoryIcon] || Receipt;
                    const isIncome = tx.type === "income";
                    const isTransfer = tx.type === "transfer";
                    const accountLabel = tx.creditCardId
                      ? creditCards.find((c) => c.id === tx.creditCardId)?.name || "บัตรเครดิต"
                      : accounts.find((a) => a.id === tx.accountId)?.name || "กระเป๋าเงิน";

                    return (
                      <div
                        key={tx.id}
                        onClick={() => onNavigate("transactions")}
                        className="py-3 sm:py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 group hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 px-3 -mx-3 rounded-2xl transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${isIncome
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              : isTransfer
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                              }`}
                          >
                            <IconComponent className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <p className="text-sm font-bold text-zinc-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {tx.note || tx.categoryName}
                            </p>
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                              <span className="font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                                {tx.categoryName}
                              </span>
                              <span>•</span>
                              <span className="font-mono text-zinc-400 truncate">{accountLabel}</span>
                              <span>•</span>
                              <span>{formatShortDate(tx.date)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p
                            className={`text-base font-black tracking-tight tabular-nums ${isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isTransfer
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-rose-600 dark:text-rose-400"
                              }`}
                          >
                            {isIncome ? "+" : isTransfer ? "" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          <span className="text-[10.5px] text-zinc-400 block font-medium mt-0.5">
                            {isIncome ? "รายรับ" : isTransfer ? "โอนย้าย" : "รายจ่าย"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Footer Info & Quick Link */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400">
                <span>แสดง 6 รายการล่าสุดจากทั้งหมด {transactions.length} รายการ</span>
                <button
                  onClick={() => onNavigate("transactions")}
                  className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>ดูสมุดบัญชีทั้งหมด</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}