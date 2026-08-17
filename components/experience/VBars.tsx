"use client";

import { motion, type MotionValue } from "framer-motion";
import { V_LEFT_PATH, V_RIGHT_PATH, V_VIEWBOX } from "@/lib/v-geometry";
import { cn } from "@/lib/utils";

type Num = number | MotionValue<number>;

export interface VBarTransform {
  x?: Num;
  y?: Num;
  rotate?: Num;
  scale?: Num;
}

interface VBarsProps {
  className?: string;
  color?: string;
  left?: VBarTransform;
  right?: VBarTransform;
  opacity?: Num;
  strokeOnly?: boolean;
}

const barStyle = { transformBox: "fill-box" as const, transformOrigin: "50% 50%" };

/**
 * Raw two-bar V geometry with independently drivable transforms per bar —
 * the primitive every scroll-linked / fragmenting rendition of the mark is
 * built from (Hero, VSymbolSystem, TransformGate). Accepts either plain
 * numbers or framer MotionValues so scroll-linked callers can bind directly
 * without pushing React state on every frame.
 */
export function VBars({ className, color = "currentColor", left = {}, right = {}, opacity, strokeOnly }: VBarsProps) {
  const fillProps = strokeOnly ? { fill: "none", stroke: color, strokeWidth: 1.5 } : { fill: color };
  return (
    <motion.svg
      viewBox={`0 0 ${V_VIEWBOX} ${V_VIEWBOX}`}
      className={cn("overflow-visible", className)}
      style={{ opacity }}
      aria-hidden
    >
      <motion.path
        d={V_LEFT_PATH}
        style={{ ...barStyle, x: left.x ?? 0, y: left.y ?? 0, rotate: left.rotate ?? 0, scale: left.scale ?? 1 }}
        {...fillProps}
      />
      <motion.path
        d={V_RIGHT_PATH}
        style={{ ...barStyle, x: right.x ?? 0, y: right.y ?? 0, rotate: right.rotate ?? 0, scale: right.scale ?? 1 }}
        {...fillProps}
      />
    </motion.svg>
  );
}
