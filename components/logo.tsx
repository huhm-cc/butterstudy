import { cx } from "@/lib/cx";

/** ButterStudy 標記:一塊奶油。 */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex items-center gap-2.5", className)}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden className="shrink-0">
        <rect x="2" y="6" width="28" height="20" rx="7" fill="var(--color-butter)" />
        <path d="M10.5 10.5h11l-2 6.5h-11l2-6.5Z" fill="#fff8e6" opacity="0.95" />
        <path d="M11.8 10.5l-1.3 6.5" stroke="#c98f16" strokeWidth="1.4" strokeLinecap="round" opacity="0.5" />
      </svg>
      <span className="font-serif text-[19px] font-semibold tracking-tight text-ink">
        Butter<span className="text-amber-deep">Study</span>
      </span>
    </span>
  );
}