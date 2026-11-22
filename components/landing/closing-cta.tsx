"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { buttonClass } from "@/components/ui/button";
import { IconArrow } from "@/components/ui/icons";

export function ClosingCta() {
  return (
    <section className="bg-cream-2">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="text-[32px] sm:text-[40px]"
          >
            下一篇要讀的文章,
            <br />
            讓 AI 先幫你畫好重點
          </motion.h2>
          <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-ink-2">
            十秒辦帳號,上傳第一篇文章。剩下的交給 AI 教師。
          </p>
          <div className="mt-8 flex justify-center">
            <Link href="/register" className={buttonClass("primary", "lg")}>
              免費開始
              <IconArrow className="h-[18px] w-[18px]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}