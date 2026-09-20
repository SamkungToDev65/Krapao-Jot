"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
  KeyRound,
  X,
  AtSign
} from "lucide-react";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth-context";
import { createClient } from "@/lib/supabase/client";

// Clean High-fidelity Official Google SVG Icon
function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

interface FieldErrors {
  identifier?: string;
  fullName?: string;
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  resetEmail?: string;
}

export function AuthScreen() {
  const { theme, setTheme } = useTheme();
  const { signInWithPassword, signUp } = useAuth();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "register">("login");

  // Form fields
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // UI & Validation states
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Forgot Password Modal
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetStatus, setResetStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const clearFieldError = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Professional Password Strength Calculation (Zero Emojis)
  const passwordStrength = useMemo(() => {
    if (!password) return null;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 9) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[A-Z]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, text: "ความปลอดภัยต่ำ", color: "bg-rose-500", textColor: "text-rose-500" };
      case 2:
        return { score: 2, text: "ความปลอดภัยปานกลาง", color: "bg-amber-500", textColor: "text-amber-500" };
      case 3:
        return { score: 3, text: "ความปลอดภัยสูง", color: "bg-emerald-500", textColor: "text-emerald-500" };
      case 4:
        return { score: 4, text: "ความปลอดภัยระดับองค์กร", color: "bg-emerald-600", textColor: "text-emerald-600" };
      default:
        return { score: 1, text: "อย่างน้อย 6 ตัวอักษร", color: "bg-rose-500", textColor: "text-rose-500" };
    }
  }, [password]);

  const handleSwitchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setErrorMessage(null);
    setSuccessMessage(null);
    setFieldErrors({});
  };

  // Google / Gmail OAuth Login
  const handleGoogleSignIn = async () => {
    if (!supabase) return;
    setErrorMessage(null);
    setIsGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMessage(err.message || "ไม่สามารถเชื่อมต่อกับ Google ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง");
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const newErrors: FieldErrors = {};

    if (mode === "login") {
      const cleanId = identifier.trim();
      if (!cleanId) {
        newErrors.identifier = "กรุณาระบุชื่อผู้ใช้งาน หรือ อีเมล";
      }
      if (!password) {
        newErrors.password = "กรุณาระบุรหัสผ่าน";
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
      }

      setFieldErrors({});
      setIsLoading(true);
      const res = await signInWithPassword(cleanId, password);
      setIsLoading(false);

      if (res.error) {
        setErrorMessage(res.error);
      }
    } else {
      const cleanFullName = fullName.trim();
      const cleanUsername = username.trim().toLowerCase();
      const cleanEmail = email.trim();

      if (!cleanFullName) {
        newErrors.fullName = "กรุณาระบุชื่อ-นามสกุลของคุณ";
      }

      if (!cleanUsername) {
        newErrors.username = "กรุณาระบุชื่อผู้ใช้งาน (Username)";
      } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
        newErrors.username = "ต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข หรือขีดล่าง 3-20 ตัวอักษร";
      }

      if (!cleanEmail) {
        newErrors.email = "กรุณาระบุอีเมล";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        newErrors.email = "รูปแบบอีเมลไม่ถูกต้อง";
      }

      if (!password) {
        newErrors.password = "กรุณาระบุรหัสผ่าน";
      } else if (password.length < 6) {
        newErrors.password = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      }

      if (!confirmPassword) {
        newErrors.confirmPassword = "กรุณายืนยันรหัสผ่านอีกครั้ง";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน";
      }

      if (Object.keys(newErrors).length > 0) {
        setFieldErrors(newErrors);
        return;
      }

      setFieldErrors({});
      setIsLoading(true);
      const res = await signUp(cleanEmail, password, cleanFullName, cleanUsername);
      setIsLoading(false);

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        // Populate login form identifier with registered email, keep password filled
        setIdentifier(cleanEmail);
        // Clear registration form fields
        setFullName("");
        setUsername("");
        setEmail("");
        setConfirmPassword("");
        // Switch mode to login tab
        setMode("login");

        if (res.needsConfirmation) {
          setSuccessMessage("ลงทะเบียนสำเร็จเรียบร้อยแล้ว กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชี หรือกดเข้าสู่ระบบ");
        } else {
          setSuccessMessage("ลงทะเบียนสำเร็จเรียบร้อยแล้ว ข้อมูลเข้าสู่ระบบพร้อมใช้งาน สามารถกดเข้าสู่ระบบได้ทันที");
        }
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus(null);
    clearFieldError("resetEmail");

    const cleanResetEmail = resetEmail.trim();
    if (!cleanResetEmail) {
      setFieldErrors((prev) => ({ ...prev, resetEmail: "กรุณาระบุอีเมลที่ลงทะเบียนไว้" }));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanResetEmail)) {
      setFieldErrors((prev) => ({ ...prev, resetEmail: "รูปแบบอีเมลไม่ถูกต้อง" }));
      return;
    }

    if (!supabase) return;
    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanResetEmail, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });

      if (error) {
        setResetStatus({ type: "error", message: error.message });
      } else {
        setResetStatus({
          type: "success",
          message: "ระบบส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณเรียบร้อยแล้ว",
        });
      }
    } catch (err: any) {
      setResetStatus({ type: "error", message: err.message || "เกิดข้อผิดพลาดในการส่งคำขอ" });
    } finally {
      setResetLoading(false);
    }
  };

  const getInputClass = (hasError?: boolean, extraPaddingRight = "pr-3.5") =>
    `w-full pl-10 ${extraPaddingRight} h-11 text-sm rounded-xl transition-all placeholder:text-slate-400 outline-none focus:outline-none ${
      hasError
        ? "bg-rose-50/50 dark:bg-rose-950/30 border border-rose-500 text-rose-950 dark:text-rose-100 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
        : "bg-slate-50/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
    }`;

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center px-4 py-12 relative transition-colors duration-200">

      {/* Subtle Precision Background Grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 dark:opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          color: "rgba(148, 163, 184, 0.25)",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-emerald-500/10 dark:bg-emerald-500/5 blur-[120px] pointer-events-none rounded-full" />

      {/* Top Header Controls: Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        {mounted && (
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer shadow-xs"
            title={theme === "dark" ? "สลับเป็นโหมดสว่าง" : "สลับเป็นโหมดมืด"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        )}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-[440px] relative z-10">

        {/* Brand Header - STRICTLY Krapao Jot */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 mb-3 flex items-center justify-center p-1">
            <Image
              src="/icons/icon-512.png"
              alt="Krapao Jot"
              width={64}
              height={64}
              className="w-full h-full object-contain rounded-xl"
              priority
            />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
            Krapao Jot
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            ระบบบันทึกและจัดการการเงินส่วนบุคคล
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-900/5 dark:shadow-black/30 p-6 sm:p-8">

          {/* Underline Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
            <button
              type="button"
              onClick={() => handleSwitchMode("login")}
              className={`flex-1 pb-3 text-sm font-medium transition-all relative cursor-pointer ${
                mode === "login"
                  ? "text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              เข้าสู่ระบบ
              {mode === "login" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode("register")}
              className={`flex-1 pb-3 text-sm font-medium transition-all relative cursor-pointer ${
                mode === "register"
                  ? "text-slate-900 dark:text-slate-100 font-semibold"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              }`}
            >
              ลงทะเบียนใหม่
              {mode === "register" && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Social Auth (Google / Gmail) */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isLoading}
              className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              ) : (
                <GoogleIcon className="w-4 h-4" />
              )}
              <span>{mode === "login" ? "เข้าสู่ระบบด้วย Google" : "ลงทะเบียนด้วย Google"}</span>
            </button>

            {/* Clean Horizontal Divider */}
            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              <span className="flex-shrink mx-3 text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                หรือใช้อีเมล / ชื่อผู้ใช้
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            </div>
          </div>

          {/* Top Banner Errors / Success */}
          {errorMessage && (
            <div className="mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-snug font-medium">{successMessage}</span>
            </div>
          )}

          {/* Form with noValidate to block native browser tooltips */}
          <form noValidate onSubmit={handleSubmit} className="mt-4 space-y-3.5">

            {/* Login Mode: Username or Email Field */}
            {mode === "login" ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  ชื่อผู้ใช้งาน หรือ อีเมล
                </label>
                <div className="relative">
                  <UserIcon className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.identifier ? "text-rose-500" : "text-slate-400"}`} />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => {
                      setIdentifier(e.target.value);
                      clearFieldError("identifier");
                    }}
                    placeholder="username หรือ name@example.com"
                    className={getInputClass(!!fieldErrors.identifier)}
                  />
                </div>
                {fieldErrors.identifier && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.identifier}
                  </p>
                )}
              </div>
            ) : (
              /* Register Mode: Full Name, Username, Email */
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    ชื่อ-นามสกุล
                  </label>
                  <div className="relative">
                    <UserIcon className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.fullName ? "text-rose-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        clearFieldError("fullName");
                      }}
                      placeholder="สมชาย ใจดี"
                      className={getInputClass(!!fieldErrors.fullName)}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                      {fieldErrors.fullName}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                      ชื่อผู้ใช้งาน (Username)
                    </label>
                    <span className="text-[11px] text-slate-400">ภาษาอังกฤษ 3-20 ตัวอักษร</span>
                  </div>
                  <div className="relative">
                    <AtSign className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.username ? "text-rose-500" : "text-slate-400"}`} />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                        clearFieldError("username");
                      }}
                      placeholder="เช่น somchai99"
                      className={getInputClass(!!fieldErrors.username)}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                      {fieldErrors.username}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    อีเมล
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.email ? "text-rose-500" : "text-slate-400"}`} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearFieldError("email");
                      }}
                      placeholder="name@example.com"
                      className={getInputClass(!!fieldErrors.email)}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                  รหัสผ่าน
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(identifier.includes("@") ? identifier : "");
                      setIsForgotPasswordOpen(true);
                      clearFieldError("resetEmail");
                    }}
                    className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 cursor-pointer"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.password ? "text-rose-500" : "text-slate-400"}`} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError("password");
                  }}
                  placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                  className={getInputClass(!!fieldErrors.password, "pr-10")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                  {fieldErrors.password}
                </p>
              )}

              {/* Password strength (Register only) */}
              {mode === "register" && passwordStrength && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">ระดับความปลอดภัย</span>
                    <span className={`font-semibold ${passwordStrength.textColor}`}>{passwordStrength.text}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full transition-colors ${
                          step <= passwordStrength.score ? passwordStrength.color : "bg-slate-200 dark:bg-slate-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password (Register only) */}
            {mode === "register" && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  ยืนยันรหัสผ่าน
                </label>
                <div className="relative">
                  <KeyRound className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.confirmPassword ? "text-rose-500" : "text-slate-400"}`} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError("confirmPassword");
                    }}
                    placeholder="ระบุรหัสผ่านอีกครั้ง"
                    className={getInputClass(!!fieldErrors.confirmPassword, "pr-10")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* Remember Me (Login only) */}
            {mode === "login" && (
              <div className="flex items-center pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 dark:text-slate-400">จดจำการเข้าสู่ระบบไว้</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full mt-3 h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm hover:shadow-md hover:shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังประมวลผล...</span>
                </>
              ) : mode === "login" ? (
                <>
                  <span>เข้าสู่ระบบ Krapao Jot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>สร้างบัญชีผู้ใช้ Krapao Jot</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Security Trust Badges */}
        <div className="mt-6 flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            256-Bit SSL Protection
          </span>
          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <span>PostgreSQL RLS Secured</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  รีเซ็ตรหัสผ่าน
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมล
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPasswordOpen(false);
                  setResetStatus(null);
                  clearFieldError("resetEmail");
                }}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none focus:outline-none"
                aria-label="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 ${
                  resetStatus.type === "success"
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                }`}
              >
                {resetStatus.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form noValidate onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  อีเมลที่ลงทะเบียน
                </label>
                <div className="relative">
                  <Mail className={`w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none ${fieldErrors.resetEmail ? "text-rose-500" : "text-slate-400"}`} />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => {
                      setResetEmail(e.target.value);
                      clearFieldError("resetEmail");
                    }}
                    placeholder="name@example.com"
                    className={getInputClass(!!fieldErrors.resetEmail)}
                  />
                </div>
                {fieldErrors.resetEmail && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium animate-in fade-in slide-in-from-top-1">
                    {fieldErrors.resetEmail}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetStatus(null);
                    clearFieldError("resetEmail");
                  }}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer outline-none focus:outline-none"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 outline-none focus:outline-none"
                >
                  {resetLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>ส่งคำขอ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}