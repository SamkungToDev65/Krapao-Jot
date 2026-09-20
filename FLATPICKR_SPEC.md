# Flatpickr Thai (th) Specification — Krapao Jot

> **Status:** Production Standard  
> **Version:** 1.0.0  
> **Target Platforms:** Web (Desktop, Tablet, Mobile PWA)  
> **Locale:** Thai (`th`) with Buddhist Era (พ.ศ.) & CE (ค.ศ.) support  
> **Design Compliance:** Bank-Grade FinTech, Strict NO Emojis, Tailwind CSS Variables

---

## 1. วัตถุประสงค์และภาพรวม (Overview & Goals)

เอกสารฉบับนี้กำหนดมาตรฐานการใช้งาน **Flatpickr Thai (`flatpickr th`)** เป็นระบบ Date & Time Picker มาตรฐานพื้นฐานของทั้งโปรเจกต์ **Krapao Jot** โดยมีเป้าหมายหลัก:

1. **ภาษาไทยสมบูรณ์ (100% Thai Localization):** ใช้ชื่อวันย่อ (`อา, จ, อ, พ, พฤ, ศ, ส`) และชื่อเดือนภาษาไทย (`มกราคม - ธันวาคม` / `ม.ค. - ธ.ค.`)
2. **จัดเก็บแบบสากล แสดงผลแบบไทย:**
   - **เบื้องหลัง (Value/Database):** บันทึกเป็น ISO `YYYY-MM-DD` (ค.ศ.) เสมอ เพื่อความเข้ากันได้ 100% กับ Supabase, PostgreSQL และ JavaScript Date API
   - **เบื้องหน้า (Display/UI):** แสดงผลเป็น วัน เดือน ปี พ.ศ. หรือ ค.ศ. ที่อ่านง่าย
3. **รองรับอุปกรณ์พกพาและมือถือ (Mobile-First Responsiveness):** บังคับใช้ `disableMobile: true` เพื่อป้องกันไม่ให้เบราว์เซอร์มือถือ (iOS Safari / Android Chrome) สลับไปใช้ Native Picker ภาษาอังกฤษ และจัดวาง Calendar ในรูปแบบ Bottom Sheet / Modal พร้อม Backdrop เพื่อการแตะสัมผัสที่แม่นยำ
4. **มาตรฐาน FinTech Enterprise & NO Emojis:** ดีไซน์สอดคล้องกับโทนสีหลักของระบบ (`--bg-surface`, `--border-subtle`, `--accent-mint`) และใช้ SVG Icons เท่านั้น

---

## 2. การติดตั้งและ Dependency (Installation)

```bash
npm install flatpickr
```

### การ Import ในโค้ด
```typescript
import flatpickr from "flatpickr";
import { Thai } from "flatpickr/dist/l10n/th.js";
import "flatpickr/dist/flatpickr.min.css";
```

---

## 3. สเปกการตั้งค่าหลัก (Core Configuration Specs)

การเรียกใช้ Flatpickr ในโปรเจกต์ต้องมีค่าคอนฟิกพื้นฐานดังนี้:

| Property | Value | คำอธิบาย |
|---|---|---|
| `locale` | `Thai` (`"th"`) | ใช้การแปลภาษาไทยจาก `flatpickr/dist/l10n/th.js` |
| `dateFormat` | `"Y-m-d"` | รูปแบบข้อมูลจริงที่ส่งเข้า Form/Database (`2026-09-20`) |
| `altInput` | `true` | แยก Input แสดงผลสำหรับผู้ใช้ออกจาก Hidden Input |
| `altFormat` | `"j F Y"` | รูปแบบแสดงผล เช่น `20 กันยายน 2026` |
| `disableMobile` | `false` | ตัวเลือกเริ่มต้น ให้ Flatpickr แสดงหน้าตาปฏิทินของตัวเองบนมือถือ |
| `static` | `true` | ทำให้ปฏิทินแสดงผลคงที่และจัดตำแหน่งได้ง่ายขึ้นบนหน้าจอเล็ก |
| `prevArrow` | SVG Chevron Left | ห้ามใช้ตัวอักษรหรือ Emoji |
| `nextArrow` | SVG Chevron Right | ห้ามใช้ตัวอักษรหรือ Emoji |

