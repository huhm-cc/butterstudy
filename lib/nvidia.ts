/**
 * NVIDIA NIM 用戶端:OpenAI 兼容的 /v1/chat/completions。
 * 文章理解、AI 問答、自動大綱、出題、圖片取字全部走同一個 VL 模型。
 */

export const NVIDIA_BASE_URL =
  process.env.NVIDIA_BASE_URL?.trim() || "https://integrate.api.nvidia.com/v1";
export const NVIDIA_MODEL =
  process.env.NVIDIA_MODEL?.trim() || "nvidia/nemotron-3.5-super-vl-120b-a12b";

export function hasNvidiaKey(): boolean {
  return Boolean(process.env.NVIDIA_API_KEY?.trim());
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content:
    | string
    | Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }>;
}

export class NvidiaError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

interface ChatOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
  signal?: AbortSignal;
}

function authHeaders(): HeadersInit {
  const key = process.env.NVIDIA_API_KEY?.trim();
  if (!key) {
    throw new NvidiaError("尚未設定 NVIDIA_API_KEY(請在 .env.local 或 Vercel 環境變數填入)", 503);
  }
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

/** 非串流:取純文字回覆。json 模式若不支援會自動降級重试。 */
export async function chatOnce(opts: ChatOptions): Promise<string> {
  try {
    return await postOnce(opts, Boolean(opts.json));
  } catch (err) {
    if (opts.json && err instanceof NvidiaError && (err.status === 400 || err.status === 422)) {
      return postOnce(opts, false);
    }
    throw err;
  }
}

async function postOnce(opts: ChatOptions, jsonMode: boolean): Promise<string> {
  const body: Record<string, unknown> = {
    model: NVIDIA_MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 2048,
    stream: false,
    top_p: 0.9,
    reasoning_effort: "none",
    chat_template_kwargs: { enable_thinking: false },
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
    signal: opts.signal,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new NvidiaError(`NVIDIA API ${res.status}: ${text.slice(0, 300)}`, res.status === 401 ? 503 : 502);
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data.choices?.[0]?.message?.content ?? "";
}

/** 串流:回傳 SSE 串流給前端。 */
export async function chatStream(opts: ChatOptions): Promise<Response> {
  try {
    return await streamOnce(opts, true);
  } catch (err) {
    if (err instanceof NvidiaError && (err.status === 400 || err.status === 422)) {
      // 模型不支援關閉思考的參數時,退回一般串流
      return streamOnce(opts, false);
    }
    throw err;
  }
}

async function streamOnce(opts: ChatOptions, disableThinking: boolean): Promise<Response> {
  const body: Record<string, unknown> = {
    model: NVIDIA_MODEL,
    messages: opts.messages,
    temperature: opts.temperature ?? 0.6,
    max_tokens: opts.maxTokens ?? 2048,
    stream: true,
    top_p: 0.9,
  };
  if (disableThinking) {
    // nemotron 3.5 推理模型:直接出答案,不先吐 reasoning_content
    body.reasoning_effort = "none";
    body.chat_template_kwargs = { enable_thinking: false };
  }
  const res = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => "");
    throw new NvidiaError(`NVIDIA API ${res.status}: ${text.slice(0, 300)}`, res.status === 401 ? 503 : 502);
  }
  return new Response(res.body, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

/** 從模型回覆中穩健地解析 JSON(容忍 ```json 圍欄與前後雜訊)。 */
export function parseJsonLoose<T>(raw: string): T {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : raw).trim();
  try {
    return JSON.parse(candidate) as T;
  } catch {
    const start = candidate.search(/[[{]/);
    const end = Math.max(candidate.lastIndexOf("}"), candidate.lastIndexOf("]"));
    if (start >= 0 && end > start) {
      return JSON.parse(candidate.slice(start, end + 1)) as T;
    }
    throw new NvidiaError("模型沒有回傳可解析的 JSON");
  }
}