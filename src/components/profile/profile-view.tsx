"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  User,
  GenderMale,
  GenderFemale,
  Sparkle,
  Shuffle,
  Check,
  ArrowsCounterClockwise,
  Palette,
  TShirt,
  Scissors,
  Eyeglasses,
  Headphones,
  EnvelopeSimple,
  IdentificationCard,
  FloppyDisk,
  ShieldCheck,
  CheckCircle,
  Wallet,
  Sun,
  Moon,
  Desktop,
  Plus,
  Trash,
  Building,
  Warning,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { useFinance } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { AccountType, Account } from "@/lib/types";
import { BANK_PRESETS, getBankTheme } from "@/lib/bank-presets";

import {
  MascotConfig,
  MascotGender,
  MascotSkinToneId,
  MascotHairStyle,
  MascotHairColorId,
  MascotOutfitId,
  MascotOutfitColorId,
  MascotAccessoryId,
  MascotBackdropId,
  SKIN_TONES,
  HAIR_COLORS,
  MALE_HAIR_STYLES,
  FEMALE_HAIR_STYLES,
  OUTFITS,
  OUTFIT_COLORS,
  ACCESSORIES,
  BACKDROPS,
  DEFAULT_MALE_MASCOT,
  DEFAULT_FEMALE_MASCOT,
  getRandomMascotConfig,
} from "@/lib/mascot-types";
import { MascotAvatar } from "./mascot-avatar";

interface ProfileViewProps {
  onNavigate?: (tab: string) => void;
}