---

## 4. สเปกสำหรับมือถือ (Mobile Support Specs)

### 4.1 ทำไมต้องใช้ `disableMobile: true`?
บนสมาร์ตโฟน (iOS / Android) ถ้าไม่ปิด `disableMobile`:
- เบราว์เซอร์จะเปิด Wheel Picker ประจำเครื่องซึ่งมักเป็นภาษาอังกฤษ
- ไม่รองรับการแสดงผลเดือนภาษาไทยและปี พ.ศ.
- รูปแบบ Input จะไม่ตรงกับดีไซน์ FinTech ของระบบ

### 4.2 สไตล์และการจัดวางบนหน้าจอมือถือ (`< 640px`)
1. **Modal / Bottom Sheet Center:**
   - แสดงผลแบบ Centered Popover หรือ Bottom Sheet พร้อมฉากหลังทึบแสง (`backdrop-blur-xs bg-black/50`)
   - ป้องกันปฏิทินล้นขอบจอซ้าย-ขวา
2. **Touch Target Size (ขนาดจุดสัมผัส):**
   - ช่องวันที่ (`.flatpickr-day`): ขนาดไม่ต่ำกว่า **40px × 40px** เพื่อให้กดด้วยนิ้วโป้งได้แม่นยำ
   - ปุ่มเลื่อนเดือน (`.flatpickr-prev-month`, `.flatpickr-next-month`): ขนาดไม่ต่ำกว่า **36px × 36px**
3. **Quick Action Shortcuts (ปุ่มลัดสำหรับมือถือ):**
   - แถบปุ่มลัดด้านล่างปฏิทิน:
     - `วันนี้` (Today)
     - `เมื่อวาน` (Yesterday)
     - `ต้นเดือน` (1st of Month)
     - `ล้างค่า` (Clear)

---

## 5. การแปลงปี พ.ศ. (Buddhist Era Conversion Spec)

สำหรับฟิลด์ที่ต้องการแสดงปี พ.ศ. ในรูปแบบทางการ:

```typescript
export function formatThaiDateBE(date: Date | string, format: "short" | "medium" | "long" = "medium"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const day = d.getDate();
  const monthNamesShort = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const monthNamesLong = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
  const yearBE = d.getFullYear() + 543;

  if (format === "short") {
    return `${day}/${d.getMonth() + 1}/${yearBE}`;
  }
  if (format === "long") {
    return `${day} ${monthNamesLong[d.getMonth()]} พ.ศ. ${yearBE}`;
  }
  return `${day} ${monthNamesShort[d.getMonth()]} ${yearBE}`;
}
```

---

## 6. สไตล์ธีม CSS สำหรับ Flatpickr (Tailwind / Krapao Jot)

ใส่ไว้ใน `src/app/globals.css` หรือสร้างไฟล์ `src/styles/flatpickr-custom.css`:

