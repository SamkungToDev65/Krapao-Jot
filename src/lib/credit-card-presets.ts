export interface PopularCreditCardPreset {
  id: string;
  bank: string;
  name: string;
  cardColor: string; // Base Hex
  secondaryColor: string;
  accentColor: string;
  gradient: string;
  textColor: string; // 'text-white' | 'text-slate-900'
  chipColor: string;
  network: "visa" | "mastercard" | "unionpay" | "jcb";
  statementDay: number;
  dueDay: number;
  styleCategory: "silver" | "dark" | "color" | "gold";
  description: string;
  mood: string;
}

export const POPULAR_BANKS = [
  "KTC (กรุงไทย)",
  "KBANK (กสิกรไทย)",
  "CardX (ไทยพาณิชย์)",
  "BBL (กรุงเทพ)",
  "Krungsri (กรุงศรี)",
  "ttb (ทีเอ็มบีธนชาต)",
  "UOB",
] as const;

export const POPULAR_CREDIT_CARDS: PopularCreditCardPreset[] = [
  // KTC (กรุงไทย)
  {
    id: "ktc-platinum-mc",
    bank: "KTC (กรุงไทย)",
    name: "KTC Platinum Mastercard",
    cardColor: "#C0C0C8",
    secondaryColor: "#EAEAEA",
    accentColor: "#2B2B2F",
    gradient: "linear-gradient(135deg, #EAEAEA 0%, #C8C8D2 45%, #9E9EA8 100%)",
    textColor: "text-slate-900",
    chipColor: "#E2B857",
    network: "mastercard",
    statementDay: 17,
    dueDay: 2,
    styleCategory: "silver",
    description: "สีเงิน-เทาเมทัลลิก ผสมเงาขาวมินิมอล ให้ความรู้สึกเรียบง่าย สุภาพ คลาสสิก",
    mood: "Silver Brushed Metal & Minimalist",
  },
  {
    id: "ktc-platinum-visa",
    bank: "KTC (กรุงไทย)",
    name: "KTC Platinum Visa",
    cardColor: "#C0C0C8",
    secondaryColor: "#EAEAEA",
    accentColor: "#2B2B2F",
    gradient: "linear-gradient(135deg, #F5F5F7 0%, #D2D2DC 45%, #A2A2AC 100%)",
    textColor: "text-slate-900",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 17,
    dueDay: 2,
    styleCategory: "silver",
    description: "สีเงินซิลเวอร์เมทัลลิก คลาสสิก สุภาพ เข้าได้กับทุกการใช้งาน",
    mood: "Silver Metallic",
  },
  {
    id: "ktc-proud",
    bank: "KTC (กรุงไทย)",
    name: "KTC PROUD (กดเงินสด/ผ่อน)",
    cardColor: "#1A1C20",
    secondaryColor: "#3A3E45",
    accentColor: "#D4AF37",
    gradient: "linear-gradient(135deg, #30343C 0%, #1A1C20 50%, #0C0D0F 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "unionpay",
    statementDay: 25,
    dueDay: 10,
    styleCategory: "dark",
    description: "สีเทาดำ-ชาร์โคล ผสมเส้นสายประกายทอง/เงิน มู้ดคมเข้ม พรีเมียม",
    mood: "Dark Charcoal & Accent Gold",
  },
  {
    id: "ktc-digital-signature",
    bank: "KTC (กรุงไทย)",
    name: "KTC Digital Signature",
    cardColor: "#0F172A",
    secondaryColor: "#1E293B",
    accentColor: "#38BDF8",
    gradient: "linear-gradient(135deg, #1E293B 0%, #0F172A 60%, #020617 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 17,
    dueDay: 2,
    styleCategory: "dark",
    description: "ดำแมตต์ ตัดกับน้ำเงินเข้มและเงิน สไตล์เทค/โมเดิร์น",
    mood: "Midnight Slate & Cyan Glow",
  },

  // KBANK (กสิกรไทย)
  {
    id: "kbank-platinum",
    bank: "KBANK (กสิกรไทย)",
    name: "KBank Platinum Visa",
    cardColor: "#00A950",
    secondaryColor: "#1C3D2B",
    accentColor: "#B0BEC5",
    gradient: "linear-gradient(135deg, #00B254 0%, #007D3A 50%, #07381C 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 20,
    dueDay: 5,
    styleCategory: "color",
    description: "สีเขียวซิกเนเจอร์ ผสมเทาเงินหรือดำเข้ม เรียบหรูทางการ",
    mood: "Signature K-Green & Platinum",
  },
  {
    id: "kbank-the-wisdom",
    bank: "KBANK (กสิกรไทย)",
    name: "KBank THE WISDOM",
    cardColor: "#6A0D25",
    secondaryColor: "#8B1E3F",
    accentColor: "#DFB15B",
    gradient: "linear-gradient(135deg, #8B1E3F 0%, #6A0D25 50%, #30040F 100%)",
    textColor: "text-amber-100",
    chipColor: "#DFB15B",
    network: "visa",
    statementDay: 20,
    dueDay: 5,
    styleCategory: "dark",
    description: "สีแดงเข้มเบอร์กันดี ตัดตัวอักษรทอง/เงิน หรูหรา ไฮเอนด์",
    mood: "Deep Burgundy Wine & Luxury Gold",
  },

  // SCB / CardX (ไทยพาณิชย์)
  {
    id: "cardx-beyond",
    bank: "CardX (ไทยพาณิชย์)",
    name: "CardX BEYOND",
    cardColor: "#4D148C",
    secondaryColor: "#260D4D",
    accentColor: "#9B51E0",
    gradient: "linear-gradient(135deg, #6C20C2 0%, #4D148C 50%, #1E0740 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "mastercard",
    statementDay: 16,
    dueDay: 6,
    styleCategory: "color",
    description: "สีม่วงเข้ม ตัดด้วยน้ำเงินเข้มและสีเงินเมทัลลิก ดูทันสมัย คล่องตัว",
    mood: "SCB Royal Purple & Electric Violet",
  },
  {
    id: "cardx-ultra-platinum",
    bank: "CardX (ไทยพาณิชย์)",
    name: "CardX ULTRA PLATINUM",
    cardColor: "#3B1464",
    secondaryColor: "#1A0830",
    accentColor: "#C0C0C8",
    gradient: "linear-gradient(135deg, #5B2391 0%, #3B1464 60%, #170626 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 16,
    dueDay: 6,
    styleCategory: "color",
    description: "สีม่วงเข้ม อัลตร้าแพลทินัม พรีเมียมทันสมัย",
    mood: "Midnight Purple & Platinum",
  },

  // BBL (กรุงเทพ)
  {
    id: "bbl-airasia",
    bank: "BBL (กรุงเทพ)",
    name: "Bangkok Bank AirAsia",
    cardColor: "#002D62",
    secondaryColor: "#005A9C",
    accentColor: "#E05A2B",
    gradient: "linear-gradient(135deg, #005A9C 0%, #002D62 55%, #001738 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "mastercard",
    statementDay: 15,
    dueDay: 5,
    styleCategory: "color",
    description: "โทนน้ำเงินกรมท่าเข้ม ตัดด้วยสีส้มอิฐแดง สุขุม มั่นคง",
    mood: "Deep Navy & AirAsia Red Accent",
  },
  {
    id: "bbl-titanium",
    bank: "BBL (กรุงเทพ)",
    name: "Bangkok Bank Titanium",
    cardColor: "#1E293B",
    secondaryColor: "#334155",
    accentColor: "#94A3B8",
    gradient: "linear-gradient(135deg, #475569 0%, #1E293B 60%, #0F172A 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "mastercard",
    statementDay: 15,
    dueDay: 5,
    styleCategory: "dark",
    description: "สีเทาเข้มไทเทเนียม สุขุม มั่นคง สไตล์โมเดิร์นคอร์ปอเรต",
    mood: "Titanium Slate & Cobalt",
  },

  // Krungsri (กรุงศรี)
  {
    id: "krungsri-first-choice",
    bank: "Krungsri (กรุงศรี)",
    name: "Krungsri First Choice Platinum",
    cardColor: "#18181B",
    secondaryColor: "#27272A",
    accentColor: "#FAED26",
    gradient: "linear-gradient(135deg, #2D2D32 0%, #18181B 65%, #09090B 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 20,
    dueDay: 10,
    styleCategory: "dark",
    description: "สีดำแมตต์-เทาเข้ม ตัดด้วยแถบเหลืองนีออนสดใส สไตล์สปอร์ต/คนรุ่นใหม่",
    mood: "Matte Stealth Black & First Choice Neon Yellow",
  },
  {
    id: "krungsri-signature",
    bank: "Krungsri (กรุงศรี)",
    name: "Krungsri Exclusive Signature",
    cardColor: "#D9B464",
    secondaryColor: "#E5E7EB",
    accentColor: "#333333",
    gradient: "linear-gradient(135deg, #E8CD8A 0%, #D9B464 50%, #947228 100%)",
    textColor: "text-slate-900",
    chipColor: "#D4AF37",
    network: "visa",
    statementDay: 20,
    dueDay: 10,
    styleCategory: "gold",
    description: "สีทองแชมเปญ หรือสีเงิน ผสมเทาอ่อน เน้นความพรีเมียม อบอุ่น เรียบหรู",
    mood: "Champagne Luxury Gold",
  },

  // ttb (ทีเอ็มบีธนชาต)
  {
    id: "ttb-so-fast",
    bank: "ttb (ทีเอ็มบีธนชาต)",
    name: "ttb so fast",
    cardColor: "#002D72",
    secondaryColor: "#00A3E0",
    accentColor: "#FFFFFF",
    gradient: "linear-gradient(135deg, #008DCC 0%, #002D72 65%, #00163B 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 12,
    dueDay: 2,
    styleCategory: "color",
    description: "สีน้ำเงินตัดคู่สีฟ้าสว่างและสีขาว ลุคคลีน สดใส ทันสมัย เข้าถึงง่าย",
    mood: "ttb Deep Navy & Electric Sky Blue",
  },
  {
    id: "ttb-so-smart",
    bank: "ttb (ทีเอ็มบีธนชาต)",
    name: "ttb so smart",
    cardColor: "#003A8C",
    secondaryColor: "#00B2E3",
    accentColor: "#FFFFFF",
    gradient: "linear-gradient(135deg, #00A6E6 0%, #003A8C 60%, #001B45 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "mastercard",
    statementDay: 12,
    dueDay: 2,
    styleCategory: "color",
    description: "สีน้ำเงินสดตัดคู่สีฟ้าสว่าง คลีน ทันสมัย",
    mood: "ttb Modern Blue & Sky Blue",
  },

  // UOB
  {
    id: "uob-premier",
    bank: "UOB",
    name: "UOB Premier",
    cardColor: "#00205B",
    secondaryColor: "#D00028",
    accentColor: "#E2E8F0",
    gradient: "linear-gradient(135deg, #003487 0%, #00205B 60%, #001033 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "visa",
    statementDay: 18,
    dueDay: 8,
    styleCategory: "color",
    description: "น้ำเงินมิดไนท์บลู ตัดริ้วสีแดงและเงินเมทัลลิก สไตล์สากล สุขุม",
    mood: "UOB Midnight Navy & Red Ribbon Accent",
  },
  {
    id: "uob-one",
    bank: "UOB",
    name: "UOB One",
    cardColor: "#001D4A",
    secondaryColor: "#E60028",
    accentColor: "#FFFFFF",
    gradient: "linear-gradient(135deg, #083273 0%, #001D4A 60%, #000E26 100%)",
    textColor: "text-white",
    chipColor: "#E2B857",
    network: "mastercard",
    statementDay: 18,
    dueDay: 8,
    styleCategory: "color",
    description: "น้ำเงินเข้มขรึม ตัดแถบริ้วสีแดงสด ซิกเนเจอร์ UOB",
    mood: "UOB Signature Deep Navy",
  },
];

