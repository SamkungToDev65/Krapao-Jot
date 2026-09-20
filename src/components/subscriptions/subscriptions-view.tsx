"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  PauseCircle,
  X,
  CreditCard,
  Pencil,
  AlertTriangle,
  Layers,
  Sparkles,
  Wallet,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useFinance } from "@/lib/store";
import { formatCurrency, formatShortDate } from "@/lib/utils";
import { Subscription, SubscriptionCycle } from "@/lib/types";
import {
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_PRESETS,
  SubscriptionPreset,
  SubscriptionBrandIcon,
  findSubscriptionPreset,
} from "./subscription-catalog";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";

const COLOR_PALETTE = [
  "#E50914", // Netflix Red
  "#1DB954", // Spotify Green
  "#FF0000", // YouTube Red
  "#10A37F", // OpenAI Emerald
  "#113CCF", // Disney Royal Blue
  "#00A8E1", // Prime Cyan
  "#5822B4", // HBO Purple
  "#00C4CC", // Canva Turquoise
  "#CC785C", // Claude Terracotta
  "#4E81EE", // Gemini Blue
  "#6E40C9", // Copilot Purple
  "#107C10", // Xbox Green
  "#003791", // PlayStation Blue
  "#FC5200", // Strava Orange
  "#5865F2", // Discord Blurple
  "#0071E3", // Apple Blue
  "#6366F1", // Indigo
  "#18181B", // Dark
];

