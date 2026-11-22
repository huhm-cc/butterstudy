import { cx } from "@/lib/cx";

type Variant = "primary" | "accent" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-cream border border-ink hover:bg-[#3a2d18] active:scale-[0.97] shadow-soft",
  accent:
    "bg-amber text-white border border-amber-deep hover:bg-amber-deep active:scale-[0.97] shadow-soft",
  ghost:
    "bg-transparent text-ink border border-line-strong hover:border-ink hover:bg-cream-2 active:scale-[0.97]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm rounded-lg",
  md: "h-11 px-5 text-[15px] rounded-[10px]",
  lg: "h-[52px] px-7 text-base rounded-xl",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cx(
    "inline-flex items-center justify-center gap-2 font-medium tracking-wide",
    "transition-[transform,background-color,border-color,box-shadow] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
    "select-none whitespace-nowrap",
    variants[variant],
    sizes[size],
    extra,
  );
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}