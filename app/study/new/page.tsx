import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { UploadPanel } from "@/components/study/upload-panel";

export const metadata: Metadata = {
  title: "開始新課程",
  description: "上傳 PDF、TXT、Markdown 或圖片,或貼上文章,讓 AI 教師開始幫你畫重點。",
};

export default async function NewStudyPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login?next=/study/new");
  return (
    <div className="mx-auto w-full max-w-[720px] px-5 py-12 lg:px-8">
      <h1 className="text-[30px] sm:text-[36px]">開始新課程</h1>
      <p className="mt-3 text-[16.5px] leading-relaxed text-ink-2">
        選一份檔案或貼上文字。PDF 的文字會在瀏覽器解析;圖片交給 AI 辨識;接著就能看大綱、問 AI、做練習。
      </p>
      <div className="mt-8">
        <UploadPanel />
      </div>
    </div>
  );
}