"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * Custom cursor for the marketing pages only. Disabled on touch devices.
 * Expands and labels itself over elements tagged data-cursor="view" / "drag".
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const isFinePointer = useMediaQuery("(pointer: fine)");
  const zoneRef = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, { damping: 28, stiffness: 340, mass: 0.4 });
  const springY = useSpring(y, { damping: 28, stiffness: 340, mass: 0.4 });

  useEffect(() => {
    if (!isFinePointer) return;
    const zone = zoneRef.current;
    if (!zone) return;

    const handleMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
      const target = (event.target as HTMLElement)?.closest("[data-cursor]");
      if (target) {
        setActive(true);
        setLabel(target.getAttribute("data-cursor-label"));
      } else {
        setActive(false);
        setLabel(null);
      }
    };

    zone.addEventListener("pointermove", handleMove);
    return () => zone.removeEventListener("pointermove", handleMove);
  }, [isFinePointer, x, y]);

  return (
    <div ref={zoneRef} data-cursor-zone={isFinePointer ? "" : undefined}>
      {children}
      {isFinePointer && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full mix-blend-difference"
          style={{ x: springX, y: springY, translateX: "-50%", translateY: "-50%" }}
          animate={{
            width: active ? 72 : 10,
            height: active ? 72 : 10,
            backgroundColor: "#ffffff",
          }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {label && (
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink">
              {label}
            </span>
          )}
        </motion.div>
      )}
    </div>
  );
}
