export type MascotGender = "male" | "female";

export type MascotSkinToneId = "fair" | "peach" | "honey" | "tan" | "bronze" | "cocoa";

export type MascotMaleHairStyle =
  | "short-messy"
  | "side-part"
  | "curly-crop"
  | "modern-fade"
  | "slick-back";

export type MascotFemaleHairStyle =
  | "bob-bangs"
  | "long-wavy"
  | "high-ponytail"
  | "double-bun"
  | "straight-lob";

export type MascotHairStyle = MascotMaleHairStyle | MascotFemaleHairStyle;

export type MascotHairColorId =
  | "jet-black"
  | "dark-brown"
  | "caramel-blonde"
  | "ash-silver"
  | "rosewood"
  | "pastel-lilac";

export type MascotOutfitId =
  | "tech-hoodie"
  | "fintech-blazer"
  | "casual-tshirt"
  | "knit-sweater"
  | "zip-polo";

export type MascotOutfitColorId =
  | "emerald"
  | "navy"
  | "slate"
  | "white"
  | "burgundy"
  | "amber"
  | "rose"
  | "violet";

export type MascotAccessoryId = "none" | "round-glasses" | "tech-headphones";

export type MascotBackdropId =
  | "emerald-glow"
  | "indigo-night"
  | "sunset-amber"
  | "rose-quartz"
  | "slate-clean";

export interface MascotConfig {
  gender: MascotGender;
  skinTone: MascotSkinToneId;
  hairStyle: MascotHairStyle;
  hairColor: MascotHairColorId;
  outfit: MascotOutfitId;
  outfitColor: MascotOutfitColorId;
  accessory: MascotAccessoryId;
  backdrop: MascotBackdropId;
}

export interface SkinToneDef {
  id: MascotSkinToneId;
  name: string;
  baseHex: string;
  lightHex: string;
  shadowHex: string;
  blushHex: string;
}

export const SKIN_TONES: SkinToneDef[] = [
  {
    id: "fair",
    name: "ขาวอมชมพู (Fair Pink)",
    baseHex: "#FFDFC4",
    lightHex: "#FFF1E6",
    shadowHex: "#EABAA1",
    blushHex: "#FF9C9C",
  },
  {
    id: "peach",
    name: "ขาวเหลืองอบอุ่น (Warm Peach)",
    baseHex: "#F6D2B8",
    lightHex: "#FFE4D0",
    shadowHex: "#DEAC8E",
    blushHex: "#F28E82",
  },
  {
    id: "honey",
    name: "สีน้ำผึ้งธรรมชาติ (Golden Honey)",
    baseHex: "#E5B68A",
    lightHex: "#F5CEAA",
    shadowHex: "#C49265",
    blushHex: "#DE7A68",
  },
  {
    id: "tan",
    name: "ผิวแทนสุขภาพดี (Sun Tan)",
    baseHex: "#C98E5E",
    lightHex: "#DCAB7D",
    shadowHex: "#A76B3B",
    blushHex: "#BF6656",
  },
  {
    id: "bronze",
    name: "บรอนซ์คมเข้ม (Bronze)",
    baseHex: "#9B643A",
    lightHex: "#B47C50",
    shadowHex: "#77451F",
    blushHex: "#8B4B3F",
  },
  {
    id: "cocoa",
    name: "โกโก้เข้มมีมิติ (Deep Cocoa)",
    baseHex: "#683F25",
    lightHex: "#815234",
    shadowHex: "#4C2B16",
    blushHex: "#5E3125",
  },
];

export interface HairColorDef {
  id: MascotHairColorId;
  name: string;
  baseHex: string;
  lightHex: string;
  shadowHex: string;
}

