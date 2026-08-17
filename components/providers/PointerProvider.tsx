"use client";

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  motionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

export interface PointerField {
  /** Raw viewport coordinates in px — for anything anchored to the cursor itself. */
  clientX: MotionValue<number>;
  clientY: MotionValue<number>;
  /** Spring-smoothed pointer position normalized to −0.5…0.5 of the viewport. */
  nx: MotionValue<number>;
  ny: MotionValue<number>;
  /** False on touch devices and whenever the user asks for reduced motion. */
  enabled: boolean;
}

const IDLE: PointerField = {
  clientX: motionValue(-100),
  clientY: motionValue(-100),
  nx: motionValue(0),
  ny: motionValue(0),
  enabled: false,
};

const PointerContext = createContext<PointerField>(IDLE);

/**
 * One `pointermove` listener for the whole page, read through motion values.
 *
 * Every cursor-reactive element on the landing page (parallax layers, the
 * symbol drift, the custom cursor) subscribes to these values instead of
 * attaching its own listener, so pointer motion never triggers a React
 * render — it writes straight to the compositor via transforms.
 *
 * The field reports `enabled: false` on coarse pointers and under
 * `prefers-reduced-motion`, which is the single switch consumers check
 * before applying any cursor-driven transform.
 */
export function PointerProvider({ children }: { children: ReactNode }) {
  const finePointer = useMediaQuery("(pointer: fine)");
  const reducedMotion = useReducedMotion();
  const enabled = finePointer && !reducedMotion;

  const clientX = useMotionValue(-100);
  const clientY = useMotionValue(-100);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const nx = useSpring(rawX, { stiffness: 90, damping: 26, mass: 0.55 });
  const ny = useSpring(rawY, { stiffness: 90, damping: 26, mass: 0.55 });

  const frame = useRef<number | null>(null);
  const latest = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!enabled) {
      rawX.set(0);
      rawY.set(0);
      return;
    }

    // Events are coalesced into one rAF tick: a 1000Hz mouse still costs at
    // most one write per frame.
    const flush = () => {
      frame.current = null;
      const point = latest.current;
      if (!point) return;
      clientX.set(point.x);
      clientY.set(point.y);
      rawX.set(point.x / window.innerWidth - 0.5);
      rawY.set(point.y / window.innerHeight - 0.5);
    };

    const onMove = (event: PointerEvent) => {
      latest.current = { x: event.clientX, y: event.clientY };
      frame.current ??= requestAnimationFrame(flush);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };
  }, [enabled, clientX, clientY, rawX, rawY]);

  const value = useMemo<PointerField>(
    () => ({ clientX, clientY, nx, ny, enabled }),
    [clientX, clientY, nx, ny, enabled]
  );

  return <PointerContext.Provider value={value}>{children}</PointerContext.Provider>;
}

export function usePointerField(): PointerField {
  return useContext(PointerContext);
}
