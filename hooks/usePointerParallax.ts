"use client";

import { useTransform, type MotionValue } from "framer-motion";
import { usePointerField } from "@/components/providers/PointerProvider";

/**
 * Turns the shared pointer field into a small parallax offset, in px.
 *
 * `strength` is the maximum travel at the very edge of the viewport — keep it
 * in the 4–24px range. Anything larger stops reading as depth and starts
 * reading as an element chasing the cursor.
 */
export function usePointerParallax(
  strength = 12,
  strengthY = strength
): { x: MotionValue<number>; y: MotionValue<number>; enabled: boolean } {
  const { nx, ny, enabled } = usePointerField();
  const x = useTransform(nx, (value) => (enabled ? value * strength * 2 : 0));
  const y = useTransform(ny, (value) => (enabled ? value * strengthY * 2 : 0));
  return { x, y, enabled };
}
