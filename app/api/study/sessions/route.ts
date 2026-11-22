import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { countryOf, recordEvent } from "@/lib/stats";
import { detectKind, titleFromFilename } from "@/lib/text";
import type { DocKind, StudySession } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

/** 學習歷史(含正確率)。 */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  await ensureSchema();
  const db = getDb();
  const rows = await db.execute({
    sql: `SELECT s.id, s.title, s.status, s.progress, s.created_at, s.completed_at,
                 d.id AS document_id, d.title AS document_title, d.kind AS kind,
                 (SELECT COUNT(*) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = s.user_id) AS attempts,
                 (SELECT COALESCE(SUM(a.correct),0) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = s.user_id) AS corrects,
                 (SELECT COALESCE(SUM(a.total),0) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = s.user_id) AS totals
          FROM study_sessions s JOIN documents d ON d.id = s.document_id
          WHERE s.user_id = ? ORDER BY s.updated_at DESC LIMIT 100`,
    args: [auth.user.id],
  });
  const sessions = rows.rows.map((r) => ({
    id: String(r.id),
    documentId: String(r.document_id),
    title: String(r.title),
    documentTitle: String(r.document_title),
    kind: String(r.kind) as DocKind,
    status: String(r.status) as "active" | "done",
    progress: Number(r.progress),
    createdAt: Number(r.created_at),
    completedAt: r.completed_at == null ? null : Number(r.completed_at),
    attempts: Number(r.attempts ?? 0),
    accuracy:
      Number(r.totals ?? 0) > 0 ? Math.round((Number(r.corrects ?? 0) / Number(r.totals)) * 100) : null,
  }));
  return NextResponse.json({ sessions });
}

/**
 * 開始新課程:
 * - {documentId}:用既有文章
 * - {content,title,kind,filename}:現場建立文章(上傳的新檔案)
 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  const body = (await req.json().catch(() => ({}))) as {
    documentId?: string;
    content?: string;
    title?: string;
    kind?: DocKind;
    filename?: string;
  };
  await ensureSchema();
  const db = getDb();
  let documentId = body.documentId;

  if (!documentId) {
    const content = (body.content ?? "").trim();
    if (content.length < 2) {
      return NextResponse.json({ error: "文章內容太短,至少兩個字" }, { status: 400 });
    }
    const kind = detectKind(body.filename ?? "") ?? body.kind ?? "txt";
    const title = (body.title ?? "").trim() || titleFromFilename(body.filename ?? "新課程");
    documentId = randomUUID();
    const now = Date.now();
    await db.execute({
      sql: "INSERT INTO documents (id, user_id, title, kind, content, outline, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)",
      args: [documentId, auth.user.id, title, kind, content, now, now],
    });
  } else {
    const check = await db.execute({
      sql: "SELECT id FROM documents WHERE id = ? AND user_id = ?",
      args: [documentId, auth.user.id],
    });
    if (!check.rows[0]) return NextResponse.json({ error: "找不到這篇文章" }, { status: 404 });
  }

  const doc = await db.execute({
    sql: "SELECT title FROM documents WHERE id = ?",
    args: [documentId],
  });
  const session: StudySession = {
    id: randomUUID(),
    user_id: auth.user.id,
    document_id: documentId,
    title: String(doc.rows[0]?.title ?? "學習課程"),
    status: "active",
    progress: 0,
    created_at: Date.now(),
    updated_at: Date.now(),
    completed_at: null,
  };
  await db.execute({
    sql: "INSERT INTO study_sessions (id, user_id, document_id, title, status, progress, created_at, updated_at, completed_at) VALUES (?, ?, ?, ?, 'active', 0, ?, ?, NULL)",
    args: [session.id, session.user_id, session.document_id, session.title, session.created_at, session.updated_at],
  });
  await recordEvent("use", countryOf(req));
  return NextResponse.json({ session });
}