import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TONE_CLASS = {
  neutral: "bg-neutral-100 text-neutral-700",
  ink: "bg-ink text-off-white",
  accent: "bg-accent text-accent-ink",
  outline: "border border-ink/15 text-ink",
} as const;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: keyof typeof TONE_CLASS;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-label font-medium uppercase tracking-[0.06em]",
        TONE_CLASS[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
