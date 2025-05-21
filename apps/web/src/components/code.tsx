"use client";

import { useState, useCallback } from "react";
import { Highlight } from "prism-react-renderer";
import copy from "copy-to-clipboard";

import { cn } from "@/lib/cn";

const theme = {
  plain: {
    color: "var(--color-white)",
    fontSize: "13px",
    lineHeight: "1.7",
  },
  styles: [
    {
      types: ["comment"],
      style: {
        color: "color-mix(in oklab, var(--color-white) 54%, transparent)",
      },
    },
    {
      types: ["atrule", "keyword", "attr-name", "selector", "string"],
      style: {
        color: "color-mix(in oklab, var(--color-white) 71%, transparent)",
      },
    },
    {
      types: ["punctuation", "operator"],
      style: {
        color: "color-mix(in oklab, var(--color-white) 54%, transparent)",
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
  title?: string;
  variant?: "client" | "server";
  className?: string;
};

export function Code({
  code,
  language = "jsx",
  title,
  variant,
  className,
}: Props) {
  const [copying, setCopying] = useState(0);

  const onCopy = useCallback(() => {
    copy(code);

    setCopying((c) => c + 1);
    setTimeout(() => {
      setCopying((c) => c - 1);
    }, 2000);
  }, [code]);

  const variantStyles = {
    client: {
      gradient: "from-emerald-400/5",
      text: "text-emerald-100",
    },
    server: {
      gradient: "from-rose-400/5",
      text: "text-rose-100",
    },
  };

  return (
    <div
      className={cn(
        "group relative my-6 rounded-2xl",
        "bg-white/5 inset-ring inset-ring-white/10",
        className,
      )}
    >
      <div className={cn("relative p-1")}>
        {title && (
          <div
            className={cn(
              "font px-2 pt-2 pb-2.5 font-serif text-sm font-medium tracking-tight",
              variant && variantStyles[variant].text,
            )}
          >
            <span>{title}</span>
          </div>
        )}

        <button
          onClick={onCopy}
          aria-label="Copy code"
          className={cn(
            "absolute top-[15px] right-[15px] z-10 grid size-8 place-items-center rounded-md",
            "transition-opacity,colors duration-100",
            "bg-black/20 ring ring-white/10 backdrop-blur-md",
            "hover:cursor-pointer hover:bg-white/20",
            "group-hover:opacity-100",
            "sm:opacity-0",
            title && "top-[54px] right-[15px]",
          )}
        >
          {copying ? (
            <div>
              <svg
                viewBox="0 0 24 24"
                className={cn("size-4", "fill-none stroke-current stroke-2")}
                strokeLinecap="round"
                strokeLinejoin="round"
                shapeRendering="geometricPrecision"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
          ) : (
            <div>
              <svg
                viewBox="0 0 24 24"
                className={cn("size-4", "fill-none stroke-current stroke-2")}
                strokeLinecap="round"
                strokeLinejoin="round"
                shapeRendering="geometricPrecision"
              >
                <path d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z" />
              </svg>
            </div>
          )}
        </button>

        <Highlight theme={theme} code={code} language={language}>
          {({ style, tokens, getLineProps, getTokenProps }) => (
            <pre
              style={style}
              className={cn(
                "overflow-x-scroll rounded-xl p-4",
                "bg-radial-[at_-10%_-20%] from-white/10 to-black [background-size:170%_120%] inset-ring inset-ring-white/5",
                variant && variantStyles[variant].gradient,
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
    </div>
  );
}
