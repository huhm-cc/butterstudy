import { NextRequest, NextResponse } from "next/server";
import { ensureSchema, getDb } from "@/lib/db";
import { createSession, sessionCookieName, verifyPassword } from "@/lib/auth";
import { sessionCookieOptions } from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  const { email, password } = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanEmail || typeof password !== "string") {
    return NextResponse.json({ error: "請填寫 Email 與密碼" }, { status: 400 });
  }
  await ensureSchema();
  const db = getDb();
  const row = await db.execute({
    sql: "SELECT id, name, email, password_hash FROM users WHERE email = ?",
    args: [cleanEmail],
  });
  const u = row.rows[0];
  if (!u || !verifyPassword(password, String(u.password_hash))) {
    return NextResponse.json({ error: "Email 或密碼不正確" }, { status: 401 });
  }
  const token = await createSession(String(u.id));
  const res = NextResponse.json({
    ok: true,
    user: { id: String(u.id), name: String(u.name), email: String(u.email) },
  });
  res.cookies.set(sessionCookieName, token, sessionCookieOptions(30 * 86400));
  return res;
}