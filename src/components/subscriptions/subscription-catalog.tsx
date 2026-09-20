import React from "react";

export interface SubscriptionPreset {
  id: string;
  name: string;
  category: string;
  defaultPrice: number;
  color: string;
  iconKey: string;
  keywords: string[];
  billingCycle: "monthly" | "yearly";
}

export const SUBSCRIPTION_CATEGORIES = [
  "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
  "AI & เครื่องมือการทำงาน",
  "เกมมิ่ง & ดิจิทัลไลฟ์สไตล์",
  "คลาวด์ & จัดเก็บข้อมูล",
  "อื่น ๆ (กำหนดเอง)",
] as const;

export type SubscriptionCategoryType = (typeof SUBSCRIPTION_CATEGORIES)[number];

export const SUBSCRIPTION_PRESETS: SubscriptionPreset[] = [
  // ================= 1. ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง =================
  {
    id: "netflix",
    name: "Netflix",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 419,
    color: "#E50914",
    iconKey: "netflix",
    keywords: ["netflix", "เน็ตฟลิก", "เน็ตฟลิกซ์"],
    billingCycle: "monthly",
  },
  {
    id: "disney",
    name: "Disney+ Hotstar",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 289,
    color: "#113CCF",
    iconKey: "disney",
    keywords: ["disney", "disney+", "ดิสนีย์", "hotstar"],
    billingCycle: "monthly",
  },
  {
    id: "youtube",
    name: "YouTube Premium",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 299,
    color: "#FF0000",
    iconKey: "youtube",
    keywords: ["youtube", "ยูทูบ", "ยูทูป", "yt"],
    billingCycle: "monthly",
  },
  {
    id: "prime",
    name: "Prime Video",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 149,
    color: "#00A8E1",
    iconKey: "prime",
    keywords: ["prime", "amazon", "ไพรม์"],
    billingCycle: "monthly",
  },
  {
    id: "hbo",
    name: "HBO Max / HBO GO",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 199,
    color: "#5822B4",
    iconKey: "hbo",
    keywords: ["hbo", "max", "เอชบีโอ"],
    billingCycle: "monthly",
  },
  {
    id: "viu",
    name: "Viu Premium",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 149,
    color: "#FFC200",
    iconKey: "viu",
    keywords: ["viu", "วิว"],
    billingCycle: "monthly",
  },
  {
    id: "iqiyi",
    name: "iQIYI VIP",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 119,
    color: "#00C132",
    iconKey: "iqiyi",
    keywords: ["iqiyi", "อ้ายฉีอี้", "อ้ายฉี"],
    billingCycle: "monthly",
  },
  {
    id: "wetv",
    name: "WeTV VIP",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 119,
    color: "#FF6A00",
    iconKey: "wetv",
    keywords: ["wetv", "วีทีวี"],
    billingCycle: "monthly",
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 219,
    color: "#1DB954",
    iconKey: "spotify",
    keywords: ["spotify", "สปอติฟาย"],
    billingCycle: "monthly",
  },
  {
    id: "applemusic",
    name: "Apple Music",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 139,
    color: "#FA243C",
    iconKey: "applemusic",
    keywords: ["apple music", "แอเปิ้ล มิวสิค"],
    billingCycle: "monthly",
  },
  {
    id: "joox",
    name: "JOOX VIP",
    category: "ความบันเทิง วิดีโอสตรีมมิ่ง & เพลง",
    defaultPrice: 129,
    color: "#00C300",
    iconKey: "joox",
    keywords: ["joox", "จุกซ์", "จู๊กซ์"],
    billingCycle: "monthly",
  },

  // ================= 2. AI & เครื่องมือการทำงาน =================
  {
    id: "chatgpt",
    name: "ChatGPT Plus",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 750,
    color: "#10A37F",
    iconKey: "chatgpt",
    keywords: ["chatgpt", "openai", "gpt", "แชทจีพีที"],
    billingCycle: "monthly",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 350,
    color: "#1E40AF",
    iconKey: "deepseek",
    keywords: ["deepseek", "ดีพซีค"],
    billingCycle: "monthly",
  },
  {
    id: "grok",
    name: "Grok (xAI)",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 550,
    color: "#000000",
    iconKey: "grok",
    keywords: ["grok", "xai", "กร็อก"],
    billingCycle: "monthly",
  },
  {
    id: "canva",
    name: "Canva Pro",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 229,
    color: "#00C4CC",
    iconKey: "canva",
    keywords: ["canva", "แคนวา"],
    billingCycle: "monthly",
  },
  {
    id: "claude",
    name: "Claude Pro",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 750,
    color: "#CC785C",
    iconKey: "claude",
    keywords: ["claude", "clude", "anthropic", "คลอด"],
    billingCycle: "monthly",
  },
  {
    id: "gemini",
    name: "Gemini Advanced",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 750,
    color: "#4E81EE",
    iconKey: "gemini",
    keywords: ["gemini", "เจมินาย", "google ai"],
    billingCycle: "monthly",
  },
  {
    id: "cursor",
    name: "Cursor",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 700,
    color: "#000000",
    iconKey: "cursor",
    keywords: ["cursor", "cursor ai"],
    billingCycle: "monthly",
  },
  {
    id: "opencode",
    name: "OpenCode",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 700,
    color: "#0F172A",
    iconKey: "opencode",
    keywords: ["opencode", "open code", "ai code"],
    billingCycle: "monthly",
  },
  {
    id: "copilot",
    name: "GitHub Copilot",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 350,
    color: "#6E40C9",
    iconKey: "copilot",
    keywords: ["copilot", "colpilot", "github copilot"],
    billingCycle: "monthly",
  },
  {
    id: "github",
    name: "GitHub Pro",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 150,
    color: "#24292F",
    iconKey: "github",
    keywords: ["github", "กิตฮับ"],
    billingCycle: "monthly",
  },
  {
    id: "golang",
    name: "Go / JetBrains IDE",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 590,
    color: "#00ADD8",
    iconKey: "golang",
    keywords: ["go", "golang", "jetbrains", "goland"],
    billingCycle: "monthly",
  },
  {
    id: "midjourney",
    name: "Midjourney",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 350,
    color: "#2B2D42",
    iconKey: "midjourney",
    keywords: ["midjourney", "มิดเจอร์นีย์"],
    billingCycle: "monthly",
  },
  {
    id: "notion",
    name: "Notion Plus",
    category: "AI & เครื่องมือการทำงาน",
    defaultPrice: 350,
    color: "#18181B",
    iconKey: "notion",
    keywords: ["notion", "โนชั่น"],
    billingCycle: "monthly",
  },

  // ================= 3. เกมมิ่ง & ดิจิทัลไลฟ์สไตล์ =================
  {
    id: "xbox",
    name: "PC Game Pass / Xbox Game Pass",
    category: "เกมมิ่ง & ดิจิทัลไลฟ์สไตล์",
    defaultPrice: 209,
    color: "#107C10",
    iconKey: "xbox",
    keywords: ["xbox", "game pass", "pc game pass", "เกมพาส"],
    billingCycle: "monthly",
  },
  {
    id: "playstation",
    name: "PlayStation Plus",
    category: "เกมมิ่ง & ดิจิทัลไลฟ์สไตล์",
    defaultPrice: 210,
    color: "#003791",
    iconKey: "playstation",
    keywords: ["playstation", "ps plus", "psn", "เพลย์สเตชัน"],
    billingCycle: "monthly",
  },
  {
    id: "nintendo",
    name: "Nintendo Switch Online",
    category: "เกมมิ่ง & ดิจิทัลไลฟ์สไตล์",
    defaultPrice: 130,
    color: "#E60012",
    iconKey: "nintendo",
    keywords: ["nintendo", "switch", "นินเทนโด"],
    billingCycle: "monthly",
  },
  {
    id: "strava",
    name: "Strava",
    category: "เกมมิ่ง & ดิจิทัลไลฟ์สไตล์",
    defaultPrice: 189,
    color: "#FC5200",
    iconKey: "strava",
    keywords: ["strava", "สตราวา", "วิ่ง", "ปั่นจักรยาน"],
    billingCycle: "monthly",
  },
  {
    id: "discord",
    name: "Discord Nitro",
    category: "เกมมิ่ง & ดิจิทัลไลฟ์สไตล์",
    defaultPrice: 300,
    color: "#5865F2",
    iconKey: "discord",
    keywords: ["discord", "nitro", "ดิสคอร์ด"],
    billingCycle: "monthly",
  },

  // ================= 4. คลาวด์ & จัดเก็บข้อมูล =================
  {
    id: "icloud",
    name: "iCloud+ (200GB)",
    category: "คลาวด์ & จัดเก็บข้อมูล",
    defaultPrice: 99,
    color: "#0071E3",
    iconKey: "icloud",
    keywords: ["icloud", "apple", "ไอคลาวด์"],
    billingCycle: "monthly",
  },
  {
    id: "googleone",
    name: "Google One (100GB)",
    category: "คลาวด์ & จัดเก็บข้อมูล",
    defaultPrice: 70,
    color: "#4285F4",
    iconKey: "googleone",
    keywords: ["google", "google one", "กูเกิลวัน"],
    billingCycle: "monthly",
  },
];

