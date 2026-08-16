"use client";

import Link from "next/link";
import type { Identity } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { VMark } from "@/components/ui/VMark";
import { BrandBoardModule } from "@/components/ui/BrandBoardModule";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";

export function IdentityResultView({ identity }: { identity: Identity }) {
  return (
    <div className="mx-auto max-w-5xl">
      <Reveal className="text-center">
        <VMark variant="cropped" size={56} tone="ink" className="mx-auto" breathe />
        <p className="mt-6 text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          {identity.brandName}
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Sua identidade está pronta.</h1>
      </Reveal>

      <Stagger className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StaggerItem className="col-span-2">
          <BrandBoardModule label="Logo" tone="ink" className="min-h-[170px]">
            <div className="flex items-center gap-3">
              <VMark variant="solid" size={36} tone="paper" />
              <span className="text-2xl font-semibold lowercase tracking-[-0.02em] text-off-white">
                {identity.brandName.toLowerCase()}
              </span>
            </div>
          </BrandBoardModule>
        </StaggerItem>

        <StaggerItem>
          <BrandBoardModule label="Símbolo" className="min-h-[170px] items-center">
            <VMark variant={identity.symbolVariant} size={56} tone="ink" />
          </BrandBoardModule>
        </StaggerItem>

        <StaggerItem>
          <BrandBoardModule label="Tipografia" className="min-h-[170px]">
            <p className="text-2xl font-medium text-ink">Aa</p>
            <p className="mt-1 text-[0.75rem] text-neutral-500">{identity.typography.display}</p>
          </BrandBoardModule>
        </StaggerItem>

        <StaggerItem className="col-span-2">
          <BrandBoardModule label="Paleta" tone="off-white" className="min-h-[150px]">
            <div className="grid grid-cols-4 gap-2">
              {identity.colors.map((color) => (
                <div key={color.hex}>
                  <div className="h-12 rounded-[4px] border border-ink/8" style={{ backgroundColor: color.hex }} />
                  <p className="mt-1.5 text-[0.6875rem] text-neutral-500">{color.name}</p>
                </div>
              ))}
            </div>
          </BrandBoardModule>
        </StaggerItem>

        <StaggerItem className="col-span-2">
          <BrandBoardModule label="Direção visual" className="min-h-[150px]">
            <div className="flex flex-wrap gap-2">
              {identity.personalityTags.map((tag) => (
                <span key={tag} className="rounded-full border border-ink/12 px-3 py-1 text-[0.75rem] font-medium text-ink">
                  {tag}
                </span>
              ))}
            </div>
          </BrandBoardModule>
        </StaggerItem>

        <StaggerItem className="col-span-2 md:col-span-4">
          <BrandBoardModule label="Aplicações" tone="accent" className="min-h-[120px]">
            <div className="flex flex-wrap gap-2">
              {identity.applications.map((app) => (
                <span key={app.label} className="rounded-full border border-accent-ink/15 px-3 py-1 text-[0.75rem] font-medium text-accent-ink">
                  {app.label}
                </span>
              ))}
            </div>
          </BrandBoardModule>
        </StaggerItem>
      </Stagger>

      <Reveal delay={0.1} className="mt-10 flex flex-wrap justify-center gap-3">
        <Button variant="secondary">Editar identidade</Button>
        <Button href={`/app/brandbook/${identity.id}`} variant="secondary">
          Ver Brand Book
        </Button>
        <Button href="/app/designers">Refinar com designer</Button>
      </Reveal>

      <Reveal delay={0.18} className="mt-20 rounded-md border border-ink/8 bg-ink p-10 text-center text-off-white">
        <p className="text-h3 font-medium">Quer levar sua marca além?</p>
        <p className="mx-auto mt-3 max-w-md text-[0.9375rem] text-off-white/60">
          Conecte seu projeto a um designer profissional e transforme a primeira versão em uma
          identidade definitiva.
        </p>
        <Link
          href="/app/designers"
          className="mt-6 inline-flex items-center justify-center rounded-[3px] bg-accent px-6 py-3 text-[0.875rem] font-medium text-accent-ink transition-transform hover:-translate-y-0.5"
        >
          Ver designers disponíveis
        </Link>
      </Reveal>
    </div>
  );
}
