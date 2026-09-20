import { AccountType } from "./types";

export interface BankPreset {
  id: string;
  name: string; // Official display name
  shortName: string; // Short code e.g. "KBANK"
  type: AccountType;
  color: string;
  gradient: string;
  badgeText: string;
  textColor: string;
  subtextColor: string;
  borderGlow: string;
}

export const BANK_PRESETS: BankPreset[] = [
  // ================= ธนาคารไทยยอดนิยม (Banks) =================
  {
    id: "kbank",
    name: "KBank (ธนาคารกสิกรไทย)",
    shortName: "KBank",
    type: "bank",
    color: "#00A950",
    gradient: "from-[#00A950] via-[#008740] to-[#005B2B]",
    badgeText: "KBANK",
    textColor: "text-white",
    subtextColor: "text-emerald-100",
    borderGlow: "border-emerald-500/30",
  },
  {
    id: "scb",
    name: "SCB (ธนาคารไทยพาณิชย์)",
    shortName: "SCB",
    type: "bank",
    color: "#4E148C",
    gradient: "from-[#4E148C] via-[#3B0764] to-[#240046]",
    badgeText: "SCB",
    textColor: "text-white",
    subtextColor: "text-purple-200",
    borderGlow: "border-purple-500/30",
  },
  {
    id: "ktb",
    name: "KTB (ธนาคารกรุงไทย)",
    shortName: "KTB",
    type: "bank",
    color: "#00A4E4",
    gradient: "from-[#00A4E4] via-[#007EA7] to-[#005270]",
    badgeText: "KTB",
    textColor: "text-white",
    subtextColor: "text-cyan-100",
    borderGlow: "border-cyan-500/30",
  },
  {
    id: "bbl",
    name: "BBL (ธนาคารกรุงเทพ)",
    shortName: "BBL",
    type: "bank",
    color: "#1E3A8A",
    gradient: "from-[#1E3A8A] via-[#1E293B] to-[#0F172A]",
    badgeText: "BBL",
    textColor: "text-white",
    subtextColor: "text-blue-200",
    borderGlow: "border-blue-500/30",
  },
  {
    id: "krungsri",
    name: "Krungsri (ธนาคารกรุงศรี)",
    shortName: "Krungsri",
    type: "bank",
    color: "#FFCC00",
    gradient: "from-[#FFCC00] via-[#D49E00] to-[#8C6B00]",
    badgeText: "BAY",
    textColor: "text-zinc-950",
    subtextColor: "text-zinc-800",
    borderGlow: "border-amber-400/40",
  },
  {
    id: "ttb",
    name: "ttb (ธนาคารทีเอ็มบีธนชาต)",
    shortName: "ttb",
    type: "bank",
    color: "#002D72",
    gradient: "from-[#002D72] via-[#0055B8] to-[#00A3E0]",
    badgeText: "TTB",
    textColor: "text-white",
    subtextColor: "text-sky-100",
    borderGlow: "border-sky-500/30",
  },
  {
    id: "gsb",
    name: "GSB (ธนาคารออมสิน)",
    shortName: "GSB",
    type: "bank",
    color: "#E91E63",
    gradient: "from-[#E91E63] via-[#C2185B] to-[#880E4F]",
    badgeText: "GSB",
    textColor: "text-white",
    subtextColor: "text-pink-100",
    borderGlow: "border-pink-500/30",
  },
  {
    id: "dime",
    name: "Dime! (เกียรตินาคินภัทร KKP)",
    shortName: "Dime!",
    type: "bank",
    color: "#00C274",
    gradient: "from-[#00C274] via-[#008F55] to-[#052E16]",
    badgeText: "DIME!",
    textColor: "text-white",
    subtextColor: "text-emerald-100",
    borderGlow: "border-emerald-400/40",
  },
  {
    id: "uob",
    name: "UOB (ธนาคารยูโอบี)",
    shortName: "UOB",
    type: "bank",
    color: "#002B49",
    gradient: "from-[#002B49] via-[#001D33] to-[#000E1A]",
    badgeText: "UOB",
    textColor: "text-white",
    subtextColor: "text-blue-100",
    borderGlow: "border-blue-400/30",
  },
  {
    id: "cimb",
    name: "CIMB (ธนาคารซีไอเอ็มบีไทย)",
    shortName: "CIMB",
    type: "bank",
    color: "#7E1416",
    gradient: "from-[#7E1416] via-[#5C0E10] to-[#2E0708]",
    badgeText: "CIMB",
    textColor: "text-white",
    subtextColor: "text-rose-100",
    borderGlow: "border-rose-500/30",
  },

  // ================= กระเป๋าเงินดิจิทัล (E-Wallets) =================
  {
    id: "truemoney",
    name: "TrueMoney Wallet (ทรูมันนี่)",
    shortName: "TrueMoney",
    type: "e_wallet",
    color: "#FF6A00",
    gradient: "from-[#FF6A00] via-[#EE0979] to-[#8E0E00]",
    badgeText: "TRUE",
    textColor: "text-white",
    subtextColor: "text-orange-100",
    borderGlow: "border-orange-500/30",
  },
  {
    id: "linepay",
    name: "LINE Pay (ไลน์เพย์)",
    shortName: "LINE Pay",
    type: "e_wallet",
    color: "#00C300",
    gradient: "from-[#00C300] via-[#009E00] to-[#005700]",
    badgeText: "LINE",
    textColor: "text-white",
    subtextColor: "text-emerald-100",
    borderGlow: "border-emerald-500/30",
  },
  {
    id: "shopeepay",
    name: "ShopeePay (ช้อปปี้เพย์)",
    shortName: "ShopeePay",
    type: "e_wallet",
    color: "#EE4D2D",
    gradient: "from-[#EE4D2D] via-[#CC3210] to-[#8A1A00]",
    badgeText: "SHOPEE",
    textColor: "text-white",
    subtextColor: "text-orange-100",
    borderGlow: "border-orange-500/30",
  },

  // ================= เงินสด (Cash) =================
  {
    id: "cash-wallet",
    name: "เงินสดติดกระเป๋า (Cash in Wallet)",
    shortName: "เงินสด",
    type: "cash",
    color: "#52525B",
    gradient: "from-zinc-800 via-zinc-900 to-black",
    badgeText: "CASH",
    textColor: "text-white",
    subtextColor: "text-zinc-400",
    borderGlow: "border-zinc-700",
  },
  {
    id: "cash-emergency",
    name: "เงินสดสำรองฉุกเฉิน (Emergency Cash)",
    shortName: "เงินสดสำรอง",
    type: "cash",
    color: "#3F3F46",
    gradient: "from-neutral-800 via-neutral-900 to-black",
    badgeText: "CASH",
    textColor: "text-white",
    subtextColor: "text-neutral-400",
    borderGlow: "border-neutral-700",
  },
];

