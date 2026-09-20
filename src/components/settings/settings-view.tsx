"use client";

import React, { useState, useMemo } from "react";
import { 
  Settings, 
  Sun, 
  Moon, 
  Laptop, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Check, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink,
  Wallet,
  LogOut,
  UserCheck,
  X,
  AlertTriangle,
  Layers,
  Building2,
  Sparkles,
  Hash
} from "lucide-react";
import { useTheme } from "next-themes";
import { useFinance } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency } from "@/lib/utils";
import { AccountType, Account } from "@/lib/types";
import { BANK_PRESETS, getBankTheme } from "@/lib/bank-presets";

export function SettingsView() {
  const { theme, setTheme } = useTheme();
  const { accounts, addAccount, deleteAccount, resetToDefaultData } = useFinance();
  const { user, profile, signOut } = useAuth();

  // Supabase Config State
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseKey, setSupabaseKey] = useState("");
  const [isCopiedSchema, setIsCopiedSchema] = useState(false);
  const [isSavedSupa, setIsSavedSupa] = useState(false);

  // New Account Form State (Preset-driven)
  const [isAddAccOpen, setIsAddAccOpen] = useState(false);
  const [accType, setAccType] = useState<AccountType>("bank");
  const [selectedPresetId, setSelectedPresetId] = useState("kbank");
  const [customBankName, setCustomBankName] = useState("");
  const [accNickname, setAccNickname] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [accBalance, setAccBalance] = useState("");
  const [accErrors, setAccErrors] = useState<{ name?: string; balance?: string }>({});

  // Confirmation Modals
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Filter presets matching active account type
  const availablePresets = useMemo(() => {
    return BANK_PRESETS.filter((p) => p.type === accType);
  }, [accType]);

  const selectedPreset = useMemo(() => {
    if (selectedPresetId === "custom") return null;
    return availablePresets.find((p) => p.id === selectedPresetId) || availablePresets[0] || null;
  }, [selectedPresetId, availablePresets]);

  // Real-time Preview Name
  const previewName = useMemo(() => {
    if (selectedPresetId === "custom") {
      return customBankName.trim() || "ระบุชื่อสถาบันการเงิน";
    }
    if (!selectedPreset) return "เลือกบัญชี";
    if (accNickname.trim()) {
      return `${selectedPreset.shortName} (${accNickname.trim()})`;
    }
    return selectedPreset.name;
  }, [selectedPresetId, customBankName, selectedPreset, accNickname]);

  // Real-time Bank Theme for Card Mockup
  const bankTheme = useMemo(() => {
    return getBankTheme(previewName, selectedPreset?.color);
  }, [previewName, selectedPreset]);

  // Handle Type Switch (bank / e_wallet / cash)
  const handleTypeChange = (type: AccountType) => {
    setAccType(type);
    const presetsForType = BANK_PRESETS.filter((p) => p.type === type);
    if (presetsForType.length > 0) {
      setSelectedPresetId(presetsForType[0].id);
    } else {
      setSelectedPresetId("custom");
    }
    setCustomBankName("");
    if (accErrors.name) setAccErrors((prev) => ({ ...prev, name: undefined }));
  };

  React.useEffect(() => {
    const savedUrl = localStorage.getItem("krapao_supabase_url") || "";
    const savedKey = localStorage.getItem("krapao_supabase_key") || "";
    setSupabaseUrl(savedUrl);
    setSupabaseKey(savedKey);
  }, []);

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("krapao_supabase_url", supabaseUrl.trim());
    localStorage.setItem("krapao_supabase_key", supabaseKey.trim());
    setIsSavedSupa(true);
    setTimeout(() => setIsSavedSupa(false), 2000);
  };

  const handleExportData = () => {
    const data = {
      accounts: JSON.parse(localStorage.getItem("krapao_accounts") || "[]"),
      transactions: JSON.parse(localStorage.getItem("krapao_transactions") || "[]"),
      creditCards: JSON.parse(localStorage.getItem("krapao_credit_cards") || "[]"),
      subscriptions: JSON.parse(localStorage.getItem("krapao_subscriptions") || "[]"),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `krapao-jot-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; balance?: string } = {};

    let finalName = "";
    if (selectedPresetId === "custom") {
      if (!customBankName.trim()) {
        errors.name = "กรุณาระบุชื่อบัญชีหรือสถาบันการเงิน";
      } else {
        finalName = accNickname.trim()
          ? `${customBankName.trim()} (${accNickname.trim()})`
          : customBankName.trim();
      }
    } else {
      if (!selectedPreset) {
        errors.name = "กรุณาเลือกสถาบันการเงิน / ธนาคาร";
      } else {
        finalName = accNickname.trim()
          ? `${selectedPreset.shortName} (${accNickname.trim()})`
          : selectedPreset.name;
      }
    }

    const numBalance = accBalance.trim() === "" ? 0 : parseFloat(accBalance);
    if (isNaN(numBalance)) {
      errors.balance = "กรุณากรอกยอดเงินเริ่มต้นเป็นตัวเลข";
    }

    if (Object.keys(errors).length > 0) {
      setAccErrors(errors);
      return;
    }

    addAccount({
      name: finalName,
      type: accType,
      balance: numBalance,
      currency: "THB",
      color: selectedPreset?.color || bankTheme.accent,
      accountNumber: accNumber.trim() ? accNumber.trim() : undefined,
      bankName: selectedPreset?.shortName || undefined,
    });

    setIsAddAccOpen(false);
    setSelectedPresetId("kbank");
    setCustomBankName("");
    setAccNickname("");
    setAccNumber("");
    setAccBalance("");
    setAccErrors({});
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--fg-primary)] tracking-tight">
          การตั้งค่า & เชื่อมต่อระบบ
        </h1>
        <p className="text-sm text-[var(--fg-muted)] mt-0.5">
          ปรับแต่งหน้าตา จัดการบัญชีธนาคาร และเชื่อมต่อฐานข้อมูล Supabase
        </p>
      </div>

      {/* Account Info Card */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold text-base flex items-center justify-center shadow-sm flex-shrink-0">
              {(profile?.full_name || user?.user_metadata?.full_name || user?.email || "KJ")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--fg-primary)]">
                  {profile?.full_name || user?.user_metadata?.full_name || "ผู้ใช้งาน"}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <UserCheck className="w-3 h-3" />
                  เข้าสู่ระบบแล้ว
                </span>
              </div>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 text-xs font-bold transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>

      {/* Theme Settings Card */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[var(--fg-primary)]">ธีมการแสดงผล (Appearance)</h3>
        <p className="text-xs text-[var(--fg-muted)]">
          เลือกระหว่าง Light Mode (โทนสีสว่างสบายตา) หรือ Dark Mode (โทนสีเข้มลึก)
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <button
            onClick={() => setTheme("light")}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all cursor-pointer ${
              theme === "light"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:border-slate-400"
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span>โหมดสว่าง (Light)</span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all cursor-pointer ${
              theme === "dark"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:border-slate-400"
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span>โหมดมืด (Dark)</span>
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`p-3.5 rounded-2xl border flex flex-col items-center gap-2 font-semibold text-xs transition-all cursor-pointer ${
              theme === "system"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:border-slate-400"
            }`}
          >
            <Laptop className="w-5 h-5 text-slate-500" />
            <span>ตามอุปกรณ์ (Auto)</span>
          </button>
        </div>
      </div>

      {/* Wallets & Bank Accounts Manager */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[var(--fg-primary)]">จัดการกระเป๋า & บัญชี</h3>
            <p className="text-xs text-[var(--fg-muted)] mt-0.5">เพิ่มหรือลบบัญชีเงินสด บัญชีธนาคาร หรือ E-Wallet</p>
          </div>
          <button
            onClick={() => setIsAddAccOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มบัญชี</span>
          </button>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {accounts.map((acc) => (
            <div key={acc.id} className="py-3 flex items-center justify-between first:pt-1 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: acc.color || "#10B981" }} />
                <div>
                  <h4 className="text-sm font-bold text-[var(--fg-primary)]">{acc.name}</h4>
                  <span className="text-[11px] text-[var(--fg-muted)]">
                    {acc.type === "bank" ? "ธนาคาร" : acc.type === "cash" ? "เงินสด" : "e-Wallet"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-[var(--fg-primary)]">{formatCurrency(acc.balance)}</span>
                {accounts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setAccountToDelete(acc)}
                    className="p-1.5 rounded-lg text-[var(--fg-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    aria-label={`ลบบัญชี ${acc.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Supabase Database & Vercel Integration Guide */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-500" />
          <h3 className="text-base font-bold text-[var(--fg-primary)]">
            การเชื่อมต่อฐานข้อมูล Supabase (Free Tier)
          </h3>
        </div>
        <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
          แอปนี้รองรับการทำงานทั้งโหมด Local Storage ออฟไลน์แบบ PWA และการซิงก์ขึ้น Supabase Cloud สำหรับ Next.js บน Vercel 
          พร้อมสิทธิ์ความปลอดภัย Row Level Security (RLS)
        </p>

        <div className="p-4 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--fg-primary)]">
              สคริปต์สร้างตารางฐานข้อมูล: supabase/schema.sql
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(`-- Copy schema from project file: supabase/schema.sql`);
                setIsCopiedSchema(true);
                setTimeout(() => setIsCopiedSchema(false), 2000);
              }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              {isCopiedSchema ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopiedSchema ? "คัดลอกชื่อไฟล์แล้ว!" : "ไฟล์ schema.sql พร้อมแล้ว"}</span>
            </button>
          </div>
          <p className="text-[11px] text-[var(--fg-muted)]">
            คุณสามารถนำไฟล์ <code className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px]">supabase/schema.sql</code> ในโปรเจกต์นี้ ไปวางและรันในเมนู <strong>SQL Editor</strong> บนหน้าต่างของ Supabase เพื่อสร้างตารางทั้งหมดได้ในคลิกเดียว
          </p>
        </div>

        {/* Live Supabase Credentials Input */}
        <form onSubmit={handleSaveSupabase} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1">
              NEXT_PUBLIC_SUPABASE_URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--fg-primary)] font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--fg-muted)] mb-1">
              NEXT_PUBLIC_SUPABASE_ANON_KEY
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full py-2 px-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--fg-primary)] font-mono"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {isSavedSupa ? <Check className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            <span>{isSavedSupa ? "บันทึกข้อมูลเรียบร้อย!" : "บันทึกการเชื่อมต่อ"}</span>
          </button>
        </form>
      </div>

      {/* Data Backup & Reset */}
      <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
        <h3 className="text-base font-bold text-[var(--fg-primary)]">จัดการสำรองข้อมูล (Backup & Reset)</h3>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-bold text-[var(--fg-primary)] hover:border-slate-400 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>สำรองข้อมูลเป็นไฟล์ JSON</span>
          </button>

          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-xs font-bold text-rose-500 hover:bg-rose-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>รีเซ็ตข้อมูลเป็นตัวอย่างเริ่มต้น (Demo)</span>
          </button>
        </div>
      </div>

      {/* Add Account Modal (Bank Preset Driven) */}
      {isAddAccOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90dvh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">
                    เพิ่มกระเป๋า / บัญชีใหม่
                  </h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                    เลือกจากสถาบันการเงินยอดนิยม เพื่อความแม่นยำและแสดงผลระดับมืออาชีพ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddAccOpen(false);
                  setAccErrors({});
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
                aria-label="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Card Mockup (Bank-Grade Preview) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[var(--fg-muted)] px-1">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ตัวอย่างหน้าตาบัตรบัญชีบน Dashboard</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {bankTheme.badgeText}
                </span>
              </div>

              <div
                className={`relative p-5 rounded-2xl bg-gradient-to-br ${bankTheme.gradient} border ${bankTheme.borderGlow} shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden min-h-[140px]`}
              >
                {/* Background ambient shapes */}
                <div className="absolute right-0 top-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
                <div className="absolute left-0 bottom-0 -ml-4 -mb-4 w-20 h-20 rounded-full bg-black/15 blur-lg pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/25 backdrop-blur-xs ${bankTheme.textColor}`}>
                      {bankTheme.badgeText}
                    </span>
                    <span className={`text-[11px] font-medium ${bankTheme.subtextColor} opacity-90`}>
                      {accType === "cash"
                        ? "เงินสด"
                        : accType === "e_wallet"
                          ? "E-Wallet"
                          : "บัญชีออมทรัพย์"}
                    </span>
                  </div>

                  <h4 className={`text-base font-extrabold tracking-tight truncate ${bankTheme.textColor}`}>
                    {previewName}
                  </h4>
                  {accNumber.trim() ? (
                    <p className={`text-[11px] font-mono mt-0.5 tracking-wider ${bankTheme.subtextColor} opacity-85`}>
                      ••{accNumber.trim().slice(-4)}
                    </p>
                  ) : (
                    <p className={`text-[10px] mt-0.5 opacity-60 ${bankTheme.subtextColor}`}>
                      (ไม่ระบุเลขท้าย)
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2.5 border-t border-white/10 flex items-baseline justify-between">
                  <span className={`text-[10px] font-medium ${bankTheme.subtextColor}`}>
                    ยอดเงินเริ่มต้น
                  </span>
                  <p className={`text-lg font-black tracking-tight ${bankTheme.textColor} drop-shadow-xs`}>
                    {formatCurrency(parseFloat(accBalance) || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <form noValidate onSubmit={handleAddAccountSubmit} className="space-y-4 pt-1">
              {/* STEP 1: ประเภทบัญชี (Segmented Tabs) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  1. เลือกประเภทบัญชี
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                  <button
                    type="button"
                    onClick={() => handleTypeChange("bank")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none focus:outline-none ${
                      accType === "bank"
                        ? "bg-[var(--bg-surface)] text-emerald-600 dark:text-emerald-400 shadow-xs border border-[var(--border-subtle)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>ธนาคาร</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("e_wallet")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none focus:outline-none ${
                      accType === "e_wallet"
                        ? "bg-[var(--bg-surface)] text-orange-500 shadow-xs border border-[var(--border-subtle)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>E-Wallet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTypeChange("cash")}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer outline-none focus:outline-none ${
                      accType === "cash"
                        ? "bg-[var(--bg-surface)] text-zinc-900 dark:text-zinc-100 shadow-xs border border-[var(--border-subtle)]"
                        : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                    }`}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>เงินสด</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: เลือกสถาบันการเงิน / ธนาคาร (Preset Selector) */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  2. เลือกสถาบันการเงิน / ธนาคาร <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center group">
                  <div className="absolute left-3.5 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => {
                      setSelectedPresetId(e.target.value);
                      if (accErrors.name) setAccErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    className={`w-full h-11 py-2.5 pl-10 pr-4 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border transition-all cursor-pointer shadow-2xs outline-none focus:outline-none ${
                      accErrors.name && selectedPresetId === "custom" && !customBankName.trim()
                        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  >
                    {availablePresets.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                    <option value="custom">+ อื่นๆ (พิมพ์ชื่อเอง)</option>
                  </select>
                </div>

                {/* Custom Name Input if "custom" selected */}
                {selectedPresetId === "custom" && (
                  <div className="mt-2 animate-in fade-in duration-200">
                    <input
                      type="text"
                      placeholder="ระบุชื่อธนาคารหรือกระเป๋า เช่น สหกรณ์, เงินฉุกเฉิน"
                      value={customBankName}
                      onChange={(e) => {
                        setCustomBankName(e.target.value);
                        if (accErrors.name) setAccErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      className={`w-full h-11 py-2.5 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-medium text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                        accErrors.name
                          ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                          : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      }`}
                    />
                  </div>
                )}
                {accErrors.name && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {accErrors.name}
                  </p>
                )}
              </div>

              {/* STEP 3 & 4: ชื่อเล่นบัญชี & เลขบัญชี 4 หลักท้าย */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                    3. ชื่อเล่น / วัตถุประสงค์ (ไม่บังคับ)
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น เงินเดือน, ออมเที่ยว"
                    value={accNickname}
                    onChange={(e) => setAccNickname(e.target.value)}
                    className="w-full h-11 py-2.5 px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-medium text-[var(--fg-primary)] placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs outline-none focus:outline-none"
                  />
                  <p className="text-[10px] text-[var(--fg-muted)] mt-1">
                    จะแสดงต่อท้ายชื่อธนาคารอัตโนมัติ
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                    4. เลขท้าย 4 หลัก (ไม่บังคับ)
                  </label>
                  <div className="relative flex items-center group">
                    <div className="absolute left-3.5 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10">
                      <Hash className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      placeholder="เช่น 8849"
                      value={accNumber}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setAccNumber(val);
                      }}
                      className="w-full h-11 py-2.5 pl-10 pr-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-bold tracking-widest text-[var(--fg-primary)] placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-2xs outline-none focus:outline-none"
                    />
                  </div>
                  <p className="text-[10px] text-[var(--fg-muted)] mt-1">
                    สำหรับช่วยจำแนกสมุดบัญชี
                  </p>
                </div>
              </div>

              {/* STEP 5: ยอดเงินเริ่มต้น */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">
                  5. ยอดเงินเริ่มต้นคงเหลือ (บาท) <span className="text-rose-500">*</span>
                </label>
                <div className="relative flex items-center group">
                  <span className="absolute left-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold pointer-events-none z-10">
                    ฿
                  </span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0"
                    value={accBalance}
                    onChange={(e) => {
                      setAccBalance(e.target.value);
                      if (accErrors.balance) setAccErrors((prev) => ({ ...prev, balance: undefined }));
                    }}
                    className={`w-full h-11 py-2.5 pl-8 pr-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border transition-all shadow-2xs outline-none focus:outline-none ${
                      accErrors.balance
                        ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                        : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                </div>
                {accErrors.balance && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {accErrors.balance}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddAccOpen(false);
                    setAccErrors({});
                  }}
                  className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2 outline-none focus:outline-none"
                >
                  <Plus className="w-4 h-4" />
                  <span>บันทึกบัญชี</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Dialog */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-[var(--fg-primary)]">
                ยืนยันการลบบัญชี?
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
                คุณต้องการลบบัญชี <strong className="text-[var(--fg-primary)] font-semibold">"{accountToDelete.name}"</strong> (คงเหลือ {formatCurrency(accountToDelete.balance)}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAccountToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAccount(accountToDelete.id);
                  setAccountToDelete(null);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95 outline-none focus:outline-none"
              >
                ลบบัญชี
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Data Confirmation Dialog */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-base font-bold text-[var(--fg-primary)]">
                รีเซ็ตข้อมูลเป็นตัวอย่าง (Demo)?
              </h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
                การรีเซ็ตจะล้างข้อมูลธุรกรรม บัญชี และบัตรเครดิตปัจจุบันทั้งหมด แล้วแทนที่ด้วยข้อมูลชุดตัวอย่างเริ่มต้น
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultData();
                  setIsResetConfirmOpen(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95 outline-none focus:outline-none"
              >
                ยืนยันรีเซ็ต
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
