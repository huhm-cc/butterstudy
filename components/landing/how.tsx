import { Card, SectionTitle } from "@/components/ui/card";
import { IconChat, IconList, IconUpload } from "@/components/ui/icons";

const steps = [
  {
    n: "01",
    icon: <IconUpload className="h-[22px] w-[22px]" />,
    title: "上傳文章",
    desc: "拖曳 PDF、TXT、Markdown 或圖片進來。圖片裡的文字會自動辨識,不用先打字。",
    visual: <UploadVisual />,
  },
  {
    n: "02",
    icon: <IconList className="h-[22px] w-[22px]" />,
    title: "AI 整理重點",
    desc: "章節、結論與 3-6 個重點自動排好,長文也能三分鐘看完架構。",
    visual: <OutlineVisual />,
  },
  {
    n: "03",
    icon: <IconChat className="h-[22px] w-[22px]" />,
    title: "問 AI、做練習",
    desc: "哪段不懂直接問,答案只從文章裡找。讀完按一下出新題,單選加簡答驗收。",
    visual: <QuizVisual />,
  },
];

export function How() {
  return (
    <section id="how" className="border-b border-line bg-surface">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:px-8 lg:py-24">
        <SectionTitle
          eyebrow="怎麼運作"
          title="三步,讀完一篇"
          desc="不用先註冊也能看流程;要開始讀,再花十秒辦帳號。"
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {steps.map((s) => (
            <Card key={s.n} interactive className="flex flex-col p-6">
              <div className="flex items-center justify-between">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-cream-2 text-amber-deep">
                  {s.icon}
                </span>
                <span className="num font-mono text-sm font-semibold text-ink-3">{s.n}</span>
              </div>
              <h3 className="mt-5 text-xl">{s.title}</h3>
              <p className="mt-2 text-[15.5px] leading-relaxed text-ink-2">{s.desc}</p>
              <div className="mt-5 flex flex-1 items-end">{s.visual}</div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

/* 三步的小圖示(技術型產品的靜態/脈衝示意圖,純 SVG 程式繪製) */

function UploadVisual() {
  return (
    <svg viewBox="0 0 220 72" className="h-[72px] w-full" role="img" aria-label="四種檔案格式進入同一個閱讀器">
      {["PDF", "TXT", "MD", "圖"].map((t, i) => (
        <g key={t}>
          <rect
            x={8 + i * 54}
            y={8}
            width={44}
            height={26}
            rx={7}
            fill="var(--color-cream-2)"
            stroke="var(--color-line-strong)"
          />
          <text x={30 + i * 54} y={25} textAnchor="middle" fontSize={11} fill="var(--color-ink-2)" fontFamily="var(--font-mono)">
            {t}
          </text>
          <path
            d={`M${30 + i * 54} 34 L110 58`}
            stroke="var(--color-butter)"
            strokeWidth={1.6}
            strokeDasharray="3 3"
          />
        </g>
      ))}
      <rect x={78} y={50} width={64} height={18} rx={9} fill="var(--color-ink)" />
      <text x={110} y={62.5} textAnchor="middle" fontSize={10.5} fill="var(--color-cream)" fontFamily="var(--font-sans)">
        ButterStudy
      </text>
    </svg>
  );
}

function OutlineVisual() {
  return (
    <svg viewBox="0 0 220 72" className="h-[72px] w-full" role="img" aria-label="文章自動分出章節與重點">
      <rect x={8} y={6} width={88} height={60} rx={8} fill="var(--color-cream-2)" stroke="var(--color-line-strong)" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x={18} y={16 + i * 12} width={i === 0 ? 54 : 66 - i * 8} height={5} rx={2.5} fill="var(--color-line-strong)" />
          {i === 0 ? <circle cx={12.5} cy={18.5} r={2.5} fill="var(--color-amber)" /> : null}
        </g>
      ))}
      <path d="M104 36 L124 36" stroke="var(--color-butter)" strokeWidth={2} />
      <rect x={128} y={6} width={84} height={60} rx={8} fill="var(--color-surface)" stroke="var(--color-line)" />
      <text x={138} y={23} fontSize={10} fill="var(--color-amber-deep)" fontFamily="var(--font-mono)">
        重點
      </text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={138} y={31 + i * 12} width={i === 2 ? 40 : 64} height={5} rx={2.5} fill="var(--color-butter)" opacity={0.85 - i * 0.22} />
      ))}
    </svg>
  );
}

function QuizVisual() {
  return (
    <svg viewBox="0 0 220 72" className="h-[72px] w-full" role="img" aria-label="問 AI 與練習題">
      <rect x={8} y={4} width={96} height={26} rx={9} fill="var(--color-cream-2)" stroke="var(--color-line-strong)" />
      <text x={20} y={21} fontSize={10.5} fill="var(--color-ink-2)" fontFamily="var(--font-sans)">
        為什麽先複習?
      </text>
      <rect x={60} y={40} width={126} height={26} rx={9} fill="var(--color-ink)" />
      <text x={72} y={57} fontSize={10.5} fill="var(--color-cream)" fontFamily="var(--font-sans)">
        第一天忘得最快
      </text>
      <circle cx={30} cy={57} r={3} fill="var(--color-butter)">
        <animate attributeName="opacity" values="1;0.3;1" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <path d="M104 17 q22 20 0 23" stroke="var(--color-butter)" strokeWidth={1.6} fill="none" strokeDasharray="3 3" />
    </svg>
  );
}