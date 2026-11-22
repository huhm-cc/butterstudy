import { Logo } from "@/components/logo";

/** auth 頁共用的兩欄殼(左表單、右說明)。 */
export function AuthShell({
  title,
  desc,
  children,
  aside,
}: {
  title: string;
  desc: string;
  children: React.ReactNode;
  aside: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-12 lg:px-8 lg:py-20">
      <div className="mb-10 lg:hidden">
        <Logo />
      </div>
      <div className="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr] lg:gap-20">
        <div>
          <h1 className="text-[30px] sm:text-[36px]">{title}</h1>
          <p className="mt-3 text-[16.5px] leading-relaxed text-ink-2">{desc}</p>
          <div className="mt-8 rounded-2xl border border-line bg-surface p-6 shadow-soft">{children}</div>
        </div>
        {aside}
      </div>
    </div>
  );
}