// ฟังก์ชันระบุคู่สีและธีมอัตโนมัติตามชื่อธนาคาร / Wallet
export function getBankTheme(name: string = "", fallbackColor?: string) {
  const n = name.toLowerCase();

  // KBank (กสิกรไทย)
  if (n.includes("kbank") || n.includes("กสิกร") || n.includes("kasikorn")) {
    return {
      gradient: "from-[#00A950] via-[#008740] to-[#005B2B]",
      accent: "#00A950",
      badgeText: "KBANK",
      textColor: "text-white",
      subtextColor: "text-emerald-100",
      borderGlow: "border-emerald-500/30",
    };
  }
  // SCB (ไทยพาณิชย์)
  if (n.includes("scb") || n.includes("ไทยพาณิชย์")) {
    return {
      gradient: "from-[#4E148C] via-[#3B0764] to-[#240046]",
      accent: "#4E148C",
      badgeText: "SCB",
      textColor: "text-white",
      subtextColor: "text-purple-200",
      borderGlow: "border-purple-500/30",
    };
  }
  // KTB / Krungthai (กรุงไทย)
  if (n.includes("ktb") || n.includes("กรุงไทย") || n.includes("next")) {
    return {
      gradient: "from-[#00A4E4] via-[#007EA7] to-[#005270]",
      accent: "#00A4E4",
      badgeText: "KTB",
      textColor: "text-white",
      subtextColor: "text-cyan-100",
      borderGlow: "border-cyan-500/30",
    };
  }
  // BBL (กรุงเทพ)
  if (n.includes("bbl") || n.includes("กรุงเทพ") || n.includes("bangkok")) {
    return {
      gradient: "from-[#1E3A8A] via-[#1E293B] to-[#0F172A]",
      accent: "#1E3A8A",
      badgeText: "BBL",
      textColor: "text-white",
      subtextColor: "text-blue-200",
      borderGlow: "border-blue-500/30",
    };
  }
  // Krungsri / BAY (กรุงศรี)
  if (n.includes("krungsri") || n.includes("กรุงศรี") || n.includes("bay") || n.includes("kma")) {
    return {
      gradient: "from-[#FFCC00] via-[#D49E00] to-[#8C6B00]",
      accent: "#FFCC00",
      badgeText: "BAY",
      textColor: "text-zinc-950",
      subtextColor: "text-zinc-800",
      borderGlow: "border-amber-400/40",
    };
  }
  // ttb (ทีเอ็มบีธนชาต)
  if (n.includes("ttb") || n.includes("ธนชาต") || n.includes("tmb")) {
    return {
      gradient: "from-[#002D72] via-[#0055B8] to-[#00A3E0]",
      accent: "#002D72",
      badgeText: "TTB",
      textColor: "text-white",
      subtextColor: "text-sky-100",
      borderGlow: "border-sky-500/30",
    };
  }
  // GSB (ออมสิน)
  if (n.includes("gsb") || n.includes("ออมสิน")) {
    return {
      gradient: "from-[#E91E63] via-[#C2185B] to-[#880E4F]",
      accent: "#E91E63",
      badgeText: "GSB",
      textColor: "text-white",
      subtextColor: "text-pink-100",
      borderGlow: "border-pink-500/30",
    };
  }
  // Dime!
  if (n.includes("dime")) {
    return {
      gradient: "from-[#00C274] via-[#008F55] to-[#052E16]",
      accent: "#00C274",
      badgeText: "DIME!",
      textColor: "text-white",
      subtextColor: "text-emerald-100",
      borderGlow: "border-emerald-400/40",
    };
  }
  // UOB
  if (n.includes("uob")) {
    return {
      gradient: "from-[#002B49] via-[#001D33] to-[#000E1A]",
      accent: "#002B49",
      badgeText: "UOB",
      textColor: "text-white",
      subtextColor: "text-blue-100",
      borderGlow: "border-blue-400/30",
    };
  }
  // CIMB
  if (n.includes("cimb")) {
    return {
      gradient: "from-[#7E1416] via-[#5C0E10] to-[#2E0708]",
      accent: "#7E1416",
      badgeText: "CIMB",
      textColor: "text-white",
      subtextColor: "text-rose-100",
      borderGlow: "border-rose-500/30",
    };
  }
  // TrueMoney Wallet
  if (n.includes("truemoney") || n.includes("true wallet") || n.includes("ทรู")) {
    return {
      gradient: "from-[#FF6A00] via-[#EE0979] to-[#8E0E00]",
      accent: "#FF6A00",
      badgeText: "TRUE",
      textColor: "text-white",
      subtextColor: "text-orange-100",
      borderGlow: "border-orange-500/30",
    };
  }
  // LINE Pay
  if (n.includes("line")) {
    return {
      gradient: "from-[#00C300] via-[#009E00] to-[#005700]",
      accent: "#00C300",
      badgeText: "LINE",
      textColor: "text-white",
      subtextColor: "text-emerald-100",
      borderGlow: "border-emerald-500/30",
    };
  }
  // ShopeePay
  if (n.includes("shopee")) {
    return {
      gradient: "from-[#EE4D2D] via-[#CC3210] to-[#8A1A00]",
      accent: "#EE4D2D",
      badgeText: "SHOPEE",
      textColor: "text-white",
      subtextColor: "text-orange-100",
      borderGlow: "border-orange-500/30",
    };
  }
  // เงินสดติดกระเป๋า / Cash
  if (n.includes("สด") || n.includes("cash")) {
    return {
      gradient: "from-zinc-800 via-zinc-900 to-black",
      accent: "#52525B",
      badgeText: "CASH",
      textColor: "text-white",
      subtextColor: "text-zinc-400",
      borderGlow: "border-zinc-700",
    };
  }

  // ค่าตั้งต้นเมื่อไม่มีชื่อเฉพาะ
  return {
    gradient: "from-slate-800 via-slate-900 to-zinc-950",
    accent: fallbackColor || "#10B981",
    badgeText: "BANK",
    textColor: "text-white",
    subtextColor: "text-slate-300",
    borderGlow: "border-slate-700",
  };
}
