"use client";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { IconList, IconSparkles } from "@/components/ui/icons";
import type { Outline } from "@/lib/types";
import { sanitizeOutline } from "@/lib/text";

interface Saved {
  outline: Outline | null;
  hasOutline: boolean;
}

/** 章節 / 重點 / 結論:第一次進來自動整理,之後讀快取。 */
export function OutlinePanel({
  documentId,
  kind,
  onReady,
}: {
  documentId: string;
  kind: string;
  onReady?: (o: Outline) => void;
}) {
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openChapters, setOpenChapters] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch("/api/ai/outline", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId }),
    })
      .then(async (r) => {
        const d = (await r.json()) as Saved & { error?: string };
        if (!r.ok) throw new Error(d.error ?? "整理失敗");
        const parsed = sanitizeOutline(d.outline);
        if (alive) {
          setOutline(parsed);
          onReady?.(parsed);
        }
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  async function regenerate() {
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/ai/outline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, force: true }),
      });
      const d = (await r.json()) as Saved & { error?: string };
      if (!r.ok) throw new Error(d.error ?? "整理失敗");
      const parsed = sanitizeOutline(d.outline);
      setOutline(parsed);
      onReady?.(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "整理失敗");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Panel>
        <PanelHead icon={<IconList className="h-[18px] w-[18px]" />} title="整理中…" />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-4 animate-pulse rounded bg-cream-2" style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
        <p className="mt-4 text-[13px] text-ink-3">AI 教師正在畫重點,通常幾秒就好。</p>
      </Panel>
    );
  }

  if (error || !outline) {
    return (
      <Panel>
        <PanelHead icon={<IconList className="h-[18px] w-[18px]" />} title="還沒整理好" />
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{error || "按下面按鈕,讓 AI 先畫重點。"}</p>
        <button className={buttonClass("accent", "sm", "mt-4")} onClick={regenerate}>
          <IconSparkles className="h-4 w-4" />
          重新整理
        </button>
      </Panel>
    );
  }

  return (
    <Panel>
      <PanelHead icon={<IconList className="h-[18px] w-[18px]" />} title="章節與重點" kind={kind} onRegen={regenerate} />

      <p className="mt-3 text-[13.5px] leading-relaxed text-ink-2">{outline.summary}</p>

      <button
        className="mt-4 flex w-full items-center justify-between text-[13px] font-semibold text-ink"
        onClick={() => setOpenChapters((v) => !v)}
        aria-expanded={openChapters}
      >
        章節({outline.chapters.length})
        <span className="text-ink-3">{openChapters ? "▾" : "▸"}</span>
      </button>
      {openChapters ? (
        <ol className="mt-2 space-y-2.5">
          {outline.chapters.map((c, i) => (
            <li key={i} className="rounded-lg border border-line bg-cream p-3">
              <div className="text-[13.5px] font-medium text-ink">
                {i + 1}. {c.title}
              </div>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-2">{c.summary}</p>
            </li>
          ))}
        </ol>
      ) : null}

      <div className="mt-5 rounded-xl border border-line bg-butter-soft/50 p-3.5">
        <div className="font-mono text-[11px] uppercase tracking-wider text-amber-deep">全文重點</div>
        <ul className="mt-2 space-y-2">
          {outline.keyPoints.map((k, i) => (
            <li key={i} className="flex gap-2 text-[13px] leading-relaxed text-ink">
              <span className="num mt-0.5 text-amber-deep">{i + 1}.</span>
              {k}
            </li>
          ))}
        </ul>
      </div>

      {outline.conclusion ? (
        <div className="mt-4">
          <div className="font-mono text-[11px] uppercase tracking-wider text-ink-3">結論</div>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-2">{outline.conclusion}</p>
        </div>
      ) : null}
    </Panel>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">{children}</div>;
}

function PanelHead({
  icon,
  title,
  kind,
  onRegen,
}: {
  icon: React.ReactNode;
  title: string;
  kind?: string;
  onRegen?: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <span className="text-amber-deep">{icon}</span>
        {title}
      </div>
      {onRegen ? (
        <button
          onClick={onRegen}
          className="text-[12px] text-ink-3 underline underline-offset-4 transition-colors hover:text-ink"
        >
          重新整理
        </button>
      ) : null}
    </div>
  );
}