import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSessionsForUser } from "@/lib/queries";
import { StudyHome } from "@/components/study/study-home";

export const metadata: Metadata = {
  title: "學習",
  description: "你的學習主頁:繼續讀、看歷史紀錄、開始新課程。",
};

export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/study");
  const sessions = await getSessionsForUser(user.id);
  return <StudyHome userName={user.name} sessions={sessions} />;
}