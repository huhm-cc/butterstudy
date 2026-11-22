// 把 public/share.svg 轉成 1200x630 的 PNG(社群分享圖;文字用系統字體繪製)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public", "share.svg"));
await sharp(svg, { density: 144 })
  .resize(1200, 630, { fit: "cover" })
  .png()
  .toFile(join(root, "public", "share.png"));
console.log("[make-og] public/share.png 1200x630");