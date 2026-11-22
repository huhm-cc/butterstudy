import { cx } from "@/lib/cx";

export function Card({
  className,
  interactive = false,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cx(
        "rounded-[14px] border border-line bg-surface shadow-soft",
        interactive &&
          "transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-[2px] hover:shadow-lift",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  eyebrow,
  title,
  desc,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  desc?: string;
  center?: boolean;
}) {
  return (
    <div className={cx("max-w-2xl", center && "mx-auto text-center")}>
      {eyebrow ? (
        <div className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-amber-deep">
          {eyebrow}
        </div>
      ) : null}
      <h2 className="text-[26px] sm:text-[32px]">{title}</h2>
      {desc ? <p className="mt-3 text-[17px] leading-relaxed text-ink-2">{desc}</p> : null}
    </div>
  );
}