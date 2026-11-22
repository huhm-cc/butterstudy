"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { buttonClass } from "@/components/ui/button";
import { IconArrow, IconCheck } from "@/components/ui/icons";
import { ReaderMock } from "./reader-mock";

const facts = ["4 種檔案格式", "自動章節大綱", "問 AI + 出題練習"];

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line bg-cream" data-enter>
      {/* 暖色光暈背景 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-24 h-[420px] w-[420px] rounded-full bg-butter-soft opacity-70 blur-[90px]"
      />
      <div className="relative mx-auto w-full max-w-[1200px] px-5 pb-14 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.16em] text-amber-deep"
        >
          AI 閱讀教室
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
          className="max-w-3xl text-[38px] leading-[1.12] sm:text-[52px] lg:text-[60px]"
        >
          上傳一篇文章,
          <br />
          AI 幫你畫重點
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
          className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-2"
        >
          PDF、TXT、Markdown、圖片都能讀。ButterStudy 自動分出章節、結論與重點,
          讀不懂就問 AI,讀完就出題練習。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="mt-8 flex flex-wrap items-center gap-3"
        >
          <Link href="/register" className={buttonClass("primary", "lg")}>
            上傳第一篇文章
            <IconArrow className="h-[18px] w-[18px]" />
          </Link>
          <Link href="/stats" className={buttonClass("ghost", "lg")}>
            看網站數據
          </Link>
        </motion.div>

        <motion.ul
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.23, 1, 0.32, 1] }}
          className="mt-6 flex flex-wrap gap-x-6 gap-y-2"
        >
          {facts.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-ink-2">
              <IconCheck className="h-4 w-4 text-success" />
              {f}
            </li>
          ))}
        </motion.ul>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.34, ease: [0.23, 1, 0.32, 1] }}
          className="mt-10 lg:mt-14"
        >
          <ReaderMock />
        </motion.div>
      </div>
    </section>
  );
}