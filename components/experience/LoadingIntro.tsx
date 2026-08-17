"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import type { VMarkVariant } from "@/lib/types";

const SESSION_KEY = "veyro-intro-seen";

/**
 * Opening sequence for the whole site, played once per browser session.
 * The V arrives fragmented (VMark "stacked"), draws together ("split"),
 * locks solid, then dissolves into the wordmark before lifting away. No
 * spinner, no progress bar — the mark itself is the loading state.
 */
export function LoadingIntro() {
  const [show, setShow] = useState(false);
  const [ready, setReady] = useState(false);
  const [markVariant, setMarkVariant] = useState<VMarkVariant>("stacked");
  const [showWord, setShowWord] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Kicking off the boot sequence is an external-system side effect (like
    // starting an animation), not derived state — the canonical justified
    // use of an effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY)) return;

    setShow(true);
    const root = document.documentElement;
    root.style.overflow = "hidden";

    const timers = [
      setTimeout(() => setMarkVariant("split"), 380),
      setTimeout(() => setMarkVariant("solid"), 1040),
      setTimeout(() => setShowWord(true), 1480),
      setTimeout(() => finish(), 2380),
    ];

    function finish() {
      setExiting(true);
      root.style.overflow = "";
      window.sessionStorage.setItem(SESSION_KEY, "1");
      setTimeout(() => setShow(false), 720);
    }

    return () => {
      timers.forEach(clearTimeout);
      root.style.overflow = "";
    };
  }, []);

  function skip() {
    document.documentElement.style.overflow = "";
    window.sessionStorage.setItem(SESSION_KEY, "1");
    setShow(false);
  }

  if (!ready || !show) return null;

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center bg-ink"
      animate={{ opacity: exiting ? 0 : 1, y: exiting ? "-4%" : "0%" }}
      transition={{ duration: 0.72, ease: EASE_EDITORIAL }}
    >
      <div className="relative flex h-24 items-center justify-center">
        <AnimatePresence mode="wait">
          {!showWord ? (
            <motion.div
              key="mark"
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
            >
              <VMark variant={markVariant} size={72} tone="paper" />
            </motion.div>
          ) : (
            <motion.div
              key="word"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: EASE_EDITORIAL }}
            >
              <Wordmark className="whitespace-nowrap text-4xl text-off-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="button"
        onClick={skip}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.4 }}
        className="absolute bottom-8 right-8 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-off-white/30 transition-colors hover:text-off-white/70"
      >
        Pular
      </motion.button>
    </motion.div>
  );
}
