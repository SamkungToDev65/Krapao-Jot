<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Design & Coding Guidelines (Krapao Jot)

- **Strictly NO Emojis**: Do NOT use emojis anywhere in the UI, button labels, toasts, badges, or titles. All visual cues must use SVG icons only (`lucide-react` or `@phosphor-icons/react`).
- **Professional Enterprise Aesthetic**: Maintain a clean, high-precision, bank-grade FinTech design (similar to Stripe, Linear, Mercury, Vercel). Avoid informal or playful gimmicks.
- **Typography & Layout**: Clean typography hierarchy, subtle borders (`border-subtle`), refined dark/light modes, accessible contrast.
- **Form Validation Standard (No Native Popups)**: Never use or trigger default browser validation popups (e.g. `Please fill out this field`). Always add `noValidate` to `<form>`. Show validation errors directly on the UI using:
  1. Red/rose border on the invalid input field (`border-rose-500 focus:border-rose-500 focus:ring-rose-500/20`).
  2. Contextual error message text directly underneath the input field (`text-xs text-rose-500 dark:text-rose-400 mt-1 font-medium`).
- **User Feedback & Notification System Standards**:
  The application must provide appropriate user feedback based on the situation, strictly adhering to the **NO Emojis** rule and using clean SVG icons only (`lucide-react` / `@phosphor-icons/react`):
  1. **Toast Notification (Auto-Dismiss 3–4s)**:
     - ใช้สำหรับแจ้งเตือนผลลัพธ์การทำงานทั่วไปที่หายไปเอง (e.g. "บันทึกข้อมูลสำเร็จ", "คัดลอกข้อมูลแล้ว")
     - แสดงผลพร้อมไอคอน SVG ตามประเภท (`CheckCircle2`, `AlertCircle`, `AlertTriangle`, `Info`) และมีปุ่มกดปิด [X]
  2. **Snackbar (With Action)**:
     - คล้าย Toast แต่มีปุ่ม Action ให้ผู้ใช้กดทันที (e.g. "ลบรายการเรียบร้อยแล้ว [เลิกทำ / UNDO]")
  3. **Alert Dialog (Modal Popup)**:
     - ป๊อปอัปบังคับตอบ สำหรับข้อผิดพลาดสำคัญระดับระบบที่ไม่สามารถดำเนินต่อได้ (e.g. "ไม่สามารถเชื่อมต่อฐานข้อมูลได้")
  4. **Confirmation Dialog (Destructive Actions)**:
     - บังคับใช้ก่อนทำรายการที่มีผลกระทบร้ายแรงหรือย้อนกลับไม่ได้ (e.g. "คุณต้องการลบบัญชีนี้ใช่หรือไม่?") มีปุ่ม [ยกเลิก] และปุ่มยืนยันอันตราย [ลบข้อมูล] (`bg-rose-600`)
  5. **Inline Notification**:
     - แจ้งเตือนข้อผิดพลาดหรือคำแนะนำภายในหน้าฟอร์ม (Red border + ข้อความสีแดงใต้ Input)
  6. **Banner Notification**:
     - แถบแจ้งเตือนระดับบนสุดของหน้าเว็บ สำหรับแจ้งสถานะระบบ (e.g. "กำลังทำงานในโหมดออฟไลน์", "กำลังซิงค์ข้อมูลกับคลาวด์")
  7. **Badge & In-App Notification**:
     - ตัวเลขแจ้งเตือนบนไอคอน (e.g. บิลบัตรเครดิตที่ใกล้ถึงกำหนดชำระ, การแจ้งเตือนค่า Subscription)
- **Flatpickr Thai Standard (Base DatePicker Specification)**:
  Every DatePicker in Krapao Jot must comply with [FLATPICKR_SPEC.md](file:///d:/Krapao%20Jot/FLATPICKR_SPEC.md):
  1. Use Flatpickr Thai (`locale: Thai` from `flatpickr/dist/l10n/th.js`).
  2. Always set `disableMobile: true` to prevent unlocalized native English browser pickers.
  3. Support mobile responsive viewports with touch targets (min 40px × 40px) and modal backdrop.
  4. Display Thai month names and Buddhist Era (พ.ศ.) while storing standard ISO `YYYY-MM-DD` in backend/state.
  5. Strictly NO Emojis (SVG arrows only).
- **60-30-10 Color Rule (กฎการแบ่งสัดส่วนการใช้สีอย่างเป็นระบบ)**:
  ป้องกันไม่ให้หน้าจอมีสีสะเปะสะปะหรือดูไม่เป็นมืออาชีพ เพื่อให้งานออกแบบมีความสมดุล สบายตา และนำสายตาอย่างมีแบบแผน (Bank-Grade FinTech Balance):
  1. **60% Dominant Color (สีหลัก - พื้นหลังและพื้นผิว)**: พื้นที่ส่วนใหญ่ 60% ต้องเป็นสี Neutral สะอาดตา (`--bg-canvas`, `--bg-surface`, ขาว/เทา/ดำเนียนตา) เพื่อสร้างความสงบ สบายตา และโปร่งโล่ง
  2. **30% Secondary Color (สีรอง - โครงสร้างและเนื้อหา)**: พื้นที่ 30% สำหรับตัวหนังสือ Typography, เส้นขอบ (`--border-subtle`), ไอคอนรอง, ป้ายกำกับทั่วไป (`--fg-primary`, `--fg-muted`, Slate/Zinc) เพื่อสร้าง Hierarchy และ Contrast ที่อ่านง่าย
  3. **10% Accent Color (สีเน้น - จุดนำสายตาและการกระทำ)**: พื้นที่เพียง 10% สำหรับ Call-to-Action (CTA), สถานะ Active, จุดไฮไลท์สำคัญ โดยใช้แบรนด์สีหลักของระบบ (`Emerald-500/600`) และใช้สี Semantic เมื่อจำเป็นเท่านั้น (เช่น Rose สำหรับยอดค้าง/อันตราย) **ห้ามสาดสีรุ้งหรือผสมหลายเฉดสี (Amber, Indigo, Purple, Blue, Cyan) มั่วซั่วในหน้าเดียวกัน**