export const HAIR_COLORS: HairColorDef[] = [
  {
    id: "jet-black",
    name: "ดำสนิท (Jet Black)",
    baseHex: "#1E2229",
    lightHex: "#374151",
    shadowHex: "#0F1115",
  },
  {
    id: "dark-brown",
    name: "น้ำตาลช็อกโกแลต (Dark Brown)",
    baseHex: "#4A3222",
    lightHex: "#694732",
    shadowHex: "#2E1C12",
  },
  {
    id: "caramel-blonde",
    name: "บลอนด์คาราเมล (Caramel)",
    baseHex: "#B8863A",
    lightHex: "#D9A859",
    shadowHex: "#8A5F20",
  },
  {
    id: "ash-silver",
    name: "เทาควันบุหรี่ (Ash Silver)",
    baseHex: "#88929A",
    lightHex: "#B0B9C0",
    shadowHex: "#5F6870",
  },
  {
    id: "rosewood",
    name: "น้ำตาลโรสวูด (Rosewood)",
    baseHex: "#7B3B3B",
    lightHex: "#9C5252",
    shadowHex: "#522424",
  },
  {
    id: "pastel-lilac",
    name: "ม่วงพาสเทล (Pastel Lilac)",
    baseHex: "#8E7CC3",
    lightHex: "#B4A7D6",
    shadowHex: "#674EA7",
  },
];

export interface HairStyleDef {
  id: MascotHairStyle;
  name: string;
  gender: MascotGender;
  description: string;
}

export const MALE_HAIR_STYLES: HairStyleDef[] = [
  { id: "short-messy", name: "Short Messy", gender: "male", description: "สั้นเซอร์มีวอลลุ่ม เป็นธรรมชาติ" },
  { id: "side-part", name: "Side Part Pompadour", gender: "male", description: "หวีเป๋ทรงสมาร์ท มาดนักบริหาร" },
  { id: "curly-crop", name: "Curly Crop", gender: "male", description: "ดัดลอนคิ้วท์สไตล์เกาหลี" },
  { id: "modern-fade", name: "Modern Fade", gender: "male", description: "ไถข้างสั้นเนี้ยบ คมชัดสไตล์สปอร์ต" },
  { id: "slick-back", name: "Slicked Back", gender: "male", description: "ปาดเรียบเนี้ยบ หรูหราไฮเอนด์" },
];

export const FEMALE_HAIR_STYLES: HairStyleDef[] = [
  { id: "bob-bangs", name: "Bob with Bangs", gender: "female", description: "บ๊อบสั้นหน้าม้าคิ้วท์ น่ารักสดใส" },
  { id: "long-wavy", name: "Long Wavy", gender: "female", description: "ลอนคลื่นยาวสลวย หวานละมุน" },
  { id: "high-ponytail", name: "High Ponytail", gender: "female", description: "หางม้าสูงทะมัดทะแมง มั่นใจ" },
  { id: "double-bun", name: "Double Space Bun", gender: "female", description: "ดังโงะคู่ ซุกซนมีชีวิตชีวา" },
  { id: "straight-lob", name: "Straight Lob", gender: "female", description: "ประบ่าเรียบหรู ดูแลตัวเองดี" },
];

export interface OutfitDef {
  id: MascotOutfitId;
  name: string;
  description: string;
}

export const OUTFITS: OutfitDef[] = [
  { id: "tech-hoodie", name: "Tech Hoodie", description: "เสื้อฮู้ดดี้สตรีทเทค ทันสมัย" },
  { id: "fintech-blazer", name: "FinTech Blazer", description: "สูทเบลเซอร์เนี้ยบ พร้อมเชิ้ตด้านใน" },
  { id: "casual-tshirt", name: "Casual Minimal T-Shirt", description: "เสื้อยืดคอกลมมินิมอล สบายๆ" },
  { id: "knit-sweater", name: "Cozy Knit Sweater", description: "สเวตเตอร์ไหมพรม อบอุ่นนุ่มนวล" },
  { id: "zip-polo", name: "Executive Zip Polo", description: "เสื้อโปโลซิปสปอร์ต คล่องตัว" },
];

export interface OutfitColorDef {
  id: MascotOutfitColorId;
  name: string;
  baseHex: string;
  lightHex: string;
  shadowHex: string;
}

