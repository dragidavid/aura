"use client";

import { useState, useCallback } from "react";
import { Highlight } from "prism-react-renderer";
import copy from "copy-to-clipboard";

import { cn } from "@/lib/cn";

const theme = {
  plain: {
    color: "var(--color-white)",
    fontSize: "var(--text-sm)",
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "var(--color-zinc-300)",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector", "string"],
      style: {
        color: "var(--color-zinc-400)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "var(--color-zinc-300)",
      },
    },
    {
      types: ["class-name", "function", "tag"],
      style: {
        color: "var(--color-white)",
      },
    },
  ],
};

type Props = {
  code: string;
  language?: string;
};

export function Code({ code, language = "jsx" }: Props) {
  const [copying, setCopying] = useState(0);

  const onCopy = useCallback(() => {
    copy(code);
    setCopying((c) => c + 1);
    setTimeout(() => {
      setCopying((c) => c - 1);
    }, 2000);
  }, [code]);

  return (
    <div className={cn("group relative")}>
      <button
        className={cn(
          "absolute top-3 right-3 z-10 grid size-6 place-items-center rounded-md",
          "border border-white/20 bg-black opacity-0",
          "transition-opacity duration-200",
          "group-hover:opacity-100",
        )}
        onClick={onCopy}
      >
        {copying ? (
          <div>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              shapeRendering="geometricPrecision"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        ) : (
          <div>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              shapeRendering="geometricPrecision"
            >
              <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z" />
            </svg>
          </div>
        )}
      </button>
      <Highlight theme={theme} code={code} language={language}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            style={style}
            className={cn(
              "overflow-x-scroll rounded-lg p-3",
              "bg-radial-[at_-10%_-20%] from-zinc-800 to-black [background-size:170%_120%]",
            )}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
