"use client";

import { motion } from "framer-motion";
import { VMark } from "@/components/ui/VMark";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

interface App {
  label: string;
  span?: "wide" | "tall" | "normal";
  tone: "ink" | "off-white" | "accent";
  initial: Record<string, number>;
}

const APPS: App[] = [
  { label: "Website", span: "wide", tone: "ink", initial: { opacity: 0, x: -80 } },
  { label: "Smartphone", tone: "off-white", initial: { opacity: 0, y: 90, rotate: 8 } },
  { label: "Social media", tone: "accent", initial: { opacity: 0, scale: 0.6 } },
  { label: "Cartão", tone: "ink", initial: { opacity: 0, x: 90, rotate: -6 } },
  { label: "Apresentação", span: "wide", tone: "off-white", initial: { opacity: 0, rotateX: -35, y: 40 } },
  { label: "Embalagem", tone: "ink", initial: { opacity: 0, y: -80 } },
  { label: "Brand book", tone: "off-white", initial: { opacity: 0, scale: 0.5, rotate: 10 } },
  { label: "Dashboard", span: "wide", tone: "accent", initial: { opacity: 0, x: 100 } },
];

const TONE_CLASS: Record<App["tone"], string> = {
  ink: "bg-ink text-off-white",
  "off-white": "bg-off-white text-ink border border-ink/10",
  accent: "bg-accent text-accent-ink",
};

export function ApplicationsOrbit() {
  return (
    <section className="bg-[#0d0d08] py-32" style={{ perspective: 1400 }}>
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">Aplicações</p>
        <h2 className="mt-4 text-h1 font-medium text-off-white">A mesma marca, em todo lugar.</h2>
        <p className="mx-auto mt-4 max-w-md text-body-lg text-off-white/55">
          Cada peça chega pronta para uso — consistente do site ao cartão de visitas.
        </p>
      </div>

      <div className="mx-auto mt-16 grid max-w-5xl grid-cols-2 gap-3 px-6 md:grid-cols-4">
        {APPS.map((app, i) => (
          <motion.div
            key={app.label}
            initial={app.initial}
            whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0, rotateX: 0, scale: 1 }}
            viewport={{ once: true, margin: "-15% 0px" }}
            transition={{ duration: 0.7, delay: (i % 4) * 0.08, ease: EASE_EDITORIAL }}
            whileHover={{ y: -5 }}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-3 rounded-md",
              TONE_CLASS[app.tone],
              app.span === "wide" && "col-span-2 aspect-auto py-10"
            )}
          >
            <VMark variant="mono" size={26} tone={app.tone === "off-white" ? "ink" : app.tone === "accent" ? "current" : "paper"} />
            <span className="text-[0.8125rem] font-medium">{app.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
