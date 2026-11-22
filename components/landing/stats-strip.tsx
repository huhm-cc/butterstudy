"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { buttonClass } from "@/components/ui/button";
import { IconArrow, IconGlobe } from "@/components/ui/icons";
import { countryName } from "@/lib/countries";

interface Stats {
  views: number;
  uses: number;
  countries: Array<{ country: string; name: string; count: number; percent: number }>;
}

/** 首頁的即時數據條(資料來自公開的 /api/stats)。 */
export function StatsStrip() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d: Stats) => alive && setStats(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const top = stats?.countries.slice(0, 5) ?? [];

  return (
    <section className="border-b border-line bg-cream">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-deep">
              網站數據
            </div>
            <h2 className="text-[26px] sm:text-[32px]">現在有多少人在讀</h2>
            <p className="mt-3 max-w-md text-[16.5px] leading-relaxed text-ink-2">
              每一次瀏覽與每一次 AI 使用都會記下來,台灣時間即時更新。數據頁面看得到各國比例。
            </p>
            <Link href="/stats" className={`${buttonClass("ghost", "md")} mt-5`}>
              前往數據頁
              <IconArrow className="h-[18px] w-[18px]" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl border border-line bg-surface p-6 shadow-soft"
            >
              <div className="num font-serif text-[40px] font-semibold leading-none text-ink">
                {stats ? stats.views.toLocaleString("zh-TW") : "—"}
              </div>
              <div className="mt-2 text-sm text-ink-2">總瀏覽次數</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.23, 1, 0.32, 1] }}
              className="rounded-2xl border border-line bg-surface p-6 shadow-soft"
            >
              <div className="num font-serif text-[40px] font-semibold leading-none text-ink">
                {stats ? stats.uses.toLocaleString("zh-TW") : "—"}
              </div>
              <div className="mt-2 text-sm text-ink-2">AI 使用次數</div>
            </motion.div>

            <div className="sm:col-span-2 rounded-2xl border border-line bg-surface p-5 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-medium text-ink">
                <IconGlobe className="h-[18px] w-[18px] text-amber-deep" />
                瀏覽來自哪些地方
              </div>
              <ul className="mt-3 space-y-2.5">
                {top.length === 0 ? (
                  <li className="text-sm text-ink-3">還沒有資料,等你成為第一筆。</li>
                ) : (
                  top.map((c) => (
                    <li key={c.country} className="flex items-center gap-3 text-sm">
                      <span className="w-16 shrink-0 text-ink-2">{countryName(c.country)}</span>
                      <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-2">
                        <span
                          className="block h-full rounded-full bg-amber"
                          style={{ width: `${Math.max(c.percent, 2)}%` }}
                        />
                      </span>
                      <span className="num w-12 shrink-0 text-right text-ink-2">{c.percent}%</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}