import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthAside, AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "登入",
  description: "登入 ButterStudy,繼續你的閱讀與練習。",
};

export default async function LoginPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/study");
  return (
    <AuthShell
      title="登入"
      desc="登入後就能看到歷史紀錄、學習總覽與 AI 教師建議。"
      aside={<AuthAside mode="login" />}
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}