"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { VMark } from "@/components/ui/VMark";
import { RevealLines } from "@/components/landing/TextReveal";
import { useTilt } from "@/hooks/useTilt";
import { APPLICATIONS, BRAND_DIRECTIONS } from "@/lib/mock/landing";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const NORTE = BRAND_DIRECTIONS[0]!;
const [INK, LINEN, SAND, SIGNAL] = [
  NORTE.palette[0]!.hex,
  NORTE.palette[1]!.hex,
  NORTE.palette[2]!.hex,
  NORTE.palette[3]!.hex,
];

/** Each card enters on its own vector, so the grid assembles instead of marching. */
const ENTRANCES = [
  { opacity: 0, x: -28, y: 0, scale: 1, rotate: 0 },
  { opacity: 0, x: 0, y: 44, scale: 1, rotate: 0 },
  { opacity: 0, x: 0, y: 0, scale: 0.93, rotate: 0 },
  { opacity: 0, x: 26, y: 12, scale: 1, rotate: 0 },
  { opacity: 0, x: 0, y: 36, scale: 1, rotate: -1.2 },
  { opacity: 0, x: 0, y: 30, scale: 0.96, rotate: 0 },
] as const;

const SPANS = [
  "md:col-span-2",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-1",
  "md:col-span-2",
];

const MOCKS: Record<string, ReactNode> = {
  website: <WebsiteMock />,
  instagram: <InstagramMock />,
  packaging: <PackagingMock />,
  "business-card": <BusinessCardMock />,
  social: <SocialMock />,
  advertisement: <AdvertisementMock />,
};

/**
 * Section 5 — the same identity on six surfaces.
 *
 * Every mock is drawn in CSS from the brand's own palette: no raster assets to
 * download, nothing to lazy-load, and the compositions stay crisp at any
 * density.
 */
