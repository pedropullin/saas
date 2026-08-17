"use client";

import { useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useRef, useState, type RefObject } from "react";

/**
 * Tracks scroll progress of a target section and quantizes it into discrete
 * steps — used to drive the PhoneMockup through the briefing → result
 * sequence as the Hero is scrolled. Also exposes the raw progress value so
 * callers can derive their own parallax transforms from the same scroll read.
 */
export function useScrollProgress(stepCount: number): {
  ref: RefObject<HTMLDivElement | null>;
  activeStep: number;
  scrollYProgress: MotionValue<number>;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  const stepValue = useTransform(scrollYProgress, [0, 1], [0, stepCount - 1]);

  useMotionValueEvent(stepValue, "change", (latest) => {
    const next = Math.min(stepCount - 1, Math.max(0, Math.round(latest)));
    setActiveStep((prev) => (prev === next ? prev : next));
  });

  return { ref, activeStep, scrollYProgress };
}
