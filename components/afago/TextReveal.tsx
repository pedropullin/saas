"use client";

import { motion } from "framer-motion";
import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

interface TextRevealProps {
  text: string;
  as?: ElementType;
  className?: string;
  /** Words (case-insensitive, exact match) rendered in the terracotta accent + italic. */
  highlight?: string[];
  delay?: number;
  /** Stagger step between words, in seconds. */
  stagger?: number;
  once?: boolean;
}

/**
 * Word-by-word mask reveal: each word sits in an overflow-hidden clip and
 * slides up from below as it enters the viewport, so the type appears to be
 * unveiled rather than simply faded in. Whole words (not characters) keep it
 * cheap enough to run well on mobile.
 */
export function TextReveal({
  text,
  as: Tag = "p",
  className,
  highlight = [],
  delay = 0,
  stagger = 0.055,
  once = true,
}: TextRevealProps) {
  const strip = (w: string) => w.toLowerCase().replace(/[.,!?"“”]/g, "");
  const words = text.split(" ");
  const highlightSet = new Set(highlight.map(strip));

  return (
    <Tag className={cn("flex flex-wrap", className)}>
      {words.map((word, i) => {
        const isHighlighted = highlightSet.has(strip(word));
        return (
          <span key={`${word}-${i}`} className="mr-[0.28em] overflow-hidden pb-[0.12em]">
            <motion.span
              className={cn("inline-block", isHighlighted && "italic text-afago-terracotta-soft")}
              initial={{ y: "110%" }}
              whileInView={{ y: "0%" }}
              viewport={{ once, margin: "-10% 0px" }}
              transition={{
                duration: 0.85,
                ease: EASE_EDITORIAL,
                delay: delay + i * stagger,
              }}
            >
              {word}
            </motion.span>
          </span>
        );
      })}
    </Tag>
  );
}
