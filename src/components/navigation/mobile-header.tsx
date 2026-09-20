"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  List,
  X,
  Sun,
  Moon,
  SignOut,
  SquaresFour,
  Receipt,
  CreditCard,
  ArrowsClockwise,
  User,
  HandCoins,
  CaretRight,
  ShieldCheck,
  TrendUp,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { useFinance } from "@/lib/store";
import { MascotAvatar } from "@/components/profile/mascot-avatar";

interface MobileHeaderProps {
  onSelectTab?: (tab: string) => void;
  currentTab?: string;
}

export function MobileHeader({ onSelectTab, currentTab = "dashboard" }: MobileHeaderProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { user, profile, signOut, mascotConfig } = useAuth();
  const { creditCards, subscriptions, loans } = useFinance();

  const [mounted, setMounted] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Scroll detection: hide on scroll down, show on scroll up
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Has scrolled past top threshold
      setIsScrolled(currentScrollY > 10);

      // Determine visibility
      if (currentScrollY <= 10) {
        // At the very top: always visible
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current + 8) {
        // Scrolling down -> hide header
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current - 8) {
        // Scrolling up -> show header
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Compute live badges
  const pendingCardsCount = creditCards.filter(
    (c) => !c.isPaidThisMonth && c.currentBalance > 0
  ).length;
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
          badgeColor: "",
        },
        {
          id: "transactions",
          label: "รายรับ - รายจ่าย",
          icon: Receipt,
          badge: null,
          badgeColor: "",
        },
        {
          id: "investments",
          label: "พอร์ตการลงทุน",
          icon: TrendUp,
          badge: null,
          badgeColor: "",
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
          badge: pendingCardsCount > 0 ? `${pendingCardsCount} บิล` : null,
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        },
        {
          id: "subscriptions",
          label: "ค่า Subscription",
          icon: ArrowsClockwise,
          badge: activeSubsCount > 0 ? `${activeSubsCount}` : null,
          badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
        },
        {
          id: "loans",
          label: "เงินให้ยืม (ลูกหนี้)",
          icon: HandCoins,
          badge: pendingLoansCount > 0 ? `${pendingLoansCount} ราย` : null,
          badgeColor: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700",
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
          badgeColor: "",
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Top Floating Bar (Hide on scroll down, show on scroll up with backdrop blur) */}
      <header
        className={`md:hidden sticky top-0 z-40 transition-all duration-300 ease-in-out select-none ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        } ${
          isScrolled
            ? "bg-[var(--bg-canvas)]/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-[var(--border-subtle)] shadow-xs"
            : "bg-[var(--bg-canvas)]/60 dark:bg-zinc-950/60 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="flex items-center justify-between px-4 pt-[calc(env(safe-area-inset-top,0px)+0.5rem)] pb-2.5 max-w-lg mx-auto">
          {/* Left: Minimalist Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-center text-[var(--fg-primary)] hover:border-emerald-500/50 active:scale-95 transition-all cursor-pointer"
            aria-label="เปิดเมนูนำทาง"
          >
            <List size={20} weight="bold" />
          </button>

          {/* Right: Clean Profile Avatar Button */}
          <button
            type="button"
            onClick={() => onSelectTab?.("profile")}
            className="w-10 h-10 rounded-full p-0.5 bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-center overflow-hidden hover:border-emerald-500/50 active:scale-95 transition-all cursor-pointer"
            aria-label="ไปยังหน้าโปรไฟล์"
            title="โปรไฟล์ & มาสคอต 3D"
          >
            <MascotAvatar config={mascotConfig} size="sm" rounded="full" />
          </button>
        </div>
      </header>

      {/* Mobile Slide-Over Navigation Drawer with Smooth Two-Way Transitions */}
      <div
        className={`fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md md:hidden select-none transition-opacity duration-300 ease-in-out ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsDrawerOpen(false)}
        aria-hidden={!isDrawerOpen}
      >
        <div
          className={`fixed inset-y-0 left-0 w-[310px] max-w-[86vw] bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between p-4 pt-[calc(env(safe-area-inset-top,0px)+0.75rem)] pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isDrawerOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Content Top & Navigation */}
          <div className="flex flex-col min-h-0 flex-1">
              {/* Brand Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[var(--border-subtle)] flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl overflow-hidden border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-0.5 shadow-2xs flex items-center justify-center">
                    <Image
                      src="/icons/icon-512.png"
                      alt="Krapao Jot"
                      width={28}
                      height={28}
                      className="object-contain rounded-lg"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold tracking-tight text-[var(--fg-primary)]">
                        Krapao Jot
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        PWA
                      </span>
                    </div>
                    <p className="text-[10px] text-[var(--fg-muted)] tracking-wide">
                      Personal Finance & Vault
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] active:scale-95 transition-all cursor-pointer outline-none focus:outline-none"
                  aria-label="ปิดเมนู"
                >
                  <X size={18} weight="bold" />
                </button>
              </div>

              {/* User Profile Card */}
              <div
                onClick={() => {
                  onSelectTab?.("profile");
                  setIsDrawerOpen(false);
                }}
                className="mt-3 p-2.5 rounded-2xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all cursor-pointer group shadow-2xs flex items-center justify-between flex-shrink-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative flex-shrink-0">
                    <MascotAvatar config={mascotConfig} size="sm" rounded="full" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[var(--bg-surface)]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[var(--fg-primary)] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {profile?.full_name || "ผู้ใช้งาน"}
                    </p>
                    <p className="text-[10px] text-[var(--fg-muted)] truncate">
                      {user?.email || "เข้าสู่ระบบแล้ว"}
                    </p>
                  </div>
                </div>
                <CaretRight size={14} weight="bold" className="text-[var(--fg-muted)] group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
              </div>

              {/* Categorized Navigation Sections (Bank-Grade UI) */}
              <div className="flex-1 overflow-y-auto mt-3 pr-1 space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <div className="px-2.5 pb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        {section.title}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentTab === item.id;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              onSelectTab?.(item.id);
                              setIsDrawerOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer outline-none focus:outline-none ${
                              isActive
                                ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/25"
                                : "text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)]"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                size={18}
                                weight={isActive ? "bold" : "regular"}
                                className={isActive ? "text-white" : "text-current"}
                              />
                              <span className="truncate">{item.label}</span>
                            </div>

                            {item.badge && (
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border shrink-0 ${
                                  isActive
                                    ? "bg-white/20 text-white border-white/25"
                                    : item.badgeColor
                                }`}
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
              </div>
            </div>

            {/* Drawer Bottom Actions: Theme Toggle & Logout */}
            <div className="pt-3 border-t border-[var(--border-subtle)] space-y-2 flex-shrink-0">
              {mounted && (
                <button
                  type="button"
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    {resolvedTheme === "dark" ? (
                      <Sun size={16} weight="bold" className="text-amber-400" />
                    ) : (
                      <Moon size={16} weight="bold" className="text-slate-600" />
                    )}
                    <span>ธีม{resolvedTheme === "dark" ? "สว่าง" : "มืด"}</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[var(--fg-muted)] bg-[var(--bg-canvas)] px-2 py-0.5 rounded-md border border-[var(--border-subtle)]">
                    {resolvedTheme === "dark" ? "DARK" : "LIGHT"}
                  </span>
                </button>
              )}

              {user && (
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer outline-none focus:outline-none"
                >
                  <SignOut size={16} weight="bold" />
                  <span>ออกจากระบบ</span>
                </button>
              )}

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[9px] text-[var(--fg-muted)]">
                <ShieldCheck size={12} weight="bold" className="text-emerald-500" />
                <span>Krapao Jot FinTech Vault • Secure</span>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}
