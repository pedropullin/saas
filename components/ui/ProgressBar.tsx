"use client";

import { motion } from "framer-motion";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

export function ProgressBar({
  progress,
  className,
}: {
  progress: number;
  className?: string;
}) {
  return (
    <div className={cn("h-[3px] w-full overflow-hidden rounded-full bg-ink/8", className)}>
      <motion.div
        className="h-full rounded-full bg-accent"
        animate={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
        transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
      />
    </div>
  );
}
