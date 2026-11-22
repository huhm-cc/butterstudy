import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { chatStream, hasNvidiaKey } from "@/lib/nvidia";
import { articleForPrompt, chatSystemPrompt, chatUserPrompt } from "@/lib/prompts";
import { countryOf, recordEvent } from "@/lib/stats";

/** AI 問答(SSE 串流)。 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  if (!hasNvidiaKey()) {
    return NextResponse.json({ error: "伺服器尚未設定 NVIDIA_API_KEY" }, { status: 503 });
  }
  const { documentId, question, history } = (await req.json().catch(() => ({}))) as {
    documentId?: string;
    question?: string;
    history?: Array<{ role: "user" | "assistant"; content: string }>;
  };
  if (!documentId || !question?.trim()) {
    return NextResponse.json({ error: "缺少文章或問題" }, { status: 400 });
  }
  await ensureSchema();
  const row = await getDb().execute({
    sql: "SELECT title, content FROM documents WHERE id = ? AND user_id = ?",
    args: [documentId, auth.user.id],
  });
  const doc = row.rows[0];
  if (!doc) return NextResponse.json({ error: "找不到這篇文章" }, { status: 404 });
  const safeHistory = Array.isArray(history) ? history.slice(-8) : [];
  try {
    const stream = await chatStream({
      temperature: 0.5,
      maxTokens: 1500,
      messages: [
        { role: "system", content: chatSystemPrompt(String(doc.title)) },
        {
          role: "user",
          content: chatUserPrompt(String(doc.content), safeHistory, question.trim()),
        },
      ],
    });
    await recordEvent("use", countryOf(req));
    return stream;
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 沒有回應";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}