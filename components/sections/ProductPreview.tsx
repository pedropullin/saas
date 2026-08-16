"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { PRODUCT_NAV } from "@/lib/constants";
import { projects } from "@/lib/mock/projects";

const recent = projects.slice(0, 4);

export function ProductPreview() {
  return (
    <section id="produto" className="border-y border-ink/8 bg-off-white py-28 md:py-36">
      <Container>
        <Reveal className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <SectionHeading
            eyebrow="O produto"
            title="Um dashboard feito para gerenciar marcas, não só arquivos."
            description="Projetos, identidades e brand books organizados em um só lugar — do rascunho ao sistema final."
          />
          <Button href="/app" variant="secondary">
            Ver dashboard completo
          </Button>
        </Reveal>

        <Reveal delay={0.12} className="mt-14">
          <div className="overflow-hidden rounded-md border border-ink/10 bg-paper shadow-lifted">
            <div className="grid grid-cols-[220px_1fr]">
              <aside className="hidden border-r border-ink/8 bg-off-white p-5 sm:block">
                <div className="mb-8 flex items-center gap-2">
                  <VMark variant="solid" size={18} tone="ink" />
                  <Wordmark className="text-[0.9375rem]" />
                </div>
                <nav className="space-y-1">
                  {PRODUCT_NAV.map((item, i) => (
                    <div
                      key={item.href}
                      className={`rounded-[4px] px-3 py-2 text-[0.8125rem] font-medium ${
                        i === 0 ? "bg-ink text-off-white" : "text-neutral-500"
                      }`}
                    >
                      {item.label}
                    </div>
                  ))}
                </nav>
              </aside>

              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-h3 font-medium text-ink">Dashboard</p>
                    <p className="mt-1 text-[0.8125rem] text-neutral-500">
                      Bem-vinda de volta. Aqui está o panorama dos seus projetos.
                    </p>
                  </div>
                  <span className="rounded-[4px] bg-accent px-4 py-2 text-[0.8125rem] font-medium text-accent-ink">
                    Nova identidade
                  </span>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Projetos", value: "8" },
                    { label: "Em andamento", value: "3" },
                    { label: "Identidades", value: "5" },
                    { label: "Designers", value: "2" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-[6px] border border-ink/8 p-4">
                      <p className="text-2xl font-medium text-ink">{stat.value}</p>
                      <p className="mt-1 text-[0.75rem] text-neutral-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <p className="mb-3 text-[0.75rem] font-medium uppercase tracking-[0.06em] text-neutral-500">
                    Projetos recentes
                  </p>
                  <div className="divide-y divide-ink/6 rounded-[6px] border border-ink/8">
                    {recent.map((project) => (
                      <div key={project.id} className="flex items-center justify-between px-4 py-3">
                        <div>
                          <p className="text-[0.875rem] font-medium text-ink">{project.name}</p>
                          <p className="text-[0.75rem] text-neutral-500">{project.segment}</p>
                        </div>
                        <span className="text-[0.6875rem] uppercase tracking-[0.05em] text-neutral-400">
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
