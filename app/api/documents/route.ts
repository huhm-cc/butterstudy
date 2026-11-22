import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { detectKind, titleFromFilename } from "@/lib/text";
import type { DocKind, Document } from "@/lib/types";
import { randomUUID } from "node:crypto";

/** 取得登入者的所有文章。 */
export async function GET(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  await ensureSchema();
  const rows = await getDb().execute({
    sql: "SELECT id, title, kind, outline, created_at, updated_at, length(content) AS size FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
    args: [auth.user.id],
  });
  const documents = rows.rows.map((r) => ({
    id: String(r.id),
    title: String(r.title),
    kind: String(r.kind) as DocKind,
    hasOutline: Boolean(r.outline),
    createdAt: Number(r.created_at),
    updatedAt: Number(r.updated_at),
    size: Number(r.size ?? 0),
  }));
  return NextResponse.json({ documents });
}

/** 新增文章(title/kind/content),或帶上 id 更新內容。 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  const body = (await req.json().catch(() => ({}))) as {
    title?: string;
    kind?: string;
    content?: string;
    filename?: string;
  };
  const content = (body.content ?? "").trim();
  if (content.length < 2) {
    return NextResponse.json({ error: "文章內容太短,至少兩個字" }, { status: 400 });
  }
  if (content.length > 400_000) {
    return NextResponse.json({ error: "文章太長了(上限約 40 萬字),請分段上傳" }, { status: 413 });
  }
  const kind = (detectKind(body.filename ?? body.kind ?? "article.txt") ??
    (body.kind as DocKind) ??
    "txt") as DocKind;
  const title = (body.title ?? "").trim() || titleFromFilename(body.filename ?? "未命名文章");
  const id = randomUUID();
  const now = Date.now();
  await ensureSchema();
  await getDb().execute({
    sql: "INSERT INTO documents (id, user_id, title, kind, content, outline, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NULL, ?, ?)",
    args: [id, auth.user.id, title, kind, content, now, now],
  });
  const doc: Pick<Document, "id" | "title" | "kind" | "created_at" | "updated_at"> = {
    id,
    title,
    kind,
    created_at: now,
    updated_at: now,
  };
  return NextResponse.json({ document: doc });
}