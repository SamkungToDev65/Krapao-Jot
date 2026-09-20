import React from "react";
import { InvestmentAssetType, InvestmentPlatform } from "@/lib/types";

export interface PlatformPreset {
  id: InvestmentPlatform;
  name: string;
  subtitle: string;
  brandColor: string;
  supportedAssets: InvestmentAssetType[];
  defaultCurrency: "THB" | "USD";
}

export const INVESTMENT_PLATFORMS: PlatformPreset[] = [
  {
    id: "dime",
    name: "Dime!",
    subtitle: "KKP Dime หุ้นสหรัฐฯ & ออมทอง",
    brandColor: "#059669", // Dime emerald/mint
    supportedAssets: ["us_stock", "thai_stock", "fund", "gold"],
    defaultCurrency: "USD",
  },
  {
    id: "binance",
    name: "Binance",
    subtitle: "Crypto Exchange อันดับ 1 ของโลก",
    brandColor: "#F59E0B", // Binance Gold/Amber
    supportedAssets: ["crypto"],
    defaultCurrency: "USD",
  },
  {
    id: "bitkub",
    name: "Bitkub",
    subtitle: "ศูนย์ซื้อขายสินทรัพย์ดิจิทัลไทย",
    brandColor: "#10B981", // Bitkub green
    supportedAssets: ["crypto"],
    defaultCurrency: "THB",
  },
  {
    id: "innovestx",
    name: "InnovestX",
    subtitle: "SCBX หุ้นไทย หุ้นนอก & กองทุน",
    brandColor: "#6366F1", // SCB purple/indigo
    supportedAssets: ["us_stock", "thai_stock", "fund", "crypto"],
    defaultCurrency: "THB",
  },
  {
    id: "streaming",
    name: "Streaming (SET)",
    subtitle: "พอร์ตหุ้นไทย & TFEX",
    brandColor: "#0284C7", // SET blue
    supportedAssets: ["thai_stock", "fund"],
    defaultCurrency: "THB",
  },
  {
    id: "webull",
    name: "Webull",
    subtitle: "แพลตฟอร์มเทรดหุ้นสหรัฐฯ",
    brandColor: "#EF4444", // Webull red
    supportedAssets: ["us_stock"],
    defaultCurrency: "USD",
  },
  {
    id: "ibkr",
    name: "Interactive Brokers",
    subtitle: "IBKR Global Markets",
    brandColor: "#DC2626",
    supportedAssets: ["us_stock", "fund"],
    defaultCurrency: "USD",
  },
  {
    id: "huasengheng",
    name: "ฮั่วเซ่งเฮง (HSH)",
    subtitle: "ออมทองคำแท่ง 96.5% / 99.99%",
    brandColor: "#D97706",
    supportedAssets: ["gold"],
    defaultCurrency: "THB",
  },
  {
    id: "mtsgold",
    name: "MTS Gold",
    subtitle: "แม่ทองสุก ออมทองคำแท่ง & โกลด์สปอต",
    brandColor: "#D97706",
    supportedAssets: ["gold"],
    defaultCurrency: "THB",
  },
  {
    id: "exness",
    name: "Exness",
    subtitle: "โบรกเกอร์ระดับโลก คริปโต & CFD",
    brandColor: "#FFDE00",
    supportedAssets: ["crypto", "gold", "us_stock"],
    defaultCurrency: "USD",
  },
  {
    id: "xm",
    name: "XM",
    subtitle: "XM Global หุ้นนอก, ทองคำ & CFD",
    brandColor: "#BA0C2F",
    supportedAssets: ["crypto", "gold", "us_stock"],
    defaultCurrency: "USD",
  },
  {
    id: "other",
    name: "แพลตฟอร์มอื่นๆ",
    subtitle: "กระเป๋าส่วนตัว / Cold Wallet / อื่นๆ",
    brandColor: "#64748B",
    supportedAssets: ["us_stock", "thai_stock", "crypto", "fund", "gold", "other"],
    defaultCurrency: "THB",
  },
];

export const ASSET_TYPE_CONFIG: Record<
  InvestmentAssetType,
  { label: string; badgeColor: string; dotColor: string }
> = {
  us_stock: {
    label: "หุ้นสหรัฐฯ",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    dotColor: "#3B82F6",
  },
  thai_stock: {
    label: "หุ้นไทย",
    badgeColor: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
    dotColor: "#0284C7",
  },
  crypto: {
    label: "คริปโต",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    dotColor: "#F59E0B",
  },
  fund: {
    label: "กองทุนรวม",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
    dotColor: "#6366F1",
  },
  gold: {
    label: "ทองคำ",
    badgeColor: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    dotColor: "#EAB308",
  },
  other: {
    label: "อื่นๆ",
    badgeColor: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20",
    dotColor: "#64748B",
  },
};

// ================= OFFICIAL WEBP INVESTMENT PLATFORM LOGOS =================
export const PLATFORM_WEBP_MAP: Record<string, string> = {
  dime: "/image/dime.webp",
  binance: "/image/binance.webp",
  bitkub: "/image/bitkub.webp",
  innovestx: "/image/innovestx.webp",
  streaming: "/image/streaming.webp",
  webull: "/image/webull.webp",
  ibkr: "/image/ibkr.webp",
  interactivebrokers: "/image/ibkr.webp",
  huasengheng: "/image/huasengheng.webp",
  hsh: "/image/huasengheng.webp",
  mtsgold: "/image/mtsgold.webp",
  mts: "/image/mtsgold.webp",
  exness: "/image/exness.webp",
  xm: "/image/xm.webp",
};

