"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cx } from "@/lib/cx";
import { buttonClass } from "@/components/ui/button";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { KindBadge } from "@/components/study/study-home";
import { IconArrow, IconChat, IconMedal, IconTarget } from "@/components/ui/icons";

export interface SubjectRow {
  documentId: string;
  title: string;
  kind: string;
  completed: number;
  attempts: number;
  correct: number;
  total: number;
  accuracy: number | null;
}

export function OverviewClient({
  userName,
  done,
  activeCount,
  subjects,
  best,
}: {
  userName: string;
  done: Array<{ id: string; documentTitle: string; kind: string; completedAt: number | null; accuracy: number | null }>;
  activeCount: number;
  subjects: SubjectRow[];
  best: SubjectRow | null;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [tipLoading, setTipLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/overview")
      .then((r) => r.json())
      .then((d: { suggestions?: string[] }) => {
        if (alive) setSuggestions(d.suggestions ?? []);
      })
      .catch(() => {})
      .finally(() => alive && setTipLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const goalRate = subjects.length > 0 ? Math.round((done.length / subjects.length) * 100) : 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 lg:px-8 lg:py-14">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] sm:text-[36px]">{userName}的學習總覽</h1>
          <p className="mt-2 text-[16px] text-ink-2">讀過的每一篇,都算數。</p>
        </div>
        <Link href="/study/new" className={buttonClass("primary", "lg")}>
          開始新課程
          <IconArrow className="h-[18px] w-[18px]" />
        </Link>
      </header>

      {/* 第一列:三個大數字 */}
      <div className="mt-8 grid gap-4 lg:grid-cols-[280px_1fr]">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
          className="flex flex-col items-center rounded-2xl border border-line bg-surface p-6 shadow-soft"
        >
          <ProgressRing
            value={goalRate}
            caption={subjects.length > 0 ? `${done.length}/${subjects.length} 篇文章已上完` : "還沒有課程"}
            big={`${goalRate}%`}
          />
          <div className="mt-6 grid w-full grid-cols-2 gap-3">
            <Tile icon={<IconMedal className="h-[18px] w-[18px]" />} label="已學會" value={done.length} />
            <Tile icon={<IconTarget className="h-[18px] w-[18px]" />} label="進行中" value={activeCount} />
          </div>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border border-line bg-surface p-6 shadow-soft"
          >
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-deep">比較好的科目</div>
            {best ? (
              <>
                <h3 className="mt-3 text-xl leading-snug">{best.title}</h3>
                <div className="mt-3">
                  <ProgressBar value={best.accuracy ?? 0} tone="success" label="練習正確率" />
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">
                  練過 {best.attempts} 次・上完 {best.completed} 堂。這科先保持手感,再拿弱的科目練。
                </p>
              </>
            ) : (
              <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
                做完第一次練習,這裡就會告訴你哪一科最強。
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-2xl border border-line bg-ink p-6 text-cream shadow-soft"
          >
            <div className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-amber text-[11px] font-bold text-white">
                AI
              </span>
              <span className="text-sm font-semibold text-cream">AI 教師建議</span>
            </div>
            {tipLoading ? (
              <div className="mt-3 space-y-2">
                {[0, 1].map((i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-cream/15" />
                ))}
              </div>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {suggestions.map((s, i) => (
                  <li key={i} className="flex gap-2 text-[14px] leading-relaxed text-cream/90">
                    <span className="num text-amber">{i + 1}.</span>
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>

      {/* 第二列:文章掌握度 */}
      <section className="mt-12">
        <h2 className="text-2xl">每篇文章的掌握度</h2>
        {subjects.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
            <p className="text-[15.5px] text-ink-2">總覽會等你上完第一堂課。</p>
            <Link href="/study/new" className={buttonClass("accent", "md", "mt-5")}>
              上傳第一篇文章
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s, i) => (
              <motion.div
                key={s.documentId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link
                  href="/study"
                  className={cx(
                    "block h-full rounded-2xl border border-line bg-surface p-5 shadow-soft",
                    "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px] hover:shadow-lift",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-[16px] font-semibold text-ink">{s.title}</span>
                    <KindBadge kind={s.kind} />
                  </div>
                  <div className="mt-4 space-y-3">
                    <ProgressBar
                      value={s.accuracy ?? 0}
                      tone={s.accuracy !== null && s.accuracy >= 70 ? "success" : "amber"}
                      label="正確率"
                    />
                    <div className="num flex justify-between text-[12.5px] text-ink-3">
                      <span>上完 {s.completed} 堂</span>
                      <span>練過 {s.attempts} 次</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 第三列:已學會清單 */}
      {done.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl">已學會({done.length})</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {done.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface px-4 py-3.5 shadow-soft"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/10 text-success">
                  <IconMedal className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] font-medium text-ink">{s.documentTitle}</span>
                  <span className="block text-[12px] text-ink-3">
                    {s.completedAt ? new Date(s.completedAt).toLocaleDateString("zh-TW") : ""}
                    {s.accuracy !== null ? `・正確率 ${s.accuracy}%` : ""}
                  </span>
                </span>
                <KindBadge kind={s.kind} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 flex items-center gap-2 rounded-xl border border-line bg-cream-2 px-4 py-3 text-[13.5px] text-ink-2">
        <IconChat className="h-[18px] w-[18px] shrink-0 text-amber-deep" />
        AI 教師的建議每天依你的最新紀錄重算;數字都是真的,來自你自己的練習。
      </div>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-line bg-cream p-3.5">
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      <div className="num mt-1 font-serif text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}