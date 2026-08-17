"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/** Slim fixed progress bar tracking whole-page scroll — one of the few
 * "chrome" elements that stays visible across every section. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 160,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-[90] h-[2.5px] origin-left bg-gradient-to-r from-afago-terracotta via-afago-gold to-afago-terracotta-soft"
      style={{ scaleX }}
    />
  );
}