```css
/* ================= KRAPAO JOT FLATPICKR THAI THEME ================= */
.flatpickr-calendar {
  background: var(--bg-surface) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: 1.25rem !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  font-family: var(--font-sans) !important;
  padding: 0.75rem !important;
  width: 320px !important;
  overflow: hidden !important;
  z-index: 99999 !important;
}

.flatpickr-calendar::before,
.flatpickr-calendar::after {
  display: none !important;
}

/* Header Month & Year */
.flatpickr-months {
  padding-bottom: 0.5rem !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  align-items: center !important;
}

.flatpickr-current-month {
  font-size: 0.9375rem !important;
  font-weight: 700 !important;
  color: var(--fg-primary) !important;
  padding-top: 0.25rem !important;
}

.flatpickr-current-month .cur-month {
  font-weight: 700 !important;
  color: var(--fg-primary) !important;
}

.flatpickr-current-month .numInputWrapper span {
  display: none !important;
}

/* Prev / Next Arrows */
.flatpickr-prev-month,
.flatpickr-next-month {
  padding: 0.35rem !important;
  border-radius: 0.625rem !important;
  color: var(--fg-muted) !important;
  fill: var(--fg-muted) !important;
  transition: all 0.15s ease !important;
}

.flatpickr-prev-month:hover,
.flatpickr-next-month:hover {
  background: var(--bg-canvas) !important;
  color: var(--fg-primary) !important;
  fill: var(--fg-primary) !important;
}

/* Weekday Row */
span.flatpickr-weekday {
  color: var(--fg-muted) !important;
  font-weight: 600 !important;
  font-size: 0.75rem !important;
}

/* Day Cells */
.flatpickr-day {
  border-radius: 0.625rem !important;
  color: var(--fg-primary) !important;
  font-size: 0.8125rem !important;
  font-weight: 500 !important;
  height: 38px !important;
  line-height: 38px !important;
  margin: 2px !important;
  border: 1px solid transparent !important;
  transition: all 0.15s ease !important;
}

.flatpickr-day:hover {
  background: rgba(16, 185, 129, 0.12) !important;
  border-color: rgba(16, 185, 129, 0.2) !important;
  color: #10B981 !important;
}

.flatpickr-day.today {
  border-color: #10B981 !important;
  color: #10B981 !important;
  font-weight: 700 !important;
}

.flatpickr-day.selected,
.flatpickr-day.selected:hover {
  background: #10B981 !important;
  border-color: #10B981 !important;
  color: #FFFFFF !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 10px rgba(16, 185, 129, 0.3) !important;
}

.flatpickr-day.flatpickr-disabled,
.flatpickr-day.prevMonthDay,
.flatpickr-day.nextMonthDay {
  color: var(--fg-muted) !important;
  opacity: 0.35 !important;
}

/* Mobile Responsive Modal Overrides */
@media (max-width: 640px) {
  .flatpickr-calendar.has-mobile-modal {
    position: fixed !important;
    left: 50% !important;
    top: 50% !important;
    transform: translate(-50%, -50%) !important;
    width: min(340px, 92vw) !important;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35) !important;
  }
}
```

---

## 7. มาตรฐาน React Component: `<ThaiDatePicker />`

คอมโพเนนต์ทางการของโปรเจกต์อยู่ที่:  
`src/components/ui/thai-date-picker.tsx`

### Interface
```typescript
export interface ThaiDatePickerProps {
  value: string; // ISO format "YYYY-MM-DD"
  onChange: (dateStr: string) => void;
  label?: string;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  showBuddhistEra?: boolean; // Default true: แสดง พ.ศ.
  showShortcuts?: boolean;   // Default true: แสดงปุ่มลัดบนมือถือ
}
```

### การใช้งาน (Example Usage)
```tsx
import { ThaiDatePicker } from "@/components/ui/thai-date-picker";

export function TransactionForm() {
  const [date, setDate] = useState("2026-09-20");

  return (
    <ThaiDatePicker
      label="วันที่ทำรายการ"
      value={date}
      onChange={setDate}
      showBuddhistEra={true}
      showShortcuts={true}
    />
  );
}
```

---

## 8. กฎเหล็กสำหรับนักพัฒนาและ AI Agent (Rules)

1. **ห้ามใช้ Native `<input type="date">` โดดๆ โดยไม่มี Thai Localization** ในหน้าฟอร์มที่ผู้ใช้มองเห็น
2. **ห้ามใส่ Emoji** ในปุ่มลัด ตัวเลือก หรือหัวปฏิทิน ให้ใช้ SVG Icons เท่านั้น
3. **จัดเก็บเป็น ISO ค.ศ. เสมอ (`YYYY-MM-DD`)** ใน Store, Database, และ Query Parameters
4. **ต้องเปิด `disableMobile: true` เสมอ** ใน Flatpickr options เพื่อป้องกันการหลุดไปเป็นเบราว์เซอร์อังกฤษ
5. **Form Validation ต้องเป็น Inline Message** (กรอบแดง + ข้อความสีแดงใต้ Input) ห้ามใช้ Browser Native Popup
