"use client";

import React, { useId } from "react";
import {
  MascotConfig,
  SKIN_TONES,
  HAIR_COLORS,
  OUTFIT_COLORS,
  BACKDROPS,
  DEFAULT_MALE_MASCOT,
} from "@/lib/mascot-types";

export type MascotAvatarSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_MAP: Record<MascotAvatarSize, string> = {
  xs: "w-7 h-7 min-w-7 min-h-7",
  sm: "w-9 h-9 min-w-9 min-h-9",
  md: "w-12 h-12 min-w-12 min-h-12",
  lg: "w-20 h-20 min-w-20 min-h-20",
  xl: "w-36 h-36 min-w-36 min-h-36",
  "2xl": "w-56 h-56 min-w-56 min-h-56",
};

interface MascotAvatarProps {
  config?: MascotConfig;
  size?: MascotAvatarSize;
  className?: string;
  rounded?: "full" | "3xl" | "2xl" | "xl";
  showBackdrop?: boolean;
}

export function MascotAvatar({
  config = DEFAULT_MALE_MASCOT,
  size = "md",
  className = "",
  rounded = "2xl",
  showBackdrop = true,
}: MascotAvatarProps) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  // Resolve active theme definitions
  const skin = SKIN_TONES.find((s) => s.id === config.skinTone) || SKIN_TONES[1];
  const hair = HAIR_COLORS.find((h) => h.id === config.hairColor) || HAIR_COLORS[0];
  const outfitCol = OUTFIT_COLORS.find((o) => o.id === config.outfitColor) || OUTFIT_COLORS[0];
  const backdrop = BACKDROPS.find((b) => b.id === config.backdrop) || BACKDROPS[0];

  const isFemale = config.gender === "female";

  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;
  const roundedClass =
    rounded === "full"
      ? "rounded-full"
      : rounded === "3xl"
        ? "rounded-3xl"
        : rounded === "2xl"
          ? "rounded-2xl"
          : "rounded-xl";

  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden flex-shrink-0 shadow-xs select-none ${sizeClasses} ${roundedClass} ${className}`}
      style={{
        background: showBackdrop
          ? `linear-gradient(135deg, ${backdrop.innerHex} 0%, ${backdrop.outerHex} 100%)`
          : "transparent",
      }}
    >
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Backdrop Radial Halo Glow */}
          <radialGradient
            id={`${id}-halo`}
            cx="50%"
            cy="35%"
            r="60%"
            fx="50%"
            fy="35%"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
            <stop offset="60%" stopColor={backdrop.ringHex} stopOpacity="0.2" />
            <stop offset="100%" stopColor={backdrop.outerHex} stopOpacity="0" />
          </radialGradient>

          {/* Skin 3D Lighting */}
          <radialGradient
            id={`${id}-skin-face`}
            cx="48%"
            cy="38%"
            r="55%"
            fx="44%"
            fy="32%"
          >
            <stop offset="0%" stopColor={skin.lightHex} />
            <stop offset="55%" stopColor={skin.baseHex} />
            <stop offset="100%" stopColor={skin.shadowHex} />
          </radialGradient>

          {/* Neck Shading */}
          <linearGradient id={`${id}-skin-neck`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={skin.shadowHex} />
            <stop offset="40%" stopColor={skin.baseHex} />
            <stop offset="100%" stopColor={skin.shadowHex} />
          </linearGradient>

          {/* Hair 3D Shading */}
          <linearGradient id={`${id}-hair-grad`} x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor={hair.lightHex} />
            <stop offset="45%" stopColor={hair.baseHex} />
            <stop offset="100%" stopColor={hair.shadowHex} />
          </linearGradient>

          {/* Hair Specular Shine Overlay */}
          <linearGradient id={`${id}-hair-shine`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>

          {/* Outfit 3D Lighting */}
          <linearGradient id={`${id}-outfit-grad`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor={outfitCol.lightHex} />
            <stop offset="50%" stopColor={outfitCol.baseHex} />
            <stop offset="100%" stopColor={outfitCol.shadowHex} />
          </linearGradient>

          {/* Eye Iris Depth */}
          <radialGradient id={`${id}-iris-grad`} cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </radialGradient>

          {/* Soft Cheek Blush */}
          <radialGradient id={`${id}-blush`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={skin.blushHex} stopOpacity="0.5" />
            <stop offset="100%" stopColor={skin.blushHex} stopOpacity="0" />
          </radialGradient>

          {/* Chin Cast Shadow Filter/Gradient */}
          <radialGradient id={`${id}-chin-shadow`} cx="50%" cy="0%" r="80%">
            <stop offset="0%" stopColor={skin.shadowHex} stopOpacity="0.75" />
            <stop offset="100%" stopColor={skin.shadowHex} stopOpacity="0" />
          </radialGradient>

          {/* Glasses Lens Sheen */}
          <linearGradient id={`${id}-lens-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#FFFFFF" stopOpacity="0.1" />
            <stop offset="70%" stopColor="#60A5FA" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 1. Backdrop Ambient Halo Glow */}
        {showBackdrop && (
          <circle cx="120" cy="110" r="110" fill={`url(#${id}-halo)`} />
        )}

        {/* 2. Female Long Back Hair (Behind Body) */}
        {isFemale && config.hairStyle === "long-wavy" && (
          <g id="back-hair-long-wavy">
            <path
              d="M 68 115 C 50 145 42 185 52 235 C 72 238 90 230 92 215 C 94 185 86 150 82 130 Z"
              fill={`url(#${id}-hair-grad)`}
            />
            <path
              d="M 172 115 C 190 145 198 185 188 235 C 168 238 150 230 148 215 C 146 185 154 150 158 130 Z"
              fill={`url(#${id}-hair-grad)`}
            />
          </g>
        )}

        {isFemale && config.hairStyle === "high-ponytail" && (
          <g id="back-hair-ponytail">
            {/* Scrunchie band */}
            <ellipse cx="168" cy="62" rx="10" ry="8" fill={outfitCol.baseHex} />
            <path
              d="M 168 62 C 192 68 215 95 210 140 C 200 152 188 150 184 135 C 182 108 174 85 166 70 Z"
              fill={`url(#${id}-hair-grad)`}
            />
          </g>
        )}

        {isFemale && config.hairStyle === "double-bun" && (
          <g id="back-hair-double-buns">
            {/* Left Space Bun */}
            <circle cx="68" cy="58" r="22" fill={`url(#${id}-hair-grad)`} />
            <circle cx="68" cy="58" r="22" fill={`url(#${id}-hair-shine)`} opacity="0.4" />
            <ellipse cx="76" cy="74" rx="8" ry="4" fill={outfitCol.baseHex} />

            {/* Right Space Bun */}
            <circle cx="172" cy="58" r="22" fill={`url(#${id}-hair-grad)`} />
            <circle cx="172" cy="58" r="22" fill={`url(#${id}-hair-shine)`} opacity="0.4" />
            <ellipse cx="164" cy="74" rx="8" ry="4" fill={outfitCol.baseHex} />
          </g>
        )}

        {/* 3. Half-Body Torso & Outfits */}
        <g id="mascot-torso">
          {/* Torso Base Body Silhouette */}
          <path
            d="M 52 240 C 48 215 54 185 80 166 C 92 158 106 155 120 155 C 134 155 148 158 160 166 C 186 185 192 215 188 240 Z"
            fill={`url(#${id}-outfit-grad)`}
          />

          {/* Outfit Specific Styling */}
          {config.outfit === "casual-tshirt" && (
            <g id="outfit-tshirt">
              {/* Crewneck collar rim */}
              <path
                d="M 98 156 C 104 167 136 167 142 156 C 146 162 142 172 120 172 C 98 172 94 162 98 156 Z"
                fill={outfitCol.shadowHex}
              />
              {/* Shoulder stitch seams */}
              <path
                d="M 80 168 Q 94 185 96 220"
                stroke={outfitCol.shadowHex}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.5"
              />
              <path
                d="M 160 168 Q 146 185 144 220"
                stroke={outfitCol.shadowHex}
                strokeWidth="1.5"
                strokeDasharray="3 3"
                opacity="0.5"
              />
            </g>
          )}

          {config.outfit === "tech-hoodie" && (
            <g id="outfit-hoodie">
              {/* 3D Puffy Hoodie Collar */}
              <path
                d="M 88 152 C 96 172 144 172 152 152 C 160 165 158 182 120 182 C 82 182 80 165 88 152 Z"
                fill={outfitCol.lightHex}
              />
              <path
                d="M 94 156 C 100 174 140 174 146 156 C 150 168 142 178 120 178 C 98 178 90 168 94 156 Z"
                fill={outfitCol.shadowHex}
              />
              {/* Drawstrings with metal aglets */}
              <path d="M 108 176 L 107 206" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="105.5" y="204" width="3" height="6" rx="1.5" fill="#94A3B8" />

              <path d="M 132 176 L 133 206" stroke="#E2E8F0" strokeWidth="2.5" strokeLinecap="round" />
              <rect x="131.5" y="204" width="3" height="6" rx="1.5" fill="#94A3B8" />

              {/* Kangaroo Pocket arch */}
              <path
                d="M 82 232 C 95 218 145 218 158 232"
                stroke={outfitCol.shadowHex}
                strokeWidth="2"
                fill="none"
                opacity="0.6"
              />
            </g>
          )}

          {config.outfit === "fintech-blazer" && (
            <g id="outfit-blazer">
              {/* Inner crisp white shirt */}
              <polygon points="106,155 134,155 120,188" fill="#F8FAFC" />
              {/* Mini tie or collar fold */}
              <polygon points="117,162 123,162 122,185 120,189 118,185" fill={outfitCol.shadowHex} />

              {/* Left Lapel */}
              <path
                d="M 94 156 L 80 198 L 118 206 L 106 158 Z"
                fill={outfitCol.lightHex}
                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.15))"
              />
              {/* Right Lapel */}
              <path
                d="M 146 156 L 160 198 L 122 206 L 134 158 Z"
                fill={outfitCol.baseHex}
                filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.15))"
              />
              {/* Single metallic button */}
              <circle cx="120" cy="222" r="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1" />
            </g>
          )}

          {config.outfit === "knit-sweater" && (
            <g id="outfit-sweater">
              {/* Ribbed neck collar */}
              <path
                d="M 94 154 C 102 168 138 168 146 154 C 150 166 142 176 120 176 C 98 176 90 166 94 154 Z"
                fill={outfitCol.shadowHex}
              />
              {/* Knit texture ribs */}
              <line x1="104" y1="158" x2="104" y2="172" stroke={outfitCol.lightHex} strokeWidth="1.5" opacity="0.4" />
              <line x1="112" y1="160" x2="112" y2="174" stroke={outfitCol.lightHex} strokeWidth="1.5" opacity="0.4" />
              <line x1="120" y1="161" x2="120" y2="175" stroke={outfitCol.lightHex} strokeWidth="1.5" opacity="0.4" />
              <line x1="128" y1="160" x2="128" y2="174" stroke={outfitCol.lightHex} strokeWidth="1.5" opacity="0.4" />
              <line x1="136" y1="158" x2="136" y2="172" stroke={outfitCol.lightHex} strokeWidth="1.5" opacity="0.4" />
            </g>
          )}

          {config.outfit === "zip-polo" && (
            <g id="outfit-polo">
              {/* Polo collar wings */}
              <path d="M 94 155 L 110 174 L 116 156 Z" fill={outfitCol.shadowHex} />
              <path d="M 146 155 L 130 174 L 124 156 Z" fill={outfitCol.shadowHex} />
              {/* Zipper line & silver pull tab */}
              <line x1="120" y1="162" x2="120" y2="196" stroke="#94A3B8" strokeWidth="2" />
              <rect x="118.5" y="174" width="3" height="6" rx="1" fill="#F1F5F9" stroke="#475569" strokeWidth="0.8" />
            </g>
          )}
        </g>

        {/* 4. Cylindrical Neck & Under-chin Shadow */}
        <g id="mascot-neck">
          <path
            d="M 104 126 L 104 158 C 104 164 136 164 136 158 L 136 126 Z"
            fill={`url(#${id}-skin-neck)`}
          />
          {/* Chin drop shadow */}
          <ellipse cx="120" cy="134" rx="22" ry="8" fill={`url(#${id}-chin-shadow)`} />
        </g>

        {/* 5. Cute Ears (Behind head cheeks) */}
        <g id="mascot-ears">
          {/* Left Ear */}
          <ellipse cx="69" cy="106" rx="9" ry="13" fill={`url(#${id}-skin-face)`} />
          <ellipse cx="70" cy="106" rx="5" ry="8" fill={skin.shadowHex} opacity="0.6" />

          {/* Right Ear */}
          <ellipse cx="171" cy="106" rx="9" ry="13" fill={`url(#${id}-skin-face)`} />
          <ellipse cx="170" cy="106" rx="5" ry="8" fill={skin.shadowHex} opacity="0.6" />
        </g>

        {/* 6. Rounded Cute 3D Head Base */}
        <g id="mascot-head">
          <ellipse
            cx="120"
            cy="102"
            rx="49"
            ry="50"
            fill={`url(#${id}-skin-face)`}
            filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.08))"
          />

          {/* Cute Rosy Blushing Cheeks */}
          <circle cx="88" cy="114" r="11" fill={`url(#${id}-blush)`} />
          <circle cx="152" cy="114" r="11" fill={`url(#${id}-blush)`} />
        </g>

        {/* 7. Expressive 3D Glossy Eyes & Eyebrows */}
        <g id="mascot-eyes">
          {/* Eyebrows */}
          {isFemale ? (
            // Feminine soft arched eyebrows
            <>
              <path
                d="M 80 85 Q 92 81 103 85"
                stroke={hair.shadowHex}
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 137 85 Q 148 81 160 85"
                stroke={hair.shadowHex}
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : (
            // Male confident groomed eyebrows
            <>
              <path
                d="M 78 84 Q 92 81 104 84"
                stroke={hair.shadowHex}
                strokeWidth="3.4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 136 84 Q 148 81 162 84"
                stroke={hair.shadowHex}
                strokeWidth="3.4"
                strokeLinecap="round"
                fill="none"
              />
            </>
          )}

          {/* Left Eye */}
          <g id="left-eye">
            {/* Eye Sclera White */}
            <ellipse cx="92" cy="99" rx="10" ry="11" fill="#FFFFFF" />
            {/* Glossy Iris */}
            <ellipse cx="92" cy="99" rx="8.5" ry="9.5" fill={`url(#${id}-iris-grad)`} />
            {/* Pupil Depth */}
            <circle cx="92" cy="99" r="5" fill="#0A0F1D" />
            {/* Primary Catchlight (Sparkle) */}
            <circle cx="89" cy="95" r="3.2" fill="#FFFFFF" />
            {/* Secondary Tiny Specular Sparkle */}
            <circle cx="95" cy="102" r="1.4" fill="#FFFFFF" opacity="0.85" />

            {/* Female upper eyelash wing */}
            {isFemale && (
              <>
                <path
                  d="M 82 96 Q 92 90 102 96"
                  stroke="#1E293B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 102 96 Q 106 93 107 90"
                  stroke="#1E293B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* Right Eye */}
          <g id="right-eye">
            {/* Eye Sclera White */}
            <ellipse cx="148" cy="99" rx="10" ry="11" fill="#FFFFFF" />
            {/* Glossy Iris */}
            <ellipse cx="148" cy="99" rx="8.5" ry="9.5" fill={`url(#${id}-iris-grad)`} />
            {/* Pupil Depth */}
            <circle cx="148" cy="99" r="5" fill="#0A0F1D" />
            {/* Primary Catchlight (Sparkle) */}
            <circle cx="145" cy="95" r="3.2" fill="#FFFFFF" />
            {/* Secondary Tiny Specular Sparkle */}
            <circle cx="151" cy="102" r="1.4" fill="#FFFFFF" opacity="0.85" />

            {/* Female upper eyelash wing */}
            {isFemale && (
              <>
                <path
                  d="M 138 96 Q 148 90 158 96"
                  stroke="#1E293B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 158 96 Q 162 93 163 90"
                  stroke="#1E293B"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            )}
          </g>

          {/* 8. Cute Button Nose & Sweet Smile */}
          <g id="mascot-nose-mouth">
            {/* Nose button with soft shadow */}
            <ellipse cx="120" cy="112" rx="4.5" ry="3.5" fill={skin.shadowHex} opacity="0.45" />
            <circle cx="119" cy="110.5" r="1.2" fill="#FFFFFF" opacity="0.55" />

            {/* Friendly Warm Smile */}
            <path
              d="M 111 121 Q 120 128 129 121"
              stroke="#B91C1C"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            {/* Bottom lip soft glow */}
            <path
              d="M 114 125 Q 120 128 126 125"
              stroke={skin.shadowHex}
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            />
          </g>
        </g>

        {/* 9. Front Hair Layers (Male & Female Styles) */}
        <g id="mascot-front-hair">
          {/* MALE STYLES */}
          {!isFemale && config.hairStyle === "short-messy" && (
            <g id="hair-short-messy">
              {/* Crown Volume */}
              <path
                d="M 68 85 C 60 55 85 40 120 38 C 155 40 180 55 172 85 C 168 85 162 76 156 70 C 146 80 136 68 124 66 C 114 74 100 68 88 72 C 78 78 72 85 68 85 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Forehead Textured Clumps */}
              <path
                d="M 80 72 C 90 88 98 76 108 84 C 118 72 130 86 142 74 C 150 82 158 76 164 80 C 160 62 148 54 120 54 C 92 54 84 62 80 72 Z"
                fill={`url(#${id}-hair-grad)`}
              />
            </g>
          )}

          {!isFemale && config.hairStyle === "side-part" && (
            <g id="hair-side-part">
              {/* Smart Executive Pompadour Sweep */}
              <path
                d="M 66 88 C 62 60 76 44 106 38 C 142 32 176 45 174 85 C 172 75 166 65 152 64 C 130 62 108 68 94 78 C 84 85 76 88 66 88 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Part line definition */}
              <path
                d="M 72 76 C 88 62 120 56 162 68"
                stroke={hair.lightHex}
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}

          {!isFemale && config.hairStyle === "curly-crop" && (
            <g id="hair-curly-crop">
              {/* Korean-style textured curls */}
              <circle cx="82" cy="52" r="16" fill={`url(#${id}-hair-grad)`} />
              <circle cx="106" cy="44" r="18" fill={`url(#${id}-hair-grad)`} />
              <circle cx="134" cy="44" r="18" fill={`url(#${id}-hair-grad)`} />
              <circle cx="158" cy="52" r="16" fill={`url(#${id}-hair-grad)`} />
              <circle cx="94" cy="66" r="14" fill={`url(#${id}-hair-grad)`} />
              <circle cx="120" cy="64" r="15" fill={`url(#${id}-hair-grad)`} />
              <circle cx="146" cy="66" r="14" fill={`url(#${id}-hair-grad)`} />
            </g>
          )}

          {!isFemale && config.hairStyle === "modern-fade" && (
            <g id="hair-modern-fade">
              {/* Clean fade sides */}
              <path
                d="M 68 95 L 72 75 C 80 50 110 44 120 44 C 130 44 160 50 168 75 L 172 95 C 168 85 160 76 150 74 C 132 70 108 70 90 74 C 80 76 72 85 68 95 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Clean crop bangs line */}
              <path
                d="M 85 74 L 155 74 C 150 60 138 52 120 52 C 102 52 90 60 85 74 Z"
                fill={hair.lightHex}
                opacity="0.8"
              />
            </g>
          )}

          {!isFemale && config.hairStyle === "slick-back" && (
            <g id="hair-slick-back">
              <path
                d="M 68 86 C 64 56 82 42 120 40 C 158 42 176 56 172 86 C 166 70 154 62 120 60 C 86 62 74 70 68 86 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Slick back combed tracks */}
              <path d="M 88 56 Q 120 48 152 56" stroke={hair.lightHex} strokeWidth="2" opacity="0.7" />
              <path d="M 94 66 Q 120 58 146 66" stroke={hair.lightHex} strokeWidth="2" opacity="0.7" />
            </g>
          )}

          {/* FEMALE STYLES */}
          {isFemale && config.hairStyle === "bob-bangs" && (
            <g id="hair-bob-bangs">
              {/* Crown and Chic Side Bobs Framing Face */}
              <path
                d="M 66 80 C 58 50 82 36 120 36 C 158 36 182 50 174 80 C 182 110 175 142 166 148 C 160 148 158 126 156 105 C 146 100 138 98 120 98 C 102 98 94 100 84 105 C 82 126 80 148 74 148 C 65 142 58 110 66 80 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Cute Straight/Curved Bangs */}
              <path
                d="M 82 92 C 94 95 106 96 120 96 C 134 96 146 95 158 92 C 154 74 144 60 120 60 C 96 60 86 74 82 92 Z"
                fill={`url(#${id}-hair-grad)`}
              />
            </g>
          )}

          {isFemale && config.hairStyle === "long-wavy" && (
            <g id="hair-long-wavy-front">
              {/* Crown and cascading front shoulder waves */}
              <path
                d="M 66 80 C 60 48 84 36 120 36 C 156 36 180 48 174 80 C 180 105 186 140 180 175 C 172 178 166 165 165 140 C 162 108 156 88 140 85 C 128 83 112 83 100 85 C 84 88 78 108 75 140 C 74 165 68 178 60 175 C 54 140 60 105 66 80 Z"
                fill={`url(#${id}-hair-grad)`}
              />
            </g>
          )}

          {isFemale && config.hairStyle === "high-ponytail" && (
            <g id="hair-high-ponytail-front">
              <path
                d="M 68 84 C 64 52 84 38 120 38 C 156 38 176 52 172 84 C 166 72 152 64 120 64 C 88 64 74 72 68 84 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Side wisps/bangs */}
              <path d="M 72 82 Q 68 105 72 118" stroke={`url(#${id}-hair-grad)`} strokeWidth="4" strokeLinecap="round" />
              <path d="M 168 82 Q 172 105 168 118" stroke={`url(#${id}-hair-grad)`} strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {isFemale && config.hairStyle === "double-bun" && (
            <g id="hair-double-bun-front">
              {/* Front hair with center part */}
              <path
                d="M 68 84 C 64 52 84 40 120 44 C 156 40 176 52 172 84 C 166 72 154 68 120 70 C 86 68 74 72 68 84 Z"
                fill={`url(#${id}-hair-grad)`}
              />
              {/* Cute front tendrils */}
              <path d="M 78 80 Q 72 105 76 120" stroke={`url(#${id}-hair-grad)`} strokeWidth="3" strokeLinecap="round" />
              <path d="M 162 80 Q 168 105 164 120" stroke={`url(#${id}-hair-grad)`} strokeWidth="3" strokeLinecap="round" />
            </g>
          )}

          {isFemale && config.hairStyle === "straight-lob" && (
            <g id="hair-straight-lob">
              {/* Sleek straight cut framing collarbones */}
              <path
                d="M 66 78 C 58 48 84 36 120 36 C 156 36 182 48 174 78 C 182 110 180 155 174 185 C 168 186 164 168 162 135 C 158 98 152 82 120 80 C 88 82 82 98 78 135 C 76 168 72 186 66 185 C 60 155 58 110 66 78 Z"
                fill={`url(#${id}-hair-grad)`}
              />
            </g>
          )}

          {/* 3D Hair Specular Shine Halo across the crown */}
          <path
            d="M 80 56 Q 120 42 160 56"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.35"
          />
        </g>

        {/* 10. Accessories */}
        {config.accessory === "round-glasses" && (
          <g id="accessory-glasses">
            {/* Left Lens Frame */}
            <circle
              cx="92"
              cy="99"
              r="14"
              fill={`url(#${id}-lens-sheen)`}
              stroke="#D4AF37"
              strokeWidth="2.2"
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.2))"
            />
            {/* Right Lens Frame */}
            <circle
              cx="148"
              cy="99"
              r="14"
              fill={`url(#${id}-lens-sheen)`}
              stroke="#D4AF37"
              strokeWidth="2.2"
              filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.2))"
            />
            {/* Bridge between lenses */}
            <path
              d="M 106 97 Q 120 94 134 97"
              stroke="#D4AF37"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Temple arms */}
            <line x1="78" y1="98" x2="68" y2="102" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
            <line x1="162" y1="98" x2="172" y2="102" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" />
            {/* Specular glare streak across glass */}
            <path
              d="M 84 92 L 96 106"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M 140 92 L 152 106"
              stroke="#FFFFFF"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
          </g>
        )}

        {config.accessory === "tech-headphones" && (
          <g id="accessory-headphones">
            {/* Arched Headband */}
            <path
              d="M 64 102 C 60 48 90 32 120 32 C 150 32 180 48 176 102"
              stroke="#0F172A"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 72 88 C 76 52 95 40 120 40 C 145 40 164 52 168 88"
              stroke={outfitCol.baseHex}
              strokeWidth="2.5"
              fill="none"
            />

            {/* Left Ear Cup */}
            <rect
              x="57"
              y="94"
              width="14"
              height="26"
              rx="7"
              fill="#1E293B"
              stroke={outfitCol.baseHex}
              strokeWidth="2"
            />
            {/* Right Ear Cup */}
            <rect
              x="169"
              y="94"
              width="14"
              height="26"
              rx="7"
              fill="#1E293B"
              stroke={outfitCol.baseHex}
              strokeWidth="2"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
