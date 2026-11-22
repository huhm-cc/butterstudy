import type { DocKind, Quiz, QuizQuestion, Outline } from "./types";

export const ACCEPTED_TYPES = ".txt,.md,.markdown,.pdf,.png,.jpg,.jpeg,.webp";

export function detectKind(filename: string): DocKind | null {
  const ext = filename.toLowerCase().split(".").pop() ?? "";
  if (ext === "txt") return "txt";
  if (ext === "md" || ext === "markdown") return "md";
  if (ext === "pdf") return "pdf";
  if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "webp") return "image";
  return null;
}

/** 中英文混雜的字數(中文字元 + 英文單字)。 */
export function countWords(text: string): number {
  const cjk = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) ?? []).length;
  const en = (text.match(/[A-Za-z0-9]+(?:['’-][A-Za-z]+)*/g) ?? []).length;
  return cjk + en;
}

export function readingMinutes(text: string): number {
  // 中文 350 字/分、英文 220 詞/分,取平均
  const words = countWords(text);
  return Math.max(1, Math.round(words / 320));
}

export function titleFromFilename(filename: string): string {
  const base = filename.replace(/\.[^.]+$/, "");
  return base.length > 60 ? `${base.slice(0, 60)}…` : base;
}

/* ------------ 安全的 Markdown 區塊渲染(不解析 HTML) ------------ */

export type Block =
  | { type: "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; text: string };

export function markdownBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let i = 0;
  const inline = (s: string) =>
    s
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\*\*([^*]+)\*\*/g, "$1")
      .replace(/\*([^*]+)\*/g, "$1");

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed) {
      i++;
      continue;
    }
    if (trimmed.startsWith("```")) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        buf.push(lines[i]);
        i++;
      }
      i++;
      blocks.push({ type: "code", text: buf.join("\n") });
      continue;
    }
    const h = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      blocks.push({ type: level <= 2 ? "h2" : "h3", text: inline(h[2]) });
      i++;
      continue;
    }
    const q = trimmed.match(/^>\s?(.*)$/);
    if (q) {
      const buf: string[] = [inline(q[1])];
      i++;
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        buf.push(inline(lines[i].replace(/^\s*>\s?/, "")));
        i++;
      }
      blocks.push({ type: "quote", text: buf.join(" ") });
      continue;
    }
    const ul = trimmed.match(/^[-*+]\s+(.*)$/);
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ul || ol) {
      const ordered = Boolean(ol);
      const items: string[] = [inline((ul ?? ol)![1])];
      i++;
      while (i < lines.length) {
        const t = lines[i].trim();
        const m2 = ordered ? t.match(/^\d+[.)]\s+(.*)$/) : t.match(/^[-*+]\s+(.*)$/);
        if (!m2) break;
        items.push(inline(m2[1]));
        i++;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }
    const buf: string[] = [trimmed];
    i++;
    while (i < lines.length) {
      const t = lines[i].trim();
      if (!t || t.startsWith("```") || /^#{1,4}\s/.test(t) || /^>\s?/.test(t) || /^([-*+]\s|\d+[.)]\s)/.test(t)) break;
      buf.push(t);
      i++;
    }
    blocks.push({ type: "p", text: inline(buf.join("")) });
  }
  return blocks;
}

/** 純文字(TXT)也走同一套區塊解析:連續行合成段落,空行分段。 */
export function textBlocks(text: string): Block[] {
  const normalized = text.replace(/\r\n/g, "\n");
  return markdownBlocks(normalized);
}

/* ------------ 模型輸出的校驗與修正 ------------ */

export function sanitizeOutline(raw: unknown): Outline {
  const obj = (raw ?? {}) as Partial<Outline>;
  const chapters = Array.isArray(obj.chapters) ? obj.chapters : [];
  return {
    summary: str(obj.summary) || "AI 教師正在整理這篇文章…",
    chapters: chapters.slice(0, 12).map((c) => ({
      title: str(c?.title) || "未命名章節",
      summary: str(c?.summary),
      keyPoints: Array.isArray(c?.keyPoints) ? c!.keyPoints.map(str).filter(Boolean).slice(0, 8) : [],
    })),
    keyPoints: Array.isArray(obj.keyPoints) ? obj.keyPoints.map(str).filter(Boolean).slice(0, 8) : [],
    conclusion: str(obj.conclusion),
  };
}

export function sanitizeQuiz(raw: unknown): Quiz {
  const obj = (raw ?? {}) as Partial<Quiz>;
  const list = Array.isArray(obj.questions) ? obj.questions : [];
  const questions: QuizQuestion[] = [];
  for (const q of list.slice(0, 8)) {
    if (!q) continue;
    if (q.type === "single" && Array.isArray(q.options) && q.options.length >= 2) {
      const answerIndex = Math.min(Math.max(Number(q.answerIndex) || 0, 0), q.options.length - 1);
      questions.push({
        type: "single",
        question: str(q.question),
        options: q.options.map(str),
        answerIndex,
        explain: str(q.explain),
      });
    } else if (q.type === "short") {
      questions.push({
        type: "short",
        question: str(q.question),
        shortAnswer: str(q.shortAnswer),
        explain: str(q.explain),
      });
    }
  }
  return { questions };
}

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}