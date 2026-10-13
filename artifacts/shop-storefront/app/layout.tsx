import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { STORE_NAME } from "@/components/brand";
import "./globals.css";

export const metadata: Metadata = {
  title: `${STORE_NAME} — مكتبة الاكتشاف`,
  description: "اكتشف عوالم جديدة بين رفوف الكتب. تصفح مكتبة مفتوحة من العناوين والأنواع.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Suspense fallback={<div className="topbar">رفوف · مكتبة الاكتشاف</div>}><SiteHeader /></Suspense>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
