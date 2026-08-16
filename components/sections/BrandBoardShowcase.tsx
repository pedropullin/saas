"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { BrandBoardModule } from "@/components/ui/BrandBoardModule";
import { VMark } from "@/components/ui/VMark";
import { identities } from "@/lib/mock/identities";

const identity = identities[0]!;

export function BrandBoardShowcase() {
  return (
    <section className="py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="O resultado"
            title="Uma ideia. Um sistema de marca completo."
            description={`O briefing de ${identity.brandName} se transforma em um sistema coerente — não apenas um logotipo.`}
          />
        </Reveal>

        <Stagger className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4">
          <StaggerItem className="col-span-2">
            <BrandBoardModule label="Logo principal" tone="ink" className="min-h-[180px]">
              <div className="flex items-center gap-3">
                <VMark variant="solid" size={40} tone="paper" />
                <span className="text-3xl font-semibold lowercase tracking-[-0.02em] text-off-white">
                  norte
                </span>
              </div>
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem>
            <BrandBoardModule label="Símbolo" className="min-h-[180px] items-center">
              <VMark variant="cropped" size={64} tone="ink" />
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem>
            <BrandBoardModule label="Logo secundária" className="min-h-[180px]">
              <div className="flex flex-col items-start gap-2">
                <VMark variant="stacked" size={30} tone="ink" />
                <span className="text-lg font-medium lowercase tracking-[-0.01em]">norte</span>
              </div>
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem className="col-span-2">
            <BrandBoardModule label="Paleta" tone="off-white" className="min-h-[180px]">
              <div className="grid grid-cols-4 gap-2">
                {identity.colors.map((color) => (
                  <div key={color.hex}>
                    <div
                      className="h-14 rounded-[4px] border border-ink/8"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="mt-1.5 text-[0.6875rem] text-neutral-500">{color.hex}</p>
                  </div>
                ))}
              </div>
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem className="col-span-2">
            <BrandBoardModule label="Tipografia" className="min-h-[180px]">
              <div className="space-y-2">
                <p className="text-3xl font-medium leading-none text-ink">Aa Bb Cc</p>
                <p className="text-[0.8125rem] text-neutral-500">
                  {identity.typography.display} — {identity.typography.body}
                </p>
              </div>
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem>
            <BrandBoardModule label="Direção fotográfica" tone="ink" className="min-h-[180px]">
              <div className="grid grid-cols-2 gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-[3px] bg-off-white/10" />
                ))}
              </div>
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem>
            <BrandBoardModule label="Elementos gráficos" className="min-h-[180px]">
              <div className="flex flex-wrap gap-1.5">
                <VMark variant="outline" size={26} tone="ink" />
                <VMark variant="mono" size={26} tone="ink" />
                <VMark variant="split" size={26} tone="ink" />
              </div>
            </BrandBoardModule>
          </StaggerItem>

          <StaggerItem className="col-span-2">
            <BrandBoardModule label="Aplicações" tone="accent" className="min-h-[180px]">
              <div className="flex flex-wrap gap-2">
                {identity.applications.map((app) => (
                  <span
                    key={app.label}
                    className="rounded-full border border-accent-ink/15 px-3 py-1 text-[0.75rem] font-medium text-accent-ink"
                  >
                    {app.label}
                  </span>
                ))}
              </div>
            </BrandBoardModule>
          </StaggerItem>
        </Stagger>
      </Container>
    </section>
  );
}
