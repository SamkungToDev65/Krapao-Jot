"use client";

import React from "react";
import {
  SquaresFour,
  Receipt,
  CreditCard,
  ArrowsClockwise,
  HandCoins,
  User,
} from "@phosphor-icons/react";

interface BottomNavProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenQuickAdd?: () => void;
}

export function BottomNav({ currentTab, onSelectTab }: BottomNavProps) {
  const tabs = [
    { id: "dashboard", label: "ภาพรวม", icon: SquaresFour },
    { id: "transactions", label: "รายการ", icon: Receipt },
    { id: "cards", label: "บัตร", icon: CreditCard },
    { id: "subscriptions", label: "ซับ", icon: ArrowsClockwise },
    { id: "loans", label: "เงินให้ยืม", icon: HandCoins },
    { id: "profile", label: "โปรไฟล์", icon: User },
  ];

  return (
    <nav
      aria-label="เมนูนำทางหลักด้านล่าง"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pointer-events-none select-none"
    >
      {/* Floating Island Container */}
      <div className="pointer-events-auto max-w-md mx-auto h-[62px] rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-xl border border-zinc-200/80 dark:border-zinc-800/90 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.35)] px-1.5 flex items-center justify-between transition-all">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center h-11 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
                isActive
                  ? "text-emerald-600 dark:text-emerald-400 font-bold"
                  : "text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300 font-medium"
              }`}
            >
              <Icon
                size={21}
                weight={isActive ? "fill" : "regular"}
                className={`transition-transform duration-200 ${
                  isActive ? "scale-105" : ""
                }`}
              />
              <span className="text-[10px] tracking-tight mt-0.5 leading-none truncate max-w-[56px]">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}