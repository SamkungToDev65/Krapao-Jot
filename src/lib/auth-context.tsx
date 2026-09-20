"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";
import { MascotConfig, DEFAULT_MALE_MASCOT } from "./mascot-types";

export interface UserProfile {
  id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  currency: string;
  theme: string;
  mascot_config?: MascotConfig | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  mascotConfig: MascotConfig;
  isLoading: boolean;
  signInWithPassword: (identifier: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, username: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateMascotConfig: (config: MascotConfig) => Promise<void>;
  updateProfileName: (fullName: string, username?: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthErrorToThai(errorMsg: string): string {
  const lower = errorMsg.toLowerCase();
  if (lower.includes("invalid login credentials") || lower.includes("invalid credentials")) {
    return "อีเมล ชื่อผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "อีเมลนี้ถูกลงทะเบียนไว้แล้วในระบบ";
  }
  if (lower.includes("password should be at least")) {
    return "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
  }
  if (lower.includes("email not confirmed")) {
    return "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ";
  }
  if (lower.includes("rate limit")) {
    return "มีการส่งคำขอถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง";
  }
  return errorMsg;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [mascotConfig, setMascotConfig] = useState<MascotConfig>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("krapao_mascot_config");
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to read mascot config from localStorage:", e);
      }
    }
    return DEFAULT_MALE_MASCOT;
  });
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  // Listen to cross-tab mascot config updates
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "krapao_mascot_config" && e.newValue) {
        try {
          setMascotConfig(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const updateMascotConfig = async (newConfig: MascotConfig) => {
    setMascotConfig(newConfig);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("krapao_mascot_config", JSON.stringify(newConfig));
      } catch (e) {
        console.error("Failed to save mascot config to localStorage:", e);
      }
    }

    if (supabase && user) {
      try {
        await supabase.auth.updateUser({
          data: { mascot_config: newConfig },
        });
      } catch (err) {
        console.error("Failed to sync mascot config to Supabase user metadata:", err);
      }
    }
  };

  const updateProfileName = async (fullName: string, username?: string): Promise<{ error: string | null }> => {
    const trimmedName = fullName.trim();
    const trimmedUsername = username?.trim().toLowerCase();

    // Local state optimistic update
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            full_name: trimmedName,
            ...(trimmedUsername ? { username: trimmedUsername } : {}),
          }
        : null
    );

    if (!supabase || !user) {
      return { error: null };
    }

    try {
      // 1. Update profiles table if possible
      const { error: profileErr } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          ...(trimmedUsername ? { username: trimmedUsername } : {}),
        })
        .eq("id", user.id);

      // 2. Also update auth user metadata
      await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          ...(trimmedUsername ? { username: trimmedUsername } : {}),
        },
      });

      if (profileErr) {
        console.warn("Profiles table update returned error, but auth metadata updated:", profileErr);
      }

      await fetchProfile(user.id);
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลโปรไฟล์" };
    }
  };

  const fetchProfile = async (userId: string, authUser?: User | null) => {
    if (!supabase) return;
    try {
      // Also check user_metadata for mascot
      const u = authUser || user;
      if (u?.user_metadata?.mascot_config) {
        setMascotConfig((prev) => {
          if (typeof window !== "undefined" && !localStorage.getItem("krapao_mascot_config")) {
            localStorage.setItem("krapao_mascot_config", JSON.stringify(u.user_metadata.mascot_config));
            return u.user_metadata.mascot_config;
          }
          return prev;
        });
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, email, full_name, currency, theme")
        .eq("id", userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data as UserProfile);
      } else {
        setProfile({
          id: userId,
          username: u?.user_metadata?.username || u?.email?.split("@")[0] || "User",
          email: u?.email || null,
          full_name: u?.user_metadata?.full_name || u?.email?.split("@")[0] || "User",
          currency: "THB",
          theme: "system",
        });
      }
    } catch {
      const u = authUser || user;
      setProfile({
        id: userId,
        username: u?.user_metadata?.username || u?.email?.split("@")[0] || "User",
        email: u?.email || null,
        full_name: u?.user_metadata?.full_name || u?.email?.split("@")[0] || "User",
        currency: "THB",
        theme: "system",
      });
    }
  };

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function initAuth() {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await fetchProfile(session.user.id, session.user);
          } else {
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err) {
        console.error("Failed to get initial session:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id, session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithPassword = async (identifier: string, password: string) => {
    if (!supabase) {
      return { error: "Supabase client not configured" };
    }

    const cleanId = identifier.trim();
    let emailToUse = cleanId;

    // If identifier doesn't have '@', resolve from username to email
    if (!cleanId.includes("@")) {
      try {
        // Try RPC
        const { data: rpcEmail, error: rpcError } = await supabase.rpc("get_email_by_username", {
          p_username: cleanId,
        });

        if (!rpcError && rpcEmail) {
          emailToUse = rpcEmail as string;
        } else {
          // Direct query fallback
          const { data: profileRow } = await supabase
            .from("profiles")
            .select("email")
            .ilike("username", cleanId)
            .maybeSingle();

          if (profileRow?.email) {
            emailToUse = profileRow.email;
          } else {
            return { error: "ไม่พบชื่อผู้ใช้งาน (Username) นี้ในระบบ" };
          }
        }
      } catch (err) {
        return { error: "ไม่พบชื่อผู้ใช้งานนี้ในระบบ" };
      }
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });

      if (error) {
        return { error: mapAuthErrorToThai(error.message) };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err.message || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" };
    }
  };

  const signUp = async (email: string, password: string, fullName: string, username: string) => {
    if (!supabase) {
      return { error: "Supabase client not configured", needsConfirmation: false };
    }

    const cleanUsername = username.trim().toLowerCase();

    // Check if username is already taken
    if (cleanUsername) {
      try {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .ilike("username", cleanUsername)
          .maybeSingle();

        if (existing) {
          return {
            error: "ชื่อผู้ใช้งาน (Username) นี้ถูกใช้งานแล้ว กรุณาเลือกชื่ออื่น",
            needsConfirmation: false,
          };
        }
      } catch {
        // continue
      }
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            username: cleanUsername,
          },
        },
      });

      if (error) {
        return { error: mapAuthErrorToThai(error.message), needsConfirmation: false };
      }

      const needsConfirmation = !!(data.user && !data.session);

      if (data.user && data.session) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }

      return { error: null, needsConfirmation };
    } catch (err: any) {
      return { error: err.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก", needsConfirmation: false };
    }
  };

  const signOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        mascotConfig,
        isLoading,
        signInWithPassword,
        signUp,
        signOut,
        refreshProfile,
        updateMascotConfig,
        updateProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
