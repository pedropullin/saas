"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

interface RevealLinesProps {
  /** One entry per rendered line — the reveal is per line, never per letter. */
  lines: ReactNode[];
  className?: string;
  lineClassName?: string;
  delay?: number;
  stagger?: number;
  /** Runs immediately (hero) instead of waiting for the viewport. */
  immediate?: boolean;
  as?: "h1" | "h2" | "p" | "div";
}

/**
 * Editorial line reveal: each line sits in its own overflow-hidden box and
 * rises into place. Letter-by-letter staggers were deliberately avoided —
 * they shred kerning at display sizes and read as a template effect.
 *
 * Under reduced motion the root `MotionConfig reducedMotion="user"` drops the
 * y-travel and keeps the opacity fade, so the copy still lands.
 */
export function RevealLines({
  lines,
  className,
  lineClassName,
  delay = 0,
  stagger = 0.09,
  immediate = false,
  as = "div",
}: RevealLinesProps) {
  const MotionTag = as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : as === "p" ? motion.p : motion.div;
  const animateProps = immediate
    ? { animate: "visible" as const }
    : { whileInView: "visible" as const, viewport: { once: true, margin: "-12% 0px" } };

  return (
    <MotionTag
      initial="hidden"
      {...animateProps}
      transition={{ staggerChildren: stagger, delayChildren: delay }}
      className={className}
    >
      {lines.map((line, index) => (
        <span key={index} className={cn("reveal-line", lineClassName)}>
          <motion.span
            className="block"
            variants={{
              hidden: { y: "110%", opacity: 0 },
              visible: {
                y: "0%",
                opacity: 1,
                transition: { duration: 1, ease: EASE_EDITORIAL },
              },
            }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}
