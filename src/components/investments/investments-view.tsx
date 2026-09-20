"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Plus,
  Search,
  LayoutGrid,
  List,
  ArrowUpDown,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  Edit2,
  Trash2,
  PieChart,
  DollarSign,
  Wallet,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { useToast } from "@/lib/toast-context";
import { InvestmentAssetType, InvestmentHolding, InvestmentPlatform } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  INVESTMENT_PLATFORMS,
  ASSET_TYPE_CONFIG,
  PlatformBadgeIcon,
} from "./investment-presets";

// Modals
import { AddInvestmentModal } from "./add-investment-modal";
import { TradeInvestmentModal } from "./trade-investment-modal";
import { EditInvestmentModal } from "./edit-investment-modal";
import { DeleteInvestmentDialog } from "./delete-investment-dialog";

export function InvestmentsView() {
  const {
    investments,
    accounts,
    summary,
    addInvestmentHolding,
    updateInvestmentHolding,
    recordInvestmentTrade,
    deleteInvestmentHolding,
  } = useFinance();
  const { success } = useToast();

  // UX Controls
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [selectedAssetType, setSelectedAssetType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"value_desc" | "profit_desc" | "profit_asc" | "newest">("value_desc");
  const [allocationTab, setAllocationTab] = useState<"asset_type" | "platform">("platform");
  const [pageSize, setPageSize] = useState<number | "all">(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Auto-reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedPlatform, selectedAssetType, sortBy, pageSize]);

  // Modal Visibility States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [tradeTargetHolding, setTradeTargetHolding] = useState<InvestmentHolding | null>(null);
  const [editTargetHolding, setEditTargetHolding] = useState<InvestmentHolding | null>(null);
  const [deleteTargetHolding, setDeleteTargetHolding] = useState<InvestmentHolding | null>(null);

  // =========================================================================
  // METRICS & COMPUTED STATS (60-30-10 HARMONY)
  // =========================================================================
  const stats = useMemo(() => {
    let totalValueTHB = 0;
    let totalCostTHB = 0;

    const platformTotals: Record<string, { value: number; cost: number; count: number }> = {};
    const assetTypeTotals: Record<string, { value: number; cost: number; count: number }> = {};

    investments.forEach((inv) => {
      const rate = inv.currency === "USD" ? Number(inv.exchangeRate) || 35.5 : 1;
      const cost = Number(inv.units) * Number(inv.avgBuyPrice) * rate;
      const value = Number(inv.units) * Number(inv.currentPrice) * rate;

      totalValueTHB += value;
      totalCostTHB += cost;

      // Platform aggregation
      const p = inv.platform || "other";
      if (!platformTotals[p]) platformTotals[p] = { value: 0, cost: 0, count: 0 };
      platformTotals[p].value += value;
      platformTotals[p].cost += cost;
      platformTotals[p].count += 1;

      // Asset type aggregation
      const a = inv.assetType || "other";
      if (!assetTypeTotals[a]) assetTypeTotals[a] = { value: 0, cost: 0, count: 0 };
      assetTypeTotals[a].value += value;
      assetTypeTotals[a].cost += cost;
      assetTypeTotals[a].count += 1;
    });

    const netProfitLossTHB = totalValueTHB - totalCostTHB;
    const profitLossPercent = totalCostTHB > 0 ? (netProfitLossTHB / totalCostTHB) * 100 : 0;

    return {
      totalValueTHB,
      totalCostTHB,
      netProfitLossTHB,
      profitLossPercent,
      platformTotals,
      assetTypeTotals,
      holdingsCount: investments.length,
    };
  }, [investments]);

  // =========================================================================
  // FILTERING & SORTING LOGIC
  // =========================================================================
  const filteredAndSortedHoldings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = investments.filter((inv) => {
      const matchesSearch =
        !q ||
        inv.symbol.toLowerCase().includes(q) ||
        inv.name.toLowerCase().includes(q) ||
        (inv.platformName && inv.platformName.toLowerCase().includes(q)) ||
        (inv.note && inv.note.toLowerCase().includes(q));

      const matchesPlatform = selectedPlatform === "all" || inv.platform === selectedPlatform;
      const matchesAssetType = selectedAssetType === "all" || inv.assetType === selectedAssetType;

      return matchesSearch && matchesPlatform && matchesAssetType;
    });

    return filtered.sort((a, b) => {
      const rateA = a.currency === "USD" ? Number(a.exchangeRate) || 35.5 : 1;
      const rateB = b.currency === "USD" ? Number(b.exchangeRate) || 35.5 : 1;
      const valA = Number(a.units) * Number(a.currentPrice) * rateA;
      const valB = Number(b.units) * Number(b.currentPrice) * rateB;

      const costA = Number(a.units) * Number(a.avgBuyPrice) * rateA;
      const costB = Number(b.units) * Number(b.avgBuyPrice) * rateB;

      const pnlA = valA - costA;
      const pnlB = valB - costB;

      if (sortBy === "value_desc") return valB - valA;
      if (sortBy === "profit_desc") return pnlB - pnlA;
      if (sortBy === "profit_asc") return pnlA - pnlB;
      // newest
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [investments, searchQuery, selectedPlatform, selectedAssetType, sortBy]);

  // Active Platforms present in portfolio
  const availablePlatforms = useMemo(() => {
    const pSet = new Set(investments.map((i) => i.platform));
    return INVESTMENT_PLATFORMS.filter((p) => pSet.has(p.id));
  }, [investments]);

  // Pagination Calculations (25 items per page default)
  const totalHoldings = filteredAndSortedHoldings.length;
  const effectivePageSize = pageSize === "all" ? totalHoldings || 1 : pageSize;
  const totalPages = Math.max(1, Math.ceil(totalHoldings / effectivePageSize));
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedHoldings = useMemo(() => {
    if (pageSize === "all") return filteredAndSortedHoldings;
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredAndSortedHoldings.slice(start, start + pageSize);
  }, [filteredAndSortedHoldings, safeCurrentPage, pageSize]);

  const startIndex = totalHoldings === 0 ? 0 : pageSize === "all" ? 1 : (safeCurrentPage - 1) * pageSize + 1;
  const endIndex = pageSize === "all" ? totalHoldings : Math.min(safeCurrentPage * pageSize, totalHoldings);

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
    <div className="space-y-6 sm:space-y-8 pb-12 animate-in fade-in duration-200 font-sans">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/50 px-2.5 py-0.5 rounded-full">
              พอร์ตการลงทุน & สินทรัพย์
            </span>
            <span className="text-xs text-[var(--fg-muted)] font-medium hidden sm:inline">
              Dime! • Binance • Bitkub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--fg-primary)] tracking-tight mt-1">
            พอร์ตการลงทุน
          </h1>
          <p className="text-xs sm:text-sm text-[var(--fg-muted)] mt-0.5">
            ติดตามมูลค่าหุ้นสหรัฐฯ คริปโต และกองทุน คำนวณกำไร/ขาดทุนแบบเรียลไทม์
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-sm shadow-sm shadow-emerald-600/25 transition-all cursor-pointer"
        >
          <Plus size={18} />
          <span>เพิ่มสินทรัพย์</span>
        </button>
      </div>

      {/* 2. Hero 3-Stat Metric Cards (60-30-10 Principle) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Portfolio Value */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium mb-3">
            <span>มูลค่าพอร์ตรวม (Net Value)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Coins size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight">
            {formatCurrency(stats.totalValueTHB)}
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-2">
            กระจายอยู่ใน <span className="font-semibold text-[var(--fg-primary)]">{availablePlatforms.length}</span> แพลตฟอร์ม • รวม {stats.holdingsCount} สินทรัพย์
          </p>
        </div>

        {/* Total Unrealized Profit/Loss */}
        <div
          className={`p-6 rounded-3xl bg-[var(--bg-surface)] border shadow-xs relative overflow-hidden transition-all ${
            stats.netProfitLossTHB >= 0
              ? "border-emerald-500/30 hover:border-emerald-500/50"
              : "border-rose-500/30 hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium mb-3">
            <span>กำไร / ขาดทุนรวม (Unrealized P/L)</span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                stats.netProfitLossTHB >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 text-rose-500"
              }`}
            >
              {stats.netProfitLossTHB >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight ${
              stats.netProfitLossTHB >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-500"
            }`}
          >
            {stats.netProfitLossTHB >= 0 ? "+" : ""}
            {formatCurrency(stats.netProfitLossTHB)}
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                stats.netProfitLossTHB >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {stats.profitLossPercent >= 0 ? "+" : ""}
              {stats.profitLossPercent.toFixed(2)}%
            </span>
            <span className="text-xs text-[var(--fg-muted)]">ผลตอบแทนรวมตลอดกาล</span>
          </div>
        </div>

        {/* Total Invested Capital */}
        <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-[var(--fg-muted)] font-medium mb-3">
            <span>เงินต้นรวมทั้งหมด (Invested Cost)</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-[var(--fg-muted)] flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[var(--fg-primary)] tracking-tight">
            {formatCurrency(stats.totalCostTHB)}
          </div>
          <p className="text-xs text-[var(--fg-muted)] mt-2">
            คำนวณจากราคาต้นทุนซื้อสะสมทุกรายการ
          </p>
        </div>
      </div>

      {/* 3. Portfolio Allocation Bar (Interactive 60-30-10 Visual) */}
      {stats.totalValueTHB > 0 && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-[var(--fg-primary)]">
                การกระจายความเสี่ยงของพอร์ต (Allocation)
              </h3>
            </div>
            <div className="flex items-center p-1 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAllocationTab("platform")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  allocationTab === "platform"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                }`}
              >
                ตามแพลตฟอร์ม
              </button>
              <button
                type="button"
                onClick={() => setAllocationTab("asset_type")}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  allocationTab === "asset_type"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                }`}
              >
                ตามประเภทสินทรัพย์
              </button>
            </div>
          </div>

          {/* Progress Stack Bar */}
          <div className="h-3 w-full rounded-full bg-[var(--bg-canvas)] overflow-hidden flex gap-0.5">
            {allocationTab === "platform"
              ? Object.entries(stats.platformTotals).map(([pId, data]) => {
                  const percent = (data.value / stats.totalValueTHB) * 100;
                  const preset = INVESTMENT_PLATFORMS.find((p) => p.id === pId);
                  const color = preset?.brandColor || "#64748B";
                  return (
                    <div
                      key={pId}
                      style={{ width: `${percent}%`, backgroundColor: color }}
                      className="h-full transition-all hover:opacity-85"
                      title={`${preset?.name || pId}: ${percent.toFixed(1)}% (${formatCurrency(data.value)})`}
                    />
                  );
                })
              : Object.entries(stats.assetTypeTotals).map(([aType, data]) => {
                  const percent = (data.value / stats.totalValueTHB) * 100;
                  const conf = ASSET_TYPE_CONFIG[aType as InvestmentAssetType] || ASSET_TYPE_CONFIG.other;
                  return (
                    <div
                      key={aType}
                      style={{ width: `${percent}%`, backgroundColor: conf.dotColor }}
                      className="h-full transition-all hover:opacity-85"
                      title={`${conf.label}: ${percent.toFixed(1)}% (${formatCurrency(data.value)})`}
                    />
                  );
                })}
          </div>

          {/* Allocation Legend */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs">
            {allocationTab === "platform"
              ? Object.entries(stats.platformTotals).map(([pId, data]) => {
                  const percent = (data.value / stats.totalValueTHB) * 100;
                  const preset = INVESTMENT_PLATFORMS.find((p) => p.id === pId);
                  return (
                    <div key={pId} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: preset?.brandColor || "#64748B" }}
                      />
                      <span className="font-semibold text-[var(--fg-primary)]">
                        {preset?.name || pId}
                      </span>
                      <span className="font-mono text-[var(--fg-muted)]">
                        {percent.toFixed(1)}% ({formatCurrency(data.value)})
                      </span>
                    </div>
                  );
                })
              : Object.entries(stats.assetTypeTotals).map(([aType, data]) => {
                  const percent = (data.value / stats.totalValueTHB) * 100;
                  const conf = ASSET_TYPE_CONFIG[aType as InvestmentAssetType] || ASSET_TYPE_CONFIG.other;
                  return (
                    <div key={aType} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: conf.dotColor }}
                      />
                      <span className="font-semibold text-[var(--fg-primary)]">
                        {conf.label}
                      </span>
                      <span className="font-mono text-[var(--fg-muted)]">
                        {percent.toFixed(1)}% ({formatCurrency(data.value)})
                      </span>
                    </div>
                  );
                })}
          </div>
        </div>
      )}

      {/* 4. Controls: Platform Tabs & Asset Filters */}
      <div className="space-y-3">
        {/* Platform Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setSelectedPlatform("all")}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              selectedPlatform === "all"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)]"
            }`}
          >
            ทุกแพลตฟอร์ม ({investments.length})
          </button>

          {INVESTMENT_PLATFORMS.filter((p) =>
            investments.some((inv) => inv.platform === p.id)
          ).map((p) => {
            const count = investments.filter((inv) => inv.platform === p.id).length;
            const isSelected = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                    : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border-[var(--border-subtle)] hover:text-[var(--fg-primary)]"
                }`}
              >
                <PlatformBadgeIcon platform={p.id} size={16} className="rounded-xs" />
                <span>{p.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected ? "bg-white/20 text-white" : "bg-[var(--bg-canvas)] text-[var(--fg-muted)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search, Rows Per Page, Sort & View Mode Switch */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
          {/* Search Input (Fluid & Spacious) */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาสินทรัพย์ (เช่น NVDA, BTC, Dime)..."
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
                <option value="value_desc" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">มูลค่าพอร์ตสูงสุด</option>
                <option value="profit_desc" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">กำไร (P/L) สูงสุด</option>
                <option value="profit_asc" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">ขาดทุนมากสุด</option>
                <option value="newest" className="bg-[var(--bg-surface)] text-[var(--fg-primary)]">อัปเดตล่าสุด</option>
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
                aria-label="มุมมองตารางการ์ด"
                title="มุมมองตารางการ์ด"
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
                aria-label="มุมมองรายการละเอียด"
                title="มุมมองรายการละเอียด"
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Holdings Content Display */}
      {filteredAndSortedHoldings.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <Coins size={24} />
          </div>
          <h3 className="text-base font-bold text-[var(--fg-primary)]">
            ไม่พบรายการสินทรัพย์การลงทุน
          </h3>
          <p className="text-xs text-[var(--fg-muted)] max-w-sm mx-auto">
            {searchQuery
              ? `ไม่พบผลการค้นหาสำหรับ "${searchQuery}" ลองค้นหาด้วยคำอื่น`
              : "ยังไม่มีรายการในพอร์ตนี้ เริ่มต้นบันทึกสินทรัพย์ Dime, Binance เพื่อติดตามกำไร/ขาดทุน"}
          </p>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs cursor-pointer mt-2"
          >
            <Plus size={16} />
            <span>เพิ่มสินทรัพย์ใหม่</span>
          </button>
        </div>
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedHoldings.map((holding) => {
            const rate = holding.currency === "USD" ? Number(holding.exchangeRate) || 35.5 : 1;
            const costTHB = Number(holding.units) * Number(holding.avgBuyPrice) * rate;
            const valueTHB = Number(holding.units) * Number(holding.currentPrice) * rate;
            const pnlTHB = valueTHB - costTHB;
            const pnlPercent = costTHB > 0 ? (pnlTHB / costTHB) * 100 : 0;
            const isProfit = pnlTHB >= 0;

            const assetConf = ASSET_TYPE_CONFIG[holding.assetType] || ASSET_TYPE_CONFIG.other;

            return (
              <div
                key={holding.id}
                className="p-5 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-emerald-500/40 transition-all shadow-xs flex flex-col justify-between group"
              >
                {/* Top: Platform & Symbol */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <PlatformBadgeIcon
                        platform={holding.platform}
                        size={32}
                        className="rounded-xl shadow-2xs flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-extrabold text-[var(--fg-primary)] tracking-tight">
                            {holding.symbol}
                          </h4>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${assetConf.badgeColor}`}
                          >
                            {assetConf.label}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--fg-muted)] truncate max-w-[150px]">
                          {holding.name}
                        </p>
                      </div>
                    </div>

                    {/* Quick Edit/Delete Icons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => setEditTargetHolding(holding)}
                        className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer"
                        title="แก้ไขข้อมูลสินทรัพย์"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetHolding(holding)}
                        className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                        title="ลบออกจากพอร์ต"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Market Value & Profit/Loss */}
                  <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] text-[var(--fg-muted)]">มูลค่าปัจจุบัน</span>
                      <div className="text-right">
                        <span className="text-base font-black text-[var(--fg-primary)] tracking-tight">
                          {formatCurrency(valueTHB)}
                        </span>
                        {holding.currency === "USD" && (
                          <span className="block text-[10px] font-mono text-[var(--fg-muted)]">
                            ${(holding.units * holding.currentPrice).toLocaleString(undefined, {
                              maximumFractionDigits: 2,
                            })}{" "}
                            USD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-[var(--fg-muted)]">กำไร / ขาดทุน</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-xs font-bold ${
                            isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(pnlTHB)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${
                            isProfit
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {pnlPercent.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    {/* Holdings Detail Breakdown */}
                    <div className="pt-2 border-t border-dashed border-[var(--border-subtle)] text-[11px] text-[var(--fg-muted)] flex items-center justify-between">
                      <span>ถือครอง: {holding.units} หน่วย</span>
                      <span>
                        ต้นทุน: {holding.avgBuyPrice} {holding.currency}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions: DCA (Buy) & Sell */}
                <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTradeTargetHolding(holding)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 dark:hover:text-white text-xs font-bold border border-emerald-500/20 transition-all cursor-pointer"
                  >
                    <ArrowDownLeft size={14} />
                    <span>ซื้อเพิ่ม (DCA)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTradeTargetHolding(holding)}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--bg-canvas)] hover:bg-rose-600 text-[var(--fg-muted)] hover:text-white text-xs font-bold border border-[var(--border-subtle)] transition-all cursor-pointer"
                  >
                    <ArrowUpRight size={14} />
                    <span>ขายออก</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View (Bank-Grade Enterprise) */
        <div className="rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--bg-canvas)] border-b border-[var(--border-subtle)] text-[var(--fg-muted)] font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">สินทรัพย์ / โบรกเกอร์</th>
                  <th className="px-4 py-3.5 text-right">จำนวนที่ถือ</th>
                  <th className="px-4 py-3.5 text-right">ต้นทุนเฉลี่ย</th>
                  <th className="px-4 py-3.5 text-right">ราคาตลาด</th>
                  <th className="px-4 py-3.5 text-right">มูลค่าพอร์ต</th>
                  <th className="px-4 py-3.5 text-right">กำไร / ขาดทุน (P/L)</th>
                  <th className="px-5 py-3.5 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {paginatedHoldings.map((holding) => {
                  const rate = holding.currency === "USD" ? Number(holding.exchangeRate) || 35.5 : 1;
                  const costTHB = Number(holding.units) * Number(holding.avgBuyPrice) * rate;
                  const valueTHB = Number(holding.units) * Number(holding.currentPrice) * rate;
                  const pnlTHB = valueTHB - costTHB;
                  const pnlPercent = costTHB > 0 ? (pnlTHB / costTHB) * 100 : 0;
                  const isProfit = pnlTHB >= 0;
                  const assetConf = ASSET_TYPE_CONFIG[holding.assetType] || ASSET_TYPE_CONFIG.other;

                  return (
                    <tr
                      key={holding.id}
                      className="hover:bg-slate-500/5 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <PlatformBadgeIcon
                            platform={holding.platform}
                            size={28}
                            className="rounded-lg shadow-2xs flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-sm text-[var(--fg-primary)]">
                                {holding.symbol}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${assetConf.badgeColor}`}
                              >
                                {assetConf.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-[var(--fg-muted)]">
                              {holding.name} • {holding.platformName || holding.platform}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-semibold font-mono text-[var(--fg-primary)]">
                        {holding.units}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-[var(--fg-muted)]">
                        {holding.avgBuyPrice.toLocaleString()} {holding.currency}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-semibold text-[var(--fg-primary)]">
                        {holding.currentPrice.toLocaleString()} {holding.currency}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold text-sm font-mono text-[var(--fg-primary)] block">
                          {formatCurrency(valueTHB)}
                        </span>
                        {holding.currency === "USD" && (
                          <span className="text-[10px] text-[var(--fg-muted)] font-mono">
                            ${(holding.units * holding.currentPrice).toFixed(2)} USD
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`font-bold font-mono block ${
                            isProfit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {formatCurrency(pnlTHB)}
                        </span>
                        <span
                          className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded border inline-block ${
                            isProfit
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {isProfit ? "+" : ""}
                          {pnlPercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setTradeTargetHolding(holding)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-300 dark:hover:text-white text-xs font-bold transition-all cursor-pointer"
                          >
                            เทรด/DCA
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditTargetHolding(holding)}
                            className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer"
                            title="แก้ไข"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTargetHolding(holding)}
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

      {/* 6. Pagination Controls Footer */}
      {filteredAndSortedHoldings.length > 0 && (
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--fg-muted)]">
          <div className="text-[11px] sm:text-xs text-center sm:text-left">
            {pageSize === "all" ? (
              <span>
                ทั้งหมด <strong className="text-[var(--fg-primary)] font-bold">{totalHoldings}</strong> รายการ
              </span>
            ) : (
              <span>
                แสดง <strong className="text-[var(--fg-primary)] font-bold">{startIndex}</strong>-
                <strong className="text-[var(--fg-primary)] font-bold">{endIndex}</strong> จาก{" "}
                <strong className="text-[var(--fg-primary)] font-bold">{totalHoldings}</strong> รายการ
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

      {/* Modals & Dialogs */}
      <AddInvestmentModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        accounts={accounts}
        onAddHolding={(data, deduct, accId) => {
          addInvestmentHolding(data, deduct, accId);
          success(`เพิ่ม ${data.symbol} เข้าพอร์ตเรียบร้อยแล้ว`);
        }}
      />

      <TradeInvestmentModal
        isOpen={Boolean(tradeTargetHolding)}
        onClose={() => setTradeTargetHolding(null)}
        holding={tradeTargetHolding}
        accounts={accounts}
        onRecordTrade={(hId, trade, syncAcc) => {
          recordInvestmentTrade(hId, trade, syncAcc);
          success(
            trade.type === "buy"
              ? `บันทึกการซื้อเพิ่ม (DCA) ${trade.units} หน่วยแล้ว`
              : `บันทึกการขาย ${trade.units} หน่วยเรียบร้อยแล้ว`
          );
        }}
      />

      <EditInvestmentModal
        isOpen={Boolean(editTargetHolding)}
        onClose={() => setEditTargetHolding(null)}
        holding={editTargetHolding}
        onUpdateHolding={(id, partial) => {
          updateInvestmentHolding(id, partial);
          success("อัปเดตข้อมูลสินทรัพย์เรียบร้อยแล้ว");
        }}
      />

      <DeleteInvestmentDialog
        isOpen={Boolean(deleteTargetHolding)}
        onClose={() => setDeleteTargetHolding(null)}
        holding={deleteTargetHolding}
        onConfirmDelete={(id) => {
          deleteInvestmentHolding(id);
          success("ลบสินทรัพย์ออกจากพอร์ตแล้ว");
        }}
      />
    </div>
  );
}