export function BrandShowcase() {
  return (
    <section className="border-b border-ink/8 py-24 md:py-36">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
              Aplicações
            </p>
            <RevealLines
              as="h2"
              className="mt-5 text-h1 font-medium text-ink"
              lines={["Uma marca só existe", "quando é aplicada."]}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.1 }}
            className="max-w-sm text-[0.9375rem] leading-relaxed text-neutral-600 lg:text-right"
          >
            Cada peça abaixo sai do mesmo sistema gerado pela VEYRO — sem redesenhar nada.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {APPLICATIONS.map((application, index) => (
            <ShowcaseCard
              key={application.id}
              label={application.label}
              note={application.note}
              index={index}
              className={SPANS[index]}
            >
              {MOCKS[application.id]}
            </ShowcaseCard>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL }}
            className="md:col-span-1"
          >
            <Link
              href="/app/criar"
              className="group flex h-full min-h-[260px] flex-col justify-between rounded-md border border-dashed border-ink/15 p-6 transition-colors duration-500 hover:border-ink/40"
              data-cursor="cta"
              data-cursor-label="Criar"
            >
              <VMark variant="outline" size={26} tone="ink" className="opacity-40" />
              <div>
                <p className="text-[1.0625rem] font-medium text-ink">
                  E tudo o mais que a marca precisar.
                </p>
                <p className="mt-2 text-[0.8125rem] text-neutral-500">
                  Apresentações, e-mail, sinalização, uniforme, frota.
                </p>
                <span className="mt-4 inline-flex items-center gap-2 text-[0.8125rem] font-medium text-ink">
                  Criar minha identidade
                  <span className="transition-transform duration-300 ease-editorial group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </div>
            </Link>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function ShowcaseCard({
  label,
  note,
  index,
  className,
  children,
}: {
  label: string;
  note: string;
  index: number;
  className?: string;
  children: ReactNode;
}) {
  const tilt = useTilt({ max: 2, drift: 3, lift: 3 });
  const from = ENTRANCES[index] ?? ENTRANCES[1]!;

  return (
    <motion.div
      initial={from}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.95, ease: EASE_EDITORIAL }}
      onPointerMove={tilt.onPointerMove}
      onPointerLeave={tilt.onPointerLeave}
      className={cn("[perspective:1000px]", className)}
    >
      <motion.figure
        style={{ rotateX: tilt.rotateX, rotateY: tilt.rotateY, x: tilt.x, y: tilt.y }}
        className="group h-full overflow-hidden rounded-md border border-ink/8 bg-paper"
        data-cursor="view"
        data-cursor-label={label}
      >
        {/* A fixed media height — not an aspect ratio — keeps the two-column
            cards the same height as the single-column ones in the same row. */}
        <div
          className="relative h-[220px] overflow-hidden sm:h-[250px] lg:h-[280px]"
          style={{ backgroundColor: LINEN }}
        >
          {children}
        </div>
        <figcaption className="flex items-baseline justify-between gap-3 border-t border-ink/8 px-4 py-3">
          <span className="text-[0.8125rem] font-medium text-ink">{label}</span>
          <span className="truncate text-[0.75rem] text-neutral-400">{note}</span>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */
/* Mocks — flat compositions built from the brand's own palette      */
/* ---------------------------------------------------------------- */

function WebsiteMock() {
  return (
    <div className="absolute inset-0 flex flex-col p-3 sm:p-4">
      <div className="flex items-center gap-2 rounded-t-[4px] border border-black/5 bg-white/60 px-3 py-2">
        <span className="flex gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-black/12" />
          <span className="h-1.5 w-1.5 rounded-full bg-black/12" />
          <span className="h-1.5 w-1.5 rounded-full bg-black/12" />
        </span>
        <span className="mx-auto rounded-full bg-black/5 px-3 py-0.5 text-[0.5625rem] text-black/40">
          norte.arq.br
        </span>
      </div>
      <div
        className="flex flex-1 flex-col justify-between border border-t-0 border-black/5 p-4 sm:p-5"
        style={{ backgroundColor: "#fff", color: INK }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <VMark variant="solid" size={13} tone="current" />
            <span className="text-[0.6875rem] font-semibold lowercase tracking-[-0.02em]">norte</span>
          </div>
          <div className="hidden gap-3 text-[0.5625rem] opacity-45 sm:flex">
            <span>Projetos</span>
            <span>Estúdio</span>
            <span>Contato</span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-[1.4fr_1fr] items-center gap-4 pt-4">
          <div>
            <p className="text-[1.125rem] font-medium leading-[1.05] tracking-[-0.03em] sm:text-[1.5rem]">
              Espaços que
              <br />
              envelhecem bem.
            </p>
            <span
              className="mt-3 inline-block rounded-[2px] px-2.5 py-1 text-[0.5625rem] font-medium"
              style={{ backgroundColor: INK, color: LINEN }}
            >
              Ver projetos
            </span>
          </div>
          <div className="grid gap-1.5">
            <span className="h-8 rounded-[3px]" style={{ backgroundColor: SAND }} />
            <span className="h-5 rounded-[3px]" style={{ backgroundColor: INK, opacity: 0.85 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InstagramMock() {
  const tiles = [INK, SAND, LINEN, SAND, LINEN, INK, LINEN, INK, SAND];
  return (
    <div className="absolute inset-0 flex flex-col bg-white p-3 sm:p-4" style={{ color: INK }}>
      <div className="flex items-center gap-2.5">
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ backgroundColor: INK }}
        >
          <span style={{ color: LINEN }} className="flex">
            <VMark variant="mono" size={12} tone="current" />
          </span>
        </span>
        <div className="min-w-0">
          <p className="truncate text-[0.6875rem] font-medium lowercase">norte.arq</p>
          <p className="text-[0.5625rem] opacity-45">Arquitetura · São Paulo</p>
        </div>
        <span
          className="ml-auto rounded-[2px] px-2 py-1 text-[0.5rem] font-medium"
          style={{ backgroundColor: INK, color: LINEN }}
        >
          Seguir
        </span>
      </div>
      <div className="mt-3 grid flex-1 grid-cols-3 gap-[3px]">
        {tiles.map((color, index) => (
          <span
            key={index}
            className="flex items-center justify-center rounded-[2px] ring-1 ring-inset ring-black/5"
            style={{ backgroundColor: color }}
          >
            {index === 4 && (
              <span className="text-[0.5rem] font-semibold lowercase tracking-[-0.02em] opacity-70">
                norte
              </span>
            )}
            {index === 5 && (
              <span style={{ color: LINEN }} className="flex">
                <VMark variant="cropped" size={11} tone="current" />
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

function PackagingMock() {
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-2.5 px-5 pb-0 pt-6">
      <div
        className="flex h-[62%] w-[26%] flex-col items-center justify-between rounded-t-[3px] px-2 py-3 ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: SAND }}
      >
        <span style={{ color: LINEN }} className="flex">
          <VMark variant="mono" size={12} tone="current" />
        </span>
        <span
          className="text-[0.4375rem] uppercase tracking-[0.2em]"
          style={{ color: LINEN, writingMode: "vertical-rl" }}
        >
          norte
        </span>
      </div>

      <div
        className="flex h-[86%] w-[40%] flex-col justify-between rounded-t-[3px] p-3 shadow-subtle ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: INK, color: LINEN }}
      >
        <VMark variant="solid" size={18} tone="current" />
        <div>
          <p className="text-[0.8125rem] font-semibold lowercase leading-none tracking-[-0.03em]">
            norte
          </p>
          <p className="mt-1.5 text-[0.4375rem] uppercase tracking-[0.22em] opacity-55">
            objeto 01 / edição
          </p>
        </div>
      </div>

      <div
        className="flex h-[50%] w-[22%] items-center justify-center rounded-t-[3px] ring-1 ring-inset ring-black/10"
        style={{ backgroundColor: SIGNAL }}
      >
        <span style={{ color: INK }} className="flex">
          <VMark variant="cropped" size={14} tone="current" />
        </span>
      </div>
    </div>
  );
}

function BusinessCardMock() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="absolute h-[52%] w-[62%] -translate-x-[14%] -translate-y-[16%] rotate-[-6deg] rounded-[3px] p-3 shadow-subtle ring-1 ring-inset ring-black/10 transition-transform duration-500 ease-editorial group-hover:-translate-y-[19%] group-hover:rotate-[-8deg]"
        style={{ backgroundColor: INK }}
      >
        <span style={{ color: LINEN }} className="flex h-full items-center justify-center">
          <VMark variant="solid" size={26} tone="current" />
        </span>
      </div>
      <div
        className="absolute flex h-[52%] w-[62%] translate-x-[14%] translate-y-[16%] rotate-[3deg] flex-col justify-between rounded-[3px] p-3 shadow-subtle ring-1 ring-inset ring-black/10 transition-transform duration-500 ease-editorial group-hover:translate-y-[13%]"
        style={{ backgroundColor: LINEN, color: INK }}
      >
        <div className="flex items-center gap-1.5">
          <VMark variant="mono" size={11} tone="current" />
          <span className="text-[0.5625rem] font-semibold lowercase tracking-[-0.02em]">norte</span>
        </div>
        <div className="text-[0.5rem] leading-relaxed opacity-60">
          <p className="font-medium opacity-100">Helena Braga</p>
          <p>Arquiteta responsável</p>
          <p>+55 11 9 8834 2210</p>
        </div>
      </div>
    </div>
  );
}

function SocialMock() {
  return (
    <div className="absolute inset-0 grid grid-cols-3 gap-1.5 p-3 sm:p-4">
      <div
        className="flex flex-col justify-between rounded-[3px] p-2.5"
        style={{ backgroundColor: INK, color: LINEN }}
      >
        <VMark variant="mono" size={11} tone="current" />
        <p className="text-[0.5625rem] font-medium leading-tight tracking-[-0.02em]">
          Casa
          <br />
          Ipê
        </p>
      </div>
      <div
        className="flex items-center justify-center rounded-[3px]"
        style={{ backgroundColor: SAND }}
      >
        <span style={{ color: LINEN }} className="flex">
          <VMark variant="cropped" size={20} tone="current" />
        </span>
      </div>
      <div
        className="flex flex-col justify-between rounded-[3px] p-2.5 ring-1 ring-inset ring-black/8"
        style={{ backgroundColor: "#fff", color: INK }}
      >
        <p className="text-[0.5rem] leading-snug opacity-60">
          “Luz, matéria e tempo — nessa ordem.”
        </p>
        <span className="h-[2px] w-5 rounded-full" style={{ backgroundColor: SIGNAL }} />
      </div>
    </div>
  );
}

function AdvertisementMock() {
  return (
    <div className="absolute inset-0 p-3 sm:p-4">
      <div
        className="flex h-full flex-col justify-between rounded-[4px] p-5 sm:p-6"
        style={{ backgroundColor: INK, color: LINEN }}
      >
        <div className="flex items-center justify-between">
          <VMark variant="solid" size={18} tone="current" />
          <span className="text-[0.5rem] uppercase tracking-[0.2em] opacity-45">
            OOH · 9 × 3 m
          </span>
        </div>
        <div className="flex items-end justify-between gap-6">
          <p className="text-[1.25rem] font-medium leading-[0.95] tracking-[-0.04em] sm:text-[2rem]">
            Espaços que
            <br />
            envelhecem bem
            <span style={{ color: SIGNAL }}>.</span>
          </p>
          <div className="hidden text-right text-[0.5625rem] leading-relaxed opacity-50 sm:block">
            <p className="lowercase">norte.arq.br</p>
            <p>São Paulo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
