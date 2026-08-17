"use client";

import { useCallback } from "react";
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface Magnetic {
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  enabled: boolean;
}

/**
 * Pointer attraction for a single element: it drifts a few px toward the
 * cursor while hovered and springs back on leave. Reserved for the one or two
 * decisive CTAs on a screen — used everywhere it stops meaning anything.
 */
export function useMagnetic(strength = 10): Magnetic {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 200, damping: 18, mass: 0.3 });
  const y = useSpring(rawY, { stiffness: 200, damping: 18, mass: 0.3 });

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const relX = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const relY = (event.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      rawX.set(relX * strength);
      rawY.set(relY * strength);
    },
    [enabled, strength, rawX, rawY]
  );

  const onPointerLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
  }, [rawX, rawY]);

  return { x, y, onPointerMove, onPointerLeave, enabled };
}
