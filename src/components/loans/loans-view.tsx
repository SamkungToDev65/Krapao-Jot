"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HandCoins,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowDownLeft,
  Phone,
  Edit2,
  Trash2,
  History,
  X,
  FileText,
  TrendingUp,
  LayoutGrid,
  List,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { Loan, LoanStatus } from "@/lib/types";
import { formatCurrency, formatShortDate } from "@/lib/utils";

// Modular Sub-Components (Modals & Dialogs)
import { AddLoanModal } from "./add-loan-modal";
import { RepayLoanModal } from "./repay-loan-modal";
import { LoanHistoryModal } from "./loan-history-modal";
import { EditLoanModal } from "./edit-loan-modal";
import { DeleteLoanDialog } from "./delete-loan-dialog";

export function LoansView() {
  const {
    loans,
    accounts,
    addLoan,
    recordRepayment,
    deleteRepayment,
    updateLoan,
    deleteLoan,
  } = useFinance();

  // UX Controls: View Mode, Search, Status Filter, Sort, Pagination
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | LoanStatus>("all");
  const [sortBy, setSortBy] = useState<"newest" | "highest_debt" | "name">("newest");
  const [pageSize, setPageSize] = useState<number | "all">(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, sortBy, pageSize]);

  // Modal Visibility States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [activeRepayLoan, setActiveRepayLoan] = useState<Loan | null>(null);
  const [activeHistoryLoan, setActiveHistoryLoan] = useState<Loan | null>(null);
  const [activeEditLoan, setActiveEditLoan] = useState<Loan | null>(null);
  const [activeDeleteLoan, setActiveDeleteLoan] = useState<Loan | null>(null);

  // =========================================================================
  // FINANCIAL METRICS (60-30-10 COLOR HARMONY)
  // =========================================================================
  const stats = useMemo(() => {
    let totalLentAllTime = 0;
    let totalRecovered = 0;
    let totalOutstanding = 0;
    let pendingDebtorsCount = 0;

    loans.forEach((loan) => {
      const orig = Number(loan.originalAmount) || 0;
      const paid = Number(loan.totalPaid) || 0;
      const remaining = Math.max(0, orig - paid);

      totalLentAllTime += orig;
      totalRecovered += paid;

      if (loan.status !== "paid" && remaining > 0) {
        totalOutstanding += remaining;
        pendingDebtorsCount += 1;
      }
    });

    const recoveryRate =
      totalLentAllTime > 0 ? (totalRecovered / totalLentAllTime) * 100 : 0;

    return {
      totalLentAllTime,
      totalRecovered,
      totalOutstanding,
      pendingDebtorsCount,
      recoveryRate,
    };
  }, [loans]);

  // =========================================================================
  // FILTERING & SORTING LOGIC
  // =========================================================================
  const filteredAndSortedLoans = useMemo(() => {
    const result = loans.filter((loan) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        loan.borrowerName.toLowerCase().includes(query) ||
        (loan.note && loan.note.toLowerCase().includes(query)) ||
        (loan.borrowerContact && loan.borrowerContact.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ? true : loan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return result.sort((a, b) => {
      if (sortBy === "highest_debt") {
        const remainingA = Math.max(0, a.originalAmount - a.totalPaid);
        const remainingB = Math.max(0, b.originalAmount - b.totalPaid);
        return remainingB - remainingA;
      }
      if (sortBy === "name") {
        return a.borrowerName.localeCompare(b.borrowerName, "th");
      }
      // default: newest
      return new Date(b.createdAt || b.lentDate).getTime() - new Date(a.createdAt || a.lentDate).getTime();
    });
  }, [loans, searchQuery, statusFilter, sortBy]);

  const statusCounts = useMemo(() => {
    return {
      all: loans.length,
      pending: loans.filter((l) => l.status === "pending").length,
      partial: loans.filter((l) => l.status === "partial").length,
      paid: loans.filter((l) => l.status === "paid").length,
    };
  }, [loans]);

  const getAvatarInitials = (name: string) => {
    const clean = name.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9]/g, "").trim();
    return clean.slice(0, 2).toUpperCase() || "LB";
  };

  // Pagination Calculations (25 items per page default)
  const totalLoans = filteredAndSortedLoans.length;
  const effectivePageSize = pageSize === "all" ? totalLoans || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalLoans / effectivePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedLoans = useMemo(() => {
    if (pageSize === "all") return filteredAndSortedLoans;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedLoans.slice(start, start + pageSize);
  }, [filteredAndSortedLoans, safeCurrentPage, pageSize]);

  const startIndex = totalLoans === 0 ? 0 : pageSize === "all" ? 1 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = pageSize === "all" ? totalLoans : Math.min(safeCurrentPage * pageSize, totalLoans);

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
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-300 font-sans">
      {/* ========================================================================= */}
      {/* 1. HEADER BAR WITH ACTIONS                                                */}
      {/* ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              สินเชื่อส่วนบุคคล & บันทึกลูกหนี้
            </span>
            <span className="text-xs text-[var(--fg-muted)] font-medium hidden sm:inline">
              ติดตามการชำระหนี้ • ประวัติผ่อนชำระ
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--fg-primary)] tracking-tight mt-1">
            เงินให้ยืม & ลูกหนี้
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-0.5">
            บันทึกเงินให้กู้ยืม ติดตามความคืบหน้าการรับชำระคืน และประวัติการผ่อน
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4.5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-sm shadow-emerald-600/25 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>บันทึกให้ยืมเงิน</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. EXECUTIVE FINANCIAL SUMMARY & RECOVERY PROGRESS (60-30-10 HARMONY)       */}
      {/* ========================================================================= */}
      <div className="space-y-3 sm:space-y-4">
        {/* 2.1 Hero 3-Stat Financial Cards (Mobile Carousel / Desktop 3-Grid) */}
        <div className="flex sm:grid sm:grid-cols-3 gap-3 overflow-x-auto pb-1 sm:pb-0 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Card 1: Outstanding Debt */}
          <div className="snap-start shrink-0 w-[85%] sm:w-auto p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-amber-500/40 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold mb-2.5">
                <span>ยอดรอคืนคงค้าง (Outstanding)</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Clock size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tabular-nums tracking-tight">
                {formatCurrency(stats.totalOutstanding)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]/70 flex items-center justify-between text-xs text-[var(--fg-muted)]">
              <span>สัญญาค้างชำระ</span>
              <span className="font-bold text-amber-600 dark:text-amber-400 font-mono">
                {stats.pendingDebtorsCount} สัญญา
              </span>
            </div>
          </div>

          {/* Card 2: Recovered Repayment */}
          <div className="snap-start shrink-0 w-[85%] sm:w-auto p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-emerald-500/30 shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold mb-2.5">
                <span>ได้รับชำระคืนแล้ว (Recovered)</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <CheckCircle2 size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight">
                {formatCurrency(stats.totalRecovered)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]/70 flex items-center justify-between text-xs text-[var(--fg-muted)]">
              <span>อัตราคืนทุนสำเร็จ</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {stats.recoveryRate.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Card 3: Total Capital Lent All-Time */}
          <div className="snap-start shrink-0 w-[85%] sm:w-auto p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden flex flex-col justify-between group hover:border-zinc-400 dark:hover:border-zinc-600 transition-all">
            <div>
              <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-semibold mb-2.5">
                <span>ยอดให้ยืมสะสมรวม (Total Lent)</span>
                <div className="w-8 h-8 rounded-xl bg-[var(--bg-canvas)] text-[var(--fg-muted)] border border-[var(--border-subtle)] flex items-center justify-center">
                  <HandCoins size={16} />
                </div>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tabular-nums tracking-tight">
                {formatCurrency(stats.totalLentAllTime)}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]/70 flex items-center justify-between text-xs text-[var(--fg-muted)]">
              <span>สัญญาทั้งหมดในระบบ</span>
              <span className="font-bold text-[var(--fg-primary)] font-mono">
                {loans.length} รายการ
              </span>
            </div>
          </div>
        </div>

        {/* 2.2 Recovery Progress Banner */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-[var(--fg-primary)]">
                  ภาพรวมความคืบหน้าการรับชำระคืน
                </span>
                <span className="text-[11px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {stats.recoveryRate.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[var(--fg-muted)] mt-0.5">
                รับเงินคืนแล้ว {formatCurrency(stats.totalRecovered)} จากยอดเงินต้นรวม {formatCurrency(stats.totalLentAllTime)}
              </p>
            </div>
          </div>
          <div className="w-full sm:w-72 shrink-0 space-y-1.5">
            <div className="w-full bg-[var(--bg-canvas)] rounded-full h-2.5 overflow-hidden border border-[var(--border-subtle)] p-0.5">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700 shadow-xs"
                style={{ width: `${Math.min(100, Math.max(0, stats.recoveryRate))}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--fg-muted)] font-mono font-medium">
              <span>0%</span>
              <span>คงค้าง {formatCurrency(stats.totalOutstanding)}</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. STRUCTURED TOOLBAR (HEIGHT SYNCHRONIZED & BALANCED)                    */}
      {/* ========================================================================= */}
      <div className="space-y-3 bg-[var(--bg-surface)] p-3.5 sm:p-4 rounded-3xl border border-[var(--border-subtle)] shadow-xs">
        {/* Tier 1: Status Filter Pills (Large Touch Target, Easy to Tap, Horizontal Scroll on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 sm:pb-0 [scrollbar-width:none] -mx-1 px-1">
          {/* ทั้งหมด */}
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === "all"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <span>ทั้งหมด</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "all"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
              }`}
            >
              {statusCounts.all}
            </span>
          </button>

          {/* ยังไม่คืน */}
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === "pending"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <Clock size={15} />
            <span>ยังไม่คืน</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "pending"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
              }`}
            >
              {statusCounts.pending}
            </span>
          </button>

          {/* คืนบางส่วน */}
          <button
            type="button"
            onClick={() => setStatusFilter("partial")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === "partial"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <ArrowDownLeft size={15} />
            <span>คืนบางส่วน</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "partial"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
              }`}
            >
              {statusCounts.partial}
            </span>
          </button>

          {/* คืนครบแล้ว */}
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer border ${
              statusFilter === "paid"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)] hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <CheckCircle2 size={15} />
            <span>คืนครบแล้ว</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                statusFilter === "paid"
                  ? "bg-white/20 text-white"
                  : "bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
              }`}
            >
              {statusCounts.paid}
            </span>
          </button>
        </div>

        {/* Tier 2: Search, Rows Per Page, Sort & View Mode Switch (All h-10 matching search input) */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input (Fluid & Spacious, h-10 rounded-2xl) */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อผู้ยืม, หมายเหตุ หรือเบอร์โทร..."
              className="w-full h-10 pl-10 pr-9 rounded-2xl bg-[var(--bg-surface)] text-xs sm:text-sm text-[var(--fg-primary)] placeholder:text-zinc-400 border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Right Controls: Rows Per Page, Sort & Grid/Table Toggle (All h-10 matching search input) */}
          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
            {/* Rows Per Page Dropdown Box (h-10 matching search input, clickable arrow) */}
            <div className="relative h-10 shrink-0">
              <span className="text-xs font-semibold text-[var(--fg-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                แสดง:
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const val = e.target.value === "all" ? "all" : Number(e.target.value);
                  setPageSize(val as any);
                }}
                className="w-full h-10 appearance-none pl-12 pr-8 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--fg-primary)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none cursor-pointer"
                title="จำนวนรายการต่อหน้า"
              >
                <option value={25} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">25 / หน้า</option>
                <option value={50} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">50 / หน้า</option>
                <option value={75} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">75 / หน้า</option>
                <option value={100} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">100 / หน้า</option>
                <option value={250} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">250 / หน้า</option>
                <option value={500} className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">500 / หน้า</option>
                <option value="all" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">ทั้งหมด</option>
              </select>
              <ChevronRight size={14} className="text-[var(--fg-muted)] rotate-90 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Sort Selector (h-10 matching search input, clickable arrow) */}
            <div className="relative h-10 shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full h-10 appearance-none pl-3.5 pr-8 rounded-2xl bg-[var(--bg-surface)] text-xs font-semibold text-[var(--fg-primary)] border border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer outline-none"
              >
                <option value="newest" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">บันทึกล่าสุด</option>
                <option value="highest_debt" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">ยอดค้างมากสุด</option>
                <option value="name" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">ชื่อ ก-ฮ</option>
              </select>
              <ArrowUpDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none"
              />
            </div>

            {/* View Mode Toggle (h-10 matching search input) */}
            <div className="h-10 inline-flex items-center p-1 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-full w-8 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                }`}
                aria-label="มุมมองการ์ด"
                title="มุมมองการ์ด (Grid View)"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`h-full w-8 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
                  viewMode === "table"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                }`}
                aria-label="มุมมองตาราง"
                title="มุมมองตาราง (Table View)"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. CONTENT LIST: MODERN CARD GRID OR ENTERPRISE TABLE                    */}
      {/* ========================================================================= */}
      {filteredAndSortedLoans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <HandCoins size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--fg-primary)]">
            ไม่พบรายการเงินให้ยืม
          </h3>
          <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
            {searchQuery
              ? `ไม่พบข้อมูลที่ตรงกับคำค้นหา "${searchQuery}" ลองตรวจสอบตัวสะกดหรือเปลี่ยนตัวกรอง`
              : "ยังไม่มีรายการเงินให้ยืมในระบบ เริ่มต้นสร้างสัญญาบันทึกรายการแรก"}
          </p>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>สร้างรายการให้ยืม</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* ==================== MODERN FINTECH CARD GRID VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedLoans.map((loan) => {
            const orig = Number(loan.originalAmount) || 0;
            const paid = Number(loan.totalPaid) || 0;
            const remaining = Math.max(0, orig - paid);
            const percentage = orig > 0 ? Math.min(100, Math.round((paid / orig) * 100)) : 0;
            const isSettled = loan.status === "paid" || remaining <= 0;

            return (
              <div
                key={loan.id}
                className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between group"
              >
                <div>
                  {/* Card Header: Avatar, Name, Contact, Status */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-2xs">
                        {getAvatarInitials(loan.borrowerName)}
                      </div>

                      <div className="min-w-0">
                        <h4 className="text-base font-extrabold text-[var(--fg-primary)] tracking-tight truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {loan.borrowerName}
                        </h4>
                        {loan.borrowerContact ? (
                          <p className="text-xs text-[var(--fg-muted)] flex items-center gap-1 mt-0.5 truncate">
                            <Phone size={11} className="shrink-0 text-zinc-400" />
                            <span className="truncate">{loan.borrowerContact}</span>
                          </p>
                        ) : (
                          <span className="text-[11px] text-[var(--fg-muted)]">
                            ไม่ระบุเบอร์ติดต่อ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isSettled ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} />
                          <span>คืนครบแล้ว</span>
                        </span>
                      ) : loan.status === "partial" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          <ArrowDownLeft size={12} />
                          <span>คืนบางส่วน • {percentage}%</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--bg-canvas)] text-[var(--fg-muted)] border border-[var(--border-subtle)]">
                          <Clock size={12} />
                          <span>รอชำระคืน</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Financial Balance Section (Open & Sleek, No Cluttered Nested Grey Boxes) */}
                  <div className="my-4 py-3.5 border-y border-[var(--border-subtle)]/70 space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[11px] font-semibold text-[var(--fg-muted)] block">
                          ยอดหนี้คงเหลือ
                        </span>
                        <div
                          className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                            isSettled
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-[var(--fg-primary)]"
                          }`}
                        >
                          {formatCurrency(remaining)}
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-semibold text-[var(--fg-muted)] block">
                          เงินต้นที่ให้ยืม
                        </span>
                        <div className="text-sm font-bold font-mono text-[var(--fg-muted)]">
                          {formatCurrency(orig)}
                        </div>
                      </div>
                    </div>

                    {/* Modern Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                        <span className="text-[var(--fg-muted)] text-[11px]">
                          คืนแล้ว <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{formatCurrency(paid)}</strong>
                        </span>
                        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-[var(--bg-canvas)] rounded-full h-2 overflow-hidden border border-[var(--border-subtle)]">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-emerald-500"
                          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                        />
                      </div>
                    </div>

                    {/* Metadata Strip: Date & Note */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-[var(--fg-muted)]">
                        <Clock size={12} className="text-zinc-400 shrink-0" />
                        <span>วันที่ให้ยืม:</span>
                        <span className="font-semibold text-[var(--fg-primary)]">
                          {formatShortDate(loan.lentDate)}
                        </span>
                      </div>
                      {loan.note && (
                        <div className="flex items-center gap-1 text-[11px] text-[var(--fg-muted)] bg-[var(--bg-canvas)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)] truncate max-w-[200px]">
                          <FileText size={11} className="shrink-0 text-zinc-400" />
                          <span className="truncate">{loan.note}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setActiveHistoryLoan(loan)}
                      className="h-9 px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface)] text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      title="ดูประวัติการชำระคืน"
                    >
                      <History size={13} />
                      <span>ประวัติ ({loan.repayments?.length || 0})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveEditLoan(loan)}
                      className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveDeleteLoan(loan)}
                      className="w-9 h-9 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:bg-rose-500/10 text-[var(--fg-muted)] hover:text-rose-500 hover:border-rose-500/30 flex items-center justify-center transition-all cursor-pointer shadow-2xs"
                      title="ลบรายการ"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {!isSettled ? (
                    <button
                      type="button"
                      onClick={() => setActiveRepayLoan(loan)}
                      className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <ArrowDownLeft size={14} />
                      <span>รับคืนเงิน</span>
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <CheckCircle2 size={14} />
                      <span>ชำระครบ</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ==================== HIGH-DENSITY ENTERPRISE TABLE LEDGER VIEW ==================== */
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3.5 px-5">ผู้ยืม / ข้อมูลติดต่อ</th>
                  <th className="py-3.5 px-4 text-right">เงินต้น</th>
                  <th className="py-3.5 px-4 text-right">คืนแล้ว</th>
                  <th className="py-3.5 px-4 text-right">คงเหลือ</th>
                  <th className="py-3.5 px-4">ความคืบหน้า</th>
                  <th className="py-3.5 px-4">วันที่ให้ยืม</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {paginatedLoans.map((loan) => {
                  const orig = Number(loan.originalAmount) || 0;
                  const paid = Number(loan.totalPaid) || 0;
                  const remaining = Math.max(0, orig - paid);
                  const percentage = orig > 0 ? Math.min(100, Math.round((paid / orig) * 100)) : 0;
                  const isSettled = loan.status === "paid" || remaining <= 0;

                  return (
                    <tr
                      key={loan.id}
                      className="hover:bg-slate-500/5 transition-colors group"
                    >
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/20 shrink-0">
                            {getAvatarInitials(loan.borrowerName)}
                          </div>
                          <div>
                            <div className="font-extrabold text-sm text-[var(--fg-primary)] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {loan.borrowerName}
                            </div>
                            {loan.borrowerContact ? (
                              <div className="text-[11px] text-[var(--fg-muted)] flex items-center gap-1">
                                <Phone size={10} className="text-zinc-400" />
                                <span>{loan.borrowerContact}</span>
                              </div>
                            ) : (
                              <div className="text-[10px] text-[var(--fg-muted)]">
                                ไม่ระบุเบอร์
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-[var(--fg-muted)]">
                        {formatCurrency(orig)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(paid)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-[var(--fg-primary)]">
                        {formatCurrency(remaining)}
                      </td>

                      <td className="py-3.5 px-4 min-w-[130px]">
                        <div className="flex items-center justify-between text-[10px] font-mono text-[var(--fg-muted)] mb-1">
                          <span>{percentage}%</span>
                        </div>
                        <div className="w-full bg-[var(--bg-canvas)] rounded-full h-1.5 overflow-hidden border border-[var(--border-subtle)]">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-[var(--fg-primary)]">
                        {formatShortDate(loan.lentDate)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {isSettled ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            คืนครบ
                          </span>
                        ) : loan.status === "partial" ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            คืนบางส่วน
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-canvas)] text-[var(--fg-muted)] border border-[var(--border-subtle)]">
                            ยังไม่คืน
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isSettled && (
                            <button
                              type="button"
                              onClick={() => setActiveRepayLoan(loan)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 dark:hover:text-white text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <ArrowDownLeft size={12} />
                              <span>รับเงิน</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => setActiveHistoryLoan(loan)}
                            className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer"
                            title="ประวัติผ่อน"
                          >
                            <History size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveEditLoan(loan)}
                            className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveDeleteLoan(loan)}
                            className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                            title="ลบ"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PAGINATION CONTROLS FOOTER                                             */}
      {/* ========================================================================= */}
      {filteredAndSortedLoans.length > 0 && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--fg-muted)]">
          <div className="text-[11px] sm:text-xs text-center sm:text-left">
            {pageSize === "all" ? (
              <span>
                ทั้งหมด <strong className="text-[var(--fg-primary)] font-bold">{totalLoans}</strong> รายการ
              </span>
            ) : (
              <span>
                แสดง <strong className="text-[var(--fg-primary)] font-bold">{startIndex}</strong>-
                <strong className="text-[var(--fg-primary)] font-bold">{endIndex}</strong> จาก{" "}
                <strong className="text-[var(--fg-primary)] font-bold">{totalLoans}</strong> รายการ
              </span>
            )}
          </div>

          {pageSize !== "all" && totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage(1)}
                className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="หน้าแรก"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={safeCurrentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="ก่อนหน้า"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-1 px-1">
                {pageNumbers.map((p, idx) => {
                  if (p === "...") {
                    return (
                      <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[var(--fg-muted)]">
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
                      className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-[var(--fg-secondary)] hover:bg-[var(--bg-surface)] border border-transparent hover:border-[var(--border-subtle)]"
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
                className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="ถัดไป"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className="p-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="หน้าสุดท้าย"
              >
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODULAR MODALS & DIALOGS */}
      {/* ========================================================================= */}
      <AddLoanModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        accounts={accounts}
        onAddLoan={addLoan}
      />

      <RepayLoanModal
        isOpen={!!activeRepayLoan}
        onClose={() => setActiveRepayLoan(null)}
        loan={activeRepayLoan}
        accounts={accounts}
        onRecordRepayment={recordRepayment}
      />

      <LoanHistoryModal
        isOpen={!!activeHistoryLoan}
        onClose={() => setActiveHistoryLoan(null)}
        loan={activeHistoryLoan}
        accounts={accounts}
        onDeleteRepayment={(loanId, repaymentId) => {
          deleteRepayment(loanId, repaymentId);
          setActiveHistoryLoan((prev) => {
            if (!prev) return null;
            const updated = prev.repayments.filter((r) => r.id !== repaymentId);
            const newTotal = updated.reduce((s, r) => s + Number(r.amount), 0);
            return {
              ...prev,
              totalPaid: newTotal,
              repayments: updated,
              status: newTotal >= prev.originalAmount ? "paid" : newTotal > 0 ? "partial" : "pending",
            };
          });
        }}
      />

      <EditLoanModal
        isOpen={!!activeEditLoan}
        onClose={() => setActiveEditLoan(null)}
        loan={activeEditLoan}
        onUpdateLoan={updateLoan}
      />

      <DeleteLoanDialog
        loan={activeDeleteLoan}
        onClose={() => setActiveDeleteLoan(null)}
        onConfirm={() => {
          if (activeDeleteLoan) {
            deleteLoan(activeDeleteLoan.id);
            setActiveDeleteLoan(null);
          }
        }}
      />
    </div>
  );
}
