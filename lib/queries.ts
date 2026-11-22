import { ensureSchema, getDb } from "./db";
import type { DocKind, Document, Outline, StudySession } from "./types";

/** 學習歷史(最新在上)。 */
export async function getSessionsForUser(userId: string) {
  await ensureSchema();
  const rows = await getDb().execute({
    sql: `SELECT s.id, s.title, s.status, s.progress, s.created_at, s.completed_at,
                 d.id AS document_id, d.title AS document_title, d.kind AS kind,
                 (SELECT COUNT(*) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = s.user_id) AS attempts,
                 (SELECT COALESCE(SUM(a.correct),0) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = s.user_id) AS corrects,
                 (SELECT COALESCE(SUM(a.total),0) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = s.user_id) AS totals
          FROM study_sessions s JOIN documents d ON d.id = s.document_id
          WHERE s.user_id = ? ORDER BY s.updated_at DESC LIMIT 100`,
    args: [userId],
  });
  return rows.rows.map((r) => ({
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
}

/** 課程詳情 + 文章 + 已存在的大綱。 */
export async function getSessionDetail(userId: string, sessionId: string) {
  await ensureSchema();
  const db = getDb();
  const row = await db.execute({
    sql: `SELECT s.id, s.user_id, s.document_id, s.title, s.status, s.progress,
                 s.created_at, s.completed_at,
                 d.title AS doc_title, d.kind AS doc_kind, d.content AS doc_content, d.outline AS doc_outline,
                 d.created_at AS doc_created
          FROM study_sessions s JOIN documents d ON d.id = s.document_id
          WHERE s.id = ? AND s.user_id = ?`,
    args: [sessionId, userId],
  });
  const r = row.rows[0];
  if (!r) return null;
  const document: Document = {
    id: String(r.document_id),
    user_id: String(r.user_id),
    title: String(r.doc_title),
    kind: String(r.doc_kind) as DocKind,
    content: String(r.doc_content),
    outline: r.doc_outline == null ? null : String(r.doc_outline),
    created_at: Number(r.doc_created),
    updated_at: Number(r.doc_created),
  };
  const session: StudySession = {
    id: String(r.id),
    user_id: String(r.user_id),
    document_id: document.id,
    title: String(r.title),
    status: String(r.status) as "active" | "done",
    progress: Number(r.progress),
    created_at: Number(r.created_at),
    updated_at: Number(r.created_at),
    completed_at: r.completed_at == null ? null : Number(r.completed_at),
  };
  let outline: Outline | null = null;
  if (document.outline) {
    try {
      outline = JSON.parse(document.outline) as Outline;
    } catch {
      outline = null;
    }
  }
  return { session, document, outline };
}