"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useSpring } from "framer-motion";
import { usePointerField } from "@/components/providers/PointerProvider";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

interface CursorState {
  mode: "default" | "hover";
  label: string | null;
}

/**
 * The marketing cursor: a small ink ring that trails the pointer and opens
 * into a labelled disc over anything tagged `data-cursor`. That label is the
 * "cursor reveals information" affordance — it names the action a card or
 * canvas will perform before it's clicked.
 *
 * It reads the shared pointer field rather than listening itself, and renders
 * nothing at all on touch devices or under reduced motion.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const { clientX, clientY, enabled } = usePointerField();
  const [state, setState] = useState<CursorState>({ mode: "default", label: null });
  const modeRef = useRef<CursorState>(state);

  const x = useSpring(clientX, { stiffness: 480, damping: 34, mass: 0.35 });
  const y = useSpring(clientY, { stiffness: 480, damping: 34, mass: 0.35 });

  useEffect(() => {
    if (!enabled) return;

    // Target detection is cheap but not free, so it rides the same rAF budget
    // as the pointer field and only calls setState when the mode changes.
    let frame: number | null = null;
    let pending: EventTarget | null = null;

    const resolve = () => {
      frame = null;
      const target = pending instanceof Element ? pending.closest("[data-cursor]") : null;
      const next: CursorState = target
        ? { mode: "hover", label: target.getAttribute("data-cursor-label") }
        : { mode: "default", label: null };
      if (next.mode !== modeRef.current.mode || next.label !== modeRef.current.label) {
        modeRef.current = next;
        setState(next);
      }
    };

    const onMove = (event: PointerEvent) => {
      pending = event.target;
      frame ??= requestAnimationFrame(resolve);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, [enabled]);

  const isHover = state.mode === "hover";

  return (
    <div data-cursor-zone={enabled ? "" : undefined}>
      {children}
      {enabled && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full border"
          style={{ x, y, translateX: "-50%", translateY: "-50%" }}
          animate={{
            width: isHover ? (state.label ? 88 : 40) : 12,
            height: isHover ? (state.label ? 88 : 40) : 12,
            backgroundColor: isHover ? "rgba(10,10,9,1)" : "rgba(10,10,9,0)",
            borderColor: isHover ? "rgba(10,10,9,1)" : "rgba(10,10,9,0.5)",
          }}
          transition={{ duration: 0.32, ease: EASE_EDITORIAL }}
          initial={false}
        >
          <AnimatePresence>
            {isHover && state.label && (
              <motion.span
                key={state.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, ease: EASE_EDITORIAL }}
                className="px-2 text-center text-[10px] font-medium uppercase leading-tight tracking-[0.08em] text-off-white"
              >
                {state.label}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
