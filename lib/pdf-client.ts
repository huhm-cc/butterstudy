/** 瀏覽器端 PDF 文字擷取(worker 由 postinstall 複製到 /public)。 */

const MAX_PAGES = 60;

export async function extractPdfText(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const pages = Math.min(pdf.numPages, MAX_PAGES);
  const chunks: string[] = [];
  for (let p = 1; p <= pages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    if (text) chunks.push(text);
  }
  await pdf.destroy();
  const all = chunks.join("\n\n");
  if (all.replace(/\s/g, "").length < 4) {
    throw new Error("這份 PDF 可能是純圖片掃描,請改用「圖片」上傳,或貼上文字");
  }
  return all;
}