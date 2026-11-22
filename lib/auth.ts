import { randomUUID, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import type { User } from "./types";
import { ensureSchema, getDb } from "./db";

const SESSION_COOKIE = "bs_session";
const SESSION_DAYS = 30;

function authSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret || secret.length < 16) {
    // 開發環境後備:正式部署請在 Vercel 設定 AUTH_SECRET
    return new TextEncoder().encode("butterstudy-dev-secret-change-me");
  }
  return new TextEncoder().encode(secret);
}

/* ---------------- 密碼雜湊 ---------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password.normalize("NFKC"), salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const candidate = scryptSync(password.normalize("NFKC"), salt, 64);
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/* ---------------- Session(JWT + 資料表記錄) ---------------- */

export async function createSession(userId: string): Promise<string> {
  await ensureSchema();
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_DAYS * 86400;
  const token = new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(expiresAt)
    .sign(authSecret())
    .then(async (jwt) => {
      await db.execute({
        sql: "INSERT INTO sessions (token, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
        args: [jwt, userId, Date.now(), expiresAt * 1000],
      });
      return jwt;
    });
  return token;
}

export async function destroySession(token: string): Promise<void> {
  await ensureSchema();
  await getDb().execute({ sql: "DELETE FROM sessions WHERE token = ?", args: [token] });
}

export async function verifyJwt(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret());
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: NextRequest): Promise<User | null> {
  let token: string | undefined;
  if (req) {
    token = req.cookies.get(SESSION_COOKIE)?.value;
  } else {
    // Server Component:從 next/headers 讀 cookie(Next 15 為非同步)
    try {
      const store = await cookies();
      token = store.get(SESSION_COOKIE)?.value;
    } catch {
      token = undefined;
    }
  }
  if (!token) return null;
  const userId = await verifyJwt(token);
  if (!userId) return null;
  await ensureSchema();
  const row = await getDb().execute({
    sql: "SELECT id, name, email, created_at FROM users WHERE id = ?",
    args: [userId],
  });
  const u = row.rows[0];
  if (!u) return null;
  return {
    id: String(u.id),
    name: String(u.name),
    email: String(u.email),
    created_at: Number(u.created_at),
  };
}

export const sessionCookieName = SESSION_COOKIE;

export function newUserId(): string {
  return randomUUID();
}