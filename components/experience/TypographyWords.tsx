"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { mapRangeUnit } from "@/lib/motion/mapRange";

const WORDS = ["CREATE", "DEFINE", "BUILD", "IDENTITY", "VEYRO"];

export function TypographyWords() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (v) => mapRangeUnit(v, [0, 1], ["8vw", "-232vw"]));

  return (
    <section ref={ref} className="relative bg-off-white" style={{ height: "300vh" }}>
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div style={{ x }} className="flex items-center gap-[7vw] whitespace-nowrap">
          {WORDS.map((word, i) => (
            <span
              key={word}
              style={{ fontSize: "clamp(3.5rem, 15vw, 14rem)" }}
              className={cn(
                "font-semibold leading-none tracking-[-0.04em]",
                word === "VEYRO"
                  ? "text-accent-dim"
                  : i % 2 === 0
                    ? "text-ink"
                    : "text-transparent [-webkit-text-stroke:1.5px_var(--color-ink)]"
              )}
            >
              {word}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
