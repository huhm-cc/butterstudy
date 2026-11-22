"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { cx } from "@/lib/cx";
import { buttonClass } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { IconArrow, IconBook, IconCheck, IconClock, IconMedal, IconTarget } from "@/components/ui/icons";
import { readingMinutes } from "@/lib/text";

export interface SessionRow {
  id: string;
  documentId: string;
  title: string;
  documentTitle: string;
  kind: string;
  status: "active" | "done";
  progress: number;
  createdAt: number;
  completedAt: number | null;
  attempts: number;
  accuracy: number | null;
}

export function StudyHome({ userName, sessions }: { userName: string; sessions: SessionRow[] }) {
  const done = sessions.filter((s) => s.status === "done").length;
  const active = sessions.filter((s) => s.status === "active");
  const best =
    sessions.find((s) => s.accuracy !== null && s.accuracy >= 80) ??
    sessions.find((s) => s.accuracy !== null) ??
    null;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 lg:px-8 lg:py-14">
      {/* 問候 + 主行動 */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] sm:text-[36px]">{greeting(userName)}</h1>
          <p className="mt-2 text-[16px] text-ink-2">
            {active.length > 0
              ? `有 ${active.length} 堂課正在讀,挑一堂繼續吧。`
              : "還沒有課程,上傳第一篇文章開始。"}
          </p>
        </div>
        <Link href="/study/new" className={buttonClass("primary", "lg")}>
          開始新課程
          <IconArrow className="h-[18px] w-[18px]" />
        </Link>
      </div>

      {/* 數字條 */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
        className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4"
      >
        <StatTile icon={<IconMedal className="h-[18px] w-[18px]" />} label="已學會" value={done} tone="success" />
        <StatTile icon={<IconTarget className="h-[18px] w-[18px]" />} label="已上完幾堂" value={done} tone="amber" />
        <StatTile icon={<IconClock className="h-[18px] w-[18px]" />} label="進行中" value={active.length} tone="ink" />
        <StatTile
          icon={<IconBook className="h-[18px] w-[18px]" />}
          label="優勢科目"
          value={best ? `${best.accuracy}%` : "—"}
          note={best?.documentTitle}
          tone="amber"
        />
      </motion.div>

      {/* 正在讀 */}
      {active.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-2xl">正在讀</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {active.slice(0, 4).map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05, ease: [0.23, 1, 0.32, 1] }}
              >
                <Link
                  href={`/study/${s.id}`}
                  className="block rounded-2xl border border-line bg-surface p-5 shadow-soft transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px] hover:shadow-lift"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-[17px] font-semibold text-ink">{s.documentTitle}</span>
                    <KindBadge kind={s.kind} />
                  </div>
                  <div className="mt-4">
                    <ProgressBar value={s.progress} label="進度" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[13px] text-ink-3">
                    <span>{new Date(s.createdAt).toLocaleDateString("zh-TW")}</span>
                    <span className="font-medium text-amber-deep">繼續讀 →</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      ) : null}

      {/* 歷史紀錄 */}
      <section className="mt-12">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl">歷史紀錄</h2>
          <Link href="/study-overview" className="text-sm font-medium text-amber-deep underline underline-offset-4">
            前往總覽
          </Link>
        </div>
        {sessions.length === 0 ? (
          <EmptyHistory />
        ) : (
          <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
            {sessions.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/study/${s.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors duration-150 hover:bg-cream"
                >
                  <span
                    className={cx(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-full",
                      s.status === "done" ? "bg-success/10 text-success" : "bg-cream-2 text-ink-3",
                    )}
                  >
                    {s.status === "done" ? (
                      <IconCheck className="h-[18px] w-[18px]" />
                    ) : (
                      <IconClock className="h-[18px] w-[18px]" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15.5px] font-medium text-ink">{s.documentTitle}</span>
                    <span className="block text-[13px] text-ink-3">
                      {s.status === "done" ? "已上完" : `讀到 ${s.progress}%`} ·{" "}
                      {new Date(s.createdAt).toLocaleString("zh-TW", { dateStyle: "medium", timeStyle: "short" })}
                      {s.attempts > 0 ? ` · 練過 ${s.attempts} 次` : ""}
                    </span>
                  </span>
                  {s.accuracy !== null ? <Pill>{s.accuracy}% 正確</Pill> : null}
                  <KindBadge kind={s.kind} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function greeting(name: string): string {
  const h = new Date().getHours();
  const part = h < 6 ? "夜深了" : h < 12 ? "早安" : h < 18 ? "午安" : "晚安";
  return `${part},${name}`;
}

function StatTile({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  note?: string;
  tone: "amber" | "ink" | "success";
}) {
  const bg =
    tone === "success" ? "bg-success/10 text-success" : tone === "amber" ? "bg-butter-soft text-amber-deep" : "bg-cream-2 text-ink-2";
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-soft">
      <div className={cx("grid h-9 w-9 place-items-center rounded-full", bg)}>{icon}</div>
      <div className="num mt-3 font-serif text-[28px] font-semibold leading-none text-ink">{value}</div>
      <div className="mt-1.5 text-[13px] text-ink-2">{label}</div>
      {note ? <div className="mt-1 truncate text-[12px] text-ink-3">{note}</div> : null}
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="num rounded-full border border-line bg-cream-2 px-2.5 py-1 text-[12px] font-medium text-ink-2">
      {children}
    </span>
  );
}

export function KindBadge({ kind }: { kind: string }) {
  const label = kind === "md" ? "MD" : kind.toUpperCase();
  return (
    <span className="num shrink-0 rounded-md border border-line bg-cream-2 px-2 py-0.5 font-mono text-[11px] font-semibold text-ink-2">
      {label}
    </span>
  );
}

function EmptyHistory() {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-line-strong bg-surface px-6 py-12 text-center">
      <p className="text-[15.5px] text-ink-2">還沒有紀錄。上傳第一篇文章,兩秒後這裡就會有第一筆。</p>
      <Link href="/study/new" className={buttonClass("accent", "md", "mt-5")}>
        上傳第一篇文章
      </Link>
    </div>
  );
}