"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealLines } from "@/components/landing/TextReveal";
import { CTAButton } from "@/components/landing/CTAButton";
import { useTilt } from "@/hooks/useTilt";
import { designers } from "@/lib/mock/designers";
import type { Designer } from "@/lib/types";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const FEATURED = designers.slice(0, 3);
const REST = designers.slice(3);

const AVAILABILITY_DOT: Record<Designer["availability"], string> = {
  "disponível": "bg-accent",
  "com fila": "bg-neutral-400",
  "indisponível": "bg-neutral-300",
};

/** The human half of the promise, with names attached to it. */
export function DesignerSection() {
  return (
    <section id="designers" className="scroll-mt-24 border-b border-ink/8 py-24 md:py-36">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end lg:gap-20">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
              A rede
            </p>
            <RevealLines
              as="h2"
              className="mt-5 text-h1 font-medium text-ink"
              lines={["Designers que", "assinam o resultado."]}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.1 }}
          >
            <p className="max-w-md text-body-lg text-neutral-600 text-pretty">
              Profissionais selecionados que assumem o projeto a partir da versão gerada. Você
              escolhe quem trabalha na sua marca — ou deixa a VEYRO indicar.
            </p>
            <div className="mt-6">
              <CTAButton href="/app/designers" variant="secondary" magnetic={false}>
                Conhecer a rede
              </CTAButton>
            </div>
          </motion.div>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {FEATURED.map((designer, index) => (
            <DesignerTile key={designer.id} designer={designer} index={index} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE_EDITORIAL }}
          className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/8 pt-6"
        >
          <span className="text-[0.75rem] uppercase tracking-[0.12em] text-neutral-400">
            + {38 - FEATURED.length} designers
          </span>
          {REST.map((designer) => (
            <span key={designer.id} className="text-[0.8125rem] text-neutral-500">
              {designer.name}
            </span>
          ))}
        </motion.div>
      </Container>
    </section>
  );
}

function DesignerTile({ designer, index }: { designer: Designer; index: number }) {
  const tilt = useTilt({ max: 2.5, drift: 4, lift: 4 });

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: index * 0.08 }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className="[perspective:900px]"
    >
      <motion.div
        style={{
          rotateX: tilt.rotateX,
          rotateY: tilt.rotateY,
          x: tilt.x,
          y: tilt.y,
        }}
        className="group flex h-full flex-col justify-between rounded-md border border-ink/8 bg-paper p-6 transition-colors duration-500 hover:border-ink/20"
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-[0.875rem] font-medium text-off-white">
              {designer.initials}
            </span>
            <span className="flex items-center gap-1.5 text-[0.6875rem] uppercase tracking-[0.08em] text-neutral-400">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", AVAILABILITY_DOT[designer.availability])}
                aria-hidden
              />
              {designer.availability}
            </span>
          </div>

          <p className="mt-5 text-[1.0625rem] font-medium text-ink">{designer.name}</p>
          <p className="mt-0.5 text-[0.8125rem] text-neutral-500">{designer.specialty}</p>

          {/* the bio is the cursor's reward — it opens on hover, not by default */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-500 ease-editorial group-hover:grid-rows-[1fr] motion-reduce:grid-rows-[1fr]">
            <p className="overflow-hidden text-[0.8125rem] leading-relaxed text-neutral-600 opacity-0 transition-opacity duration-500 group-hover:opacity-100 motion-reduce:opacity-100">
              <span className="mt-3 block">{designer.bio}</span>
            </p>
          </div>
        </div>

        <dl className="mt-6 flex items-center justify-between border-t border-ink/8 pt-4 text-[0.75rem] text-neutral-500">
          <div className="flex gap-1.5">
            <dt className="sr-only">Experiência</dt>
            <dd className="tabular-nums">{designer.experienceYears} anos</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="sr-only">Projetos</dt>
            <dd className="tabular-nums">{designer.projectsCount} projetos</dd>
          </div>
          <div className="flex gap-1.5">
            <dt className="sr-only">Avaliação</dt>
            <dd className="font-medium tabular-nums text-ink">{designer.rating.toFixed(1)}</dd>
          </div>
        </dl>
      </motion.div>
    </motion.article>
  );
}
