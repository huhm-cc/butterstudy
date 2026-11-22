import { cx } from "@/lib/cx";

const fieldClass =
  "h-12 w-full rounded-[10px] border border-line-strong bg-surface px-4 text-[15px] text-ink placeholder:text-ink-3 transition-colors duration-150 focus:border-amber-deep focus:outline-none focus-visible:outline-2 focus-visible:outline-amber-deep";

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-2">{label}</span>
      {children}
      {error ? (
        <span role="alert" className="mt-1.5 block text-sm text-danger">
          {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[13px] text-ink-3">{hint}</span>
      ) : null}
    </label>
  );
}

export const Input = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input className={cx(fieldClass, className)} {...props} />
);