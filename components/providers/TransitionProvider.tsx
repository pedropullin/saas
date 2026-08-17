"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

type Phase = "idle" | "covering" | "covered" | "revealing";

const TransitionContext = createContext<((href: string) => void) | null>(null);

export function useTransitionNavigate(): (href: string) => void {
  const ctx = useContext(TransitionContext);
  if (!ctx) throw new Error("useTransitionNavigate must be used inside TransitionProvider");
  return ctx;
}

/**
 * Site-wide page transition: a V mask sweeps in to cover the outgoing view,
 * the route change happens underneath it, then it sweeps back out. Pages
 * never simply swap — the symbol carries the viewer between them.
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const prevPathname = useRef(pathname);
  const pendingHref = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (phase !== "idle") return;
      pendingHref.current = href;
      setPhase("covering");
    },
    [phase]
  );

  useEffect(() => {
    if (phase !== "covering") return;
    const timeout = setTimeout(() => {
      setPhase("covered");
      if (pendingHref.current) router.push(pendingHref.current);
    }, 640);
    return () => clearTimeout(timeout);
  }, [phase, router]);

  useEffect(() => {
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;
    if (phase === "covered") {
      // Reacting to a route change that completed underneath the cover is
      // exactly the "sync with an external system" case effects exist for.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase("revealing");
      const timeout = setTimeout(() => setPhase("idle"), 640);
      return () => clearTimeout(timeout);
    }
  }, [pathname, phase]);

  const covering = phase !== "idle";

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <AnimatePresence>
        {covering && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-[200] flex items-center justify-center bg-ink"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{
              clipPath: phase === "revealing" ? "circle(0% at 50% 50%)" : "circle(150% at 50% 50%)",
            }}
            exit={{ clipPath: "circle(0% at 50% 50%)" }}
            transition={{ duration: 0.62, ease: EASE_EDITORIAL }}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: phase === "covered" ? 1 : 0.6 }}
              transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
            >
              <VMark variant="split" size={56} tone="accent" breathe />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TransitionContext.Provider>
  );
}
