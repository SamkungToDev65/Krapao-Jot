"use client";

import React, { useState } from "react";
import { HandCoins, X } from "lucide-react";
import { Account, Loan } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";

interface AddLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddLoan: (
    data: Omit<Loan, "id" | "totalPaid" | "status" | "repayments" | "createdAt">,
    deductAccount: boolean
  ) => void;
}

export function AddLoanModal({
  isOpen,
  onClose,
  accounts,
  onAddLoan,
}: AddLoanModalProps) {
  const [form, setForm] = useState({
    borrowerName: "",
    borrowerContact: "",
    originalAmount: "",
    lentDate: new Date().toISOString().split("T")[0],
    fromAccountId: accounts[0]?.id || "",
    deductAccount: true,
    note: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!form.borrowerName.trim()) {
      newErrors.borrowerName = "กรุณาระบุชื่อผู้ยืม";
    }

    const amt = parseFloat(form.originalAmount);
    if (isNaN(amt) || amt <= 0) {
      newErrors.originalAmount = "กรุณาระบุจำนวนเงินที่มากกว่า 0";
    }

    if (!form.lentDate) {
      newErrors.lentDate = "กรุณาระบุวันที่ให้ยืม";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddLoan(
      {
        borrowerName: form.borrowerName.trim(),
        borrowerContact: form.borrowerContact.trim() || undefined,
        originalAmount: amt,
        lentDate: form.lentDate,
        fromAccountId: form.fromAccountId || undefined,
        note: form.note.trim() || undefined,
      },
      form.deductAccount
    );

    // Reset and close
    setForm({
      borrowerName: "",
      borrowerContact: "",
      originalAmount: "",
      lentDate: new Date().toISOString().split("T")[0],
      fromAccountId: accounts[0]?.id || "",
      deductAccount: true,
      note: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--fg-primary)] flex items-center justify-center">
              <HandCoins size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg-primary)]">
                สร้างรายการให้ยืมเงิน
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                ระบุผู้ยืม จำนวนเงินต้น และบัญชีที่ตัดเงิน
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

        {/* Form */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4 text-xs font-medium"
        >
          {/* Borrower Name */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              ชื่อผู้ยืม <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={form.borrowerName}
              onChange={(e) => {
                setForm({ ...form, borrowerName: e.target.value });
                if (errors.borrowerName) setErrors({ ...errors, borrowerName: "" });
              }}
              placeholder="เช่น สมชาย สุขใจ, กอล์ฟ ที่ทำงาน"
              className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                errors.borrowerName
                  ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                  : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
              }`}
            />
            {errors.borrowerName && (
              <p className="text-xs text-rose-500 mt-1">{errors.borrowerName}</p>
            )}
          </div>

          {/* Amount & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                ยอดเงินต้น (บาท) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="any"
                value={form.originalAmount}
                onChange={(e) => {
                  setForm({ ...form, originalAmount: e.target.value });
                  if (errors.originalAmount) setErrors({ ...errors, originalAmount: "" });
                }}
                placeholder="0.00"
                className={`w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm font-semibold text-[var(--fg-primary)] border outline-none focus:outline-none transition-all ${
                  errors.originalAmount
                    ? "border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
                    : "border-[var(--border-subtle)] focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                }`}
              />
              {errors.originalAmount && (
                <p className="text-xs text-rose-500 mt-1">{errors.originalAmount}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
                เบอร์โทร / ช่องทางติดต่อ
              </label>
              <input
                type="text"
                value={form.borrowerContact}
                onChange={(e) => setForm({ ...form, borrowerContact: e.target.value })}
                placeholder="081-xxx-xxxx"
                className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Lent Date */}
          <div>
            <ThaiDatePicker
              value={form.lentDate}
              onChange={(d) => setForm({ ...form, lentDate: d })}
              label="วันที่ให้ยืมเงิน *"
              error={errors.lentDate}
            />
          </div>

          {/* Source Account */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              ตัดเงินออกจากกระเป๋า/บัญชี
            </label>
            <select
              value={form.fromAccountId}
              onChange={(e) => setForm({ ...form, fromAccountId: e.target.value })}
              className="w-full h-10 px-3 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              <option value="">-- ไม่ตัดเงินในบัญชี (บันทึกเตือนความจำอย่างเดียว) --</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (คงเหลือ {formatCurrency(acc.balance)})
                </option>
              ))}
            </select>
          </div>

          {form.fromAccountId && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-canvas)] border border-[var(--border-subtle)]">
              <input
                type="checkbox"
                id="addDeductAccountCheck"
                checked={form.deductAccount}
                onChange={(e) => setForm({ ...form, deductAccount: e.target.checked })}
                className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer outline-none"
              />
              <label htmlFor="addDeductAccountCheck" className="text-xs text-[var(--fg-muted)] cursor-pointer">
                หักลดยอดเงินในบัญชีนี้ พร้อมลงบันทึกในหมวดหมู่รายจ่าย
              </label>
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              บันทึกช่วยจำ
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="เช่น สำรองจ่ายค่าอาหาร, ค่าซ่อมแซม..."
              className="w-full p-2.5 rounded-xl bg-[var(--bg-canvas)] text-xs text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
              บันทึกรายการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
