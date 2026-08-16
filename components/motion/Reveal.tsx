"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion/variants";

interface RevealProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  delay?: number;
  as?: "div" | "section";
}

/** Single reveal-on-scroll wrapper reused by every section on the site. */
export function Reveal({ children, delay, as = "div", transition, ...rest }: RevealProps) {
  const MotionTag = as === "section" ? motion.section : motion.div;
  const resolvedTransition = delay
    ? { delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] as const, ...(transition as object) }
    : transition;
  return (
    <MotionTag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={fadeUp}
      transition={resolvedTransition}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
