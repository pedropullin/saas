import type { Variants } from "framer-motion";
import { DURATION, EASE_EDITORIAL } from "./easing";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.slow, ease: EASE_EDITORIAL },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.slow, ease: EASE_EDITORIAL },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: DURATION.base, ease: EASE_EDITORIAL },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.05,
    },
  },
};

export const hoverLift = {
  rest: { y: 0, transition: { duration: DURATION.fast, ease: EASE_EDITORIAL } },
  hover: { y: -4, transition: { duration: DURATION.fast, ease: EASE_EDITORIAL } },
};

export const hoverPress = {
  rest: { scale: 1 },
  hover: { scale: 1.015, transition: { duration: DURATION.fast, ease: EASE_EDITORIAL } },
  tap: { scale: 0.985, transition: { duration: 0.1, ease: EASE_EDITORIAL } },
};
