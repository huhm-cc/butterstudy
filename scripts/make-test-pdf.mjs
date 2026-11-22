// 產生一個最小可解析的單頁 PDF(純文字,給開發測試用)
import { writeFileSync } from "node:fs";

const lines = [
  "BT",
  "/F1 14 Tf",
  "72 720 Td",
  "(ButterStudy PDF test) Tj",
  "0 -20 Td",
  "(Ebbinghaus forgetting curve: memory fades fastest right after learning.) Tj",
  "0 -20 Td",
  "(Spaced repetition schedules reviews along the curve.) Tj",
  "ET",
];
const stream = lines.join("\n");

const objs = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
];

let pdf = "%PDF-1.4\n";
const offsets = [];
objs.forEach((body, i) => {
  offsets.push(pdf.length);
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xrefStart = pdf.length;
pdf += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
for (const off of offsets) pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

writeFileSync(new URL("../data/test.pdf", import.meta.url), pdf, "latin1");
console.log("wrote data/test.pdf");