export function ProfileView({ onNavigate }: ProfileViewProps) {
  const { user, profile, mascotConfig, updateMascotConfig, updateProfileName } = useAuth();
  const { accounts, creditCards, subscriptions, addAccount, deleteAccount } = useFinance();
  const { theme, setTheme } = useTheme();

  // Top-level section tab
  const [activeSection, setActiveSection] = useState<"mascot" | "accounts" | "appearance">("mascot");

  // Local draft mascot state for interactive live preview
  const [draftConfig, setDraftConfig] = useState<MascotConfig>(mascotConfig || DEFAULT_MALE_MASCOT);
  const [activeCustomTab, setActiveCustomTab] = useState<"gender" | "skin" | "hair" | "outfit" | "accessory" | "backdrop">("gender");

  // Account details edit state
  const [fullName, setFullName] = useState(profile?.full_name || user?.user_metadata?.full_name || "");
  const [username, setUsername] = useState(profile?.username || user?.user_metadata?.username || "");
  const [nameError, setNameError] = useState<string | null>(null);

  // Feedback states
  const [isSavedMascot, setIsSavedMascot] = useState(false);
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSavedSuccess, setNameSavedSuccess] = useState(false);

  // ===== ACCOUNTS SECTION STATE =====
  const [isAddAccOpen, setIsAddAccOpen] = useState(false);
  const [accType, setAccType] = useState<AccountType>("bank");
  const [selectedPresetId, setSelectedPresetId] = useState("kbank");
  const [customBankName, setCustomBankName] = useState("");
  const [accNickname, setAccNickname] = useState("");
  const [accNumber, setAccNumber] = useState("");
  const [accBalance, setAccBalance] = useState("");
  const [accErrors, setAccErrors] = useState<{ name?: string; balance?: string }>({});
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  useEffect(() => {
    if (mascotConfig) {
      setDraftConfig(mascotConfig);
    }
  }, [mascotConfig]);

  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
    }
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile]);

  // Gender Switch Handler
  const handleGenderChange = (newGender: MascotGender) => {
    const isMale = newGender === "male";
    const availableStyles = isMale ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES;
    const isCurrentStyleValid = availableStyles.some((s) => s.id === draftConfig.hairStyle);

    const updated: MascotConfig = {
      ...draftConfig,
      gender: newGender,
      hairStyle: isCurrentStyleValid ? draftConfig.hairStyle : availableStyles[0].id,
      outfit: isMale ? "fintech-blazer" : "tech-hoodie",
    };
    setDraftConfig(updated);
    updateMascotConfig(updated);
  };

  // Generic Update Handler
  const updateDraft = (patch: Partial<MascotConfig>) => {
    const next = { ...draftConfig, ...patch };
    setDraftConfig(next);
    // Instant auto-save to context and localStorage
    updateMascotConfig(next);
  };

  // Randomize mascot
  const handleRandomize = () => {
    const randomConfig = getRandomMascotConfig(draftConfig.gender);
    setDraftConfig(randomConfig);
    updateMascotConfig(randomConfig);
    setIsSavedMascot(true);
    setTimeout(() => setIsSavedMascot(false), 2000);
  };

  // Reset to default
  const handleReset = () => {
    const def = draftConfig.gender === "female" ? DEFAULT_FEMALE_MASCOT : DEFAULT_MALE_MASCOT;
    setDraftConfig(def);
    updateMascotConfig(def);
    setIsSavedMascot(true);
    setTimeout(() => setIsSavedMascot(false), 2000);
  };

  // Save explicitly
  const handleManualSaveMascot = async () => {
    await updateMascotConfig(draftConfig);
    setIsSavedMascot(true);
    setTimeout(() => setIsSavedMascot(false), 2500);
  };

  // Save Profile Name
  const handleSaveAccountInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setNameError("กรุณากรอกชื่อ-นามสกุล หรือชื่อแสดงตัวตน");
      return;
    }
    setNameError(null);
    setIsSavingName(true);
    const res = await updateProfileName(fullName, username);
    setIsSavingName(false);
    if (res.error) {
      setNameError(res.error);
    } else {
      setNameSavedSuccess(true);
      setTimeout(() => setNameSavedSuccess(false), 3000);
    }
  };

  // ===== ACCOUNTS useMemo =====
  const availablePresets = useMemo(() => BANK_PRESETS.filter((p) => p.type === accType), [accType]);
  const selectedPreset = useMemo(() => {
    if (selectedPresetId === "custom") return null;
    return availablePresets.find((p) => p.id === selectedPresetId) || availablePresets[0] || null;
  }, [selectedPresetId, availablePresets]);
  const previewName = useMemo(() => {
    if (selectedPresetId === "custom") return customBankName.trim() || "ระบุชื่อสถาบันการเงิน";
    if (!selectedPreset) return "เลือกบัญชี";
    return accNickname.trim() ? `${selectedPreset.shortName} (${accNickname.trim()})` : selectedPreset.name;
  }, [selectedPresetId, customBankName, selectedPreset, accNickname]);
  const bankTheme = useMemo(() => getBankTheme(previewName, selectedPreset?.color), [previewName, selectedPreset]);

  const handleTypeChange = (type: AccountType) => {
    setAccType(type);
    const presetsForType = BANK_PRESETS.filter((p) => p.type === type);
    setSelectedPresetId(presetsForType.length > 0 ? presetsForType[0].id : "custom");
    setCustomBankName("");
    if (accErrors.name) setAccErrors((prev) => ({ ...prev, name: undefined }));
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; balance?: string } = {};
    let finalName = "";
    if (selectedPresetId === "custom") {
      if (!customBankName.trim()) errors.name = "กรุณาระบุชื่อบัญชีหรือสถาบันการเงิน";
      else finalName = accNickname.trim() ? `${customBankName.trim()} (${accNickname.trim()})` : customBankName.trim();
    } else {
      if (!selectedPreset) errors.name = "กรุณาเลือกสถาบันการเงิน / ธนาคาร";
      else finalName = accNickname.trim() ? `${selectedPreset.shortName} (${accNickname.trim()})` : selectedPreset.name;
    }
    const numBalance = accBalance.trim() === "" ? 0 : parseFloat(accBalance);
    if (isNaN(numBalance)) errors.balance = "กรุณากรอกยอดเงินเริ่มต้นเป็นตัวเลข";
    if (Object.keys(errors).length > 0) { setAccErrors(errors); return; }
    addAccount({
      name: finalName, type: accType, balance: numBalance, currency: "THB",
      color: selectedPreset?.color || bankTheme.accent,
      accountNumber: accNumber.trim() ? accNumber.trim() : undefined,
      bankName: selectedPreset?.shortName || undefined,
    });
    setIsAddAccOpen(false);
    setSelectedPresetId("kbank"); setCustomBankName(""); setAccNickname(""); setAccNumber(""); setAccBalance(""); setAccErrors({});
  };

  const hairStylesList = draftConfig.gender === "male" ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES;
  const currentOutfit = OUTFITS.find((o) => o.id === draftConfig.outfit);
  const currentHair = hairStylesList.find((h) => h.id === draftConfig.hairStyle);


  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--border-subtle)]/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold tracking-wide mb-2">
            <ShieldCheck size={13} weight="fill" />
            โปรไฟล์และการตั้งค่า
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--fg-primary)] tracking-tight">
            โปรไฟล์และการตั้งค่า
          </h1>
          <p className="text-sm text-[var(--fg-muted)] mt-1">
            จัดการมาสคอต 3D ประจำตัว บัญชีและกระเป๋าเงิน และธีมการแสดงผล
          </p>
        </div>
      </div>

      {/* Top-Level Section Tab Bar */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {([
          { id: "mascot", label: "มาสคอต 3D", icon: Sparkle },
          { id: "accounts", label: "บัญชีและกระเป๋า", icon: Wallet },
          { id: "appearance", label: "ธีมการแสดงผล", icon: Palette },
        ] as { id: "mascot" | "accounts" | "appearance"; label: string; icon: React.ElementType }[]).map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex-1 justify-center ${
                isActive
                  ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                  : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)]"
              }`}
            >
              <Icon size={15} weight={isActive ? "fill" : "regular"} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* ======================== SECTION: มาสคอต 3D ======================== */}
      {activeSection === "mascot" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Mascot Action Buttons */}
          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-canvas)] text-[var(--fg-primary)] font-medium text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <Shuffle size={16} weight="bold" className="text-indigo-500" />
              <span>สุ่มตัวละคร</span>
            </button>
            <button
              type="button"
              onClick={handleManualSaveMascot}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-xs shadow-xs active:scale-95 transition-all cursor-pointer ${
                isSavedMascot ? "bg-emerald-600 ring-2 ring-emerald-400/40" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
              }`}
            >
              {isSavedMascot ? <><Check size={16} weight="bold" /><span>บันทึกเรียบร้อย</span></> : <><FloppyDisk size={16} weight="bold" /><span>บันทึกมาสคอต</span></>}
            </button>
          </div>

          {/* Main Studio Grid: Left Live Mascot Showcase, Right Customizer Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ================= LEFT COLUMN: MASCOT LIVE STAGE & ACCOUNT CARD ================= */}
            <div className="lg:col-span-5 space-y-6">
          {/* 3D Mascot Showcase Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm relative overflow-hidden flex flex-col items-center text-center">
            {/* Ambient Background Gradient Blur */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent pointer-events-none" />

            {/* Mascot Avatar Stage */}
            <div className="relative group my-2">
              <div className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                <MascotAvatar
                  config={draftConfig}
                  size="2xl"
                  rounded="3xl"
                  showBackdrop={true}
                  className="shadow-xl ring-4 ring-white/60 dark:ring-slate-800/80"
                />
              </div>

              {/* Status active beacon */}
              <div className="absolute -bottom-1 -right-1 z-20 w-6 h-6 rounded-full bg-emerald-500 ring-4 ring-[var(--bg-surface)] flex items-center justify-center text-white shadow-md">
                <Check size={12} weight="bold" />
              </div>
            </div>

            {/* Mascot Metadata Pills */}
            <div className="mt-4">
              <h2 className="text-lg font-extrabold text-[var(--fg-primary)] tracking-tight">
                {profile?.full_name || user?.user_metadata?.full_name || "กระเป๋าเงินของฉัน"}
              </h2>
              <p className="text-xs text-[var(--fg-muted)] mt-0.5 font-medium">
                @{profile?.username || user?.user_metadata?.username || user?.email?.split("@")[0] || "member"}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {draftConfig.gender === "male" ? (
                    <GenderMale size={13} weight="bold" />
                  ) : (
                    <GenderFemale size={13} weight="bold" />
                  )}
                  <span>{draftConfig.gender === "male" ? "มาสคอตชาย" : "มาสคอตหญิง"}</span>
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-canvas)] text-[var(--fg-muted)] border border-[var(--border-subtle)]">
                  {currentOutfit?.name}
                </span>

                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[var(--bg-canvas)] text-[var(--fg-muted)] border border-[var(--border-subtle)]">
                  {currentHair?.name}
                </span>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="w-full grid grid-cols-2 gap-2 mt-6 pt-5 border-t border-[var(--border-subtle)]">
              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--bg-canvas)] hover:bg-emerald-500/10 hover:text-emerald-600 dark:hover:text-emerald-400 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--fg-muted)] transition-all cursor-pointer"
              >
                <Shuffle size={14} weight="bold" />
                <span>สุ่มสไตล์</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[var(--bg-canvas)] hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-400 border border-[var(--border-subtle)] text-xs font-semibold text-[var(--fg-muted)] transition-all cursor-pointer"
              >
                <ArrowsCounterClockwise size={14} weight="bold" />
                <span>คืนค่าเริ่มต้น</span>
              </button>
            </div>
          </div>

          {/* Account Overview Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <IdentificationCard size={18} weight="bold" className="text-emerald-500" />
                <h3 className="text-sm font-bold text-[var(--fg-primary)]">ข้อมูลบัญชีผู้ใช้</h3>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck size={12} weight="bold" />
                <span>Verified</span>
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-[var(--fg-muted)]">อีเมลเข้าสู่ระบบ</span>
                <span className="font-semibold text-[var(--fg-primary)] select-all">
                  {user?.email || "บัญชีแบบออฟไลน์"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[var(--fg-muted)]">สถานะสมาชิก</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  สมาชิกระดับส่วนบุคคล (Standard)
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[var(--fg-muted)]">ความปลอดภัยระบบ</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Supabase RLS & Local Vault
                </span>
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-subtle)] text-center">
              <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--fg-muted)] font-medium">กระเป๋าเงิน</p>
                <p className="text-base font-extrabold text-[var(--fg-primary)] mt-0.5">{accounts.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--fg-muted)] font-medium">บัตรเครดิต</p>
                <p className="text-base font-extrabold text-[var(--fg-primary)] mt-0.5">{creditCards.length}</p>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                <p className="text-[10px] text-[var(--fg-muted)] font-medium">ซับสคริปชัน</p>
                <p className="text-base font-extrabold text-[var(--fg-primary)] mt-0.5">{subscriptions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: CUSTOMIZATION STUDIO CONTROLS ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customizer Navigation Tabs */}
          <div className="p-1.5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xs flex items-center overflow-x-auto gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {[
              { id: "gender", label: "เพศ (Gender)", icon: GenderMale },
              { id: "skin", label: "สีผิว (Skin)", icon: Palette },
              { id: "hair", label: "ทรงผม & สีผม", icon: Scissors },
              { id: "outfit", label: "ชุด & สีเสื้อผ้า", icon: TShirt },
              { id: "accessory", label: "เครื่องประดับ", icon: Eyeglasses },
              { id: "backdrop", label: "แสงพื้นหลัง", icon: Sparkle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeCustomTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCustomTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${isActive
                    ? "bg-emerald-500 text-white shadow-xs"
                    : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)]"
                    }`}
                >
                  <Icon size={15} weight={isActive ? "bold" : "regular"} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Panel Content Box */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-6 min-h-[360px]">
            {/* 1. GENDER TAB */}
            {activeCustomTab === "gender" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">เลือกเพศของมาสคอต (Gender)</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    เลือกโครงหน้า ทรงผม และมิติการแสดงผลครึ่งตัวที่เหมาะสม
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Male Option */}
                  <button
                    type="button"
                    onClick={() => handleGenderChange("male")}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer text-center ${draftConfig.gender === "male"
                      ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/40"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${draftConfig.gender === "male"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border border-[var(--border-subtle)]"
                        }`}
                    >
                      <GenderMale size={24} weight="bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--fg-primary)]">เพศชาย (Male)</p>
                      <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                        โครงหน้าสมาร์ท คิ้วคมชัด ทรงผมผู้ชาย
                      </p>
                    </div>
                    {draftConfig.gender === "male" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                        <Check size={10} weight="bold" /> เลือกอยู่
                      </span>
                    )}
                  </button>

                  {/* Female Option */}
                  <button
                    type="button"
                    onClick={() => handleGenderChange("female")}
                    className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all cursor-pointer text-center ${draftConfig.gender === "female"
                      ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/40"
                      }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${draftConfig.gender === "female"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border border-[var(--border-subtle)]"
                        }`}
                    >
                      <GenderFemale size={24} weight="bold" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[var(--fg-primary)]">เพศหญิง (Female)</p>
                      <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">
                        โครงหน้าละมุน ขนตาอ่อนหวาน บลัชออน
                      </p>
                    </div>
                    {draftConfig.gender === "female" && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                        <Check size={10} weight="bold" /> เลือกอยู่
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 2. SKIN TONE TAB */}
            {activeCustomTab === "skin" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">เฉดสีผิว 3D (Skin Tone)</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    แสงเงาแบบ 3D Ambient Occlusion ผิวสัมผัสละมุนพร้อมบลัชออน
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SKIN_TONES.map((tone) => {
                    const isSelected = draftConfig.skinTone === tone.id;
                    return (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => updateDraft({ skinTone: tone.id })}
                        className={`p-3 rounded-2xl border flex items-center gap-3.5 transition-all cursor-pointer text-left ${isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                          : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                          }`}
                      >
                        {/* Circular 3D Color Ball Preview */}
                        <div
                          className="w-10 h-10 rounded-full flex-shrink-0 shadow-sm border border-black/10 ring-2 ring-white/50 dark:ring-black/50"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${tone.lightHex} 0%, ${tone.baseHex} 60%, ${tone.shadowHex} 100%)`,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--fg-primary)] truncate">{tone.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: tone.blushHex }}
                              title="บลัชออนแก้ม"
                            />
                            <span className="text-[10px] text-[var(--fg-muted)]">บลัชออนชมพู</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                            <Check size={13} weight="bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. HAIR STYLE & COLOR TAB */}
            {activeCustomTab === "hair" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Hair Style Section */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[var(--fg-primary)]">ทรงผม (Hair Style)</h3>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                      สไตล์ผมสำหรับ{draftConfig.gender === "male" ? "เพศชาย" : "เพศหญิง"}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {hairStylesList.map((style) => {
                      const isSelected = draftConfig.hairStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => updateDraft({ hairStyle: style.id })}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                            : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-[var(--fg-primary)]">{style.name}</p>
                            <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">{style.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                              <Check size={12} weight="bold" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hair Color Section */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--fg-primary)]">เฉดสีผม (Hair Color)</h4>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                      สีผมพร้อมประกายไฮไลท์แสงตกกระทบ
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {HAIR_COLORS.map((color) => {
                      const isSelected = draftConfig.hairColor === color.id;
                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => updateDraft({ hairColor: color.id })}
                          className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                            : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                            }`}
                        >
                          <div
                            className="w-7 h-7 rounded-full shadow-xs ring-1 ring-black/20 flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${color.lightHex} 0%, ${color.baseHex} 50%, ${color.shadowHex} 100%)`,
                            }}
                          />
                          <span className="text-xs font-semibold text-[var(--fg-primary)] truncate">
                            {color.name.split(" ")[0]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 4. OUTFIT & COLOR TAB */}
            {activeCustomTab === "outfit" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Outfit Type Section */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-base font-bold text-[var(--fg-primary)]">เสื้อผ้าครึ่งตัว (Outfits)</h3>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                      ชุดแต่งกายสไตล์ FinTech & Modern Tech
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {OUTFITS.map((outfit) => {
                      const isSelected = draftConfig.outfit === outfit.id;
                      return (
                        <button
                          key={outfit.id}
                          type="button"
                          onClick={() => updateDraft({ outfit: outfit.id })}
                          className={`p-3 rounded-2xl border text-left flex items-center justify-between gap-2 transition-all cursor-pointer ${isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                            : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                            }`}
                        >
                          <div>
                            <p className="text-xs font-bold text-[var(--fg-primary)]">{outfit.name}</p>
                            <p className="text-[11px] text-[var(--fg-muted)] mt-0.5">{outfit.description}</p>
                          </div>
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                              <Check size={12} weight="bold" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Outfit Color Palette Section */}
                <div className="space-y-3 pt-4 border-t border-[var(--border-subtle)]">
                  <div>
                    <h4 className="text-sm font-bold text-[var(--fg-primary)]">เฉดสีเสื้อผ้า (Outfit Color)</h4>
                    <p className="text-xs text-[var(--fg-muted)] mt-0.5">
                      โทนสีโมเดิร์นคลาสสิกระดับ Enterprise
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {OUTFIT_COLORS.map((col) => {
                      const isSelected = draftConfig.outfitColor === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => updateDraft({ outfitColor: col.id })}
                          className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                            : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                            }`}
                        >
                          <div
                            className="w-6 h-6 rounded-lg shadow-xs ring-1 ring-black/10 flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${col.lightHex} 0%, ${col.baseHex} 50%, ${col.shadowHex} 100%)`,
                            }}
                          />
                          <span className="text-[11px] font-semibold text-[var(--fg-primary)] truncate">
                            {col.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 5. ACCESSORY TAB */}
            {activeCustomTab === "accessory" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">เครื่องประดับ (Accessories)</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    เพิ่มเอกลักษณ์เฉพาะตัวด้วยแว่นตาหรือหูฟังเทค
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {ACCESSORIES.map((acc) => {
                    const isSelected = draftConfig.accessory === acc.id;
                    const Icon =
                      acc.id === "round-glasses"
                        ? Eyeglasses
                        : acc.id === "tech-headphones"
                          ? Headphones
                          : Sparkle;

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => updateDraft({ accessory: acc.id })}
                        className={`p-4 rounded-2xl border flex flex-col items-center gap-2.5 text-center transition-all cursor-pointer ${isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                          : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-emerald-500 text-white" : "bg-[var(--bg-surface)] text-[var(--fg-muted)] border border-[var(--border-subtle)]"
                            }`}
                        >
                          <Icon size={20} weight="bold" />
                        </div>
                        <span className="text-xs font-bold text-[var(--fg-primary)]">{acc.name}</span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <Check size={11} weight="bold" /> เลือกอยู่
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. BACKDROP GLOW TAB */}
            {activeCustomTab === "backdrop" && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">แสงออร่าพื้นหลัง (Backdrop Lighting)</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-1">
                    แสงเรืองรอบตัวละครสไตล์ 3D Studio
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {BACKDROPS.map((b) => {
                    const isSelected = draftConfig.backdrop === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => updateDraft({ backdrop: b.id })}
                        className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer text-left ${isSelected
                          ? "border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/30"
                          : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] hover:border-emerald-500/30"
                          }`}
                      >
                        <div
                          className="w-10 h-10 rounded-2xl shadow-sm flex-shrink-0 ring-2 ring-white/50 dark:ring-black/40"
                          style={{
                            background: `radial-gradient(circle at 35% 35%, ${b.innerHex} 0%, ${b.outerHex} 100%)`,
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-[var(--fg-primary)]">{b.name}</p>
                          <p className="text-[10px] text-[var(--fg-muted)]">Radial Studio Light</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                            <Check size={12} weight="bold" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Form: Edit Display Name & Username */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--border-subtle)]">
              <User size={18} weight="bold" className="text-emerald-500" />
              <h3 className="text-sm font-bold text-[var(--fg-primary)]">แก้ไขข้อมูลส่วนตัว</h3>
            </div>

            <form noValidate onSubmit={handleSaveAccountInfo} className="space-y-4">
              {/* Full Name Input */}
              <div>
                <label className="block text-xs font-bold text-[var(--fg-primary)] mb-1.5">
                  ชื่อ-นามสกุล หรือชื่อแสดงตัวตน
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder="เช่น สมชาย ใจดี หรือชื่อเล่นของคุณ"
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] transition-all outline-none ${
                      nameError
                        ? "border border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
                        : "border border-[var(--border-subtle)] focus:border-emerald-500"
                    }`}
                  />
                </div>
                {nameError && (
                  <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {nameError}
                  </p>
                )}
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-[var(--fg-primary)] mb-1.5">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-mono font-bold">@</span>
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs text-[var(--fg-primary)] focus:border-emerald-500 transition-all outline-none"
                  />
                </div>
                <p className="text-[11px] text-[var(--fg-muted)] mt-1">
                  ใช้สำหรับระบุตัวตนในระบบและแสดงบนการ์ดสรุป
                </p>
              </div>

              {/* Email (Read only) */}
              <div>
                <label className="block text-xs font-bold text-[var(--fg-primary)] mb-1.5">
                  อีเมลบัญชี (Email)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <EnvelopeSimple size={16} />
                  </div>
                  <input
                    type="email"
                    value={user?.email || "เข้าสู่ระบบแบบออฟไลน์"}
                    disabled
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[var(--bg-canvas)]/50 border border-[var(--border-subtle)] text-xs text-[var(--fg-muted)] cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-2">
                {nameSavedSuccess ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle size={14} weight="bold" />
                    <span>บันทึกข้อมูลเรียบร้อยแล้ว</span>
                  </span>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={isSavingName}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSavingName ? "กำลังบันทึก..." : "บันทึกข้อมูลโปรไฟล์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
        </div>
      )}


      {/* ======================== SECTION: บัญชีและกระเป๋า ======================== */}
      {activeSection === "accounts" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Accounts List Card */}
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[var(--fg-primary)]">จัดการกระเป๋า & บัญชี</h3>
                <p className="text-xs text-[var(--fg-muted)] mt-0.5">เพิ่มหรือลบบัญชีเงินสด บัญชีธนาคาร หรือ E-Wallet</p>
              </div>
              <button
                onClick={() => setIsAddAccOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all cursor-pointer shadow-sm shadow-emerald-500/25 active:scale-95"
              >
                <Plus size={15} weight="bold" />
                <span>เพิ่มบัญชี</span>
              </button>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {accounts.map((acc) => (
                <div key={acc.id} className="py-3 flex items-center justify-between first:pt-1 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: acc.color || "#10B981" }} />
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
                        <Trash size={16} weight="bold" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "กระเป๋าเงิน", value: accounts.length, color: "text-emerald-600 dark:text-emerald-400" },
              { label: "บัตรเครดิต", value: creditCards.length, color: "text-amber-600 dark:text-amber-400" },
              { label: "ซับสคริปชัน", value: subscriptions.length, color: "text-indigo-600 dark:text-indigo-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-center">
                <p className="text-[11px] text-[var(--fg-muted)] font-medium">{stat.label}</p>
                <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================== SECTION: ธีมการแสดงผล ======================== */}
      {activeSection === "appearance" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-[var(--fg-primary)]">ธีมการแสดงผล (Appearance)</h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1">
                เลือกระหว่าง Light Mode (โทนสีสว่างสบายตา) หรือ Dark Mode (โทนสีเข้มลึก)
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "light", label: "โหมดสว่าง (Light)", Icon: Sun, iconColor: "text-amber-500" },
                { id: "dark",  label: "โหมดมืด (Dark)",   Icon: Moon, iconColor: "text-indigo-400" },
                { id: "system",label: "ตามอุปกรณ์ (Auto)",Icon: Desktop, iconColor: "text-slate-500" },
              ].map(({ id, label, Icon, iconColor }) => (
                <button
                  key={id}
                  onClick={() => setTheme(id)}
                  className={`p-4 rounded-2xl border flex flex-col items-center gap-3 font-semibold text-xs transition-all cursor-pointer active:scale-95 ${
                    theme === id
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20 shadow-sm"
                      : "border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-[var(--fg-muted)] hover:border-slate-400"
                  }`}
                >
                  <Icon size={24} weight={theme === id ? "fill" : "regular"} className={iconColor} />
                  <span>{label}</span>
                  {theme === id && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                      <Check size={10} weight="bold" /> ใช้งานอยู่
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================== ADD ACCOUNT MODAL ======================== */}
      {isAddAccOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-5 my-8 max-h-[90dvh] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Building size={18} weight="bold" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[var(--fg-primary)]">เพิ่มกระเป๋า / บัญชีใหม่</h3>
                  <p className="text-xs text-[var(--fg-muted)] mt-0.5">เลือกจากสถาบันการเงินยอดนิยม</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setIsAddAccOpen(false); setAccErrors({}); }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer"
              >
                <Warning size={16} weight="bold" className="rotate-45" />
              </button>
            </div>

            {/* Live Card Preview */}
            <div
              className={`relative p-5 rounded-2xl bg-gradient-to-br ${bankTheme.gradient} border ${bankTheme.borderGlow} shadow-lg overflow-hidden min-h-[120px] flex flex-col justify-between`}
            >
              <div className="absolute right-0 top-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />
              <div>
                <h4 className={`text-base font-extrabold tracking-tight truncate ${bankTheme.textColor}`}>{previewName}</h4>
                <p className={`text-[11px] mt-0.5 ${bankTheme.subtextColor} opacity-70`}>
                  {accType === "cash" ? "เงินสด" : accType === "e_wallet" ? "E-Wallet" : "บัญชีออมทรัพย์"}
                </p>
              </div>
              <p className={`text-xl font-black mt-3 ${bankTheme.textColor}`}>{formatCurrency(parseFloat(accBalance) || 0)}</p>
            </div>

            <form noValidate onSubmit={handleAddAccountSubmit} className="space-y-4">
              {/* Account type */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">1. เลือกประเภทบัญชี</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
                  {(["bank", "e_wallet", "cash"] as AccountType[]).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        accType === t ? "bg-[var(--bg-surface)] text-emerald-600 dark:text-emerald-400 shadow-xs border border-[var(--border-subtle)]" : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)]"
                      }`}
                    >
                      {t === "bank" ? "ธนาคาร" : t === "e_wallet" ? "E-Wallet" : "เงินสด"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank preset */}
              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">2. สถาบันการเงิน <span className="text-rose-500">*</span></label>
                <select
                  value={selectedPresetId}
                  onChange={(e) => { setSelectedPresetId(e.target.value); if (accErrors.name) setAccErrors((p) => ({ ...p, name: undefined })); }}
                  className={`w-full h-11 py-2.5 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border transition-all cursor-pointer shadow-2xs outline-none focus:outline-none ${
                    accErrors.name && selectedPresetId === "custom" && !customBankName.trim() ? "border-rose-500" : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  }`}
                >
                  {availablePresets.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
                  <option value="custom">+ อื่นๆ (พิมพ์ชื่อเอง)</option>
                </select>
                {selectedPresetId === "custom" && (
                  <input
                    type="text"
                    placeholder="ระบุชื่อธนาคารหรือกระเป๋า"
                    value={customBankName}
                    onChange={(e) => { setCustomBankName(e.target.value); if (accErrors.name) setAccErrors((p) => ({ ...p, name: undefined })); }}
                    className={`mt-2 w-full h-11 py-2.5 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] border transition-all outline-none focus:outline-none ${
                      accErrors.name ? "border-rose-500" : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                )}
                {accErrors.name && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{accErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">3. ชื่อเล่น (ไม่บังคับ)</label>
                  <input type="text" placeholder="เช่น เงินเดือน" value={accNickname} onChange={(e) => setAccNickname(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm text-[var(--fg-primary)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">4. เลขท้าย 4 หลัก (ไม่บังคับ)</label>
                  <input type="text" inputMode="numeric" maxLength={4} placeholder="เช่น 8849" value={accNumber}
                    onChange={(e) => setAccNumber(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 px-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-sm font-bold tracking-widest text-[var(--fg-primary)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1.5">5. ยอดเงินเริ่มต้น (บาท) <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-emerald-600 dark:text-emerald-400 font-bold pointer-events-none">฿</span>
                  <input type="number" step="any" placeholder="0" value={accBalance}
                    onChange={(e) => { setAccBalance(e.target.value); if (accErrors.balance) setAccErrors((p) => ({ ...p, balance: undefined })); }}
                    className={`w-full h-11 pl-8 pr-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border transition-all outline-none focus:outline-none ${
                      accErrors.balance ? "border-rose-500" : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    }`}
                  />
                </div>
                {accErrors.balance && <p className="text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium">{accErrors.balance}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button type="button" onClick={() => { setIsAddAccOpen(false); setAccErrors({}); }}
                  className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer">
                  ยกเลิก
                </button>
                <button type="submit"
                  className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2">
                  <Plus size={15} weight="bold" /><span>บันทึกบัญชี</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================== DELETE ACCOUNT CONFIRMATION ======================== */}
      {accountToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <Warning size={24} weight="bold" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-[var(--fg-primary)]">ยืนยันการลบบัญชี?</h3>
              <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
                คุณต้องการลบบัญชี <strong className="text-[var(--fg-primary)] font-semibold">&ldquo;{accountToDelete.name}&rdquo;</strong> ({formatCurrency(accountToDelete.balance)}) ใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button type="button" onClick={() => setAccountToDelete(null)}
                className="py-2.5 px-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-canvas)] text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer">
                ยกเลิก
              </button>
              <button type="button"
                onClick={() => { deleteAccount(accountToDelete.id); setAccountToDelete(null); }}
                className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95">
                ลบบัญชี
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