function calculateDaysLeft(dateStr: string): { days: number; isOverdue: boolean; label: string } {
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

export function SubscriptionsView() {
  const {
    subscriptions,
    summary,
    toggleSubscription,
    deleteSubscription,
    addSubscription,
    updateSubscription,
    accounts,
    creditCards,
  } = useFinance();

  // Active filter tab
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<SubscriptionCycle>("monthly");
  const [category, setCategory] = useState<string>(SUBSCRIPTION_CATEGORIES[0]);
  const [nextDate, setNextDate] = useState(new Date().toISOString().split("T")[0]);
  const [color, setColor] = useState("#E50914");
  const [iconKey, setIconKey] = useState("netflix");
  const [linkedAccountId, setLinkedAccountId] = useState("");

  // Validation errors
  const [formErrors, setFormErrors] = useState<{ name?: string; amount?: string }>({});

  // Delete Confirmation Dialog State
  const [subToDelete, setSubToDelete] = useState<Subscription | null>(null);

  // Presets filtered by currently selected form category
  const activeCategoryPresets = useMemo(() => {
    return SUBSCRIPTION_PRESETS.filter((p) => p.category === category);
  }, [category]);

  // Open modal for Add
  const handleOpenAdd = () => {
    setEditingSub(null);
    const defaultPreset = SUBSCRIPTION_PRESETS[0];
    setName(defaultPreset.name);
    setAmount(String(defaultPreset.defaultPrice));
    setCycle("monthly");
    setCategory(defaultPreset.category);
    setNextDate(new Date().toISOString().split("T")[0]);
    setColor(defaultPreset.color);
    setIconKey(defaultPreset.iconKey);
    setLinkedAccountId(creditCards[0]?.id || "");
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (sub: Subscription) => {
    setEditingSub(sub);
    setName(sub.name);
    setAmount(String(sub.amount));
    setCycle(sub.billingCycle);
    setCategory(sub.category || SUBSCRIPTION_CATEGORIES[0]);
    setNextDate(sub.nextBillingDate || new Date().toISOString().split("T")[0]);
    setColor(sub.color || "#6366F1");
    setIconKey(sub.icon || "");
    setLinkedAccountId(sub.linkedAccountId || "");
    setFormErrors({});
    setIsModalOpen(true);
  };

  // When user clicks a preset chip
  const handleSelectPreset = (preset: SubscriptionPreset) => {
    setName(preset.name);
    setAmount(String(preset.defaultPrice));
    setCycle(preset.billingCycle);
    setCategory(preset.category);
    setColor(preset.color);
    setIconKey(preset.iconKey);
    setFormErrors((prev) => ({ ...prev, name: undefined, amount: undefined }));
  };

  // When typing custom name, automatically infer preset if matching
  const handleNameChange = (val: string) => {
    setName(val);
    const matched = findSubscriptionPreset(val);
    if (matched) {
      setIconKey(matched.iconKey);
      if (!editingSub) {
        setColor(matched.color);
      }
    } else {
      setIconKey("");
    }
    if (formErrors.name) {
      setFormErrors((prev) => ({ ...prev, name: undefined }));
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Custom form validation
    const errors: { name?: string; amount?: string } = {};
    if (!name.trim()) {
      errors.name = "กรุณากรอกหรือเลือกชื่อบริการ";
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      errors.amount = "กรุณากรอกจำนวนเงินให้ถูกต้อง (มากกว่า 0)";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingSub) {
      // Update
      updateSubscription(editingSub.id, {
        name: name.trim(),
        amount: numAmount,
        billingCycle: cycle,
        category,
        nextBillingDate: nextDate,
        icon: iconKey || "custom",
        color,
        linkedAccountId: linkedAccountId || undefined,
      });
    } else {
      // Add
      addSubscription({
        name: name.trim(),
        amount: numAmount,
        currency: "THB",
        billingCycle: cycle,
        category,
        nextBillingDate: nextDate,
        icon: iconKey || "custom",
        color,
        isActive: true,
        linkedAccountId: linkedAccountId || undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Subscriptions filtered by Category Tab
  const filteredSubscriptions = useMemo(() => {
    if (selectedCategoryTab === "all") return subscriptions;
    return subscriptions.filter((s) => s.category === selectedCategoryTab);
  }, [subscriptions, selectedCategoryTab]);

  // Counts for each tab
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: subscriptions.length };
    SUBSCRIPTION_CATEGORIES.forEach((cat) => {
      counts[cat] = subscriptions.filter((s) => s.category === cat).length;
    });
    return counts;
  }, [subscriptions]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[var(--fg-primary)] tracking-tight">
              ค่า Subscription ประจำ
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {subscriptions.filter((s) => s.isActive).length} รายการทำงานอยู่
            </span>
          </div>
          <p className="text-sm text-[var(--fg-muted)] mt-0.5">
            ติดตามค่าบริการสตรีมมิ่ง, บริการ AI และไลฟ์สไตล์แบบมืออาชีพ
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่ม Subscription</span>
        </button>
      </div>

      {/* ================= BURN RATE SUMMARY METRICS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--fg-muted)]">ภาระรวมรายเดือน</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight mt-1.5">
            {formatCurrency(summary.monthlySubscriptionTotal)}
          </p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
            จาก {subscriptions.filter((s) => s.isActive).length} บริการที่เปิดใช้งาน
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--fg-muted)]">ประมาณการต่อปี (12 เดือน)</span>
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Calendar className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--fg-primary)] tracking-tight mt-1.5">
            {formatCurrency(summary.monthlySubscriptionTotal * 12)}
          </p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
            เฉลี่ยวันละ {formatCurrency((summary.monthlySubscriptionTotal * 12) / 365)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--fg-muted)]">เฉลี่ยต่อบริการ</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-2xl font-extrabold text-[var(--fg-primary)] tracking-tight mt-1.5">
            {formatCurrency(
              subscriptions.filter((s) => s.isActive).length > 0
                ? summary.monthlySubscriptionTotal / subscriptions.filter((s) => s.isActive).length
                : 0
            )}
          </p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1.5">
            พักชั่วคราว {subscriptions.filter((s) => !s.isActive).length} รายการ
          </p>
        </div>
      </div>

      {/* ================= CATEGORY FILTER TABS ================= */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSelectedCategoryTab("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategoryTab === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] border border-[var(--border-subtle)]"
          }`}
        >
          <span>ทั้งหมด</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedCategoryTab === "all" ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"
          }`}>
            {categoryCounts.all}
          </span>
        </button>

        {SUBSCRIPTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategoryTab(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategoryTab === cat
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
                : "bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] border border-[var(--border-subtle)]"
            }`}
          >
            <span>{cat}</span>
            {categoryCounts[cat] > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategoryTab === cat ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900" : "bg-slate-100 dark:bg-slate-800"
              }`}>
                {categoryCounts[cat]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ================= SUBSCRIPTIONS GRID ================= */}
      {filteredSubscriptions.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
          <Layers className="w-10 h-10 mx-auto text-[var(--fg-muted)] opacity-40 mb-3" />
          <h3 className="text-sm font-bold text-[var(--fg-primary)]">ไม่มีรายการในหมวดหมู่นี้</h3>
          <p className="text-xs text-[var(--fg-muted)] mt-1">
            กดปุ่มเพิ่ม Subscription ด้านบนเพื่อสร้างรายการใหม่
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubscriptions.map((sub) => {
            const daysInfo = calculateDaysLeft(sub.nextBillingDate);
            const linkedCard = creditCards.find((c) => c.id === sub.linkedAccountId);
            const linkedAcc = accounts.find((a) => a.id === sub.linkedAccountId);

            return (
              <div
                key={sub.id}
                className={`p-4 rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between group ${
                  sub.isActive
                    ? "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-emerald-500/40 hover:shadow-sm"
                    : "bg-[var(--bg-canvas)] border-[var(--border-subtle)] opacity-65"
                }`}
              >
                <div>
                  {/* Top: Icon + Name + Category + Status Toggle */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Authentic Brand SVG or Fallback Letter */}
                      <SubscriptionBrandIcon
                        name={sub.name}
                        iconKey={sub.icon}
                        color={sub.color}
                        className="w-10 h-10 rounded-xl"
                        size={22}
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[var(--fg-primary)] truncate leading-tight">
                          {sub.name}
                        </h4>
                        <span className="text-[11px] text-[var(--fg-muted)] truncate block mt-0.5">
                          {sub.category}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleSubscription(sub.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer flex-shrink-0 active:scale-95 ${
                        sub.isActive
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-slate-200 dark:bg-slate-800 text-[var(--fg-muted)] hover:bg-slate-300 dark:hover:bg-slate-700"
                      }`}
                      title={sub.isActive ? "กดเพื่อพักชั่วคราว" : "กดเพื่อเปิดใช้งาน"}
                      aria-label={sub.isActive ? "พักชั่วคราว" : "เปิดใช้งาน"}
                    >
                      {sub.isActive ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <PauseCircle className="w-3.5 h-3.5" />
                      )}
                      <span className="text-[10px]">{sub.isActive ? "ใช้งาน" : "พัก"}</span>
                    </button>
                  </div>

                  {/* Body: Cost + Billing Info */}
                  <div className="pt-2.5 pb-3 border-t border-b border-[var(--border-subtle)] space-y-1.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[var(--fg-muted)]">ค่าบริการ</span>
                      <div className="text-right">
                        <span className="text-lg font-black text-[var(--fg-primary)]">
                          {formatCurrency(sub.amount)}
                        </span>
                        <span className="text-[10px] text-[var(--fg-muted)] ml-1">
                          /{sub.billingCycle === "monthly" ? "เดือน" : "ปี"}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[var(--fg-muted)] flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3" />
                        <span>ตัดรอบถัดไป</span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-[var(--fg-primary)] text-[11px]">
                          {formatShortDate(sub.nextBillingDate)}
                        </span>
                        {daysInfo.label && (
                          <span
                            className={`text-[9.5px] px-1.5 py-0.2 rounded-md font-medium ${
                              daysInfo.isOverdue
                                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                                : daysInfo.days <= 3
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold"
                                : "bg-slate-100 dark:bg-slate-800 text-[var(--fg-muted)]"
                            }`}
                          >
                            {daysInfo.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer: Linked Account & Actions */}
                <div className="mt-3 flex items-center justify-between">
                  {/* Linked Card / Account Badge */}
                  <div className="min-w-0 flex-1 mr-2">
                    {linkedCard ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--fg-muted)] truncate">
                        <CreditCard className="w-3 h-3 text-indigo-500 flex-shrink-0" />
                        <span className="truncate">{linkedCard.name}</span>
                      </span>
                    ) : linkedAcc ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--fg-muted)] truncate">
                        <Wallet className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{linkedAcc.name}</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-[var(--fg-muted)]">
                        {sub.billingCycle === "monthly" ? "รายเดือน" : "รายปี"}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons: Edit & Delete */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors cursor-pointer"
                      title="แก้ไข Subscription"
                      aria-label="แก้ไข"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setSubToDelete(sub)}
                      className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="ลบ Subscription"
                      aria-label="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= ADD / EDIT MODAL ================= */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88dvh] sm:max-h-[90dvh] my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header (Pinned at top) */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-surface)]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-[var(--fg-primary)]">
                    {editingSub ? "แก้ไข Subscription" : "เพิ่ม Subscription ใหม่"}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[var(--fg-muted)]">
                    เลือกจากบริการยอดนิยม หรือพิมพ์ชื่อและรายละเอียดเอง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col flex-1 overflow-hidden">
              {/* Scrollable Form Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {/* SECTION 1: หมวดหมู่ (Select Dropdown) */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                    หมวดหมู่บริการ
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                      <Layers className="w-4 h-4" />
                    </div>
                    <select
                      value={category}
                      onChange={(e) => {
                        const newCat = e.target.value;
                        setCategory(newCat);
                        // Select the first preset of new category if available
                        const firstPreset = SUBSCRIPTION_PRESETS.find((p) => p.category === newCat);
                        if (firstPreset && !editingSub) {
                          handleSelectPreset(firstPreset);
                        }
                      }}
                      className="w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-medium text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                    >
                      {SUBSCRIPTION_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* SECTION 2: รายการยอดนิยม (Quick Pick Presets) */}
                {activeCategoryPresets.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-[var(--fg-muted)] flex items-center justify-between">
                      <span>รายการยอดนิยมในหมวดหมู่นี้ (คลิกเพื่อเลือกทันที)</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-normal">
                        ใส่ราคาและสีให้อัตโนมัติ
                      </span>
                    </span>
                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] max-h-32 sm:max-h-36 overflow-y-auto">
                      {activeCategoryPresets.map((preset) => {
                        const isSelected = name.toLowerCase() === preset.name.toLowerCase();
                        return (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => handleSelectPreset(preset)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border outline-none focus:outline-none ${
                              isSelected
                                ? "bg-emerald-500 text-white border-emerald-500 shadow-xs scale-102"
                                : "bg-[var(--bg-surface)] text-[var(--fg-primary)] border-[var(--border-subtle)] hover:border-emerald-500/50 hover:bg-emerald-500/5"
                            }`}
                          >
                            <SubscriptionBrandIcon
                              name={preset.name}
                              iconKey={preset.iconKey}
                              color={preset.color}
                              className="w-4 h-4 rounded-md"
                              size={12}
                            />
                            <span>{preset.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* SECTION 3: ชื่อบริการ (Customizable Input + Live Icon Preview) */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                    ชื่อบริการ (เลือกจากรายการด้านบน หรือพิมพ์ชื่อเอง)
                  </label>
                  <div className="relative flex items-center">
                    {/* Live SVG or Letter preview */}
                    <div className="absolute left-2.5 pointer-events-none z-10">
                      <SubscriptionBrandIcon
                        name={name}
                        iconKey={iconKey}
                        color={color}
                        className="w-7 h-7 rounded-lg"
                        size={16}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="เช่น Netflix, ChatGPT Plus, YouTube Premium"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className={`w-full h-10 sm:h-11 py-2 pl-12 pr-3.5 rounded-xl bg-[var(--bg-canvas)] text-xs sm:text-sm text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                        formErrors.name
                          ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                  </div>
                  {formErrors.name && (
                    <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                {/* SECTION 4: จำนวนเงิน & รอบการชำระ */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                      จำนวนเงิน (บาท)
                    </label>
                    <div className="relative flex items-center group">
                      <span className="absolute left-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold pointer-events-none z-10">
                        ฿
                      </span>
                      <input
                        type="number"
                        step="any"
                        placeholder="299"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          if (formErrors.amount) {
                            setFormErrors((prev) => ({ ...prev, amount: undefined }));
                          }
                        }}
                        className={`w-full h-10 sm:h-11 py-2 pl-8 pr-3.5 rounded-xl bg-[var(--bg-canvas)] text-xs sm:text-sm font-semibold text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                          formErrors.amount
                            ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                            : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                        }`}
                      />
                    </div>
                    {formErrors.amount && (
                      <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                        {formErrors.amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                      รอบการชำระ
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                        <Clock className="w-4 h-4" />
                      </div>
                      <select
                        value={cycle}
                        onChange={(e) => setCycle(e.target.value as SubscriptionCycle)}
                        className="w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm font-medium text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="monthly">รายเดือน (Monthly)</option>
                        <option value="yearly">รายปี (Yearly)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: วันตัดเงินถัดไป & บัญชี/บัตรที่ผูก */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <ThaiDatePicker
                      label="วันตัดเงินถัดไป"
                      value={nextDate}
                      onChange={setNextDate}
                      showBuddhistEra={true}
                      showShortcuts={true}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                      ผูกกับบัตรหรือบัญชี (ไม่บังคับ)
                    </label>
                    <div className="relative flex items-center group">
                      <div className="absolute left-3.5 pointer-events-none text-slate-400 z-10">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <select
                        value={linkedAccountId}
                        onChange={(e) => setLinkedAccountId(e.target.value)}
                        className="w-full h-10 sm:h-11 py-2 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs sm:text-sm text-[var(--fg-primary)] outline-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="">ไม่ระบุ</option>
                        {creditCards.length > 0 && (
                          <optgroup label="บัตรเครดิต">
                            {creditCards.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                        {accounts.length > 0 && (
                          <optgroup label="บัญชีธนาคาร">
                            {accounts.map((a) => (
                              <option key={a.id} value={a.id}>
                                {a.name}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: สีประจำแบรนด์ */}
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                    สีประจำแบรนด์หรือธีม
                  </label>
                  <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full transition-transform cursor-pointer relative outline-none focus:outline-none ${
                          color.toLowerCase() === c.toLowerCase()
                            ? "ring-2 ring-emerald-500 ring-offset-2 ring-offset-[var(--bg-surface)] scale-110"
                            : "hover:scale-110 opacity-85 hover:opacity-100"
                        }`}
                        style={{ backgroundColor: c }}
                        title={c}
                        aria-label={`เลือกสี ${c}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Pinned at bottom) */}
              <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-3.5 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-500/20 active:scale-98 transition-all cursor-pointer outline-none focus:outline-none"
                >
                  {editingSub ? "บันทึกการแก้ไข" : "เพิ่ม Subscription"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE CONFIRMATION DIALOG ================= */}
      {subToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSubToDelete(null)}
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
                ยืนยันการลบ Subscription?
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
                คุณต้องการลบรายการ <strong className="text-[var(--fg-primary)] font-semibold">"{subToDelete.name}"</strong> ออกจากระบบใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSubToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteSubscription(subToDelete.id);
                  setSubToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95 outline-none focus:outline-none"
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
