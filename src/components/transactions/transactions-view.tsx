"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Receipt,
  Search,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  FileImage,
  X,
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
  AlertTriangle,
  LayoutGrid,
  List,
  Building2,
  Calendar,
  CircleDollarSign,
  Filter,
  ArrowRight,
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Transaction } from "@/lib/types";

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

const PAGE_SIZE_OPTIONS = [25, 50, 75, 100, 250, 500, "all"] as const;
type PageSize = (typeof PAGE_SIZE_OPTIONS)[number];

interface TransactionsViewProps {
  onOpenQuickAdd: () => void;
}

export function TransactionsView({ onOpenQuickAdd }: TransactionsViewProps) {
  const { transactions, accounts, creditCards, deleteTransaction } = useFinance();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [txViewMode, setTxViewMode] = useState<"list" | "grid">("list");
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedSlip, setSelectedSlip] = useState<string | null>(null);
  const [txToDelete, setTxToDelete] = useState<Transaction | null>(null);

  // Reset to page 1 whenever filters or pageSize change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, accountFilter, pageSize]);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (filterType !== "all" && tx.type !== filterType) return false;

      // Account / Card Filter
      if (accountFilter !== "all") {
        const matchesAccount = tx.accountId === accountFilter;
        const matchesCard = tx.creditCardId === accountFilter;
        if (!matchesAccount && !matchesCard) return false;
      }

      // Search Filter
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const noteMatch = tx.note?.toLowerCase().includes(term);
        const categoryMatch = tx.categoryName.toLowerCase().includes(term);
        if (!noteMatch && !categoryMatch) return false;
      }

      return true;
    });
  }, [transactions, filterType, accountFilter, searchTerm]);

  // Aggregate Metrics for current filtered view
  const { totalIncome, totalExpense, netFlow, incomeCount, expenseCount } = useMemo(() => {
    let income = 0;
    let expense = 0;
    let inCount = 0;
    let exCount = 0;

    filteredTransactions.forEach((tx) => {
      // Exclude credit card swipes from overall cash flow cards unless explicitly filtering by a specific credit card
      const isCardTx = Boolean(tx.creditCardId);
      if (!isCardTx || accountFilter !== "all") {
        if (tx.type === "income") {
          income += Number(tx.amount || 0);
          inCount++;
        } else if (tx.type === "expense") {
          expense += Number(tx.amount || 0);
          exCount++;
        }
      }
    });

    return {
      totalIncome: income,
      totalExpense: expense,
      netFlow: income - expense,
      incomeCount: inCount,
      expenseCount: exCount,
    };
  }, [filteredTransactions, accountFilter]);

  // Helper to resolve payment source
  const getSourceLabel = (tx: Transaction) => {
    if (tx.creditCardId) {
      const card = creditCards.find((c) => c.id === tx.creditCardId);
      return { name: card?.name || "บัตรเครดิต", isCard: true };
    }
    const acc = accounts.find((a) => a.id === tx.accountId);
    return { name: acc?.name || "กระเป๋าเงิน", isCard: false };
  };

  // Pagination Calculations
  const totalItems = filteredTransactions.length;
  const effectivePageSize = pageSize === "all" ? totalItems || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / effectivePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedTransactions = useMemo(() => {
    if (pageSize === "all") return filteredTransactions;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, safeCurrentPage, pageSize]);

  const startIndex = totalItems === 0 ? 0 : pageSize === "all" ? 1 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = pageSize === "all" ? totalItems : Math.min(safeCurrentPage * pageSize, totalItems);

  const isFiltered = searchTerm !== "" || filterType !== "all" || accountFilter !== "all";

  const clearAllFilters = () => {
    setSearchTerm("");
    setFilterType("all");
    setAccountFilter("all");
  };

  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (safeCurrentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", safeCurrentPage - 1, safeCurrentPage, safeCurrentPage + 1, "...", totalPages];
  }, [totalPages, safeCurrentPage]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & PRIMARY ACTION                                            */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Financial Ledger
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-xs text-[var(--fg-muted)] font-medium">
              ทั้งหมด {transactions.length} รายการ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight">
            บันทึกรายรับ - รายจ่าย
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)]">
            ประวัติการเงินแบบละเอียด ค้นหาธุรกรรม ตรวจสอบสลิป และบริหารกระแสเงินสด
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
          <button
            onClick={onOpenQuickAdd}
            className="flex items-center gap-2 px-4.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-xs shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการใหม่</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE FINANCIAL CARDS (MOBILE CAROUSEL / DESKTOP GRID)              */}
      {/* ========================================================================= */}
      <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-1 sm:pb-0 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Income Card */}
        <div className="snap-start shrink-0 w-[82%] sm:w-auto p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold mb-2">
            <span>รายรับรวม</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
            +{formatCurrency(totalIncome)}
          </div>
          <p className="text-[10.5px] text-[var(--fg-muted)] mt-1.5">
            {incomeCount} รายการรับ
          </p>
        </div>

        {/* Expense Card */}
        <div className="snap-start shrink-0 w-[82%] sm:w-auto p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold mb-2">
            <span>รายจ่ายรวม</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums tracking-tight">
            -{formatCurrency(totalExpense)}
          </div>
          <p className="text-[10.5px] text-[var(--fg-muted)] mt-1.5">
            {expenseCount} รายการจ่าย
          </p>
        </div>

        {/* Net Flow Card */}
        <div className="snap-start shrink-0 w-[82%] sm:w-auto p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xs relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold mb-2">
            <span>กระแสเงินสดสุทธิ</span>
            <div className="w-7 h-7 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[var(--fg-primary)] flex items-center justify-center">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl sm:text-2xl font-black tabular-nums tracking-tight ${netFlow >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
          >
            {netFlow >= 0 ? "+" : ""}
            {formatCurrency(netFlow)}
          </div>
          <p className="text-[10.5px] text-[var(--fg-muted)] mt-1.5 truncate">
            {netFlow >= 0 ? "กระแสเงินสดเกินดุล" : "กระแสเงินสดขาดดุล"}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STRUCTURED TOOLBAR (HEIGHT SYNCHRONIZED & BALANCED)                    */}
      {/* ========================================================================= */}
      <div className="space-y-3 bg-[var(--bg-surface)] p-3.5 sm:p-4 rounded-3xl border border-[var(--border-subtle)] shadow-xs">
        {/* Tier 1: Search, Accounts & Type Segmentation (ความสูง h-10 เท่ากันทุกช่อง) */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
          {/* 1. Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="ค้นหาชื่อรายการ, หมวดหมู่ หรือหมายเหตุ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-9 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--fg-primary)] placeholder:text-zinc-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Account/Card Dropdown Filter */}
          <div className="relative min-w-[210px] shrink-0">
            <Wallet className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="w-full h-10 appearance-none pl-9 pr-8 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--fg-secondary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none cursor-pointer truncate"
            >
              <option value="all">ทุกช่องทางชำระ ({accounts.length + creditCards.length})</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.type === "cash" ? "เงินสด" : "บัญชี"})
                </option>
              ))}
              {creditCards.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (บัตรเครดิต)
                </option>
              ))}
            </select>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400 rotate-90 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Type Filter Segmented Control */}
          <div className="h-10 inline-flex items-center p-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] shrink-0 self-start sm:self-auto box-border">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`h-full px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${filterType === "all"
                ? "bg-white dark:bg-zinc-800 text-[var(--fg-primary)] shadow-xs"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
            >
              ทั้งหมด
            </button>
            <button
              type="button"
              onClick={() => setFilterType("expense")}
              className={`h-full px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${filterType === "expense"
                ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 shadow-xs"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
            >
              รายจ่าย
            </button>
            <button
              type="button"
              onClick={() => setFilterType("income")}
              className={`h-full px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${filterType === "income"
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs"
                : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
            >
              รายรับ
            </button>
          </div>

          {/* Reset Filter Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="h-10 inline-flex items-center justify-center gap-1.5 px-3 rounded-xl text-xs font-bold text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-transparent hover:border-rose-200/60 transition cursor-pointer shrink-0"
              title="รีเซ็ตตัวกรองทั้งหมด"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ล้างตัวกรอง</span>
            </button>
          )}
        </div>

        {/* Tier 2: Status Meta, Page Size & View Switcher (ความสูง h-9 เท่ากันทุกองค์ประกอบฝั่งขวา) */}
        <div className="pt-2.5 border-t border-[var(--border-subtle)] text-xs">
          <div className="flex justify-between items-center gap-2.5">
            {/* Rows Per Page Dropdown Box (h-10 matching top filter, full click area including arrow) */}
            <div className="relative h-10 shrink-0">
              <span className="text-xs font-semibold text-[var(--fg-muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                แสดง:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === "all" ? "all" : Number(e.target.value);
                  setPageSize(val as PageSize);
                }}
                className="w-full h-10 appearance-none pl-12 pr-8 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--fg-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none cursor-pointer"
              >
                <option value={25} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">25</option>
                <option value={50} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">50</option>
                <option value={75} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">75</option>
                <option value={100} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">100</option>
                <option value={250} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">250</option>
                <option value={500} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">500</option>
                <option value="all" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">ทั้งหมด</option>
              </select>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400 rotate-90 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* List / Grid Segmented Toggle (h-10 matching height) */}
            <div className="h-10 inline-flex items-center p-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setTxViewMode("list")}
                className={`h-full w-8 rounded-lg transition-all cursor-pointer flex items-center justify-center ${txViewMode === "list"
                  ? "bg-white dark:bg-zinc-800 text-[var(--fg-primary)] shadow-xs font-semibold"
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
                className={`h-full w-8 rounded-lg transition-all cursor-pointer flex items-center justify-center ${txViewMode === "grid"
                  ? "bg-white dark:bg-zinc-800 text-[var(--fg-primary)] shadow-xs font-semibold"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                  }`}
                title="มุมมองตาราง (Grid View)"
                aria-label="Grid view"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TRANSACTIONS CONTENT CONTAINER                                         */}
      {/* ========================================================================= */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 sm:p-6 shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-14">
            <Receipt className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-2.5" />
            <p className="text-sm font-bold text-[var(--fg-primary)]">
              {isFiltered ? "ไม่พบรายการที่ตรงกับเงื่อนไข" : "ยังไม่มีรายการธุรกรรมในระบบ"}
            </p>
            <p className="text-xs text-[var(--fg-muted)] mt-1">
              {isFiltered ? "ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรอง" : "เริ่มต้นจดบันทึกรายรับหรือรายจ่ายรายการแรก"}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-bold text-[var(--fg-primary)] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {txViewMode === "grid" ? (
              /* Grid View Mode */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paginatedTransactions.map((tx) => {
                  const IconComponent = CATEGORY_ICON_MAP[tx.categoryIcon] || Receipt;
                  const isIncome = tx.type === "income";
                  const isTransfer = tx.type === "transfer";
                  const source = getSourceLabel(tx);

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-emerald-500/40 hover:shadow-xs transition-all duration-200 group flex flex-col justify-between min-h-[145px]"
                    >
                      <div>
                        {/* Top: Icon, Type Badge & Actions */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${isIncome
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : isTransfer
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                              }`}
                          >
                            <IconComponent className="w-4.5 h-4.5" />
                          </div>

                          <div className="flex items-center gap-1.5">
                            {tx.slipUrl && (
                              <button
                                type="button"
                                onClick={() => setSelectedSlip(tx.slipUrl || null)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="ดูรูปสลิป"
                              >
                                <FileImage className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${isIncome
                                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40"
                                : isTransfer
                                  ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/40"
                                  : "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/40"
                                }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${isIncome ? "bg-emerald-500" : isTransfer ? "bg-blue-500" : "bg-rose-500"
                                  }`}
                              />
                              {isIncome ? "รายรับ" : isTransfer ? "โอนเงิน" : "รายจ่าย"}
                            </span>

                            <button
                              type="button"
                              onClick={() => setTxToDelete(tx)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title & Metadata Tags */}
                        <h4 className="text-sm font-bold text-[var(--fg-primary)] truncate">
                          {tx.note || tx.categoryName}
                        </h4>
                        <div className="flex flex-wrap items-center gap-1 mt-1.5">
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 truncate max-w-[120px]">
                            {tx.categoryName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 truncate max-w-[110px]">
                            {source.name}
                          </span>
                        </div>
                      </div>

                      {/* Bottom: Date & Amount */}
                      <div className="mt-3 pt-2 border-t border-[var(--border-subtle)] flex items-baseline justify-between gap-2">
                        <span className="text-[10.5px] text-[var(--fg-muted)] font-medium">
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
              <div className="divide-y divide-[var(--border-subtle)]/70">
                {paginatedTransactions.map((tx) => {
                  const IconComponent = CATEGORY_ICON_MAP[tx.categoryIcon] || Receipt;
                  const isIncome = tx.type === "income";
                  const isTransfer = tx.type === "transfer";
                  const source = getSourceLabel(tx);

                  return (
                    <div
                      key={tx.id}
                      className="py-3 first:pt-0.5 last:pb-0.5 flex items-center justify-between gap-2.5 group hover:bg-[var(--bg-canvas)] px-2.5 -mx-2.5 rounded-2xl transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${isIncome
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : isTransfer
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                            }`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-xs sm:text-sm font-bold text-[var(--fg-primary)] truncate">
                              {tx.note || tx.categoryName}
                            </h5>
                            {tx.slipUrl && (
                              <button
                                type="button"
                                onClick={() => setSelectedSlip(tx.slipUrl || null)}
                                className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0"
                                title="ดูสลิป"
                              >
                                <FileImage className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1 text-[10px] sm:text-[11px]">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded truncate max-w-[90px] sm:max-w-none">
                              {tx.categoryName}
                            </span>
                            <span className="font-mono text-zinc-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 px-1.5 py-0.5 rounded flex items-center gap-1 truncate max-w-[90px] sm:max-w-none">
                              {source.name}
                            </span>
                            <span className="text-[var(--fg-muted)] pl-0.5 text-[9.5px] sm:text-[10.5px]">
                              {formatShortDate(tx.date)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Amount & Actions */}
                      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                        <div className="text-right">
                          <p
                            className={`text-sm sm:text-base font-black tracking-tight tabular-nums ${isIncome
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isTransfer
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-rose-600 dark:text-rose-400"
                              }`}
                          >
                            {isIncome ? "+" : isTransfer ? "" : "-"}
                            {formatCurrency(tx.amount)}
                          </p>
                          <span
                            className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isIncome
                              ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300"
                              : isTransfer
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300"
                              }`}
                          >
                            {isIncome ? "รับ" : isTransfer ? "โอน" : "จ่าย"}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setTxToDelete(tx)}
                          className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="ลบรายการ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls Footer */}
            <div className="pt-3.5 border-t border-[var(--border-subtle)]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--fg-muted)]">
              <div className="text-[11px] sm:text-xs text-center sm:text-left">
                {pageSize === "all" ? (
                  <span>
                    ทั้งหมด <strong className="text-[var(--fg-primary)] font-bold">{totalItems}</strong> รายการ
                  </span>
                ) : (
                  <span>
                    แสดง <strong className="text-[var(--fg-primary)] font-bold">{startIndex}</strong>-
                    <strong className="text-[var(--fg-primary)] font-bold">{endIndex}</strong> จาก{" "}
                    <strong className="text-[var(--fg-primary)] font-bold">{totalItems}</strong>
                  </span>
                )}
              </div>

              {pageSize !== "all" && totalPages > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage(1)}
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="หน้าแรก"
                  >
                    <ChevronsLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="ก่อนหน้า"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1 px-1">
                    {pageNumbers.map((p, idx) => {
                      if (p === "...") {
                        return (
                          <span key={`ellipsis-${idx}`} className="px-0.5 text-xs text-[var(--fg-muted)]">
                            …
                          </span>
                        );
                      }
                      const isCurrent = p === safeCurrentPage;
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setCurrentPage(Number(p))}
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-bold transition cursor-pointer ${isCurrent
                            ? "bg-emerald-600 text-white shadow-xs"
                            : "text-[var(--fg-secondary)] hover:bg-[var(--bg-canvas)]"
                            }`}
                        >
                          {p}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="ถัดไป"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(totalPages)}
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                    title="หน้าสุดท้าย"
                  >
                    <ChevronsRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) for Mobile */}
      <button
        onClick={onOpenQuickAdd}
        className="sm:hidden fixed right-5 bottom-6 z-40 w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition-transform cursor-pointer"
        aria-label="เพิ่มรายการด่วน"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Slip Preview Modal */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative max-w-sm w-full bg-[var(--bg-surface)] p-4 sm:p-5 rounded-3xl border border-[var(--border-subtle)] shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
              <div>
                <h4 className="text-sm font-bold text-[var(--fg-primary)]">สลิป / หลักฐานการจ่าย</h4>
                <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">ภาพหลักฐานที่บันทึกไว้ในรายการ</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSlip(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] flex items-center justify-center p-1">
              <img
                src={selectedSlip}
                alt="Payment Slip"
                className="w-full max-h-[60vh] object-contain rounded-xl"
              />
            </div>
            <button
              type="button"
              onClick={() => setSelectedSlip(null)}
              className="w-full py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {txToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-[var(--fg-primary)]">
                ยืนยันการลบรายการธุรกรรม?
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
                คุณต้องการลบรายการ <strong className="text-[var(--fg-primary)] font-semibold">"{txToDelete.note || txToDelete.categoryName}"</strong> ยอดเงิน {formatCurrency(txToDelete.amount)} ใช่หรือไม่?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setTxToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTransaction(txToDelete.id);
                  setTxToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                ลบรายการ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}