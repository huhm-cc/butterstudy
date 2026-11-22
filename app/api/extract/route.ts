import { NextRequest, NextResponse } from "next/server";
import { isAuthenticated, requireUser } from "@/lib/api-helpers";
import { chatOnce, hasNvidiaKey } from "@/lib/nvidia";

/**
 * 圖片取字:把 base64 圖片送給 NVIDIA VL 模型辨識+轉成繁體中文文章。
 * 單張圖片上限約 4MB(base64 後,配合 Vercel 上限)。
 */
export async function POST(req: NextRequest) {
  const auth = await requireUser(req);
  if (!isAuthenticated(auth)) return auth.response;
  if (!hasNvidiaKey()) {
    return NextResponse.json({ error: "伺服器尚未設定 NVIDIA_API_KEY" }, { status: 503 });
  }
  const { image, mimeType } = (await req.json().catch(() => ({}))) as {
    image?: string;
    mimeType?: string;
  };
  if (!image || typeof image !== "string") {
    return NextResponse.json({ error: "缺少圖片資料" }, { status: 400 });
  }
  const dataUri = image.startsWith("data:") ? image : `data:${mimeType ?? "image/png"};base64,${image}`;
  const approxBytes = Math.round((dataUri.length * 3) / 4);
  if (approxBytes > 4_500_000) {
    return NextResponse.json({ error: "圖片太大,請壓縮到 4MB 以下再上傳" }, { status: 413 });
  }
  try {
    const text = await chatOnce({
      temperature: 0.1,
      maxTokens: 3000,
      messages: [
        {
          role: "system",
          content:
            "你是圖片取字助手。請完整辨識圖片中的文字,依原有段落與標題結構輸出成「純文字」(用繁體中文,保留原文語言則保留;標題獨行)。不要加評論、不要解釋圖片,只輸出辨識到的文字內容。",
        },
        {
          role: "user",
          content: [
            { type: "text", text: "請辨識這張圖片中的文字,依段落輸出:" },
            { type: "image_url", image_url: { url: dataUri } },
          ],
        },
      ],
    });
    return NextResponse.json({ text: text.trim() });
  } catch (err) {
    const message = err instanceof Error ? err.message : "辨識失敗";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}