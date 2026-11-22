import { NextResponse } from "next/server";
import { getStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

/** 公開:全站瀏覽次數、使用次數與各國比例。 */
export async function GET() {
  const stats = await getStats();
  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, max-age=10" },
  });
}