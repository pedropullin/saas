"use client";

import { motion } from "framer-motion";
import type { VMarkVariant } from "@/lib/types";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { V_LEFT_PATH, V_RIGHT_PATH, V_VIEWBOX } from "@/lib/v-geometry";
import { cn } from "@/lib/utils";

type BarTransform = { x: number; y: number; rotate: number };

interface VariantConfig {
  left: BarTransform;
  right: BarTransform;
  outline?: boolean;
  hideRight?: boolean;
  cropBottomPct?: number;
}

const VARIANTS: Record<VMarkVariant, VariantConfig> = {
  solid: { left: { x: 0, y: 0, rotate: 0 }, right: { x: 0, y: 0, rotate: 0 } },
  outline: {
    left: { x: 0, y: 0, rotate: 0 },
    right: { x: 0, y: 0, rotate: 0 },
    outline: true,
  },
  split: {
    left: { x: -4, y: -3, rotate: -4 },
    right: { x: 4, y: -3, rotate: 4 },
  },
  cropped: {
    left: { x: 0, y: 0, rotate: 0 },
    right: { x: 0, y: 0, rotate: 0 },
    cropBottomPct: 32,
  },
  stacked: {
    left: { x: 6, y: -13, rotate: -90 },
    right: { x: 6, y: 13, rotate: -90 },
  },
  mono: {
    left: { x: 8, y: 0, rotate: 0 },
    right: { x: 0, y: 0, rotate: 0 },
    hideRight: true,
  },
};

const TONE: Record<string, string> = {
  ink: "var(--color-ink)",
  paper: "var(--color-paper)",
  accent: "var(--color-accent)",
  current: "currentColor",
};

export interface VMarkProps {
  variant?: VMarkVariant;
  size?: number;
  tone?: "ink" | "paper" | "accent" | "current";
  /** 0–1 fill-reveal, used as a generation-progress indicator instead of a spinner. */
  progress?: number;
  /** Subtle breathing loop — the only continuous motion allowed on the mark. */
  breathe?: boolean;
  className?: string;
}

export function VMark({
  variant = "solid",
  size = 40,
  tone = "ink",
  progress,
  breathe = false,
  className,
}: VMarkProps) {
  const config = VARIANTS[variant];
  const color = TONE[tone] ?? TONE.ink;
  const clipStyle =
    typeof progress === "number"
      ? { clipPath: `inset(${Math.max(0, (1 - progress) * 100)}% 0 0 0)`, transition: "clip-path 0.5s var(--ease-editorial, cubic-bezier(0.22,1,0.36,1))" }
      : undefined;

  const barStyle = { transformBox: "fill-box" as const, transformOrigin: "50% 50%" };
  const fillProps = config.outline
    ? { fill: "none", stroke: color, strokeWidth: 2.5 }
    : { fill: color };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox={`0 0 ${V_VIEWBOX} ${V_VIEWBOX}`}
      className={cn("shrink-0", className)}
      role="img"
      aria-label="Símbolo veyro"
      animate={breathe ? { scale: [1, 1.015, 1] } : undefined}
      transition={breathe ? { duration: 6, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={
        config.cropBottomPct
          ? { clipPath: `inset(0 0 ${config.cropBottomPct}% 0)` }
          : undefined
      }
    >
      <g style={clipStyle}>
        <motion.path
          d={V_LEFT_PATH}
          style={barStyle}
          animate={{ x: config.left.x, y: config.left.y, rotate: config.left.rotate }}
          transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
          {...fillProps}
        />
        {!config.hideRight && (
          <motion.path
            d={V_RIGHT_PATH}
            style={barStyle}
            animate={{ x: config.right.x, y: config.right.y, rotate: config.right.rotate }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
            {...fillProps}
          />
        )}
      </g>
    </motion.svg>
  );
}
