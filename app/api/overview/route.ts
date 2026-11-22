import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { chatOnce, hasNvidiaKey, parseJsonLoose } from "@/lib/nvidia";
import { suggestionSystemPrompt, suggestionUserPrompt } from "@/lib/prompts";

export const maxDuration = 60;

export interface SubjectRow {
  documentId: string;
  title: string;
  kind: string;
  sessions: number;
  completed: number;
  attempts: number;
  correct: number;
  accuracy: number | null;
}

export interface OverviewPayload {
  mastered: number;
  completedLessons: number;
  activeLessons: number;
  totalAttempts: number;
  overallAccuracy: number | null;
  subjects: SubjectRow[];
  bestSubject: SubjectRow | null;
  suggestions: string[];
}

/** 總覽:已學會 / 已上完幾堂 / 優勢科目 / AI 教師建議。 */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  await ensureSchema();
  const db = getDb();

  const lessonRows = await db.execute({
    sql: `SELECT status, COUNT(*) AS n FROM study_sessions WHERE user_id = ? GROUP BY status`,
    args: [auth.user.id],
  });
  let done = 0;
  let active = 0;
  for (const r of lessonRows.rows) {
    if (String(r.status) === "done") done = Number(r.n);
    else active = Number(r.n);
  }

  const subjectRows = await db.execute({
    sql: `SELECT d.id AS document_id, d.title AS title, d.kind AS kind,
                 COUNT(DISTINCT s.id) AS sessions,
                 SUM(CASE WHEN s.status = 'done' THEN 1 ELSE 0 END) AS completed,
                 (SELECT COUNT(*) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = ?) AS attempts,
                 (SELECT COALESCE(SUM(a.correct),0) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = ?) AS corrects,
                 (SELECT COALESCE(SUM(a.total),0) FROM quiz_attempts a WHERE a.document_id = d.id AND a.user_id = ?) AS totals
          FROM documents d
          LEFT JOIN study_sessions s ON s.document_id = d.id AND s.user_id = d.user_id
          WHERE d.user_id = ?
          GROUP BY d.id ORDER BY completed DESC, sessions DESC LIMIT 24`,
    args: [auth.user.id, auth.user.id, auth.user.id, auth.user.id],
  });
  const subjects: SubjectRow[] = subjectRows.rows.map((r) => {
    const totals = Number(r.totals ?? 0);
    return {
      documentId: String(r.document_id),
      title: String(r.title),
      kind: String(r.kind),
      sessions: Number(r.sessions ?? 0),
      completed: Number(r.completed ?? 0),
      attempts: Number(r.attempts ?? 0),
      correct: Number(r.corrects ?? 0),
      accuracy: totals > 0 ? Math.round((Number(r.corrects ?? 0) / totals) * 100) : null,
    };
  });

  const attemptRows = await db.execute({
    sql: "SELECT COALESCE(SUM(correct),0) AS c, COALESCE(SUM(total),0) AS t FROM quiz_attempts WHERE user_id = ?",
    args: [auth.user.id],
  });
  const totalCorrect = Number(attemptRows.rows[0]?.c ?? 0);
  const totalQuestions = Number(attemptRows.rows[0]?.t ?? 0);

  const bestSubject =
    subjects.find((s) => s.accuracy !== null && s.accuracy >= 60 && (s.completed > 0 || s.attempts > 0)) ??
    subjects.find((s) => s.completed > 0) ??
    subjects[0] ??
    null;

  const payload: OverviewPayload = {
    mastered: done,
    completedLessons: done,
    activeLessons: active,
    totalAttempts: subjects.reduce((sum, s) => sum + s.attempts, 0),
    overallAccuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : null,
    subjects,
    bestSubject,
    suggestions: [],
  };

  if (hasNvidiaKey() && payload.subjects.length > 0) {
    try {
      const data = JSON.stringify({
        name: auth.user.name,
        completedLessons: payload.completedLessons,
        activeLessons: payload.activeLessons,
        overallAccuracy: payload.overallAccuracy,
        subjects: subjects.slice(0, 8),
      });
      const raw = await chatOnce({
        json: true,
        temperature: 0.6,
        maxTokens: 600,
        messages: [
          { role: "system", content: suggestionSystemPrompt() },
          { role: "user", content: suggestionUserPrompt(data) },
        ],
      });
      const parsed = parseJsonLoose<{ suggestions?: string[] }>(raw);
      payload.suggestions = (parsed.suggestions ?? []).filter((s): s is string => typeof s === "string").slice(0, 3);
    } catch {
      payload.suggestions = [];
    }
  }
  if (payload.suggestions.length === 0) {
    payload.suggestions = [
      "從一篇想讀的文章開始,讓 AI 教師先整理重點。",
      "讀完後按「出新題」,單選加簡答驗收一次。",
      "每天回來讀一篇,歷史紀錄會幫你記住進度。",
    ];
  }
  return NextResponse.json(payload);
}