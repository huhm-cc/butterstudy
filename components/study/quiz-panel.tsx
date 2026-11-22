"use client";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { cx } from "@/lib/cx";
import { buttonClass } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { IconCheck, IconList } from "@/components/ui/icons";
import type { Quiz, QuizQuestion } from "@/lib/types";
import { sanitizeQuiz } from "@/lib/text";

/** 練習題:出新題 → 作答 → 批改(單選自動、簡答對照參考要點)→ 記錄。 */
export function QuizPanel({
  documentId,
  sessionId,
  title,
  content,
}: {
  documentId: string;
  sessionId: string;
  title: string;
  content: string;
}) {
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [shortText, setShortText] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [scored, setScored] = useState<Array<{ correct: boolean }>>([]);

  useEffect(() => {
    setPicked(null);
    setShortText("");
    setRevealed(false);
  }, [index]);

  async function generate() {
    setLoading(true);
    setError("");
    setQuiz(null);
    setIndex(0);
    setScored([]);
    try {
      const res = await fetch("/api/ai/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "出題失敗");
      setQuiz(sanitizeQuiz(d.quiz));
    } catch (e) {
      setError(e instanceof Error ? e.message : "出題失敗");
    } finally {
      setLoading(false);
    }
  }

  function recordOnly(correct: boolean) {
    setScored((s) => [...s, { correct }]);
  }

  /** 單選:確定答案 → 立刻批改並計分 */
  function confirmSingle(q: QuizQuestion & { type: "single" }) {
    recordOnly(picked === q.answerIndex);
    setRevealed(true);
  }

  /** 簡答:看參考答案後自評,只計分一次 */
  function judgeShort(ok: boolean) {
    if (!revealed) {
      setRevealed(true);
      recordOnly(ok);
    }
  }

  function goNext() {
    setIndex((i) => i + 1);
  }

  async function recordAttempt(correct: number, total: number) {
    if (total === 0) return;
    await fetch("/api/study/attempts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId, sessionId, correct, total }),
    }).catch(() => {});
  }

  /* 測驗結束時自動交卷一次(recordedRef 防止重複送出;出新題會重置) */
  const recordedRef = useRef(false);
  useEffect(() => {
    if (finished && quiz && quiz.questions.length > 0 && !recordedRef.current) {
      recordedRef.current = true;
      const correct = scored.filter((s) => s.correct).length;
      recordAttempt(correct, quiz.questions.length);
    }
  });

  const current = quiz?.questions[index];
  const finished = quiz !== null && index >= quiz.questions.length;

  if (loading) {
    return (
      <Shell title="出新題中…">
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-cream-2" />
          ))}
        </div>
        <p className="mt-4 text-[13px] text-ink-3">AI 依據《{title}》出 3 單選 + 2 簡答。</p>
      </Shell>
    );
  }

  if (error) {
    return (
      <Shell title="練習題">
        <p className="mt-3 text-[13.5px] leading-relaxed text-danger">{error}</p>
        <button className={buttonClass("accent", "sm", "mt-4")} onClick={generate}>
          再試一次
        </button>
      </Shell>
    );
  }

  if (!quiz) {
    return (
      <Shell title="練習題">
        <p className="mt-3 text-[14px] leading-relaxed text-ink-2">
          讀完一篇,用五題驗收:三題單選、兩題簡答。成績會記進總覽的「已學會」。
        </p>
        <button className={buttonClass("accent", "md", "mt-5 w-full")} onClick={generate}>
          <IconList className="h-[18px] w-[18px]" />
          出新題
        </button>
      </Shell>
    );
  }

  if (finished) {
    const correct = scored.filter((s) => s.correct).length;
    return (
      <Shell title="這批測驗結束">
        <div className="py-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.25 }}
            className="num font-serif text-[52px] font-semibold text-ink"
          >
            {correct}/{quiz.questions.length}
          </motion.div>
          <p className="mt-2 text-[14px] text-ink-2">
            {correct === quiz.questions.length
              ? "全對,這篇可以收工了。"
              : correct >= quiz.questions.length - 2
                ? "不錯,錯的回去翻一下大綱。"
                : "多讀一次大綱,再出新題會更順。"}
          </p>
        </div>
        <button className={buttonClass("accent", "md", "w-full")} onClick={generate}>
          再來一新題
        </button>
      </Shell>
    );
  }

  return (
    <Shell title={`第 ${index + 1} / ${quiz.questions.length} 題`}>
      <div className="mt-3">
        <ProgressBar value={(index / quiz.questions.length) * 100} tone="ink" />
      </div>

      {current?.type === "single" ? (
        <div className="mt-4 space-y-2.5">
          <p className="text-[15px] font-medium leading-relaxed text-ink">{current.question}</p>
          {current.options.map((opt, i) => {
            const isAnswer = i === current.answerIndex;
            const state = !revealed ? "idle" : isAnswer ? "ok" : picked === i ? "bad" : "dim";
            return (
              <button
                key={i}
                disabled={revealed}
                onClick={() => setPicked(i)}
                className={cx(
                  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[14px] transition-colors duration-150",
                  state === "idle" && "border-line bg-cream hover:border-amber-deep",
                  state === "ok" && "border-success bg-success/5",
                  state === "bad" && "border-danger bg-danger/5",
                  state === "dim" && "border-line bg-cream opacity-60",
                )}
              >
                <span className="num grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line-strong text-[12px] font-semibold text-ink-2">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1">{opt}</span>
                {state === "ok" ? <IconCheck className="h-[18px] w-[18px] text-success" /> : null}
              </button>
            );
          })}
          {revealed ? (
            <div className="rounded-xl border border-line bg-cream-2 p-3.5">
              <div className="text-[13px] font-semibold text-ink">
                解答:{current.options[current.answerIndex]}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">{current.explain}</p>
            </div>
          ) : null}
          {revealed ? (
            <button className={buttonClass("primary", "md", "w-full")} onClick={goNext}>
              下一題
            </button>
          ) : (
            <button
              className={buttonClass("accent", "md", "w-full")}
              disabled={picked === null}
              onClick={() => confirmSingle(current)}
            >
              確定答案
            </button>
          )}
        </div>
      ) : null}

      {current?.type === "short" ? (
        <div className="mt-4 space-y-3">
          <p className="text-[15px] font-medium leading-relaxed text-ink">{current.question}</p>
          <textarea
            value={shortText}
            onChange={(e) => setShortText(e.target.value)}
            disabled={revealed}
            rows={4}
            placeholder="用自己的話寫兩三句…"
            className="w-full rounded-[10px] border border-line-strong bg-cream p-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-amber-deep focus:outline-none disabled:opacity-70"
          />
          {revealed ? (
            <div className="rounded-xl border border-line bg-cream-2 p-3.5">
              <div className="text-[13px] font-semibold text-ink">參考要點</div>
              <p className="mt-1 text-[13.5px] leading-relaxed text-ink-2">{current.shortAnswer}</p>
              {current.explain ? (
                <p className="mt-2 text-[12.5px] text-ink-3">{current.explain}</p>
              ) : null}
            </div>
          ) : null}
          {revealed ? (
            <div className="flex gap-2">
              <button
                className={buttonClass("primary", "md", "flex-1")}
                onClick={() => {
                  judgeShort(false);
                  goNext();
                }}
              >
                再想想
              </button>
              <button
                className={buttonClass("accent", "md", "flex-1")}
                onClick={() => {
                  judgeShort(true);
                  goNext();
                }}
              >
                我答對了
              </button>
            </div>
          ) : (
            <button
              className={buttonClass("accent", "md", "w-full")}
              disabled={shortText.trim().length < 2}
              onClick={() => setRevealed(true)}
            >
              看參考答案
            </button>
          )}
        </div>
      ) : null}

      <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12px] text-ink-3">
        <span>答對 {scored.filter((s) => s.correct).length}・已答 {scored.length}</span>
        {index === quiz.questions.length - 1 && scored.length > 0 ? (
          <button onClick={finishQuiz} className="font-medium text-amber-deep underline underline-offset-4">
            交卷
          </button>
        ) : null}
      </div>
    </Shell>
  );
}

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-2 border-b border-line pb-3 text-sm font-semibold text-ink">
        <span className="text-amber-deep">
          <IconList className="h-[18px] w-[18px]" />
        </span>
        {title}
      </div>
      {children}
    </div>
  );
}