"use client";

import { useRef } from "react";
import { useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import type { PointerEvent } from "react";

interface TiltResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  onPointerMove: (event: PointerEvent<T>) => void;
  onPointerLeave: () => void;
}

/**
 * Subtle 3D tilt-toward-cursor for cards — small rotation only, spring-eased
 * back to rest on pointer leave. Pointer-fine devices only in practice
 * (pointermove on touch doesn't fire the way this expects), which is fine
 * since the effect is a hover embellishment, not load-bearing content.
 */
export function useTilt<T extends HTMLElement>(strength = 6): TiltResult<T> {
  const ref = useRef<T>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springConfig = { stiffness: 200, damping: 20, mass: 0.4 };
  const rotateX = useSpring(useTransform(rawY, [-0.5, 0.5], [strength, -strength]), springConfig);
  const rotateY = useSpring(useTransform(rawX, [-0.5, 0.5], [-strength, strength]), springConfig);

  const onPointerMove = (event: PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    rawX.set((event.clientX - rect.left) / rect.width - 0.5);
    rawY.set((event.clientY - rect.top) / rect.height - 0.5);
  };

  const onPointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  return { ref, rotateX, rotateY, onPointerMove, onPointerLeave };
}
