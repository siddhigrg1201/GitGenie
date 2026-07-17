import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownRenderer({ children }: { children: string }) {
  return (
    <div className="markdown text-sm leading-relaxed text-foreground/90">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-6 mb-3 text-2xl font-semibold tracking-tight" {...p} />,
          h2: (p) => <h2 className="mt-6 mb-2 text-lg font-semibold tracking-tight" {...p} />,
          h3: (p) => <h3 className="mt-4 mb-2 text-base font-semibold" {...p} />,
          p: (p) => <p className="my-3 text-muted-foreground" {...p} />,
          a: (p) => <a className="text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer" {...p} />,
          ul: (p) => <ul className="my-3 list-disc space-y-1 pl-5 text-muted-foreground" {...p} />,
          ol: (p) => <ol className="my-3 list-decimal space-y-1 pl-5 text-muted-foreground" {...p} />,
          li: (p) => <li className="marker:text-muted-foreground/60" {...p} />,
          code: ({ className, children, ...rest }) => {
            const isBlock = /language-/.test(className ?? "");
            if (isBlock) {
              return (
                <pre className="my-4 overflow-x-auto rounded-lg border border-border bg-background/60 p-4 text-xs leading-relaxed">
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </pre>
              );
            }
            return (
              <code className="rounded border border-border bg-background/60 px-1 py-0.5 font-mono text-[0.85em]" {...rest}>
                {children}
              </code>
            );
          },
          table: (p) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm" {...p} />
            </div>
          ),
          th: (p) => <th className="border-b border-border bg-card/60 px-3 py-2 text-left font-semibold" {...p} />,
          td: (p) => <td className="border-b border-border/50 px-3 py-2 text-muted-foreground" {...p} />,
          hr: () => <hr className="my-6 border-border" />,
          blockquote: (p) => (
            <blockquote className="my-4 border-l-2 border-primary/60 pl-4 italic text-muted-foreground" {...p} />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