export const OUTFIT_COLORS: OutfitColorDef[] = [
  { id: "emerald", name: "Emerald Tech", baseHex: "#10B981", lightHex: "#34D399", shadowHex: "#047857" },
  { id: "navy", name: "Deep Navy", baseHex: "#2563EB", lightHex: "#60A5FA", shadowHex: "#1D4ED8" },
  { id: "slate", name: "Obsidian Slate", baseHex: "#334155", lightHex: "#64748B", shadowHex: "#0F172A" },
  { id: "white", name: "Clean Ivory White", baseHex: "#E2E8F0", lightHex: "#FFFFFF", shadowHex: "#CBD5E1" },
  { id: "burgundy", name: "Royal Burgundy", baseHex: "#991B1B", lightHex: "#DC2626", shadowHex: "#7F1D1D" },
  { id: "amber", name: "Warm Amber", baseHex: "#D97706", lightHex: "#FBBF24", shadowHex: "#B45309" },
  { id: "rose", name: "Coral Rose", baseHex: "#E11D48", lightHex: "#FB7185", shadowHex: "#BE123C" },
  { id: "violet", name: "Electric Violet", baseHex: "#7C3AED", lightHex: "#A78BFA", shadowHex: "#5B21B6" },
];

export interface AccessoryDef {
  id: MascotAccessoryId;
  name: string;
}

export const ACCESSORIES: AccessoryDef[] = [
  { id: "none", name: "ไม่มีเครื่องประดับ (None)" },
  { id: "round-glasses", name: "แว่นตากลมมินิมอล (Round Glasses)" },
  { id: "tech-headphones", name: "หูฟังสตูดิโอเทค (Tech Headphones)" },
];

export interface BackdropDef {
  id: MascotBackdropId;
  name: string;
  innerHex: string;
  outerHex: string;
  ringHex: string;
}

export const BACKDROPS: BackdropDef[] = [
  { id: "emerald-glow", name: "Emerald Fintech", innerHex: "#10B981", outerHex: "#064E3B", ringHex: "#34D399" },
  { id: "indigo-night", name: "Indigo Night", innerHex: "#6366F1", outerHex: "#1E1B4B", ringHex: "#818CF8" },
  { id: "sunset-amber", name: "Sunset Amber", innerHex: "#F59E0B", outerHex: "#78350F", ringHex: "#FCD34D" },
  { id: "rose-quartz", name: "Rose Quartz", innerHex: "#EC4899", outerHex: "#701A75", ringHex: "#F472B6" },
  { id: "slate-clean", name: "Slate Minimal", innerHex: "#475569", outerHex: "#0F172A", ringHex: "#94A3B8" },
];

export const DEFAULT_MALE_MASCOT: MascotConfig = {
  gender: "male",
  skinTone: "peach",
  hairStyle: "side-part",
  hairColor: "jet-black",
  outfit: "fintech-blazer",
  outfitColor: "emerald",
  accessory: "round-glasses",
  backdrop: "emerald-glow",
};

export const DEFAULT_FEMALE_MASCOT: MascotConfig = {
  gender: "female",
  skinTone: "fair",
  hairStyle: "bob-bangs",
  hairColor: "dark-brown",
  outfit: "tech-hoodie",
  outfitColor: "navy",
  accessory: "none",
  backdrop: "indigo-night",
};

export function getRandomMascotConfig(preferredGender?: MascotGender): MascotConfig {
  const gender: MascotGender =
    preferredGender || (Math.random() > 0.5 ? "male" : "female");
  const hairStyles = gender === "male" ? MALE_HAIR_STYLES : FEMALE_HAIR_STYLES;

  const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    gender,
    skinTone: randomItem(SKIN_TONES).id,
    hairStyle: randomItem(hairStyles).id,
    hairColor: randomItem(HAIR_COLORS).id,
    outfit: randomItem(OUTFITS).id,
    outfitColor: randomItem(OUTFIT_COLORS).id,
    accessory: randomItem(ACCESSORIES).id,
    backdrop: randomItem(BACKDROPS).id,
  };
}
