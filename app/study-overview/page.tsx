import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSessionsForUser } from "@/lib/queries";
import { OverviewClient } from "@/components/study/overview-client";

export const metadata: Metadata = {
  title: "總覽",
  description: "已學會、已上完幾堂、優勢科目與 AI 教師建議。",
};

export const dynamic = "force-dynamic";

export default async function StudyOverviewPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/study-overview");
  const sessions = await getSessionsForUser(user.id);

  const done = sessions.filter((s) => s.status === "done");
  const active = sessions.filter((s) => s.status === "active");
  const byDoc = new Map<
    string,
    { documentId: string; title: string; kind: string; completed: number; attempts: number; correct: number; total: number }
  >();
  for (const s of sessions) {
    const row =
      byDoc.get(s.documentId) ??
      {
        documentId: s.documentId,
        title: s.documentTitle,
        kind: s.kind,
        completed: 0,
        attempts: 0,
        correct: 0,
        total: 0,
      };
    if (s.status === "done") row.completed += 1;
    if (s.accuracy !== null) {
      // accuracy 百分比換回 correct/total 的近似:用 attempts 次 * 5 題
      row.attempts += 1;
      row.correct += Math.round((s.accuracy / 100) * 5);
      row.total += 5;
    }
    byDoc.set(s.documentId, row);
  }
  const subjects = [...byDoc.values()].map((r) => ({
    ...r,
    accuracy: r.total > 0 ? Math.round((r.correct / r.total) * 100) : null,
  }));
  const best = subjects.find((s) => s.accuracy !== null && s.accuracy >= 70) ?? subjects[0] ?? null;

  return (
    <OverviewClient
      userName={user.name}
      done={done}
      activeCount={active.length}
      subjects={subjects}
      best={best}
    />
  );
}