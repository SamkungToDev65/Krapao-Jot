"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";

function ThemeColorMetaSync() {
  const { resolvedTheme } = useTheme();

  React.useEffect(() => {
    const updateStatusTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const targetColor = isDark ? "#090D16" : "#FFFFFF";

      // 1. Force update all theme-color meta tags
      const metas = document.querySelectorAll('meta[name="theme-color"]');
      if (metas.length > 0) {
        metas.forEach((m, idx) => {
          m.removeAttribute("media");
          m.setAttribute("content", targetColor);
          if (idx > 0) m.remove();
        });
      } else {
        const meta = document.createElement("meta");
        meta.setAttribute("name", "theme-color");
        meta.setAttribute("content", targetColor);
        document.head.appendChild(meta);
      }

      // 2. Force update apple-mobile-web-app-status-bar-style
      const appleMetas = document.querySelectorAll(
        'meta[name="apple-mobile-web-app-status-bar-style"]'
      );
      if (appleMetas.length > 0) {
        appleMetas.forEach((m) =>
          m.setAttribute("content", isDark ? "black-translucent" : "default")
        );
      } else {
        const apple = document.createElement("meta");
        apple.setAttribute("name", "apple-mobile-web-app-status-bar-style");
        apple.setAttribute("content", isDark ? "black-translucent" : "default");
        document.head.appendChild(apple);
      }
    };

    updateStatusTheme();

    // Observe changes to html class for immediate synchronization
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          updateStatusTheme();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeColorMetaSync />
      {children}
    </NextThemesProvider>
  );
}

