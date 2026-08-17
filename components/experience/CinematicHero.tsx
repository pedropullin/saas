"use client";

import { useRef, useState, type PointerEvent } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { ArrowRight } from "lucide-react";
import { VBars } from "./VBars";
import { PhoneMockup } from "@/components/ui/PhoneMockup";
import { Magnetic } from "@/components/ui/Magnetic";
import { TransitionLink } from "@/components/providers/TransitionLink";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { mapRange, mapRangeUnit } from "@/lib/motion/mapRange";

const MORPH_WORDS = ["inteligência", "precisão", "velocidade", "consistência", "escala"];
const SEGMENT_TAGS = ["Arquitetura", "Moda", "Tecnologia", "Design", "Alimentação"];

/**
 * Isolated in its own component so the `phoneStep` state tick (which forces
 * PhoneMockup's internal AnimatePresence to remount a screen) only
 * re-renders this small subtree — not the whole hero. Keeping a
 * state-driven re-render away from sibling scroll-linked motion values
 * avoids them getting reset to a stale style on an unrelated commit.
 */
function ScrollPhone({
  opacity,
  y,
  scale,
  stepRaw,
}: {
  opacity: MotionValue<number>;
  y: MotionValue<string>;
  scale: MotionValue<number>;
  stepRaw: MotionValue<number>;
}) {
  const [step, setStep] = useState(0);
  useMotionValueEvent(stepRaw, "change", (latest) => {
    const next = Math.min(4, Math.max(0, Math.round(latest)));
    setStep((prev) => (prev === next ? prev : next));
  });

  return (
    <motion.div
      className="pointer-events-none absolute bottom-0 right-4 md:right-16"
      style={{ opacity, y, scale }}
    >
      <div className="pointer-events-auto drop-shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
        <PhoneMockup step={step} />
      </div>
    </motion.div>
  );
}

