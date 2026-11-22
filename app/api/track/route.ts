import { NextRequest } from "next/server";
import { countryOf, recordEvent } from "@/lib/stats";

/** 公開:記錄瀏覽/使用事件(每次頁面載入與關鍵操作)。 */
export async function POST(req: NextRequest) {
  let kind: "view" | "use" = "view";
  try {
    const body = await req.json();
    if (body?.kind === "use") kind = "use";
  } catch {
    /* 空 body 視為 view */
  }
  await recordEvent(kind, countryOf(req));
  return Response.json({ ok: true });
}