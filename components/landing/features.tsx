import { Card, SectionTitle } from "@/components/ui/card";
import { IconChat, IconList, IconMedal, IconSparkles } from "@/components/ui/icons";

const features = [
  {
    icon: <IconList className="h-[22px] w-[22px]" />,
    title: "章節大綱",
    desc: "照文章結構自動分段,每章一句摘要,長文先看地圖再讀正文。",
  },
  {
    icon: <IconSparkles className="h-[22px] w-[22px]" />,
    title: "重點與結論",
    desc: "3-6 個重點,每點不超過 30 字;結論兩句話說完整篇在主張什麼。",
  },
  {
    icon: <IconChat className="h-[22px] w-[22px]" />,
    title: "問 AI,不編造",
    desc: "問答只用這篇文章回答;文章沒提到就直說,不會掰一個答案給你。",
  },
  {
    icon: <IconMedal className="h-[22px] w-[22px]" />,
    title: "出題與紀錄",
    desc: "3 單選 + 2 簡答自動出題,正確率記進總覽,已學會、已上完幾堂都看得到。",
  },
];

export function Features() {
  return (
    <section id="features" className="border-b border-line bg-cream">
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 lg:px-8 lg:py-24">
        <SectionTitle
          eyebrow="功能"
          title="一個頁面,讀完也練完"
          desc="從上傳到驗收都在同一個畫面:左邊章節,中間文章,右邊問 AI 與練習題。"
        />
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title} interactive className="flex gap-4 p-6">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-line bg-cream-2 text-amber-deep">
                {f.icon}
              </span>
              <div>
                <h3 className="text-xl">{f.title}</h3>
                <p className="mt-2 text-[15.5px] leading-relaxed text-ink-2">{f.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}