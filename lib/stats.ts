import { ensureSchema, getDb } from "./db";
import { countryName } from "./countries";

export { countryName };

export function countryOf(req: Request): string {
  const h = (name: string) => req.headers.get(name);
  const code = h("x-vercel-ip-country") ?? h("cf-ipcountry") ?? h("x-country-code");
  if (!code) return process.env.NODE_ENV === "production" ? "UNKNOWN" : "LOCAL";
  return code.toUpperCase().slice(0, 8);
}

export async function recordEvent(kind: "view" | "use", country: string): Promise<void> {
  try {
    await ensureSchema();
    await getDb().execute({
      sql: "INSERT INTO events (kind, country, created_at) VALUES (?, ?, ?)",
      args: [kind, country, Date.now()],
    });
  } catch {
    // 統計不可用的話不影響主流程
  }
}

export interface StatsPayload {
  views: number;
  uses: number;
  countries: Array<{ country: string; name: string; count: number; percent: number }>;
  totalVisited: number;
}

export async function getStats(): Promise<StatsPayload> {
  await ensureSchema();
  const db = getDb();
  const viewsRow = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM events WHERE kind = 'view'",
    args: [],
  });
  const usesRow = await db.execute({
    sql: "SELECT COUNT(*) AS n FROM events WHERE kind = 'use'",
    args: [],
  });
  const byCountry = await db.execute({
    sql: `SELECT country, COUNT(*) AS n FROM events WHERE kind = 'view'
          GROUP BY country ORDER BY n DESC LIMIT 24`,
    args: [],
  });
  const totalVisited = Number(viewsRow.rows[0]?.n ?? 0);
  const countries = byCountry.rows.map((r) => ({
    country: String(r.country),
    name: countryName(String(r.country)),
    count: Number(r.n),
    percent: totalVisited ? Math.round((Number(r.n) / totalVisited) * 1000) / 10 : 0,
  }));
  return {
    views: totalVisited,
    uses: Number(usesRow.rows[0]?.n ?? 0),
    countries,
    totalVisited,
  };
}