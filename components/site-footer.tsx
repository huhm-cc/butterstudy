import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-cream-2">
      <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-5 py-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink-2">
            上傳文章,AI 幫你畫重點。讀不懂就問,讀完就練。
          </p>
        </div>
        <FooterCol
          title="產品"
          links={[
            { href: "/#how", label: "怎麼運作" },
            { href: "/#features", label: "功能" },
            { href: "/study-overview", label: "學習總覽" },
          ]}
        />
        <FooterCol
          title="開始"
          links={[
            { href: "/register", label: "註冊帳號" },
            { href: "/login", label: "登入" },
            { href: "/study/new", label: "上傳第一篇文章" },
          ]}
        />
        <FooterCol
          title="關於"
          links={[
            { href: "/stats", label: "網站數據" },
            { href: "https://github.com/huhm-cc/butterstudy", label: "GitHub(原始碼)" },
            { href: "https://build.nvidia.com", label: "NVIDIA NIM" },
          ]}
        />
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-2 px-5 py-5 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <span>© 2026 ButterStudy · MIT 授權開放原始碼</span>
          <span>AI 由 NVIDIA Nemotron 模型驅動 · 繁體中文</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold text-ink">{title}</div>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.href + l.label}>
            <Link
              href={l.href}
              className="text-sm text-ink-2 underline decoration-line decoration-1 underline-offset-4 transition-colors duration-150 hover:decoration-amber-deep hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}