/**
 * Helper to match a subscription name or iconKey with a known preset
 */
export function findSubscriptionPreset(
  name: string,
  iconKey?: string
): SubscriptionPreset | null {
  if (iconKey) {
    const matchedByKey = SUBSCRIPTION_PRESETS.find(
      (p) => p.iconKey.toLowerCase() === iconKey.toLowerCase()
    );
    if (matchedByKey) return matchedByKey;
  }

  if (!name) return null;
  const lowerName = name.toLowerCase().trim();

  // Exact ID / Name match
  const exact = SUBSCRIPTION_PRESETS.find(
    (p) =>
      p.name.toLowerCase() === lowerName ||
      p.id.toLowerCase() === lowerName ||
      p.iconKey.toLowerCase() === lowerName
  );
  if (exact) return exact;

  // Keyword match
  const keywordMatch = SUBSCRIPTION_PRESETS.find((p) =>
    p.keywords.some((k) => lowerName.includes(k))
  );
  return keywordMatch || null;
}

// ================= OFFICIAL WEBP BRAND LOGO MAPPING =================
export const BRAND_WEBP_MAP: Record<string, string> = {
  // Entertainment & Streaming
  disney: "/image/disney.webp",
  hotstar: "/image/disney.webp",
  hbo: "/image/hbo.webp",
  hbomax: "/image/hbo.webp",
  hbogo: "/image/hbo.webp",
  prime: "/image/prime.webp",
  primevideo: "/image/prime.webp",
  amazon: "/image/prime.webp",
  iqiyi: "/image/iqiyi.webp",
  wetv: "/image/wetv.webp",
  joox: "/image/joox.webp",

  // AI & Productivity Tools
  chatgpt: "/image/chatgpt.webp",
  gpt: "/image/chatgpt.webp",
  openai: "/image/chatgpt.webp",
  claude: "/image/claude.webp",
  anthropic: "/image/claude.webp",
  gemini: "/image/gemini.webp",
  googleai: "/image/gemini.webp",
  deepseek: "/image/deepseek.webp",
  grok: "/image/grok.webp",
  xai: "/image/grok.webp",
  canva: "/image/canva.webp",
  copilot: "/image/copilot.webp",
  githubcopilot: "/image/copilot.webp",
  cursor: "/image/cursor.webp",
  opencode: "/image/opencode.webp",
};

