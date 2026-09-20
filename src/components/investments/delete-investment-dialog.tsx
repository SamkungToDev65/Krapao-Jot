"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { InvestmentHolding } from "@/lib/types";

interface DeleteInvestmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  holding: InvestmentHolding | null;
  onConfirmDelete: (id: string) => void;
}

export function DeleteInvestmentDialog({
  isOpen,
  onClose,
  holding,
  onConfirmDelete,
}: DeleteInvestmentDialogProps) {
  if (!isOpen || !holding) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-md rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <Trash2 size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-extrabold text-[var(--fg-primary)] tracking-tight">
              ยืนยันการลบ {holding.symbol}
            </h3>
            <p className="text-xs text-[var(--fg-muted)] mt-1 leading-relaxed">
              คุณต้องการนำรายการสินทรัพย์ <strong className="text-[var(--fg-primary)]">{holding.name}</strong> ({holding.platformName || holding.platform}) ออกจากพอร์ตการลงทุนใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(holding.id);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer outline-none focus:outline-none"
          >
            ยืนยันลบสินทรัพย์
          </button>
        </div>
      </div>
    </div>
  );
}
