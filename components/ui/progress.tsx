import { cx } from "@/lib/cx";

/** 進度條(Operate:數字一目了然)。 */
export function ProgressBar({
  value,
  label,
  tone = "amber",
  className,
}: {
  value: number;
  label?: string;
  tone?: "amber" | "ink" | "success";
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const fill =
    tone === "success" ? "bg-success" : tone === "ink" ? "bg-ink" : "bg-amber";
  return (
    <div className={className}>
      {label ? (
        <div className="mb-1 flex justify-between text-[13px] text-ink-2">
          <span>{label}</span>
          <span className="num">{pct}%</span>
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-cream-2"
      >
        <div
          className={cx("h-full rounded-full transition-[width] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]", fill)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** 圓環(總覽頁的已學會大數字)。 */
export function ProgressRing({
  value,
  size = 132,
  caption,
  big,
}: {
  value: number;
  size?: number;
  caption: string;
  big: string;
}) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-cream-2)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-amber)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - pct / 100)}
            className="transition-[stroke-dashoffset] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="num font-serif text-[30px] font-semibold text-ink">{big}</span>
        </div>
      </div>
      <span className="text-sm text-ink-2">{caption}</span>
    </div>
  );
}