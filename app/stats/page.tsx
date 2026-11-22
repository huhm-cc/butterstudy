import type { Metadata } from "next";
import { getStats } from "@/lib/stats";
import { StatsBoard } from "@/components/stats-board";

export const metadata: Metadata = {
  title: "網站數據",
  description: "ButterStudy 的即時瀏覽次數、AI 使用次數與各國比例。",
};

export const dynamic = "force-dynamic";

export default async function StatsPage() {
  const stats = await getStats();
  return <StatsBoard initial={stats} />;
}