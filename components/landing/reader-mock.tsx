/** Landing 用「產品本體」:閱讀器介面的實況 mock(真 HTML,非截圖)。 */
export function ReaderMock() {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
      {/* 視窗列 */}
      <div className="flex items-center gap-2 border-b border-line bg-cream-2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#e8a817]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#d9c19a]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#c9b489]" />
        <span className="num ml-3 truncate font-mono text-xs text-ink-3">
          butterstudy / 認知心理學入門.md
        </span>
      </div>

      <div className="grid gap-0 sm:grid-cols-[150px_1fr]">
        {/* 章節側欄 */}
        <div className="hidden border-r border-line p-4 sm:block">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ink-3">章節</div>
          <ul className="space-y-1.5 text-[13px]">
            {[
              { t: "一、記憶怎麽運作", on: false },
              { t: "二、遺忘曲線", on: true },
              { t: "三、間隔重複", on: false },
              { t: "結論", on: false },
            ].map((c) => (
              <li
                key={c.t}
                className={
                  c.on
                    ? "rounded-md bg-butter-soft px-2 py-1.5 font-medium text-ink"
                    : "px-2 py-1.5 text-ink-2"
                }
              >
                {c.t}
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-lg border border-line bg-cream p-2.5">
            <div className="font-mono text-[11px] uppercase tracking-wider text-amber-deep">重點</div>
            <p className="mt-1 text-[12px] leading-relaxed text-ink-2">
              遺忘速度先快後慢,複習要抓緊黃金 24 小時。
            </p>
          </div>
        </div>

        {/* 文章 + AI 對話 */}
        <div className="p-4 sm:p-5">
          <div className="font-mono text-[11px] uppercase tracking-wider text-ink-3">二、遺忘曲線</div>
          <p className="mt-2 text-[13.5px] leading-[1.9] text-ink">
            艾賓浩斯發現,剛學完的東西忘得最快,第一天之後速度就慢下來。
            <mark className="rounded bg-butter-soft px-1 text-ink">
              把複習安排在 24 小時內,可以把記住的比例拉高近一倍。
            </mark>
            間隔重複就是照這個曲線安排複習的間隔。
          </p>

          <div className="mt-4 space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md border border-line bg-cream-2 px-3 py-2 text-[12.5px] text-ink">
              為什麽要先安排在一天內?
            </div>
            <div className="flex w-fit max-w-[92%] items-start gap-2 rounded-2xl rounded-bl-md border border-line bg-surface px-3 py-2 shadow-soft">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-amber text-[10px] font-bold text-white">
                AI
              </span>
              <span className="text-[12.5px] leading-relaxed text-ink">
                因為第一天的遺忘最快,這時拉回来最省力;錯過就要從更低的起點重來。
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-cream-2 px-3 py-2.5">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-bold text-cream">
              quiz
            </span>
            <span className="text-[12.5px] text-ink-2">
              <span className="font-medium text-ink">練習題</span> · 5 題(3 單選 + 2 簡答)
            </span>
            <span className="num ml-auto text-[12.5px] font-semibold text-success">答對 4/5</span>
          </div>
        </div>
      </div>
    </div>
  );
}