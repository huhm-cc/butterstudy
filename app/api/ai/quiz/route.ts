import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { chatOnce, hasNvidiaKey, parseJsonLoose } from "@/lib/nvidia";
import { quizSystemPrompt, quizUserPrompt } from "@/lib/prompts";
import { countryOf, recordEvent } from "@/lib/stats";
import { sanitizeQuiz } from "@/lib/text";
import type { Quiz } from "@/lib/types";

/** 依據文章出練習題(3 單選 + 2 簡答)。 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  if (!hasNvidiaKey()) {
    return NextResponse.json({ error: "伺服器尚未設定 NVIDIA_API_KEY" }, { status: 503 });
  }
  const { documentId } = (await req.json().catch(() => ({}))) as { documentId?: string };
  if (!documentId) return NextResponse.json({ error: "缺少 documentId" }, { status: 400 });
  await ensureSchema();
  const row = await getDb().execute({
    sql: "SELECT title, content FROM documents WHERE id = ? AND user_id = ?",
    args: [documentId, auth.user.id],
  });
  const doc = row.rows[0];
  if (!doc) return NextResponse.json({ error: "找不到這篇文章" }, { status: 404 });
  try {
    const raw = await chatOnce({
      json: true,
      temperature: 0.5,
      maxTokens: 3000,
      messages: [
        { role: "system", content: quizSystemPrompt() },
        { role: "user", content: quizUserPrompt(String(doc.content)) },
      ],
    });
    const quiz = sanitizeQuiz(parseJsonLoose<unknown>(raw));
    if (quiz.questions.length === 0) {
      return NextResponse.json({ error: "AI 沒有出成題,再按一次「出新題」試試" }, { status: 502 });
    }
    await recordEvent("use", countryOf(req));
    return NextResponse.json({ quiz });
  } catch (err) {
    const message = err instanceof Error ? err.message : "出題失敗";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}