import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { countryOf, recordEvent } from "@/lib/stats";

/** 記錄一次練習結果,並把課程標記完成。 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  const { documentId, sessionId, correct, total } = (await req.json().catch(() => ({}))) as {
    documentId?: string;
    sessionId?: string;
    correct?: number;
    total?: number;
  };
  if (!documentId || typeof correct !== "number" || typeof total !== "number" || total <= 0) {
    return NextResponse.json({ error: "缺少練習資料" }, { status: 400 });
  }
  await ensureSchema();
  const db = getDb();
  const now = Date.now();
  await db.execute({
    sql: "INSERT INTO quiz_attempts (id, user_id, document_id, session_id, correct, total, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    args: [randomUUID(), auth.user.id, documentId, sessionId ?? null, correct, total, now],
  });
  if (sessionId) {
    await db.execute({
      sql: "UPDATE study_sessions SET status = 'done', progress = 100, completed_at = ?, updated_at = ? WHERE id = ? AND user_id = ?",
      args: [now, now, sessionId, auth.user.id],
    });
  }
  await recordEvent("use", countryOf(req));
  return NextResponse.json({ ok: true });
}