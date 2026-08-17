"use client";

import { useCallback, useRef, type PointerEvent } from "react";

/**
 * Tracks pointer position within an element and writes it to CSS custom
 * properties (--glow-x/--glow-y) directly on the DOM node — no React state,
 * so this never triggers a re-render. Pair with the `.glow-card` utility in
 * globals.css for a subtle cursor-following highlight (inspired by modern
 * component-library "spotlight card" patterns, restrained to the VEYRO
 * accent at very low opacity).
 */
export function usePointerGlow<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const onPointerMove = useCallback((event: PointerEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty("--glow-x", `${x}%`);
    el.style.setProperty("--glow-y", `${y}%`);
  }, []);

  return { ref, onPointerMove };
}
