"use client";

import { useReducedMotion } from "framer-motion";
import { useMounted } from "./useMounted";

/**
 * `useReducedMotion` reads the media query as soon as the module loads in the
 * browser, so its first client value can disagree with what the server
 * rendered — which trips hydration whenever the preference changes markup
 * (a status label, a `style` attribute). This reports `false` until after
 * hydration, then the real preference.
 *
 * Use it anywhere the preference reaches the rendered output. Event handlers
 * and effects can use `useReducedMotion` directly.
 */
export function useSafeReducedMotion(): boolean {
  const reduced = useReducedMotion();
  const mounted = useMounted();
  return mounted ? reduced === true : false;
}
