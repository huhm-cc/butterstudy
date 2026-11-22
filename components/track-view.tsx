"use client";
import { useEffect } from "react";

/** 每次頁面載入回報一次瀏覽事件(country 由伺服器從 Vercel header 取得)。 */
export function TrackView() {
  useEffect(() => {
    const key = `bs_view:${location.pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const body = new Blob([JSON.stringify({ kind: "view" })], { type: "application/json" });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", body);
    } else {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, []);
  return null;
}