export const QUICK_LIMIT_PRESETS = [
  10000,
  15000,
  20000,
  30000,
  50000,
  80000,
  100000,
  150000,
  200000,
  300000,
  500000,
];

/**
 * Match a credit card to its preset for rich UI rendering
 */
export function findCardPreset(cardName: string, bankName?: string): PopularCreditCardPreset | undefined {
  const normName = cardName.toLowerCase().replace(/[\s\-_]/g, "");
  const normBank = (bankName || "").toLowerCase().replace(/[\s\-_()]/g, "");

  // Exact ID match
  const exactId = POPULAR_CREDIT_CARDS.find((p) => p.id === cardName);
  if (exactId) return exactId;

  // Exact name match
  const exactName = POPULAR_CREDIT_CARDS.find(
    (p) => p.name.toLowerCase().replace(/[\s\-_]/g, "") === normName
  );
  if (exactName) return exactName;

  // Fuzzy match
  return POPULAR_CREDIT_CARDS.find((p) => {
    const pName = p.name.toLowerCase().replace(/[\s\-_]/g, "");
    const pBank = p.bank.toLowerCase().replace(/[\s\-_()]/g, "");

    const nameMatch = normName.includes(pName) || pName.includes(normName);
    const bankMatch = normBank && (normBank.includes(pBank) || pBank.includes(normBank));

    return nameMatch || (bankMatch && normName.includes(p.id.split("-")[1] || ""));
  });
}
