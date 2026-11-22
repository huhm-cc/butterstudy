import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { chatOnce, hasNvidiaKey, parseJsonLoose } from "@/lib/nvidia";
import { articleForPrompt, outlineSystemPrompt } from "@/lib/prompts";
import { countryOf, recordEvent } from "@/lib/stats";
import { sanitizeOutline } from "@/lib/text";
import type { Outline } from "@/lib/types";

/** 產生(或取得快取)文章大綱:章節 / 重點 / 結論。 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  if (!hasNvidiaKey()) {
    return NextResponse.json({ error: "伺服器尚未設定 NVIDIA_API_KEY" }, { status: 503 });
  }
  const { documentId, force } = (await req.json().catch(() => ({}))) as {
    documentId?: string;
    force?: boolean;
  };
  if (!documentId) return NextResponse.json({ error: "缺少 documentId" }, { status: 400 });
  await ensureSchema();
  const db = getDb();
  const row = await db.execute({
    sql: "SELECT id, title, content, outline FROM documents WHERE id = ? AND user_id = ?",
    args: [documentId, auth.user.id],
  });
  const doc = row.rows[0];
  if (!doc) return NextResponse.json({ error: "找不到這篇文章" }, { status: 404 });
  const cached = doc.outline ? String(doc.outline) : null;
  if (cached && !force) {
    try {
      return NextResponse.json({ outline: JSON.parse(cached) as Outline, cached: true });
    } catch {
      /* 快取壞了就重算 */
    }
  }
  try {
    const raw = await chatOnce({
      json: true,
      temperature: 0.3,
      maxTokens: 2500,
      messages: [
        { role: "system", content: outlineSystemPrompt() },
        {
          role: "user",
          content: `文章標題:《${String(doc.title)}》\n文章內容:\n"""\n${articleForPrompt(String(doc.content))}\n"""`,
        },
      ],
    });
    const outline = sanitizeOutline(parseJsonLoose<unknown>(raw));
    await db.execute({
      sql: "UPDATE documents SET outline = ?, updated_at = ? WHERE id = ?",
      args: [JSON.stringify(outline), Date.now(), String(doc.id)],
    });
    await recordEvent("use", countryOf(req));
    return NextResponse.json({ outline, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : "整理失敗";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}