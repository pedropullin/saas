"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMagnetic } from "@/hooks/useMagnetic";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "invert" | "quiet";
type Size = "sm" | "md" | "lg";

const SURFACE: Record<Variant, string> = {
  primary: "bg-ink text-off-white",
  secondary: "border border-ink/15 text-ink hover:border-ink/40",
  invert: "bg-off-white text-ink",
  quiet: "border border-off-white/20 text-off-white hover:border-off-white/50",
};

/** The sweep that fills a solid button from the bottom on hover. */
const SWEEP: Partial<Record<Variant, string>> = {
  primary: "bg-accent",
  invert: "bg-accent",
};

const SIZE: Record<Size, string> = {
  sm: "h-9 px-4 text-[0.8125rem]",
  md: "h-11 px-6 text-[0.875rem]",
  lg: "h-[3.25rem] px-8 text-[0.9375rem]",
};

interface CTAButtonProps {
  children: ReactNode;
  href: string;
  variant?: Variant;
  size?: Size;
  /** Pointer attraction. On by default for the primary action, off for dense rows. */
  magnetic?: boolean;
  arrow?: boolean;
  className?: string;
  "data-cursor"?: string;
  "data-cursor-label"?: string;
}

/**
 * The landing page's single call-to-action element.
 *
 * Three layered microinteractions, all transform/opacity: the button drifts
 * toward the cursor (magnetic), an accent panel sweeps up behind the label,
 * and the arrow steps forward. Every one of them resolves back to rest — none
 * of them run on their own.
 */
export function CTAButton({
  children,
  href,
  variant = "primary",
  size = "md",
  magnetic = variant === "primary",
  arrow = true,
  className,
  ...rest
}: CTAButtonProps) {
  const pull = useMagnetic(8);
  const sweep = SWEEP[variant];
  const isSolid = variant === "primary" || variant === "invert";

  return (
    <motion.span
      className={cn("inline-block", className)}
      style={magnetic ? { x: pull.x, y: pull.y } : undefined}
      onPointerMove={magnetic ? pull.onPointerMove : undefined}
      onPointerLeave={magnetic ? pull.onPointerLeave : undefined}
      whileTap={{ scale: 0.985 }}
    >
      <Link
        href={href}
        data-cursor={rest["data-cursor"]}
        data-cursor-label={rest["data-cursor-label"]}
        className={cn(
          "group relative isolate inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xs font-medium tracking-[-0.01em] transition-colors duration-300",
          SURFACE[variant],
          SIZE[size],
          isSolid && "hover:text-accent-ink"
        )}
      >
        {sweep && (
          <span
            aria-hidden
            className={cn(
              "absolute inset-0 -z-10 origin-bottom scale-y-0 transition-transform duration-[450ms] ease-editorial group-hover:scale-y-100",
              sweep
            )}
          />
        )}
        <span className="relative">{children}</span>
        {arrow && (
          <svg
            aria-hidden
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className="relative -mr-0.5 transition-transform duration-300 ease-editorial group-hover:translate-x-1"
          >
            <path
              d="M2.5 7h9M7.75 3.25 11.5 7l-3.75 3.75"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Link>
    </motion.span>
  );
}
