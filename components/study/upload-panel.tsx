"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { cx } from "@/lib/cx";
import { Button, buttonClass } from "@/components/ui/button";
import { IconCheck, IconFile, IconUpload } from "@/components/ui/icons";
import { detectKind, titleFromFilename } from "@/lib/text";
import { extractPdfText } from "@/lib/pdf-client";
import { fileToCompressedDataUrl } from "@/lib/image-client";

type Stage = "idle" | "reading" | "extracting" | "saving" | "error" | "done";

/** 上傳面板:拖曳或選檔 → 擷取文字 → 建立文章與課程 → 進入閱讀器。 */
export function UploadPanel() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState("");
  const [dragging, setDragging] = useState(false);
  const [pasted, setPasted] = useState("");

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      const kind = detectKind(file.name);
      if (!kind) {
        setStage("error");
        setMessage("只支援 PDF、TXT、Markdown(md)和圖片(png/jpg/webp)");
        return;
      }
      setStage("reading");
      setMessage(`讀取 ${file.name}…`);
      try {
        let content = "";
        if (kind === "txt" || kind === "md") {
          content = await file.text();
        } else if (kind === "pdf") {
          setStage("extracting");
          setMessage("解析 PDF 文字…");
          content = await extractPdfText(file);
        } else {
          setStage("extracting");
          setMessage("AI 正在辨識圖片中的文字…");
          const dataUrl = await fileToCompressedDataUrl(file);
          const res = await fetch("/api/extract", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image: dataUrl }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "圖片辨識失敗");
          content = String(data.text ?? "");
        }
        if (content.trim().length < 2) throw new Error("沒有擷取到文字,換個檔案或貼上文字");

        setStage("saving");
        setMessage("建立課程…");
        const docRes = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: titleFromFilename(file.name),
            filename: file.name,
            kind,
            content,
          }),
        });
        const docData = await docRes.json();
        if (!docRes.ok) throw new Error(docData.error ?? "建立文章失敗");

        const sessionRes = await fetch("/api/study/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentId: docData.document.id }),
        });
        const sessionData = await sessionRes.json();
        if (!sessionRes.ok) throw new Error(sessionData.error ?? "建立課程失敗");

        setStage("done");
        setMessage("準備好了,正在打開…");
        router.push(`/study/${sessionData.session.id}`);
      } catch (err) {
        setStage("error");
        setMessage(err instanceof Error ? err.message : "上傳失敗,再試一次");
      }
    },
    [router],
  );

  async function startFromText() {
    if (pasted.trim().length < 2) return;
    setStage("saving");
    setMessage("建立課程…");
    try {
      const docRes = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "手動貼上的文章", kind: "txt", content: pasted }),
      });
      const docData = await docRes.json();
      if (!docRes.ok) throw new Error(docData.error ?? "建立文章失敗");
      const sessionRes = await fetch("/api/study/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docData.document.id }),
      });
      const sessionData = await sessionRes.json();
      router.push(`/study/${sessionData.session.id}`);
    } catch (err) {
      setStage("error");
      setMessage(err instanceof Error ? err.message : "失敗,再試一次");
    }
  }

  const busy = stage === "reading" || stage === "extracting" || stage === "saving";

  return (
    <div className="grid gap-6">
      {/* 拖放區 */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cx(
          "rounded-2xl border-2 border-dashed p-8 text-center transition-colors duration-200 sm:p-12",
          dragging ? "border-amber bg-butter-soft/40" : "border-line-strong bg-surface",
        )}
      >
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-line bg-cream-2 text-amber-deep">
          <IconUpload className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-xl">把檔案拖到這裡</h2>
        <p className="mt-2 text-sm text-ink-2">PDF、TXT、Markdown、圖片 · 單檔 4MB 以內</p>
        <input
          ref={inputRef}
          type="file"
          accept=".txt,.md,.markdown,.pdf,.png,.jpg,.jpeg,.webp"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button className="mt-5" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? "處理中…" : "選擇檔案"}
        </Button>
        {message ? (
          <p
            role="status"
            className={cx(
              "mt-4 text-sm",
              stage === "error" ? "text-danger" : stage === "done" ? "text-success" : "text-ink-2",
            )}
          >
            {message}
          </p>
        ) : null}
      </div>

      {/* 貼上文字 */}
      <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <IconFile className="h-[18px] w-[18px] text-amber-deep" />
          或直接貼上文章
        </div>
        <textarea
          value={pasted}
          onChange={(e) => setPasted(e.target.value)}
          rows={6}
          placeholder="把文章貼在這裡,標題、段落、列表都可以…"
          className="mt-3 w-full rounded-[10px] border border-line-strong bg-cream p-3.5 text-[15px] leading-relaxed text-ink placeholder:text-ink-3 focus:border-amber-deep focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="num text-[13px] text-ink-3">{pasted.trim().length} 字</span>
          <Button variant="ghost" onClick={startFromText} disabled={busy || pasted.trim().length < 2}>
            <IconCheck className="h-[18px] w-[18px]" />
            開始讀這篇
          </Button>
        </div>
      </div>

      <LinkBack />
    </div>
  );
}

function LinkBack() {
  return (
    <a href="/study" className="text-sm text-ink-2 underline underline-offset-4 hover:text-ink">
      ← 回到學習主頁
    </a>
  );
}