"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { cx } from "@/lib/cx";
import { buttonClass } from "@/components/ui/button";
import { IconChat } from "@/components/ui/icons";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = ["這篇的重點是什麼?", "用更簡單的話解釋一次", "出個和這篇有關的問題"];

/** AI 問答:SSE 串流,回答只用文章內容。 */
export function ChatPanel({
  documentId,
  title,
  content,
}: {
  documentId: string;
  title: string;
  content: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  async function ask(question: string) {
    const q = question.trim();
    if (!q || streaming) return;
    setError("");
    const history = messages.slice(-8);
    setMessages((m) => [...m, { role: "user", content: q }]);
    setInput("");
    setStreaming(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, question: q, history }),
      });
      if (!res.ok || !res.body) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? "AI 沒有回應");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const payload = trimmed.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const json = JSON.parse(payload);
            const delta: string = json.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              const snapshot = acc;
              setMessages((m) => {
                const next = [...m];
                next[next.length - 1] = { role: "assistant", content: snapshot };
                return next;
              });
            }
          } catch {
            /* 略過不完整的 JSON 行 */
          }
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI 沒有回應");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div className="flex h-[560px] flex-col rounded-2xl border border-line bg-surface shadow-soft">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="text-amber-deep">
          <IconChat className="h-[18px] w-[18px]" />
        </span>
        <span className="text-sm font-semibold text-ink">問 AI 教師</span>
        <span className="ml-auto truncate text-[12px] text-ink-3" title={title}>
          《{title}》
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="pt-6 text-center">
            <p className="text-[14px] leading-relaxed text-ink-2">
              這篇的內容就是 AI 的資料庫。
              <br />
              問什麼,它都只從文章裡找答案。
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => ask(s)}
                  className="rounded-full border border-line bg-cream-2 px-3 py-1.5 text-[13px] text-ink-2 transition-colors duration-150 hover:border-amber-deep hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className={cx("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cx(
                "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[14px] leading-relaxed",
                m.role === "user"
                  ? "rounded-br-md bg-ink text-cream"
                  : "rounded-bl-md border border-line bg-cream text-ink",
              )}
            >
              {m.content || (streaming && i === messages.length - 1 ? "…" : "")}
            </div>
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      {error ? <p className="mx-4 mb-2 rounded-lg bg-danger/5 px-3 py-2 text-[13px] text-danger">{error}</p> : null}

      <form
        className="flex items-center gap-2 border-t border-line p-3"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={streaming ? "AI 正在回答…" : "輸入問題,Enter 送出"}
          disabled={streaming}
          aria-label="問題輸入框"
          className="h-11 flex-1 rounded-[10px] border border-line-strong bg-cream px-3.5 text-[15px] text-ink placeholder:text-ink-3 focus:border-amber-deep focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          className={buttonClass("primary", "md", "shrink-0")}
          disabled={streaming || input.trim().length === 0}
        >
          送出
        </button>
      </form>
    </div>
  );
}