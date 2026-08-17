"use client";

import Link from "next/link";
import { motion, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

type Variant = "solid" | "outline" | "ghost";

const VARIANT_CLASS: Record<Variant, string> = {
  solid: "bg-afago-cream text-afago-void hover:bg-afago-terracotta hover:text-afago-cream",
  outline:
    "border border-afago-cream/30 text-afago-cream bg-transparent hover:border-afago-cream hover:bg-afago-cream/10",
  ghost: "text-afago-cream/80 hover:text-afago-gold-soft",
};

const base =
  "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 py-3.5 text-[0.8rem] font-medium uppercase tracking-[0.14em] transition-colors duration-300";

/** Whole element drifts a few px toward the cursor while hovered — used on the one or two primary CTAs per section. */
function useMagnetic(strength = 10) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 220, damping: 16, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 220, damping: 16, mass: 0.3 });

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const relX = event.clientX - (rect.left + rect.width / 2);
    const relY = event.clientY - (rect.top + rect.height / 2);
    x.set((relX / (rect.width / 2)) * strength);
    y.set((relY / (rect.height / 2)) * strength);
  };
  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { x: springX, y: springY, onPointerMove, onPointerLeave };
}

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
  icon?: ReactNode;
  "data-cursor-label"?: string;
}

interface AsLink extends CommonProps {
  href: string;
  target?: string;
  rel?: string;
  onClick?: undefined;
}

interface AsButton extends CommonProps {
  href?: undefined;
  onClick?: () => void;
  type?: "button" | "submit";
}

export function AfagoButton(props: AsLink | AsButton) {
  const { variant = "solid", className, children, icon } = props;
  const magnetic = useMagnetic();
  const classes = cn(base, VARIANT_CLASS[variant], className);

  const inner = (
    <>
      <span>{children}</span>
      {icon && (
        <span className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
          {icon}
        </span>
      )}
    </>
  );

  const motionShared = {
    style: { x: magnetic.x, y: magnetic.y },
    onPointerMove: magnetic.onPointerMove,
    onPointerLeave: magnetic.onPointerLeave,
    whileTap: { scale: 0.96 },
    transition: { duration: 0.2, ease: EASE_EDITORIAL },
  };

  if ("href" in props && props.href) {
    return (
      <motion.span {...motionShared} className="inline-block">
        <Link
          href={props.href}
          target={props.target}
          rel={props.rel}
          data-cursor="view"
          data-cursor-label={props["data-cursor-label"]}
          className={classes}
        >
          {inner}
        </Link>
      </motion.span>
    );
  }

  const buttonProps = props as AsButton;
  return (
    <motion.button
      {...motionShared}
      type={buttonProps.type ?? "button"}
      onClick={buttonProps.onClick}
      data-cursor="view"
      data-cursor-label={props["data-cursor-label"]}
      className={classes}
    >
      {inner}
    </motion.button>
  );
}
