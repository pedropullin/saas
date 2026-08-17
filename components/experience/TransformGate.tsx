"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { mapRange, mapRangeUnit } from "@/lib/motion/mapRange";

/**
 * The connective tissue between chapters — a small form grows until it
 * swallows the whole viewport, then releases into the next section. Not a
 * fade: the shape itself is the transition, per the "sections transform
 * into one another" brief.
 */
export function TransformGate({
  label,
  tone = "accent",
}: {
  label: string;
  tone?: "accent" | "ink" | "paper";
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  const scale = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.5, 0.8], [0.05, 3.4, 3.4]));
  const radius = useTransform(scrollYProgress, (v) => mapRangeUnit(v, [0, 0.45], ["50%", "6%"]));
  const gateOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.78, 1], [1, 0]));
  const labelOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.32, 0.48, 0.68], [0, 1, 0]));
  const labelY = useTransform(scrollYProgress, (v) => mapRange(v, [0.32, 0.5], [16, 0]));

  const bg = tone === "accent" ? "var(--color-accent)" : tone === "paper" ? "var(--color-off-white)" : "var(--color-ink)";
  const textClass = tone === "accent" ? "text-accent-ink" : tone === "paper" ? "text-ink" : "text-off-white";

  return (
    <section ref={ref} className="relative bg-ink" style={{ height: "150vh" }}>
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden">
        <motion.div
          aria-hidden
          className="absolute h-24 w-24"
          style={{ scale, borderRadius: radius, backgroundColor: bg, opacity: gateOpacity }}
        />
        <motion.p
          style={{ opacity: labelOpacity, y: labelY }}
          className={cn(
            "relative text-center text-h2 font-medium tracking-[-0.02em]",
            textClass
          )}
        >
          {label}
        </motion.p>
      </div>
    </section>
  );
}