export function findPlatformWebp(platform?: string): string | null {
  if (!platform) return null;
  const clean = platform.toLowerCase().replace(/[\s\-_+./!]+/g, "");

  if (PLATFORM_WEBP_MAP[clean]) {
    return PLATFORM_WEBP_MAP[clean];
  }

  for (const [key, path] of Object.entries(PLATFORM_WEBP_MAP)) {
    const cleanKey = key.replace(/[\s\-_+./!]+/g, "");
    if (clean.includes(cleanKey) || cleanKey.includes(clean)) {
      return path;
    }
  }

  return null;
}

/**
 * Platform Logo Component (High-Fidelity Official WebP + Pure SVG Fallback)
 */
export function PlatformBadgeIcon({
  platform,
  size = 20,
  className = "",
}: {
  platform: string;
  size?: number;
  className?: string;
}) {
  const webpSrc = findPlatformWebp(platform);

  if (webpSrc) {
    return (
      <div
        className={`inline-flex items-center justify-center overflow-hidden shrink-0 bg-white dark:bg-zinc-900 border border-[var(--border-subtle)] ${className}`}
        style={{ width: size, height: size }}
        title={platform}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={webpSrc}
          alt={platform}
          className="w-full h-full object-contain p-0.5"
          loading="lazy"
        />
      </div>
    );
  }

  const p = platform.toLowerCase();

  if (p === "dime" || p.includes("dime")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#059669" />
        {/* Stylized D mark with coin spark */}
        <path
          d="M7 6.5H12C14.7614 6.5 17 8.73858 17 11.5V12.5C17 15.2614 14.7614 17.5 12 17.5H7V6.5Z"
          fill="white"
          fillOpacity="0.95"
        />
        <circle cx="11.5" cy="12" r="2.2" fill="#059669" />
        <circle cx="16.5" cy="7.5" r="1.5" fill="#A7F3D0" />
      </svg>
    );
  }

  if (p === "binance" || p.includes("binance")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#181A20" />
        {/* Binance Signature 4 Diamonds */}
        <path
          d="M12 4.5L14.2 6.7L8.9 12L7.8 10.9L12 4.5ZM12 19.5L9.8 17.3L15.1 12L16.2 13.1L12 19.5Z"
          fill="#F0B90B"
        />
        <path
          d="M19.5 12L17.3 9.8L16.2 10.9L18.4 13.1L19.5 12ZM4.5 12L6.7 14.2L7.8 13.1L5.6 10.9L4.5 12Z"
          fill="#F0B90B"
        />
        <path
          d="M12 9.5L14.5 12L12 14.5L9.5 12L12 9.5Z"
          fill="#F0B90B"
        />
      </svg>
    );
  }

  if (p === "bitkub" || p.includes("bitkub")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#06120D" />
        <path
          d="M6.5 6.5H12C13.933 6.5 15.5 8.067 15.5 10C15.5 11.2323 14.8624 12.3155 13.9 12.9436C15.1328 13.524 16 14.7766 16 16.25C16 18.3211 14.3211 20 12.25 20H6.5V6.5Z"
          fill="#00E676"
        />
        <circle cx="10" cy="10" r="1.5" fill="#06120D" />
        <circle cx="10.5" cy="16.5" r="1.5" fill="#06120D" />
      </svg>
    );
  }

  if (p === "innovestx" || p.includes("innovest")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#4E2E7F" />
        <path
          d="M6.5 6.5L11.5 12L6.5 17.5H9.5L13 13.5L16.5 17.5H19.5L14.5 12L19.5 6.5H16.5L13 10.5L9.5 6.5H6.5Z"
          fill="#A78BFA"
        />
      </svg>
    );
  }

  if (p === "streaming" || p.includes("set") || p.includes("stream")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#0284C7" />
        {/* Candlestick & Pulse Line */}
        <path d="M7 14V17M7 7V10M6 10H8V14H6V10Z" stroke="white" strokeWidth="1.5" />
        <path d="M12 15V18M12 6V9M11 9H13V15H11V9Z" stroke="#BAE6FD" strokeWidth="1.5" />
        <path d="M17 12V16M17 5V8M16 8H18V12H16V8Z" stroke="white" strokeWidth="1.5" />
      </svg>
    );
  }

  if (p === "huasengheng" || p.includes("hsh") || p.includes("gold") || p.includes("ทอง")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#78350F" />
        <path
          d="M7 8L10 6H14L17 8L19 14L17 18H7L5 14L7 8Z"
          fill="#F59E0B"
          stroke="#FDE68A"
          strokeWidth="1.2"
        />
        <path d="M9 11H15M10 14H14" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }

  if (p === "mtsgold" || p.includes("mts")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#78350F" />
        <circle cx="12" cy="12" r="7" stroke="#FDE68A" strokeWidth="1.5" />
        <path d="M9 12H15M12 9V15" stroke="#FDE68A" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (p === "exness" || p.includes("exness")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#181A20" />
        <path d="M7 7L17 17M17 7L7 17" stroke="#FFDE00" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (p === "xm" || p.includes("xm")) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <rect width="24" height="24" rx="6" fill="#181A20" />
        <path d="M6 7L12 13L18 7M6 17L12 11L18 17" stroke="#BA0C2F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Default Fallback
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="24" height="24" rx="6" fill="#334155" />
      <path
        d="M6 16L10 11L14 14L18 8M18 8H14M18 8V12"
        stroke="#E2E8F0"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
