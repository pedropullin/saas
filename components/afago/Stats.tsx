"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { Star } from "@phosphor-icons/react";
import { AFAGO } from "@/lib/afago/data";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

function Counter({
  to,
  decimals = 0,
  prefix = "",
  suffix = "",
}: {
  to: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { damping: 32, stiffness: 70 });

  useEffect(() => {
    if (inView) motionValue.set(to);
  }, [inView, motionValue, to]);

  useEffect(() => {
    return spring.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${latest.toFixed(decimals)}${suffix}`;
      }
    });
  }, [spring, decimals, prefix, suffix]);

  return (
    <span ref={ref}>
      {prefix}
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}

const STATS = [
  {
    kind: "rating" as const,
    label: "Avaliação no Google",
  },
  {
    kind: "reviews" as const,
    label: "Avaliações",
  },
  {
    kind: "price" as const,
    label: "Faixa média por pessoa",
  },
];

export function Stats() {
  return (
    <section className="border-y border-afago-line bg-afago-void py-24 sm:py-32">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-16 px-6 sm:grid-cols-3 sm:gap-8 md:px-10">
        {STATS.map((stat, i) => (
          <motion.div
            key={stat.kind}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: i * 0.12 }}
            className="flex flex-col items-center text-center"
          >
            {stat.kind === "rating" && (
              <>
                <div className="flex items-baseline gap-2 font-serif text-6xl text-afago-cream sm:text-7xl">
                  <Counter to={AFAGO.googleRating} decimals={1} />
                  <Star size={26} weight="fill" className="mb-1 text-afago-gold-soft" />
                </div>
              </>
            )}
            {stat.kind === "reviews" && (
              <span className="font-serif text-6xl text-afago-cream sm:text-7xl">
                <Counter to={AFAGO.googleReviewCount} suffix="+" />
              </span>
            )}
            {stat.kind === "price" && (
              <span className="font-serif text-6xl text-afago-cream sm:text-7xl">
                <Counter to={AFAGO.pricePerPersonMin} prefix="R$" />
                <span className="mx-1 text-afago-cream-dim/50">–</span>
                <Counter to={AFAGO.pricePerPersonMax} />
              </span>
            )}
            <p className="mt-4 text-[0.72rem] font-medium uppercase tracking-[0.24em] text-afago-cream-dim/60">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
