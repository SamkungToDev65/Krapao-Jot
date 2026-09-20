import type { Metadata, Viewport } from "next";
import { Prompt, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ToastProvider } from "@/lib/toast-context";
import { PWARegister } from "@/components/pwa-register";

const prompt = Prompt({
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-prompt",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Krapao Jot - กระเป๋าจด | สมาร์ทกระเป๋าตัง บันทึกรายรับรายจ่ายและบัตรเครดิต",
  description: "เว็บแอพ PWA จัดการกระเป๋าเงิน บันทึกรายรับ-รายจ่าย แจ้งเตือนรอบบิลบัตรเครดิต และบริหารค่า Subscription รายเดือน",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "กระเป๋าจด",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${prompt.variable} ${plusJakarta.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  var color = isDark ? '#090D16' : '#FFFFFF';
                  var meta = document.querySelector('meta[name="theme-color"]');
                  if (meta) {
                    meta.removeAttribute('media');
                    meta.setAttribute('content', color);
                  }
                  var apple = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
                  if (apple) {
                    apple.setAttribute('content', isDark ? 'black-translucent' : 'default');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className="min-h-screen bg-[var(--bg-canvas)] text-[var(--fg-primary)] font-sans antialiased transition-colors duration-200"
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            {children}
            <PWARegister />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
