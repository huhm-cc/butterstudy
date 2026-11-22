import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";

/** 更新學習進度 / 完成課程。 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  const { id } = await params;
  const { progress, complete } = (await req.json().catch(() => ({}))) as {
    progress?: number;
    complete?: boolean;
  };
  await ensureSchema();
  const db = getDb();
  const now = Date.now();
  if (complete) {
    await db.execute({
      sql: "UPDATE study_sessions SET status = 'done', progress = 100, completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      args: [now, now, id, auth.user.id],
    });
  } else if (typeof progress === "number") {
    const clamped = Math.min(100, Math.max(0, Math.round(progress)));
    await db.execute({
      sql: "UPDATE study_sessions SET progress = MAX(progress, ?), updated_at = ? WHERE id = ? AND user_id = ?",
      args: [clamped, now, id, auth.user.id],
    });
  } else {
    await db.execute({
      sql: "UPDATE study_sessions SET updated_at = ? WHERE id = ? AND user_id = ?",
      args: [now, id, auth.user.id],
    });
  }
  return NextResponse.json({ ok: true });
}