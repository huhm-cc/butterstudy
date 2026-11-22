import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthAside, AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/auth/auth-shell";

export const metadata: Metadata = {
  title: "免費註冊",
  description: "十秒辦帳號,上傳第一篇文章,讓 AI 教師幫你畫重點、出題練習。",
};

export default async function RegisterPage() {
  const user = await getCurrentUser().catch(() => null);
  if (user) redirect("/study");
  return (
    <AuthShell
      title="建立帳號"
      desc="用名稱、Email 與密碼註冊,資料存在 Turso,只屬於你。"
      aside={<AuthAside mode="register" />}
    >
      <AuthForm mode="register" />
    </AuthShell>
  );
}