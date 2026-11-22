// 把 pdfjs-dist 的 worker 複製到 public/,讓 PDF 解析在瀏覽器端執行。
import { copyFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const buildDir = join(root, "node_modules", "pdfjs-dist", "build");
const outDir = join(root, "public");

if (!existsSync(buildDir)) {
  console.log("[copy-pdf-worker] pdfjs-dist 尚未安裝,跳過。");
  process.exit(0);
}

mkdirSync(outDir, { recursive: true });
const workers = readdirSync(buildDir).filter((f) => /^pdf\.worker.*\.(m?)js$/.test(f));
if (workers.length === 0) {
  console.log("[copy-pdf-worker] 找不到 worker 檔,跳過。");
  process.exit(0);
}
for (const f of workers) {
  copyFileSync(join(buildDir, f), join(outDir, f));
  console.log(`[copy-pdf-worker] public/${f}`);
}