"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { Logo } from "./logo";
import { buttonClass } from "./ui/button";
import { IconLogout } from "./ui/icons";

export interface HeaderUser {
  name: string;
  email: string;
}

const publicLinks = [
  { href: "/#how", label: "怎麼運作" },
  { href: "/#features", label: "功能" },
  { href: "/study-overview", label: "學習總覽" },
  { href: "/stats", label: "網站數據" },
];

export function SiteHeader({ user }: { user?: HeaderUser | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isApp = pathname.startsWith("/study") || pathname.startsWith("/study-overview");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-cream/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-5 lg:px-8">
        <Link href="/" className="rounded-lg" aria-label="ButterStudy 首頁">
          <Logo />
        </Link>

        <nav aria-label="主導覽" className="hidden items-center gap-1 md:flex">
          {isApp ? (
            <>
              <HeaderLink href="/study" label="學習" active={pathname === "/study"} />
              <HeaderLink href="/study/new" label="開始新課程" active={pathname === "/study/new"} />
              <HeaderLink href="/study-overview" label="總覽" active={pathname === "/study-overview"} />
              <HeaderLink href="/stats" label="網站數據" active={pathname === "/stats"} />
            </>
          ) : (
            publicLinks.map((l) => (
              <HeaderLink key={l.href} href={l.href} label={l.label} active={false} />
            ))
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <>
              <span className="max-w-[160px] truncate text-sm text-ink-2" title={user.email}>
                {user.name}
              </span>
              <button className={buttonClass("ghost", "sm")} onClick={logout}>
                <IconLogout className="h-[18px] w-[18px]" />
                登出
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={buttonClass("ghost", "sm")}>
                登入
              </Link>
              <Link href="/register" className={buttonClass("primary", "sm")}>
                免費開始
              </Link>
            </>
          )}
        </div>

        <button
          className={cx("md:hidden", buttonClass("ghost", "sm"))}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "關閉" : "選單"}
        </button>
      </div>

      {open ? (
        <div id="mobile-menu" className="border-t border-line bg-cream px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {(isApp
              ? [
                  { href: "/study", label: "學習" },
                  { href: "/study/new", label: "開始新課程" },
                  { href: "/study-overview", label: "總覽" },
                  { href: "/stats", label: "網站數據" },
                ]
              : publicLinks
            ).map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[15px] text-ink hover:bg-cream-2"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-2 flex gap-2">
              {user ? (
                <button className={buttonClass("ghost", "md", "flex-1")} onClick={logout}>
                  登出
                </button>
              ) : (
                <>
                  <Link href="/login" className={buttonClass("ghost", "md", "flex-1")} onClick={() => setOpen(false)}>
                    登入
                  </Link>
                  <Link href="/register" className={buttonClass("primary", "md", "flex-1")} onClick={() => setOpen(false)}>
                    免費開始
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}

function HeaderLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={cx(
        "relative rounded-lg px-3 py-2 text-[15px] transition-colors duration-150",
        active ? "text-ink" : "text-ink-2 hover:text-ink",
      )}
    >
      {label}
      <span
        className={cx(
          "absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-amber transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]",
          active ? "scale-x-100" : "scale-x-0",
        )}
      />
    </Link>
  );
}