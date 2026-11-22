import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { createSession, hashPassword, newUserId, sessionCookieName } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const { name, email, password } = (await req.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
  };
  const cleanName = (name ?? "").trim();
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (cleanName.length < 1 || cleanName.length > 30) {
    return NextResponse.json({ error: "請填寫 1-30 字的名稱" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return NextResponse.json({ error: "Email 格式不正確" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    return NextResponse.json({ error: "密碼需 8-72 字元" }, { status: 400 });
  }
  await ensureSchema();
  const db = getDb();
  const exists = await db.execute({
    sql: "SELECT id FROM users WHERE email = ?",
    args: [cleanEmail],
  });
  if (exists.rows.length > 0) {
    return NextResponse.json({ error: "這個 Email 已註冊,直接登入吧" }, { status: 409 });
  }
  const id = newUserId();
  await db.execute({
    sql: "INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)",
    args: [id, cleanName, cleanEmail, hashPassword(password), Date.now()],
  });
  const token = await createSession(id);
  const res = NextResponse.json({ ok: true, user: { id, name: cleanName, email: cleanEmail } });
  res.cookies.set(sessionCookieName, token, sessionCookieOptions(30 * 86400));
  return res;
}