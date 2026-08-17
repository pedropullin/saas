"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { cn } from "@/lib/utils";

/**
 * Wraps a decorative layer so it drifts a few px against the cursor. Inert on
 * touch and under reduced motion — the wrapper stays, the movement doesn't.
 */
export function Parallax({
  children,
  strength = 12,
  strengthY = strength,
  className,
}: {
  children: ReactNode;
  strength?: number;
  strengthY?: number;
  className?: string;
}) {
  const { x, y } = usePointerParallax(strength, strengthY);
  return (
    <motion.div style={{ x, y }} className={cn("will-change-transform", className)}>
      {children}
    </motion.div>
  );
}
