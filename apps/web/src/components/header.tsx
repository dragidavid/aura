import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

import logo from "@/../public/aura_logo.png";

export async function Header() {
  const res = await fetch(`https://api.github.com/repos/dragidavid/aura`);
  const data = await res.json();

  return (
    <header className={cn("sticky top-2 z-50 mt-2 px-2")}>
      <nav
        className={cn(
          "mx-auto flex h-12 max-w-2xl items-center justify-between rounded-xl px-3",
          "border border-white/10 bg-black/20 backdrop-blur-md",
        )}
      >
        <Link href="/" className={cn("rounded-full", "select-none")}>
          <Image
            src={logo}
            alt="aura logo"
            className={cn("h-5 w-auto", "pointer-events-none")}
            priority
          />
        </Link>

        <div className={cn("flex items-center gap-2")}>
          <a
            aria-label="View source code on GitHub"
            href="https://github.com/dragidavid/aura"
            target="_blank"
            className={cn(
              "h-8 rounded-full px-[5px]",
              "transition-colors duration-100",
              "border border-white/10",
              "hover:bg-white/10",
              data?.stargazers_count && "pr-2",
            )}
          >
            <span className={cn("flex h-full items-center gap-2 text-sm")}>
              <svg
                viewBox="0 0 16 16"
                className={cn("size-5", "fill-current")}
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>

              {data?.stargazers_count?.toLocaleString()}
            </span>
          </a>

          <a
            aria-label="View package on npm"
            href="https://www.npmjs.com/package/@drgd/aura"
            target="_blank"
            className={cn(
              "h-8 rounded-full px-[5px]",
              "transition-colors duration-100",
              "border border-white/10",
              "hover:bg-white/10",
            )}
          >
            <span className={cn("flex h-full items-center")}>
              <svg
                viewBox="0 0 128 128"
                className={cn("size-5", "fill-current")}
                aria-hidden="true"
              >
                <path d="M2 38.5h124v43.71H64v7.29H36.44v-7.29H2Zm6.89 36.43h13.78V53.07h6.89v21.86h6.89V45.79H8.89Zm34.44-29.14v36.42h13.78v-7.28h13.78V45.79Zm13.78 7.29H64v14.56h-6.89Zm20.67-7.29v29.14h13.78V53.07h6.89v21.86h6.89V53.07h6.89v21.86h6.89V45.79Z" />
              </svg>
            </span>
          </a>

          <a
            aria-label="View profile on X"
            href="https://x.com/dragidavid"
            target="_blank"
            className={cn(
              "h-8 rounded-full px-[5px]",
              "transition-colors duration-100",
              "border border-white/10",
              "hover:bg-white/10",
            )}
          >
            <span className={cn("flex h-full items-center")}>
              <svg
                viewBox="0 0 24 24"
                className={cn("size-5", "fill-current")}
                aria-hidden="true"
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </span>
          </a>
        </div>
      </nav>
    </header>
  );
}
