import { markdownBlocks, textBlocks } from "@/lib/text";

/** 文章渲染:MD 走區塊解析;TXT/PDF 擷取文走純段落;圖片取字保留換行。 */
export function ArticleView({ content }: { content: string }) {
  const isMarkdown = /(^|\n)#{1,4}\s|\[[^\]]+\]\(|^(\s*)[-*+]\s|^(\s*)\d+[.)]\s|```/m.test(content);
  const blocks = isMarkdown ? markdownBlocks(content) : textBlocks(content);
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i}>
                {b.text}
              </h2>
            );
          case "h3":
            return (
              <h3 key={i}>
                {b.text}
              </h3>
            );
          case "quote":
            return (
              <blockquote key={i}>
                <p>{b.text}</p>
              </blockquote>
            );
          case "list":
            return b.ordered ? (
              <ol key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ol>
            ) : (
              <ul key={i}>
                {b.items.map((it, j) => (
                  <li key={j}>{it}</li>
                ))}
              </ul>
            );
          case "code":
            return (
              <pre key={i}>
                <code>{b.text}</code>
              </pre>
            );
          default:
            return (
              <p key={i}>
                {b.text}
              </p>
            );
        }
      })}
    </>
  );
}