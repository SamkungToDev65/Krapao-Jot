"use client";

import React, { useState, useEffect } from "react";
import { Edit2, X } from "lucide-react";
import { Loan } from "@/lib/types";
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";

interface EditLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
  onUpdateLoan: (id: string, partial: Partial<Loan>) => void;
}

export function EditLoanModal({
  isOpen,
  onClose,
  loan,
  onUpdateLoan,
}: EditLoanModalProps) {
  const [form, setForm] = useState({
    borrowerName: "",
    borrowerContact: "",
    originalAmount: "",
    lentDate: "",
    note: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (loan) {
      setForm({
        borrowerName: loan.borrowerName,
        borrowerContact: loan.borrowerContact || "",
        originalAmount: loan.originalAmount.toString(),
        lentDate: loan.lentDate,
        note: loan.note || "",
      });
      setErrors({});
    }
  }, [loan]);

  if (!isOpen || !loan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!form.borrowerName.trim()) {
      newErrors.borrowerName = "กรุณาระบุชื่อผู้ยืม";
    }

    const amt = parseFloat(form.originalAmount);
    if (isNaN(amt) || amt <= 0) {
      newErrors.originalAmount = "กรุณาระบุจำนวนเงินที่ถูกต้อง";
    }

    if (!form.lentDate) {
      newErrors.lentDate = "กรุณาระบุวันที่ให้ยืม";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdateLoan(loan.id, {
      borrowerName: form.borrowerName.trim(),
      borrowerContact: form.borrowerContact.trim() || undefined,
      originalAmount: amt,
      lentDate: form.lentDate,
      note: form.note.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-subtle)] text-[var(--fg-primary)] flex items-center justify-center">
              <Edit2 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--fg-primary)]">
                แก้ไขข้อมูลสัญญาเงินให้ยืม
              </h3>
              <p className="text-xs text-[var(--fg-muted)]">
                ปรับปรุงรายละเอียดผู้ยืม หรือยอดเงินต้น
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
                เบอร์โทร / LINE ID
              </label>
              <input
                type="text"
                value={form.borrowerContact}
                onChange={(e) => setForm({ ...form, borrowerContact: e.target.value })}
                className="w-full h-10 px-3.5 rounded-xl bg-[var(--bg-canvas)] text-sm text-[var(--fg-primary)] border border-[var(--border-subtle)] outline-none focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
          </div>

          {/* Lent Date (NO Due Date) */}
          <div>
            <ThaiDatePicker
              value={form.lentDate}
              onChange={(d) => setForm({ ...form, lentDate: d })}
              label="วันที่ให้ยืม *"
              error={errors.lentDate}
            />
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[var(--fg-primary)] mb-1">
              บันทึกช่วยจำ
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
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
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
