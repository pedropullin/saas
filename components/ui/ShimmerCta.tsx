"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Magic UI-style shimmer sweep, dialed back to VEYRO's rules: no glow, no
 * neon gradient — a single thin band of light crossing the surface every
 * few seconds. Reserved for the one or two calls to action that should
 * visibly announce themselves; everywhere else the accent stays quiet.
 */
export function ShimmerCta({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("group relative inline-block overflow-hidden rounded-[3px]", className)}>
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-[-60%] w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-off-white/35 to-transparent motion-safe:[animation:shimmer-sweep_3.2s_ease-in-out_infinite]"
      />
    </span>
  );
}
