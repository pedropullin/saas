"use client";

import { useCallback } from "react";
import { useMotionValue, useReducedMotion, useSpring, type MotionValue } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface TiltOptions {
  /** Max rotation in degrees at the corners. Stays under ~4 to read as a nudge, not a toy. */
  max?: number;
  /** Px the card drifts toward the cursor. */
  drift?: number;
  /** Px the card lifts while hovered. */
  lift?: number;
}

export interface Tilt {
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void;
  onPointerLeave: () => void;
  enabled: boolean;
}

const SPRING = { stiffness: 150, damping: 20, mass: 0.4 };

/**
 * Extremely restrained card tilt: the surface leans a couple of degrees and
 * drifts a few px toward the cursor, then springs back on leave. Returns inert
 * values and no-op handlers on touch devices and under reduced motion, so the
 * caller can spread them unconditionally.
 */
export function useTilt({ max = 3, drift = 5, lift = 4 }: TiltOptions = {}): Tilt {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const tx = useMotionValue(0);
  const ty = useMotionValue(0);

  const rotateX = useSpring(rx, SPRING);
  const rotateY = useSpring(ry, SPRING);
  const x = useSpring(tx, SPRING);
  const y = useSpring(ty, SPRING);

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rx.set(-py * max * 2);
      ry.set(px * max * 2);
      tx.set(px * drift * 2);
      ty.set(py * drift * 2 - lift);
    },
    [enabled, max, drift, lift, rx, ry, tx, ty]
  );

  const onPointerLeave = useCallback(() => {
    rx.set(0);
    ry.set(0);
    tx.set(0);
    ty.set(0);
  }, [rx, ry, tx, ty]);

  return { rotateX, rotateY, x, y, onPointerMove, onPointerLeave, enabled };
}
