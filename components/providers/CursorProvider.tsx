"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { VMark } from "@/components/ui/VMark";

type CursorKind = "view" | "open" | "explore" | "v" | "drag" | null;

/**
 * Custom cursor for the marketing pages only. Disabled on touch devices.
 * Reads `data-cursor="view|open|explore|v|drag"` off the hovered element:
 * text kinds label the dot, "v" swaps the dot for a small accent V mark.
 * Everything else stays a bare 9px dot — the cursor should almost never
 * announce itself.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const isFinePointer = useMediaQuery("(pointer: fine)");
  const zoneRef = useRef<HTMLDivElement>(null);
  const [kind, setKind] = useState<CursorKind>(null);
  const [label, setLabel] = useState<string | null>(null);

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
        const value = target.getAttribute("data-cursor") as CursorKind;
        setKind(value);
        setLabel(target.getAttribute("data-cursor-label"));
      } else {
        setKind(null);
        setLabel(null);
      }
    };

    zone.addEventListener("pointermove", handleMove);
    return () => zone.removeEventListener("pointermove", handleMove);
  }, [isFinePointer, x, y]);

  const active = kind !== null;
  const isV = kind === "v";
  const size = isV ? 46 : active ? 72 : 10;

  return (
    <div ref={zoneRef} data-cursor-zone={isFinePointer ? "" : undefined}>
      {children}
      {isFinePointer && (
        <motion.div
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-[100] flex items-center justify-center rounded-full"
          style={{
            x: springX,
            y: springY,
            translateX: "-50%",
            translateY: "-50%",
            mixBlendMode: isV ? "normal" : "difference",
          }}
          animate={{
            width: size,
            height: size,
            backgroundColor: isV ? "transparent" : "#ffffff",
          }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {isV && <VMark variant="solid" size={28} tone="accent" />}
          {!isV && label && (
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-ink">{label}</span>
          )}
        </motion.div>
      )}
    </div>
  );
}
