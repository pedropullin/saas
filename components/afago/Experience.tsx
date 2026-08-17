"use client";

import { useRef } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "framer-motion";
import { Flame, ForkKnife, Martini, CookingPot, type Icon } from "@phosphor-icons/react";
import { PlaceholderImage } from "@/components/afago/PlaceholderImage";
import { MENU_CATEGORIES } from "@/lib/afago/data";

const ICONS: Record<string, Icon> = {
  petiscos: ForkKnife,
  grelhados: Flame,
  "pratos-da-casa": CookingPot,
  drinks: Martini,
};

const TONES = ["char", "terracotta", "void", "char"] as const;

function Panel({
  index,
  title,
  tagline,
  trackProgress,
  count,
}: {
  index: number;
  title: string;
  tagline: string;
  trackProgress: MotionValue<number>;
  count: number;
}) {
  const IconCmp = ICONS[title.toLowerCase().replace(/\s+/g, "-")] ?? ForkKnife;
  const textRef = useRef<HTMLDivElement>(null);

  // The track moves linearly across the *whole* scroll range, so panel i is
  // only ever exactly on-screen (x = 0) at progress = i / (count - 1) — not
  // at (i + 0.5) / count. Every per-panel transform below is keyed off that
  // same "rest" point so the image/text motion actually lines up with when
  // the panel is physically in view instead of drifting off mid-fade.
  const step = count > 1 ? 1 / (count - 1) : 1;
  const rest = index * step;

  // Image and text ride the same scroll signal at different rates/ranges —
  // the "independent movement" the brief asks for between image and copy.
  const imageScale = useTransform(
    trackProgress,
    [rest - step * 0.6, rest, rest + step * 0.6],
    [1.18, 1, 1.18]
  );
  const textY = useTransform(
    trackProgress,
    [rest - step * 0.6, rest, rest + step * 0.6],
    [60, 0, -60]
  );
  const textOpacity = useTransform(
    trackProgress,
    [rest - step * 0.55, rest - step * 0.22, rest + step * 0.22, rest + step * 0.55],
    [0, 1, 1, 0]
  );
  // `opacity` is written imperatively rather than via `style` on the
  // motion.div below — see ProgressDot's comment for why (a framer-motion 13
  // WAAPI-fastpath bug on non-monotonic opacity keyframes).
  useMotionValueEvent(textOpacity, "change", (latest) => {
    if (textRef.current) textRef.current.style.opacity = String(latest);
  });

  return (
    <div className="relative h-full w-screen shrink-0 overflow-hidden">
      <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
        <PlaceholderImage
          label={`Categoria — ${title}`}
          tone={TONES[index % TONES.length]}
          icon={IconCmp}
          className="h-full w-full"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-afago-void/90 via-afago-void/10 to-afago-void/40" />

      <motion.div
        ref={textRef}
        style={{ y: textY, opacity: 0 }}
        className="absolute inset-x-0 bottom-16 flex flex-col items-start px-8 sm:bottom-24 sm:px-16"
      >
        <span className="mb-3 font-mono text-xs tracking-[0.3em] text-afago-gold-soft">
          {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <h3 className="font-serif text-afago-h1 leading-[0.95] text-afago-cream">{title}</h3>
        <p className="mt-3 font-serif text-lg italic text-afago-cream-dim/80 sm:text-xl">
          {tagline}
        </p>
      </motion.div>
    </div>
  );
}

function ProgressDot({
  scrollYProgress,
  index,
  count,
}: {
  scrollYProgress: MotionValue<number>;
  index: number;
  count: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const step = count > 1 ? 1 / (count - 1) : 1;
  const rest = index * step;
  const opacity = useTransform(
    scrollYProgress,
    [rest - step, rest, rest + step],
    [0.25, 1, 0.25]
  );
  // Written imperatively (no motion.span) — see usePointerGlow for the same
  // pattern. A plain `motion.span` bound to a scroll-derived opacity value
  // hits a framer-motion 13 bug on mount ("Offsets must be monotonically
  // non-decreasing", thrown from its native-WAAPI fast path); reading the
  // value onto the DOM node directly sidesteps it entirely.
  useMotionValueEvent(opacity, "change", (latest) => {
    if (ref.current) ref.current.style.opacity = String(latest);
  });
  return <span ref={ref} className="h-1.5 w-1.5 rounded-full bg-afago-gold-soft" style={{ opacity: 0.25 }} />;
}

export function Experience() {
  const ref = useRef<HTMLDivElement>(null);
  const count = MENU_CATEGORIES.length;

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const trackX = useTransform(scrollYProgress, [0, 1], ["0vw", `-${(count - 1) * 100}vw`]);

  return (
    <section id="experiencia" className="relative bg-afago-void">
      <div className="px-6 pt-24 md:px-10">
        <p className="text-center text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-terracotta-soft">
          Experiência Gastronômica
        </p>
        <h2 className="mt-4 text-center font-serif text-afago-h2 text-afago-cream">
          O que se compartilha à mesa
        </h2>
      </div>

      {/* Pinned track: wrapper is N screens tall so scrolling through it drives
          horizontal translation on the sticky inner panel. Runs identically on
          touch — vertical scroll gesture, horizontal visual result. */}
      <div ref={ref} style={{ height: `${count * 100}vh` }} className="relative mt-10">
        <div className="sticky top-0 h-[100svh] overflow-hidden">
          <motion.div className="flex h-full" style={{ x: trackX }}>
            {MENU_CATEGORIES.map((cat, i) => (
              <Panel
                key={cat.id}
                index={i}
                title={cat.title}
                tagline={cat.tagline}
                trackProgress={scrollYProgress}
                count={count}
              />
            ))}
          </motion.div>

          {/* Progress dots */}
          <div className="pointer-events-none absolute inset-x-0 top-8 flex items-center justify-center gap-2">
            {MENU_CATEGORIES.map((cat, i) => (
              <ProgressDot key={cat.id} scrollYProgress={scrollYProgress} index={i} count={count} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
