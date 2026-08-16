"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";

type FormatKind = "number" | "currency" | "percent";

const FORMATTERS: Record<FormatKind, (n: number) => string> = {
  // Rounded even mid-animation — the spring can pass through fractional
  // values on its way to the target and a stray decimal reads as a bug.
  number: (n) => formatNumber(Math.round(n)),
  currency: formatCurrency,
  percent: formatPercent,
};

export function AnimatedNumber({
  value,
  format = "number",
  className,
}: {
  value: number;
  /** A named formatter kind — kept as a string (not a function) so this can be driven from a Server Component. */
  format?: FormatKind;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 30, stiffness: 90 });
  const formatter = FORMATTERS[format];

  useEffect(() => {
    if (inView) motionValue.set(value);
  }, [inView, motionValue, value]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = formatter(latest);
      }
    });
  }, [spring, formatter]);

  return (
    <span ref={ref} className={className}>
      {formatter(0)}
    </span>
  );
}
