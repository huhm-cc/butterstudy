"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { IconGlobe, IconSparkles, IconTarget } from "@/components/ui/icons";
import type { StatsPayload } from "@/lib/stats";
import { countryName } from "@/lib/countries";

/** 公開數據板:每 15 秒刷新一次。 */
export function StatsBoard({ initial }: { initial: StatsPayload }) {
  const [stats, setStats] = useState(initial);

  useEffect(() => {
    const timer = setInterval(() => {
      fetch("/api/stats")
        .then((r) => r.json())
        .then(setStats)
        .catch(() => {});
    }, 15000);
    return () => clearInterval(timer);
  }, []);

  const nonZero = stats.countries.filter((c) => c.count > 0);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 lg:px-8">
      <header>
        <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-deep">
          網站數據
        </div>
        <h1 className="text-[32px] sm:text-[40px]">這裡發生了多少事</h1>
        <p className="mt-3 max-w-xl text-[16.5px] leading-relaxed text-ink-2">
          每一次頁面瀏覽與每一次 AI 使用都會即時記錄;國別依 Vercel 傳入的地區訊息統計,每 15 秒更新。
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <BigCard
          icon={<IconTarget className="h-[22px] w-[22px]" />}
          label="總瀏覽次數"
          value={stats.views}
          note="全站每個頁面載入記一次"
          delay={0}
        />
        <BigCard
          icon={<IconSparkles className="h-[22px] w-[22px]" />}
          label="AI 使用次數"
          value={stats.uses}
          note="問 AI、整理重點、出題與練習"
          delay={0.08}
        />
        <BigCard
          icon={<IconGlobe className="h-[22px] w-[22px]" />}
          label="使用國家/地區"
          value={nonZero.length}
          note="依 IP 地區判定的瀏覽來源"
          delay={0.16}
        />
      </div>

      <section className="mt-14">
        <h2 className="text-2xl">各國瀏覽比例</h2>
        {nonZero.length === 0 ? (
          <p className="mt-4 text-[15px] text-ink-2">還沒有瀏覽紀錄,刷新幾次就會出現。</p>
        ) : (
          <ul className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
            {nonZero.map((c, i) => (
              <motion.li
                key={c.country}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-line px-5 py-4 last:border-b-0"
              >
                <span className="w-14 shrink-0 font-mono text-[13px] font-semibold text-ink-2">{c.country}</span>
                <span className="w-24 shrink-0 text-[15px] font-medium text-ink">{countryName(c.country)}</span>
                <span className="h-3 min-w-[120px] flex-1 overflow-hidden rounded-full bg-cream-2">
                  <span
                    className="block h-full rounded-full bg-amber"
                    style={{ width: `${Math.max(c.percent, 1)}%` }}
                  />
                </span>
                <span className="num w-16 shrink-0 text-right text-[14px] font-semibold text-ink">{c.percent}%</span>
                <span className="num w-20 shrink-0 text-right text-[13px] text-ink-3">{c.count.toLocaleString("zh-TW")} 次</span>
              </motion.li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-[13px] text-ink-3">
          百分比以總瀏覽次數為分母;本機開發未部署時顯示為「本機」。
        </p>
      </section>
    </div>
  );
}

function BigCard({
  icon,
  label,
  value,
  note,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  note: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.23, 1, 0.32, 1] }}
      className="rounded-2xl border border-line bg-surface p-6 shadow-soft"
    >
      <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-cream-2 text-amber-deep">
        {icon}
      </span>
      <div className="num mt-4 font-serif text-[44px] font-semibold leading-none text-ink">
        {value.toLocaleString("zh-TW")}
      </div>
      <div className="mt-2 text-[15px] font-medium text-ink">{label}</div>
      <div className="mt-1 text-[13px] text-ink-3">{note}</div>
    </motion.div>
  );
}