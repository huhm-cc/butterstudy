import { Card, SectionTitle } from "@/components/ui/card";
import { ProgressBar, ProgressRing } from "@/components/ui/progress";
import { IconChat, IconMedal, IconTarget } from "@/components/ui/icons";

/** /study-overview 的實況 mock:已學會、已上完幾堂、優勢科目、AI 建議。 */
export function OverviewPreview() {
  return (
    <section className="border-b border-line bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:px-8 lg:py-24">
        <SectionTitle
          eyebrow="學習總覽"
          title="讀到哪,一眼看清楚"
          desc="每完成一堂課,進度就結結實實記下來。登入後在「總覽」看到你自己的數字。"
        />
        <Card className="mt-10 overflow-hidden">
          <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
            {/* 左:已學會 + 已上完 */}
            <div className="border-b border-line bg-cream p-6 lg:border-b-0 lg:border-r">
              <ProgressRing value={100} caption="學習目標完成度" big="100%" />
              <div className="mt-6 grid grid-cols-2 gap-3">
                <MiniStat icon={<IconMedal className="h-4 w-4" />} label="已學會" value="12" />
                <MiniStat icon={<IconTarget className="h-4 w-4" />} label="已上完幾堂" value="14" />
              </div>
            </div>

            {/* 右:優勢科目 + AI 建議 */}
            <div className="p-6">
              <div className="font-mono text-[11px] uppercase tracking-wider text-amber-deep">
                優勢科目(練習正確率)
              </div>
              <div className="mt-4 space-y-4">
                {[
                  { t: "認知心理學入門", v: 92 },
                  { t: "統計學基礎", v: 84 },
                  { t: "歐洲史講義", v: 61 },
                ].map((s) => (
                  <div key={s.t}>
                    <ProgressBar value={s.v} tone="amber" label={s.t} />
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-xl border border-line bg-cream-2 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-cream">
                    AI
                  </span>
                  <span className="text-sm font-semibold text-ink">AI 教師建議</span>
                </div>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-2">
                  認知心理學你已经很穩,下週拿一篇統計學的長文練手:先讀大綱,再直接做簡答題。
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3.5">
      <div className="flex items-center gap-1.5 text-ink-3">
        {icon}
        <span className="text-[13px]">{label}</span>
      </div>
      <div className="num mt-1 font-serif text-2xl font-semibold text-ink">{value}</div>
    </div>
  );
}