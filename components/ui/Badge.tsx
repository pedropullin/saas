import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-[3px] px-2.5 py-1 text-label font-medium uppercase tracking-[0.06em]",
  {
    variants: {
      tone: {
        neutral: "bg-neutral-100 text-neutral-700",
        ink: "bg-ink text-off-white",
        accent: "bg-accent text-accent-ink",
        outline: "border border-ink/15 text-ink",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  }
);

export function Badge({
  children,
  tone,
  className,
}: VariantProps<typeof badgeVariants> & { children: ReactNode; className?: string }) {
  return <span className={cn(badgeVariants({ tone }), className)}>{children}</span>;
}