export function findBrandWebp(name?: string, iconKey?: string): string | null {
  const cleanKey = (iconKey || "").toLowerCase().replace(/[\s\-_+./]+/g, "");
  const cleanName = (name || "").toLowerCase().replace(/[\s\-_+./]+/g, "");

  if (cleanKey && BRAND_WEBP_MAP[cleanKey]) {
    return BRAND_WEBP_MAP[cleanKey];
  }

  for (const [key, path] of Object.entries(BRAND_WEBP_MAP)) {
    if (cleanKey.includes(key) || cleanName.includes(key)) {
      return path;
    }
  }

  return null;
}

interface SubscriptionBrandIconProps {
  name: string;
  iconKey?: string;
  color?: string;
  className?: string;
  size?: number;
}

export function SubscriptionBrandIcon({
  name,
  iconKey,
  color,
  className = "w-10 h-10 rounded-2xl",
  size = 20,
}: SubscriptionBrandIconProps) {
  const preset = findSubscriptionPreset(name, iconKey);
  const brandKey = (iconKey || preset?.iconKey || "").toLowerCase();
  const brandColor = color || preset?.color || "#6366F1";

  // 0. High-Fidelity Official WebP Brand Logo (User provided in public/image)
  const webpSrc = findBrandWebp(name, iconKey);
  if (webpSrc) {
    return (
      <div
        className={`${className} flex items-center justify-center overflow-hidden shadow-xs flex-shrink-0 bg-white dark:bg-slate-900 border border-[var(--border-subtle)]`}
        title={name}
      >
        <img
          src={webpSrc}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  // 1. Netflix
  if (brandKey === "netflix" || name.toLowerCase().includes("netflix")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-black shadow-xs flex-shrink-0`}
        title="Netflix"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path d="M5.5 2h3.3v20H5.5z" fill="#B81D24" />
          <path d="M15.2 2h3.3v20h-3.3z" fill="#B81D24" />
          <path d="M5.5 2h3.3l6.5 20h-3.3z" fill="#E50914" />
        </svg>
      </div>
    );
  }

  // 2. YouTube
  if (
    brandKey === "youtube" ||
    name.toLowerCase().includes("youtube") ||
    name.toLowerCase().includes("yt")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#FF0000] shadow-xs flex-shrink-0`}
        title="YouTube Premium"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <rect x="2" y="5" width="20" height="14" rx="4.5" fill="#FF0000" />
          <polygon points="10,8.5 16,12 10,15.5" fill="#FFFFFF" />
        </svg>
      </div>
    );
  }

  // 3. Spotify
  if (brandKey === "spotify" || name.toLowerCase().includes("spotify")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#1DB954] shadow-xs flex-shrink-0`}
        title="Spotify"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <circle cx="12" cy="12" r="10" fill="#1DB954" />
          <path
            d="M7 9.2c3.2-.8 7.3-.4 10.3 1.4"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7.6 12.3c2.6-.6 5.8-.3 8.3 1.1"
            stroke="#fff"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M8.2 15.3c2.1-.5 4.6-.2 6.5.9"
            stroke="#fff"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 4. Disney+
  if (
    brandKey === "disney" ||
    name.toLowerCase().includes("disney") ||
    name.toLowerCase().includes("hotstar")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#113CCF] shadow-xs flex-shrink-0`}
        title="Disney+ Hotstar"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M4 14.5C8 7.5 16 6.5 20 12c-3.5-3.5-9-3-12 1.5-1 1.5-2 2-4 1z"
            fill="#3884FF"
          />
          <path
            d="M18.5 7v4m-2-2h4"
            stroke="#FFF"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="18.5" cy="9" r="0.6" fill="#FFF" />
        </svg>
      </div>
    );
  }

  // 5. Prime Video
  if (
    brandKey === "prime" ||
    name.toLowerCase().includes("prime") ||
    name.toLowerCase().includes("amazon")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#00A8E1] shadow-xs flex-shrink-0`}
        title="Prime Video"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M6 10h2.5c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5H6V10zm2.2 3.6c.6 0 1.1-.5 1.1-1.1s-.5-1.1-1.1-1.1H7.4v2.2h.8z"
            fill="#FFF"
          />
          <path
            d="M5.5 17.5c4 2 9 2 13-1"
            stroke="#FFF"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M17.5 15.5l1.5 1-1.8 1"
            stroke="#FFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // 6. HBO
  if (brandKey === "hbo" || name.toLowerCase().includes("hbo")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#5822B4] shadow-xs flex-shrink-0`}
        title="HBO Max"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#FFF"
            fontSize="9"
            fontWeight="900"
            fontFamily="sans-serif"
            letterSpacing="0.5"
          >
            HBO
          </text>
          <circle
            cx="17.2"
            cy="12.5"
            r="1.4"
            fill="#5822B4"
            stroke="#FFF"
            strokeWidth="1.1"
          />
        </svg>
      </div>
    );
  }

  // 7. Viu
  if (brandKey === "viu" || name.toLowerCase().includes("viu")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#FFC200] shadow-xs flex-shrink-0`}
        title="Viu"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#1A1A1A"
            fontSize="9.5"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            viu
          </text>
          <circle cx="16.5" cy="8.5" r="1" fill="#1A1A1A" />
        </svg>
      </div>
    );
  }

  // 8. iQIYI
  if (brandKey === "iqiyi" || name.toLowerCase().includes("iqiyi")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#00C132] shadow-xs flex-shrink-0`}
        title="iQIYI"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <rect
            x="5.5"
            y="6"
            width="13"
            height="12"
            rx="4"
            stroke="#FFF"
            strokeWidth="1.8"
          />
          <polygon points="10.5,9.5 14.5,12 10.5,14.5" fill="#FFF" />
          <path
            d="M15 15.5l2.5 2.5"
            stroke="#FFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 9. WeTV
  if (brandKey === "wetv" || name.toLowerCase().includes("wetv")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#FF6A00] shadow-xs flex-shrink-0`}
        title="WeTV"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path d="M7 6.5l9 5.5-9 5.5V6.5z" fill="#0084FF" />
          <path d="M7 6.5l5 5.5-5 5.5V6.5z" fill="#FFD200" opacity="0.9" />
          <path d="M7 6.5l9 5.5-4 1.5-5-7z" fill="#FFF" opacity="0.3" />
        </svg>
      </div>
    );
  }

  // 10. ChatGPT
  if (
    brandKey === "chatgpt" ||
    name.toLowerCase().includes("chatgpt") ||
    name.toLowerCase().includes("openai") ||
    name.toLowerCase().includes("gpt")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#10A37F] shadow-xs flex-shrink-0`}
        title="ChatGPT"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <g
            transform="translate(4,4) scale(0.666)"
            stroke="#FFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M19.1 14.4a5.5 5.5 0 0 0 .5-2.4 5.5 5.5 0 0 0-5.5-5.5c-.3 0-.6 0-.9.1A5.5 5.5 0 0 0 3.7 8.2a5.5 5.5 0 0 0-1.8 4.2 5.5 5.5 0 0 0 2.8 4.8 5.5 5.5 0 0 0 .6 4.9 5.5 5.5 0 0 0 5 2.4c.3 0 .6 0 .9-.1a5.5 5.5 0 0 0 9.5-1.6 5.5 5.5 0 0 0 1.8-4.2c0-1.5-.6-3-1.6-4.2z" />
            <path d="M12 8v8M8 10l8 4M8 14l8-4" />
          </g>
        </svg>
      </div>
    );
  }

  // 11. Claude
  if (
    brandKey === "claude" ||
    name.toLowerCase().includes("claude") ||
    name.toLowerCase().includes("clude") ||
    name.toLowerCase().includes("anthropic")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#CC785C] shadow-xs flex-shrink-0`}
        title="Claude"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <g transform="translate(12,12)">
            <path
              d="M0 -7L1.2 -1.8L6.4 -3.7L2.4 0L6.4 3.7L1.2 1.8L0 7L-1.2 1.8L-6.4 3.7L-2.4 0L-6.4 -3.7L-1.2 -1.8Z"
              fill="#FFF"
            />
            <circle cx="0" cy="0" r="1.4" fill="#CC785C" />
          </g>
        </svg>
      </div>
    );
  }

  // 12. Gemini
  if (brandKey === "gemini" || name.toLowerCase().includes("gemini")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#1E293B] shadow-xs flex-shrink-0`}
        title="Gemini"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M12 3C12 7.97 7.97 12 3 12C7.97 12 12 16.03 12 21C12 16.03 16.03 12 21 12C16.03 12 12 7.97 12 3Z"
            fill="url(#gemini_grad)"
          />
          <defs>
            <linearGradient
              id="gemini_grad"
              x1="3"
              y1="3"
              x2="21"
              y2="21"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#4E81EE" />
              <stop offset="0.5" stopColor="#A855F7" />
              <stop offset="1" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  // 13. Canva
  if (brandKey === "canva" || name.toLowerCase().includes("canva")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#00C4CC] shadow-xs flex-shrink-0`}
        title="Canva"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <text
            x="12"
            y="16.5"
            textAnchor="middle"
            fill="#FFF"
            fontSize="13"
            fontWeight="bold"
            fontStyle="italic"
            fontFamily="Georgia, serif"
          >
            C
          </text>
          <circle cx="16" cy="7.5" r="1.2" fill="#7D2AE8" />
        </svg>
      </div>
    );
  }

  // 14. GitHub Copilot
  if (
    brandKey === "copilot" ||
    name.toLowerCase().includes("copilot") ||
    name.toLowerCase().includes("colpilot")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#6E40C9] shadow-xs flex-shrink-0`}
        title="GitHub Copilot"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <rect
            x="5.5"
            y="7.5"
            width="13"
            height="9"
            rx="3.5"
            stroke="#FFF"
            strokeWidth="1.8"
          />
          <circle cx="9.5" cy="12" r="1.5" fill="#FFF" />
          <circle cx="14.5" cy="12" r="1.5" fill="#FFF" />
          <path
            d="M12 4.5v3M4 12h1.5M18.5 12H20"
            stroke="#FFF"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 15. GitHub
  if (brandKey === "github" || name.toLowerCase().includes("github")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#24292F] shadow-xs flex-shrink-0`}
        title="GitHub"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 4a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.49c-2.22.48-2.69-1.07-2.69-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.66 7.66 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .22.14.46.55.38A8.001 8.001 0 0 0 12 4z"
            fill="#FFF"
          />
        </svg>
      </div>
    );
  }

  // 16. OpenCode / Cursor
  if (
    brandKey === "opencode" ||
    name.toLowerCase().includes("opencode") ||
    name.toLowerCase().includes("cursor")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#0F172A] shadow-xs flex-shrink-0`}
        title="OpenCode / Cursor"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M7 8l4 4-4 4"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="13"
            y1="16"
            x2="17"
            y2="16"
            stroke="#38BDF8"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 17. Go / Golang
  if (
    brandKey === "golang" ||
    name.toLowerCase() === "go" ||
    name.toLowerCase().includes("golang") ||
    name.toLowerCase().includes("goland")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#00ADD8] shadow-xs flex-shrink-0`}
        title="Go"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <text
            x="12"
            y="15.5"
            textAnchor="middle"
            fill="#FFF"
            fontSize="10"
            fontWeight="900"
            fontFamily="sans-serif"
          >
            GO
          </text>
        </svg>
      </div>
    );
  }

  // 18. Xbox / Game Pass
  if (
    brandKey === "xbox" ||
    name.toLowerCase().includes("xbox") ||
    name.toLowerCase().includes("game pass")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#107C10] shadow-xs flex-shrink-0`}
        title="Xbox Game Pass"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <circle cx="12" cy="12" r="10" fill="#107C10" />
          <path
            d="M7 6c2.5 2.5 4.5 5 5 6.5.5-1.5 2.5-4 5-6.5C15 4.5 13.5 4 12 4S9 4.5 7 6z"
            fill="#FFF"
          />
          <path
            d="M5.5 9c2 2 4.5 5 4.5 7 0 1.5-.5 2.5-1.5 3C6.5 17.5 5.5 13.5 5.5 9z"
            fill="#FFF"
          />
          <path
            d="M18.5 9c-2 2-4.5 5-4.5 7 0 1.5.5 2.5 1.5 3 2-1.5 3-5.5 3-10z"
            fill="#FFF"
          />
        </svg>
      </div>
    );
  }

  // 19. PlayStation
  if (
    brandKey === "playstation" ||
    name.toLowerCase().includes("playstation") ||
    name.toLowerCase().includes("ps plus") ||
    name.toLowerCase().includes("psn")
  ) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#003791] shadow-xs flex-shrink-0`}
        title="PlayStation"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M10.5 5v12.5l3-1.5V9c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5c0 .6-.4 1.2-1 1.4v2.5c2-.3 3.5-1.8 3.5-3.9 0-2.2-1.8-4-4-4-2 0-3.7 1.4-4.5 3.5z"
            fill="#FFF"
          />
          <path
            d="M6 16.5c1.5-.8 3.5-.8 5 .2l-1.5.8c-.8-.4-2-.4-2.8 0l-.7-1z"
            fill="#00A2FF"
          />
        </svg>
      </div>
    );
  }

  // 20. Strava
  if (brandKey === "strava" || name.toLowerCase().includes("strava")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#FC5200] shadow-xs flex-shrink-0`}
        title="Strava"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M11 6l3.5 6.5h-2.5L11 10.5 9.8 12.5H7.3L11 6z"
            fill="#FFF"
          />
          <path
            d="M14.5 12.5l2 4h-1.5l-1.2-2.3-.8 1.3-.8-1.5 2.3-1.5z"
            fill="#FFA372"
          />
        </svg>
      </div>
    );
  }

  // 21. Discord
  if (brandKey === "discord" || name.toLowerCase().includes("discord")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-[#5865F2] shadow-xs flex-shrink-0`}
        title="Discord"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <path
            d="M16.8 7.3A12.3 12.3 0 0 0 13.9 6.4c-.1.2-.3.6-.4.9a11.4 11.4 0 0 0-3 0c-.1-.3-.3-.7-.4-.9a12.3 12.3 0 0 0-2.9.9C5.4 10 5 12.7 5.2 15.3a12.4 12.4 0 0 0 3.8 1.9c.3-.4.6-.9.8-1.4-.6-.2-1.2-.5-1.7-.9.1-.1.3-.2.4-.3a8.8 8.8 0 0 0 7 0c.1.1.3.2.4.3-.5.4-1.1.7-1.7.9.2.5.5 1 .8 1.4a12.4 12.4 0 0 0 3.8-1.9c.3-3-.6-5.7-2-8zm-6.6 6.3c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5zm3.6 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5z"
            fill="#FFF"
          />
        </svg>
      </div>
    );
  }

  // 22. Apple Music / iCloud
  if (
    brandKey === "applemusic" ||
    brandKey === "icloud" ||
    name.toLowerCase().includes("icloud") ||
    name.toLowerCase().includes("apple")
  ) {
    const isMusic =
      brandKey === "applemusic" || name.toLowerCase().includes("music");
    return (
      <div
        className={`${className} flex items-center justify-center shadow-xs flex-shrink-0`}
        style={{ backgroundColor: isMusic ? "#FA243C" : "#0071E3" }}
        title={name}
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          {isMusic ? (
            <path
              d="M12 5v10.5a2.5 2.5 0 1 1-2-2.45V8l7-1.5v6a2.5 2.5 0 1 1-2-2.45V4.5l-3 .5z"
              fill="#FFF"
            />
          ) : (
            <path
              d="M18.5 16.5a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.5-1.5 4.5 4.5 0 0 0-3 8.5h13z"
              fill="#FFF"
            />
          )}
        </svg>
      </div>
    );
  }

  // 23. Google One
  if (brandKey === "googleone" || name.toLowerCase().includes("google")) {
    return (
      <div
        className={`${className} flex items-center justify-center bg-white border border-slate-200 dark:border-slate-800 shadow-xs flex-shrink-0`}
        title="Google One"
      >
        <svg viewBox="0 0 24 24" width={size} height={size} fill="none">
          <circle cx="12" cy="12" r="7.5" stroke="#4285F4" strokeWidth="2.5" />
          <path
            d="M12 7.5v9M10 9.5l2-2"
            stroke="#34A853"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    );
  }

  // 24. Fallback Default (อันไหนไม่มีก็ให้ใช้แบบเดิม: ใช้สีแบรนด์ + ตัวอักษรย่อตัวแรก)
  return (
    <div
      className={`${className} flex items-center justify-center font-bold text-white text-sm shadow-xs flex-shrink-0 tracking-wider`}
      style={{ backgroundColor: brandColor }}
      title={name}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
