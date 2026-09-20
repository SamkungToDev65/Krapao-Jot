"use client";

import React, { useState } from "react";
import { ArrowDownLeft, X } from "lucide-react";
import { Account, Loan } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";

interface RepayLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  accounts: Account[];
  onRecordRepayment: (
    loanId: string,
    repayment: {
      amount: number;
      date: string;
      toAccountId?: string;
      note?: string;
    },
    depositToAccount: boolean
  ) => void;
}

export function RepayLoanModal({
  isOpen,
  onClose,
  loan,
  accounts,
  onRecordRepayment,
}: RepayLoanModalProps) {
  const remaining = loan ? Math.max(0, loan.originalAmount - loan.totalPaid) : 0;

  const [form, setForm] = useState({
    amount: "",
    date: new Date().toISOString().split("T")[0],
    toAccountId: accounts[0]?.id || "",
    depositAccount: true,
    note: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen || !loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      newErrors.amount = "กรุณาระบุจำนวนเงินที่มากกว่า 0";
    } else if (amt > remaining) {
      newErrors.amount = `ยอดเงินคืนเกินยอดหนี้คงเหลือ (${formatCurrency(remaining)})`;
    }

    if (!form.date) {
      newErrors.date = "กรุณาระบุวันที่ได้รับเงินคืน";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onRecordRepayment(
      loan.id,
      {
        amount: amt,
        date: form.date,
        toAccountId: form.toAccountId || undefined,
        note: form.note.trim() || undefined,
      },
      form.depositAccount && !!form.toAccountId
    );

    // Reset and close
    setForm({
      amount: "",
      date: new Date().toISOString().split("T")[0],
      toAccountId: accounts[0]?.id || "",
      depositAccount: true,
      note: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <ArrowDownLeft size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg-primary)]">
                บันทึกการรับเงินคืน
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                ผู้ยืม: <span className="font-semibold text-[var(--fg-primary)]">{loan.borrowerName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-[var(--fg-muted)] hover:text-[var(--fg-primary)] hover:bg-[var(--bg-canvas)] flex items-center justify-center transition-all cursor-pointer outline-none focus:outline-none"
            aria-label="ปิดหน้าต่าง"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="p-5 space-y-4 text-xs font-medium"
        >
          {/* Balance info box */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)] flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-[var(--fg-muted)]">
                ยอดหนี้คงเหลือ
              </span>
              <div className="text-lg font-bold text-[var(--fg-primary)]">
                {formatCurrency(remaining)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-[var(--fg-muted)]">
                คืนสะสมแล้ว
              </span>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(loan.totalPaid)} / {formatCurrency(loan.originalAmount)}
              </div>
            </div>
          </div>

          {/* Repayment Amount */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              ยอดเงินที่คืนในงวดนี้ (บาท) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              step="any"
              value={form.amount}
              onChange={(e) => {
                setForm({ ...form, amount: e.target.value });
                if (errors.amount) setErrors({ ...errors, amount: "" });
              }}
              placeholder="0.00"
              className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-base font-bold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                errors.amount
                  ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
            {errors.amount && (
              <p className="text-xs text-rose-500 mt-1">{errors.amount}</p>
            )}

            {/* Quick Fill Pills */}
            <div className="mt-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, amount: remaining.toString() })}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:border-emerald-500 transition-all cursor-pointer outline-none focus:outline-none"
              >
                คืนเต็มจำนวนที่เหลือ
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, amount: (remaining / 2).toString() })}
                className="px-2.5 py-1 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--fg-muted)] hover:text-[var(--fg-primary)] transition-all cursor-pointer outline-none focus:outline-none"
              >
                50%
              </button>
            </div>
          </div>

          {/* Repayment Date */}
          <div>
            <ThaiDatePicker
              value={form.date}
              onChange={(d) => setForm({ ...form, date: d })}
              label="วันที่ได้รับเงินคืน *"
              error={errors.date}
            />
          </div>

          {/* Account to Deposit */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              รับเงินเข้ากระเป๋า/บัญชี
            </label>
            <select
              value={form.toAccountId}
              onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              <option value="">-- ไม่บันทึกเข้าบัญชี (ตัดลดยอดหนี้อย่างเดียว) --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (คงเหลือ {formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {form.toAccountId && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <input
                type="checkbox"
                id="repayDepositAccountCheck"
                checked={form.depositAccount}
                onChange={(e) => setForm({ ...form, depositAccount: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer outline-none"
              />
              <label htmlFor="repayDepositAccountCheck" className="text-xs text-[var(--fg-muted)] cursor-pointer">
                เพิ่มยอดเงินเข้าบัญชีนี้ พร้อมลงบันทึกในหมวดหมู่รายรับ
              </label>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              บันทึกช่วยจำ
            </label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="เช่น โอนผ่านพร้อมเพย์, คืนเงินสด..."
              className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-medium text-[var(--fg-muted)] hover:bg-[var(--bg-canvas)] transition-all cursor-pointer outline-none focus:outline-none"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer outline-none focus:outline-none"
            >
              บันทึกการรับเงินคืน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
