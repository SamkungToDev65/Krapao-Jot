"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  SquaresFour,
  Receipt,
  CreditCard,
  ArrowsClockwise,
  Sun,
  Moon,
  SidebarSimple,
  SignOut,
  User,
  HandCoins,
  TrendUp,
} from "@phosphor-icons/react";

import { useTheme } from "next-themes";
import { useFinance } from "@/lib/store";
import { useAuth } from "@/lib/auth-context";
import { MascotAvatar } from "@/components/profile/mascot-avatar";

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAdd: () => void;
}

export function Sidebar({ currentTab, onSelectTab }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const { creditCards, subscriptions, loans } = useFinance();
  const { user, profile, signOut, mascotConfig } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedState = localStorage.getItem("krapao_sidebar_state");
        const savedCollapsed = localStorage.getItem("krapao_sidebar_collapsed");
        if (savedState === "collapsed" || savedCollapsed === "true") {
          return true;
        }
        if (savedState === "expanded" || savedCollapsed === "false") {
          return false;
        }
      } catch (e) {
        console.error("Failed to read sidebar state from localStorage:", e);
      }
    }
    return false;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "krapao_sidebar_state" || e.key === "krapao_sidebar_collapsed") {
        if (e.newValue === "collapsed" || e.newValue === "true") {
          setIsCollapsed(true);
        } else if (e.newValue === "expanded" || e.newValue === "false") {
          setIsCollapsed(false);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleCollapse = () => {
    setIsTransitioning(true);
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => setIsTransitioning(false), 350);
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("krapao_sidebar_state", next ? "collapsed" : "expanded");
        localStorage.setItem("krapao_sidebar_collapsed", String(next));
      } catch (e) {
        console.error("Failed to save sidebar state to localStorage:", e);
      }
      return next;
    });
  };

  // Keyboard shortcut support: Ctrl+B to toggle sidebar, 1-6 to switch tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapse();
        return;
      }

      if (e.key === "1") onSelectTab("dashboard");
      else if (e.key === "2") onSelectTab("transactions");
      else if (e.key === "3") onSelectTab("cards");
      else if (e.key === "4") onSelectTab("subscriptions");
      else if (e.key === "5") onSelectTab("loans");
      else if (e.key === "6") onSelectTab("profile");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelectTab]);

  const pendingCards = creditCards.filter(
    (c) => !c.isPaidThisMonth && c.currentBalance > 0
  );

  const activeSubsCount = subscriptions.filter((s) => s.isActive).length;
  const pendingLoansCount = loans.filter((l) => l.status !== "paid").length;

  const navSections = [
    {
      title: "การเงินหลัก",
      items: [
        {
          id: "dashboard",
          label: "ภาพรวมการเงิน",
          icon: SquaresFour,
          badge: null,
          hasDot: false,
        },
        {
          id: "transactions",
          label: "รายรับ - รายจ่าย",
          icon: Receipt,
          badge: null,
          hasDot: false,
        },
        {
          id: "investments",
          label: "พอร์ตการลงทุน",
          icon: TrendUp,
          badge: null,
          hasDot: false,
        },
      ],
    },
    {
      title: "ภาระ & บิลประจำ",
      items: [
        {
          id: "cards",
          label: "บัตรเครดิต & รอบบิล",
          icon: CreditCard,
          badge: pendingCards.length > 0 ? `${pendingCards.length} บิล` : null,
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
          hasDot: pendingCards.length > 0,
        },
        {
          id: "subscriptions",
          label: "ค่า Subscription",
          icon: ArrowsClockwise,
          badge: activeSubsCount > 0 ? `${activeSubsCount}` : null,
          badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
          hasDot: false,
        },
        {
          id: "loans",
          label: "เงินให้ยืม (ลูกหนี้)",
          icon: HandCoins,
          badge: pendingLoansCount > 0 ? `${pendingLoansCount} ราย` : null,
          badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
          hasDot: pendingLoansCount > 0,
        },
      ],
    },
    {
      title: "รายงาน & ระบบ",
      items: [
        {
          id: "profile",
          label: "โปรไฟล์และการตั้งค่า",
          icon: User,
          badge: null,
          hasDot: false,
        },
      ],
    },
  ];

  const [avatarError, setAvatarError] = useState(false);
  const avatarUrl = !avatarError
    ? (user?.user_metadata?.avatar_url || user?.user_metadata?.picture || (profile as unknown as Record<string, string>)?.avatar_url)
    : null;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "กระเป๋าเงินของฉัน";
  const initials = displayName.slice(0, 2).toUpperCase();
  const emailText = user?.email || "เข้าสู่ระบบแล้ว";

  return (
    <aside
      className={`hidden md:flex flex-col h-screen h-[100dvh] sticky top-0 border-r border-[var(--border-subtle)] bg-[var(--bg-surface)] z-40 select-none font-sans overflow-hidden ${
        isTransitioning ? "transition-all duration-300 ease-in-out" : ""
      } ${isCollapsed ? "w-[76px] items-center" : "w-[270px]"}`}
    >
      {/* ================= TOP SECTION (HEADER) ================= */}
      {isCollapsed ? (
        /* Collapsed Top: Logo + Expand Toggle */
        <div className="flex flex-col items-center gap-3 w-full py-3.5 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div
            className="relative group cursor-pointer"
            onClick={toggleCollapse}
            title="คลิกเพื่อขยายแถบเมนู (Ctrl+B)"
          >
            <div className="w-11 h-11 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-emerald-500/50">
              <Image
                src="/icons/icon-512.png"
                alt="Krapao Jot"
                width={38}
                height={38}
                className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            {!isTransitioning && (
              <div className="absolute left-[64px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-left pointer-events-none transition-all duration-200 ease-out shadow-xl border border-slate-800 z-50 flex items-center gap-2">
                <span>Krapao Jot</span>
                <span className="text-[10px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-400">PWA</span>
              </div>
            )}
          </div>

          {/* Expand Sidebar Trigger Button */}
          <button
            onClick={toggleCollapse}
            className="w-9 h-9 rounded-xl bg-[var(--bg-canvas)] hover:bg-emerald-500/15 border border-[var(--border-subtle)] hover:border-emerald-500/30 text-[var(--fg-muted)] hover:text-emerald-500 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs active:scale-95 hover:scale-105"
            title="ขยายแถบเมนู (Ctrl+B)"
            aria-label="ขยายแถบเมนู"
          >
            <SidebarSimple size={18} weight="bold" className="rotate-180 transition-transform duration-200 hover:rotate-0" />
          </button>
        </div>
      ) : (
        /* Expanded Top: Clean Brand Header + Collapse Button */
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-subtle)] flex-shrink-0">
          <div
            className="flex items-center gap-3 min-w-0 group cursor-pointer"
            onClick={toggleCollapse}
            title="คลิกเพื่อย่อแถบเมนู (Ctrl+B)"
          >
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xs flex-shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-md group-hover:border-emerald-500/50">
              <Image
                src="/icons/icon-512.png"
                alt="Krapao Jot"
                width={38}
                height={38}
                className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-[var(--fg-primary)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors duration-200">
                  Krapao Jot
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  PWA
                </span>
              </div>
              <p className="text-[11px] text-[var(--fg-muted)] tracking-wide font-normal truncate">
                Personal Finance & Vault
              </p>
            </div>
          </div>

          {/* Collapse Switch */}
          <button
            onClick={toggleCollapse}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] hover:border-[var(--border-subtle)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-transparent"
            title="ย่อแถบเมนู (Ctrl+B)"
            aria-label="ย่อแถบเมนู"
          >
            <SidebarSimple size={18} weight="bold" className="transition-transform duration-200 hover:rotate-180" />
          </button>
        </div>
      )}

      {/* ================= MIDDLE NAVIGATION SECTIONS ================= */}
      <div className={`flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isCollapsed ? "w-full flex flex-col items-center" : "w-full"}`}>
        {isCollapsed ? (
          /* Collapsed View: Icon Rail with subtle dividers */
          <nav className="space-y-3 w-full flex flex-col items-center">
            {navSections.map((section, sIdx) => (
              <div key={section.title} className="flex flex-col items-center gap-1.5 w-full">
                {sIdx > 0 && (
                  <div className="w-6 h-[1px] bg-[var(--border-subtle)] my-1 opacity-60" />
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <div key={item.id} className="group relative flex items-center justify-center w-full">
                      <button
                        onClick={() => onSelectTab(item.id)}
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer relative active:scale-95 ${isActive
                          ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25 scale-105"
                          : "text-[var(--fg-muted)] hover:bg-emerald-500 hover:text-white hover:scale-105 hover:shadow-md hover:shadow-emerald-500/20"
                          }`}
                        aria-label={item.label}
                      >
                        <Icon
                          size={21}
                          weight={isActive ? "bold" : "regular"}
                          className="transition-transform duration-200 group-hover:scale-115 text-current"
                        />

                        {/* Dot indicator for alerts */}
                        {item.hasDot && !isActive && (
                          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-[var(--bg-surface)] animate-pulse" />
                        )}
                      </button>

                      {/* Tooltip on Hover */}
                      {!isTransitioning && (
                        <div className="absolute left-[64px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-left pointer-events-none transition-all duration-200 ease-out shadow-xl border border-slate-800 z-50">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </nav>
        ) : (
          /* Expanded View: Clean Spaced Sections */
          <nav className="space-y-4 w-full">
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Section Title */}
                <div className="px-3 pb-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </span>
                </div>

                {/* Section Items */}
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => onSelectTab(item.id)}
                        className={`group w-full h-10.5 px-3 rounded-xl flex items-center justify-between text-left transition-all duration-200 cursor-pointer relative overflow-hidden active:scale-[0.99] ${isActive
                          ? "bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:translate-x-1 hover:shadow-xs"
                          }`}
                        aria-label={item.label}
                      >
                        {/* Hover / Active Indicator Line on the left */}
                        <span
                          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full transition-all duration-200 ${isActive
                            ? "h-5 bg-emerald-500"
                            : "h-0 bg-emerald-500/50 group-hover:h-3.5"
                            }`}
                        />

                        <div className="flex items-center gap-2.5 min-w-0 pl-1">
                          {/* Icon Container with White Icon on Hover */}
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 flex-shrink-0 ${isActive
                              ? "bg-emerald-500 text-white shadow-xs"
                              : "bg-slate-100/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-xs"
                              }`}
                          >
                            <Icon
                              size={18}
                              weight={isActive ? "bold" : "regular"}
                              className="transition-colors duration-150 text-current"
                            />
                          </div>

                          <span className="text-[13px] tracking-tight truncate transition-colors duration-150 group-hover:font-medium">
                            {item.label}
                          </span>
                        </div>

                        {/* Subtle Badge */}
                        {item.badge && (
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all duration-200 group-hover:scale-105 flex-shrink-0 ${item.badgeColor}`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* ================= BOTTOM DOCKED USER PROFILE & THEME ================= */}
      <div className={`mt-auto border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] p-2.5 flex-shrink-0 ${isCollapsed ? "w-full flex flex-col items-center gap-2" : "w-full"}`}>
        {isCollapsed ? (
          /* Collapsed Bottom: Profile Avatar + Theme Switcher + Logout */
          <div className="flex flex-col items-center gap-2 w-full">
            {/* Collapsed Avatar with tooltip: Clicking opens Profile */}
            <div className="group relative flex items-center justify-center">
              <div
                onClick={() => onSelectTab("profile")}
                className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95"
                title="คลิกเพื่อจัดการโปรไฟล์และมาสคอต 3D"
              >
                <MascotAvatar
                  config={mascotConfig}
                  size="sm"
                  rounded="xl"
                  className="ring-1 ring-[var(--border-subtle)]"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
              </div>

              {!isTransitioning && (
                <div className="absolute left-[60px] top-1/2 -translate-y-1/2 px-3 py-2 rounded-xl bg-slate-900 text-white text-xs whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-left pointer-events-none transition-all duration-200 ease-out shadow-xl border border-slate-800 z-50">
                  <p className="font-semibold text-white">{displayName}</p>
                  <p className="text-[10px] text-emerald-400 font-medium mt-0.5">โปรไฟล์ & มาสคอต 3D</p>
                </div>
              )}
            </div>

            {mounted && (
              <div className="group relative flex items-center justify-center">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-transparent hover:border-[var(--border-subtle)]"
                  aria-label="เปลี่ยนโหมดมืดสว่าง"
                >
                  {theme === "dark" ? (
                    <Sun size={18} weight="fill" className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
                  ) : (
                    <Moon size={18} weight="fill" className="text-indigo-500 hover:-rotate-12 transition-transform duration-200" />
                  )}
                </button>
                {!isTransitioning && (
                  <div className="absolute left-[60px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-left pointer-events-none transition-all duration-200 ease-out shadow-xl border border-slate-800 z-50">
                    <span>{theme === "dark" ? "โหมดสว่าง" : "โหมดมืด"}</span>
                  </div>
                )}
              </div>
            )}

            <div className="group relative flex items-center justify-center">
              <button
                onClick={() => signOut()}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-rose-500 hover:bg-rose-500/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-transparent hover:border-rose-500/20"
                aria-label="ออกจากระบบ"
              >
                <SignOut size={18} weight="bold" />
              </button>
              {!isTransitioning && (
                <div className="absolute left-[60px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold whitespace-nowrap invisible group-hover:visible opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100 origin-left pointer-events-none transition-all duration-200 ease-out shadow-xl border border-slate-800 z-50">
                  <span>ออกจากระบบ</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Expanded Bottom: Docked Professional User Card + Quick Controls */
          <div className="p-2 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 hover:border-emerald-500/30 hover:shadow-xs transition-all duration-200">
            <div
              onClick={() => onSelectTab("profile")}
              className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
              title="คลิกเพื่อจัดการโปรไฟล์และมาสคอต 3D"
            >
              <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-105">
                <MascotAvatar
                  config={mascotConfig}
                  size="sm"
                  rounded="xl"
                  className="ring-1 ring-[var(--border-subtle)]"
                />
                <span
                  className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]"
                  title="สถานะ: เข้าสู่ระบบแล้ว"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-bold text-[var(--fg-primary)] truncate leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {displayName}
                </p>
                <p className="text-[10px] text-[var(--fg-muted)] truncate leading-tight mt-0.5" title={emailText}>
                  {emailText}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-7 h-7 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:border-emerald-500 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                  title={theme === "dark" ? "สลับโหมดสว่าง" : "สลับโหมดมืด"}
                  aria-label="เปลี่ยนโหมดสี"
                >
                  {theme === "dark" ? (
                    <Sun size={14} weight="fill" className="text-amber-400 hover:rotate-45 transition-transform duration-200" />
                  ) : (
                    <Moon size={14} weight="fill" className="text-indigo-500 hover:-rotate-12 transition-transform duration-200" />
                  )}
                </button>
              )}

              <button
                onClick={() => signOut()}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--fg-muted)] hover:text-rose-500 hover:border-rose-500/40 hover:bg-rose-500/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
                title="ออกจากระบบ"
                aria-label="ออกจากระบบ"
              >
                <SignOut size={14} weight="bold" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

