"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { buttonClass } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Tabs } from "@/components/ui/tabs";
import { KindBadge } from "@/components/study/study-home";
import { IconCheck, IconList, IconSparkles } from "@/components/ui/icons";
import type { Outline } from "@/lib/types";
import { ArticleView } from "./article-view";
import { OutlinePanel } from "./outline-panel";
import { ChatPanel } from "./chat-panel";
import { QuizPanel } from "./quiz-panel";

export interface WorkspaceData {
  sessionId: string;
  documentId: string;
  title: string;
  kind: string;
  content: string;
  progress: number;
  hasOutline: boolean;
}

export function StudyWorkspace(props: WorkspaceData) {
  const [tab, setTab] = useState("chat");
  const [, setOutline] = useState<Outline | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  /* 捲動進度 → 回報後端(節流 2 秒) */
  useEffect(() => {
    const el = articleRef.current;
    if (!el) return;
    let last = 0;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      if (max <= 0) return;
      const pct = Math.round((el.scrollTop / max) * 100);
      if (pct < last + 20) return;
      last = pct;
      fetch(`/api/study/sessions/${props.sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: pct }),
      }).catch(() => {});
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [props.sessionId]);

  /* 完成課程:捲到底即算讀完 */
  const finish = useCallback(async () => {
    await fetch(`/api/study/sessions/${props.sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ complete: true }),
    }).catch(() => {});
    router.refresh();
  }, [props.sessionId, router]);

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-6 px-5 py-8 lg:grid-cols-[220px_minmax(0,1fr)_380px] lg:px-8">
      {/* 左:大綱 */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <OutlinePanel
          documentId={props.documentId}
          kind={props.kind}
          onReady={setOutline}
        />
      </aside>

      {/* 中:文章 */}
      <div className="min-w-0">
        <header className="mb-5">
          <div className="flex items-center gap-3">
            <KindBadge kind={props.kind} />
            <span className="text-[13px] text-ink-3">AI 教師會依據這篇文章回答與出題</span>
          </div>
          <h1 className="mt-2 text-[26px] leading-snug sm:text-[30px]">{props.title}</h1>
          <div className="mt-4">
            <ProgressBar value={props.progress} label="閱讀進度" />
          </div>
        </header>
        <div
          ref={articleRef}
          className="prose-study max-h-[calc(100vh-260px)] overflow-y-auto rounded-2xl border border-line bg-surface p-5 shadow-soft sm:p-7"
        >
          <ArticleView content={props.content} />
          <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-line pt-5">
            <button className={cx(buttonClass("accent", "md"))} onClick={finish}>
              <IconCheck className="h-[18px] w-[18px]" />
              讀完這篇,標為完成
            </button>
            <span className="text-[13px] text-ink-3">完成後會記進「已上完幾堂」</span>
          </div>
        </div>
      </div>

      {/* 右:問 AI / 練習 */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Tabs
          className="mb-4 w-full justify-center"
          active={tab}
          onChange={setTab}
          items={[
            { id: "chat", label: "問 AI", icon: <IconSparkles className="h-4 w-4" /> },
            { id: "quiz", label: "練習題", icon: <IconList className="h-4 w-4" /> },
          ]}
        />
        {tab === "chat" ? (
          <ChatPanel documentId={props.documentId} title={props.title} content={props.content} />
        ) : (
          <QuizPanel
            documentId={props.documentId}
            sessionId={props.sessionId}
            title={props.title}
            content={props.content}
          />
        )}
      </aside>
    </div>
  );
}