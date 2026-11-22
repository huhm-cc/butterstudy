import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getSessionDetail } from "@/lib/queries";
import { StudyWorkspace } from "@/components/study/study-workspace";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `學習課程 ${id.slice(0, 6)}` };
}

export default async function StudySessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect(`/login?next=/study/${id}`);
  const detail = await getSessionDetail(user.id, id);
  if (!detail) notFound();

  return (
    <StudyWorkspace
      sessionId={detail.session.id}
      documentId={detail.document.id}
      title={detail.session.title || detail.document.title}
      kind={detail.document.kind}
      content={detail.document.content}
      progress={detail.session.progress}
      hasOutline={Boolean(detail.outline)}
    />
  );
}