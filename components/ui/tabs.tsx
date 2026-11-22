"use client";
import { motion } from "motion/react";
import { cx } from "@/lib/cx";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

/** 動畫分頁:指示器用 layout 動畫平滑移動。 */
export function Tabs({
  items,
  active,
  onChange,
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cx("inline-flex rounded-xl border border-line bg-cream-2 p-1", className)}>
      {items.map((item) => {
        const selected = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(item.id)}
            className={cx(
              "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-150",
              selected ? "text-ink" : "text-ink-2 hover:text-ink",
            )}
          >
            {selected ? (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 rounded-lg border border-line bg-surface shadow-soft"
                transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {item.icon}
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}