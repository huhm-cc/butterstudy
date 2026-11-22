import { NextRequest, NextResponse } from "next/server";
import type { User } from "./types";
import { getCurrentUser, sessionCookieName } from "./auth";

/** 取目前登入者,未登入回 401。 */
export async function requireUser(req: NextRequest): Promise<{ user: User } | { response: NextResponse }> {
  const user = await getCurrentUser(req);
  if (!user) {
    return {
      response: NextResponse.json({ error: "請先登入" }, { status: 401 }),
    };
  }
  return { user };
}

export function sessionCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export const SESSION_COOKIE = sessionCookieName;

export function isAuthenticated(result: { user: User } | { response: NextResponse }): result is { user: User } {
  return "user" in result;
}