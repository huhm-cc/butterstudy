import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TrackView } from "@/components/track-view";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://butterstudy.vercel.app"),
  title: {
    default: "ButterStudy — 上傳文章,AI 幫你畫重點",
    template: "%s · ButterStudy",
  },
  description:
    "ButterStudy 幫你畫重點:上傳 PDF、TXT、Markdown 或圖片,自動整理章節、重點與結論,讀不懂就問 AI,讀完就出題練習。",
  keywords: ["AI 學習", "畫重點", "讀書筆記", "AI 教師", "练习题", "ButterStudy"],
  authors: [{ name: "ButterStudy" }],
  openGraph: {
    type: "website",
    locale: "zh_TW",
    siteName: "ButterStudy",
    title: "ButterStudy — 上傳文章,AI 幫你畫重點",
    description: "上傳文章,自動整理章節、重點與結論;問 AI、出題練習,像 Duolingo 一樣追蹤學習進度。",
    images: [{ url: "/share.png", width: 1200, height: 630, alt: "ButterStudy" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "ButterStudy — 上傳文章,AI 幫你畫重點",
    description: "上傳文章,自動整理章節、重點與結論;問 AI、出題練習。",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser().catch(() => null);
  return (
    <html lang="zh-Hant" data-page-type="software">
      <body className="min-h-screen bg-cream">
        <a className="skip-link" href="#main">
          跳到主要內容
        </a>
        <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
        <main id="main" className="flex min-h-[60vh] flex-col">
          {children}
        </main>
        <SiteFooter />
        <TrackView />
      </body>
    </html>
  );
}