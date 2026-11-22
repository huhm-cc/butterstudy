import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

/** 保護 /study、/study-overview:未登入導向登入頁。 */
const PROTECTED = ["/study", "/study-overview"];

function redirectToLogin(req: NextRequest, pathname: string) {
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  const token = req.cookies.get("bs_session")?.value;
  const secret = process.env.AUTH_SECRET?.trim();

  const debug: Record<string, string> = {
    token: token ? "1" : "0",
    secretLen: String((secret ?? "").length),
  };
  if (token) {
    try {
      const key = new TextEncoder().encode(secret ?? "butterstudy-dev-secret-change-me");
      await jwtVerify(token, key);
      debug.verify = "ok";
    } catch (e) {
      debug.verify = String(e).slice(0, 60);
    }
  }

  if (debug.verify !== "ok") {
    return redirectToLogin(req, pathname);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/study/:path*", "/study-overview/:path*"],
};