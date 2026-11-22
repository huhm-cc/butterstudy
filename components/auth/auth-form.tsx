"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, buttonClass } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/input";

interface Props {
  mode: "register" | "login";
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "register" ? { name, email, password } : { email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "出了點問題,再試一次");
        return;
      }
      router.push("/study");
      router.refresh();
    } catch {
      setError("網路不穩,再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      {mode === "register" ? (
        <Field label="名稱" hint="顯示在學習總覽,1-30 字">
          <Input
            name="name"
            autoComplete="name"
            placeholder="例如:小奶油"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={1}
            maxLength={30}
          />
        </Field>
      ) : null}

      <Field label="Email">
        <Input
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </Field>

      <Field label="密碼" hint={mode === "register" ? "至少 8 個字元" : undefined}>
        <Input
          name="password"
          type="password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "register" ? 8 : 1}
        />
      </Field>

      {error ? (
        <p role="alert" className="rounded-lg border border-danger/30 bg-danger/5 px-3.5 py-2.5 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? "處理中…" : mode === "register" ? "建立帳號,開始讀" : "登入"}
      </Button>

      <p className="text-center text-sm text-ink-2">
        {mode === "register" ? (
          <>
            已經有帳號?{" "}
            <Link href="/login" className="font-medium text-amber-deep underline underline-offset-4">
              由此登入
            </Link>
          </>
        ) : (
          <>
            還沒帳號?{" "}
            <Link href="/register" className="font-medium text-amber-deep underline underline-offset-4">
              免費註冊
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

/**  auth 頁右欄的品牌說明。 */
export function AuthAside({ mode }: Props) {
  return (
    <div className="hidden lg:block">
      <div className="sticky top-24">
        <h2 className="text-[26px] leading-snug">
          {mode === "register" ? "十分鐘後,你會感謝現在開始的自己" : "歡迎回來,接著讀下一篇"}
        </h2>
        <ul className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-ink-2">
          {[
            "上傳 PDF、TXT、Markdown 或圖片,AI 自動整理章節、重點與結論。",
            "讀不懂就問 AI,回答只用你這篇文章的內容。",
            "每課都有練習題與正確率紀錄,總覽頁看得見已學會幾課。",
          ].map((t) => (
            <li key={t} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}