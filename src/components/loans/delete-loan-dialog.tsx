"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { Loan } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

interface DeleteLoanDialogProps {
  loan: Loan | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteLoanDialog({
  loan,
  onClose,
  onConfirm,
}: DeleteLoanDialogProps) {
  if (!loan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-5 text-center animate-in zoom-in-95 duration-150">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle size={20} />
        </div>
        <h3 className="text-sm font-bold text-[var(--fg-primary)]">
          ยืนยันการลบรายการให้ยืมเงิน?
        </h3>
        <p className="text-xs text-[var(--fg-muted)] mt-1.5 leading-relaxed">
          คุณต้องการลบข้อมูลลูกหนี้{" "}
          <span className="font-semibold text-[var(--fg-primary)]">
            "{loan.borrowerName}"
          </span>{" "}
          (ยอดเงิน {formatCurrency(loan.originalAmount)}) ใช่หรือไม่?
        </p>

        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer outline-none focus:outline-none"
          >
            ยืนยันลบ
          </button>
        </div>
      </div>
    </div>
  );
}
