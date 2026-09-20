"use client";

import React from "react";
import { History, Trash2, X } from "lucide-react";
import { Account, Loan } from "@/lib/types";
import { formatCurrency, formatShortDate } from "@/lib/utils";

interface LoanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  accounts: Account[];
  onDeleteRepayment: (loanId: string, repaymentId: string) => void;
}

export function LoanHistoryModal({
  isOpen,
  onClose,
  loan,
  accounts,
  onDeleteRepayment,
}: LoanHistoryModalProps) {
  if (!isOpen || !loan) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--fg-primary)] flex items-center justify-center">
              <History size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg-primary)]">
                ประวัติการคืนเงิน
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                {loan.borrowerName} • เงินต้น {formatCurrency(loan.originalAmount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer outline-none focus:outline-none"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Progress Overview */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-xs font-medium mb-1.5">
              <span className="text-[var(--fg-muted)]">ความคืบหน้าการรับคืน</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(loan.totalPaid)} / {formatCurrency(loan.originalAmount)}
              </span>
            </div>
            <div className="w-full bg-[var(--bg-surface)] rounded-full h-1.5 overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (loan.totalPaid / loan.originalAmount) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Repayment List */}
          <div>
            <h4 className="text-xs font-semibold text-[var(--fg-muted)] uppercase tracking-wider mb-2">
              งวดที่ชำระคืน ({loan.repayments?.length || 0})
            </h4>

            {!loan.repayments || loan.repayments.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--fg-muted)]">
                ยังไม่มีรายการคืนเงินสำหรับลูกหนี้รายนี้
              </div>
            ) : (
              <div className="space-y-2">
                {loan.repayments.map((rep, idx) => {
                  const toAcc = accounts.find((a) => a.id === rep.toAccountId);
                  return (
                    <div
                      key={rep.id || idx}
                      className="p-3 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            +{formatCurrency(rep.amount)}
                          </span>
                          <span className="text-[11px] text-[var(--fg-muted)]">
                            • {formatShortDate(rep.date)}
                          </span>
                        </div>
                        <div className="text-[11px] text-[var(--fg-muted)] truncate mt-0.5">
                          {toAcc ? `เข้าบัญชี: ${toAcc.name}` : "ไม่ผ่านบัญชี"}
                          {rep.note ? ` • ${rep.note}` : ""}
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteRepayment(loan.id, rep.id)}
                        className="p-1 rounded-lg text-[var(--fg-muted)] hover:text-rose-500 transition-all cursor-pointer flex-shrink-0"
                        title="ลบงวดนี้"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-xs font-medium text-[var(--fg-primary)] hover:border-slate-400 transition-all cursor-pointer outline-none focus:outline-none"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