export function CinematicHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  // ---- pointer parallax (independent of scroll) --------------------------
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const wordDriftX = useSpring(
    useTransform(pointerX, (v) => mapRange(v, [-0.5, 0.5], [-14, 14])),
    { stiffness: 120, damping: 20 }
  );
  const wordDriftY = useSpring(
    useTransform(pointerY, (v) => mapRange(v, [-0.5, 0.5], [-10, 10])),
    { stiffness: 120, damping: 20 }
  );
  const vDriftX = useSpring(
    useTransform(pointerX, (v) => mapRange(v, [-0.5, 0.5], [26, -26])),
    { stiffness: 90, damping: 22 }
  );
  const vDriftY = useSpring(
    useTransform(pointerY, (v) => mapRange(v, [-0.5, 0.5], [18, -18])),
    { stiffness: 90, damping: 22 }
  );

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  // ---- scroll-driven V fragmentation --------------------------------------
  const leftX = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.6], [0, -13]));
  const leftY = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.6], [0, -9]));
  const leftRotate = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.6], [0, -26]));
  const rightX = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.6], [0, 13]));
  const rightY = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.6], [0, 9]));
  const rightRotate = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.6], [0, 22]));
  const vScale = useTransform(scrollYProgress, (v) => mapRange(v, [0, 1], [1, 1.9]));
  const vOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.3, 0.7, 1], [0.045, 0.08, 0.08, 0.02]));
  const vRotateContainer = useTransform(scrollYProgress, (v) => mapRange(v, [0, 1], [0, 16]));

  // ---- scroll-driven wordmark relocation ----------------------------------
  const wordX = useTransform(scrollYProgress, (v) => mapRangeUnit(v, [0, 0.55], ["0%", "128%"]));
  const wordY = useTransform(scrollYProgress, (v) => mapRangeUnit(v, [0, 0.55], ["0%", "-92%"]));
  const wordScale = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.55], [1, 0.26]));

  // ---- scroll-driven headline reveal --------------------------------------
  const headlineOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.28, 0.48], [0, 1]));
  const headlineY = useTransform(scrollYProgress, (v) => mapRange(v, [0.28, 0.48], [36, 0]));

  // ---- scroll-driven phone --------------------------------------------------
  const phoneOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0.4, 0.58], [0, 1]));
  const phoneScale = useTransform(scrollYProgress, (v) => mapRange(v, [0.4, 1], [0.55, 1]));
  const phoneY = useTransform(scrollYProgress, (v) => mapRangeUnit(v, [0.4, 1], ["16vh", "0vh"]));
  const phoneStepRaw = useTransform(scrollYProgress, (v) => mapRange(v, [0.45, 1], [0, 4]));

  const cueOpacity = useTransform(scrollYProgress, (v) => mapRange(v, [0, 0.06], [1, 0]));

  // ---- headline word-morph -------------------------------------------------
  const [wordIndex, setWordIndex] = useState(0);
  const cycleRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCycle() {
    if (cycleRef.current) return;
    cycleRef.current = setInterval(() => {
      setWordIndex((i) => (i + 1) % MORPH_WORDS.length);
    }, 620);
  }
  function stopCycle() {
    if (cycleRef.current) {
      clearInterval(cycleRef.current);
      cycleRef.current = null;
    }
    setWordIndex(0);
  }

  return (
    <section ref={sectionRef} id="topo" className="relative bg-ink" style={{ height: "200vh" }}>
      <div className="sticky top-0 h-screen overflow-hidden" onPointerMove={handlePointerMove}>
        {/* huge, barely-there V behind everything */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ scale: vScale, rotate: vRotateContainer, x: vDriftX, y: vDriftY }}
        >
          <VBars
            className="h-[92vmin] w-[92vmin]"
            color="var(--color-off-white)"
            opacity={vOpacity}
            left={{ x: leftX, y: leftY, rotate: leftRotate }}
            right={{ x: rightX, y: rightY, rotate: rightRotate }}
          />
        </motion.div>

        {/* wordmark, reacts to cursor, relocates on scroll */}
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ x: wordX, y: wordY, scale: wordScale }}
        >
          <motion.div style={{ x: wordDriftX, y: wordDriftY }}>
            <span className="block text-[16vw] font-semibold leading-none tracking-[-0.04em] text-off-white lg:text-[13vw]">
              veyro
            </span>
          </motion.div>
        </motion.div>

        {/* headline */}
        <motion.div
          className="absolute left-6 top-[38%] max-w-2xl md:left-16 md:px-0"
          style={{ opacity: headlineOpacity, y: headlineY }}
        >
          <p className="text-h1 font-semibold leading-[1.05] tracking-[-0.03em] text-off-white">
            Crie marcas extraordinárias com{" "}
            <span
              className="relative inline-block overflow-hidden align-bottom"
              data-cursor="v"
              onMouseEnter={startCycle}
              onMouseLeave={stopCycle}
              style={{ height: "1em" }}
            >
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={MORPH_WORDS[wordIndex]}
                  initial={{ y: "60%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-60%", opacity: 0 }}
                  transition={{ duration: 0.36, ease: EASE_EDITORIAL }}
                  className="inline-block text-accent"
                >
                  {MORPH_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            .
          </p>
          <p className="mt-4 max-w-md text-body-lg text-off-white/60">
            Do briefing à marca completa. A VEYRO transforma uma ideia simples em uma identidade
            visual pronta para o mundo — em minutos.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Magnetic>
              <TransitionLink
                href="/app/criar"
                data-cursor="v"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[0.9375rem] font-semibold text-accent-ink transition-transform hover:scale-[1.03]"
              >
                Começar
                <ArrowRight className="h-4 w-4" />
              </TransitionLink>
            </Magnetic>
            <Magnetic>
              <a
                href="#produto"
                data-cursor="v"
                className="inline-flex items-center gap-2 rounded-full border border-off-white/25 px-6 py-3.5 text-[0.9375rem] font-semibold text-off-white transition-colors hover:border-off-white/60"
              >
                Saber mais
                <ArrowRight className="h-4 w-4" />
              </a>
            </Magnetic>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            {SEGMENT_TAGS.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-off-white/15 px-3.5 py-1.5 text-[0.75rem] font-medium text-off-white/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.div>

        {/* phone, arrives as the story turns toward product */}
        <ScrollPhone opacity={phoneOpacity} y={phoneY} scale={phoneScale} stepRaw={phoneStepRaw} />

        {/* scroll cue */}
        <motion.div
          style={{ opacity: cueOpacity }}
          className="absolute bottom-9 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-off-white/45"
        >
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.16em]">Role para começar</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="h-8 w-px bg-off-white/40"
          />
        </motion.div>
      </div>
    </section>
  );
}
