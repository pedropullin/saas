import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { VMark } from "@/components/ui/VMark";

export function BeforeAfter() {
  return (
    <section className="py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="A transformação" title="De uma ideia solta a um sistema fechado." />
        </Reveal>

        <div className="mt-16 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <Reveal delay={0.1}>
            <div className="rounded-md border border-dashed border-ink/20 bg-off-white p-8">
              <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-400">
                Antes — Briefing
              </p>
              <div className="mt-6 space-y-3 text-[0.9375rem] text-neutral-500">
                <p>&ldquo;Nome: Norte&rdquo;</p>
                <p>&ldquo;Segmento: Arquitetura&rdquo;</p>
                <p>&ldquo;Estilo: algo moderno, minimalista&rdquo;</p>
                <p>&ldquo;Ainda não sei as cores...&rdquo;</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.16} className="flex justify-center py-4 lg:py-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink">
              <VMark variant="solid" size={18} tone="paper" />
            </div>
          </Reveal>

          <Reveal delay={0.22}>
            <div className="rounded-md border border-ink/10 bg-ink p-8 text-off-white shadow-lifted">
              <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">
                Depois — Identidade completa
              </p>
              <div className="mt-6 flex items-center gap-3">
                <VMark variant="cropped" size={30} tone="paper" />
                <span className="text-xl font-semibold lowercase tracking-[-0.02em]">norte</span>
              </div>
              <div className="mt-5 flex gap-1.5">
                {["#17170F", "#F5F4EF", "#A8A79B", "#C6F13A"].map((hex) => (
                  <span key={hex} className="h-6 w-6 rounded-[3px]" style={{ backgroundColor: hex }} />
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-[0.75rem] text-off-white/60">
                <span className="rounded-full border border-off-white/15 px-3 py-1">Tipografia</span>
                <span className="rounded-full border border-off-white/15 px-3 py-1">Grid</span>
                <span className="rounded-full border border-off-white/15 px-3 py-1">Aplicações</span>
                <span className="rounded-full border border-off-white/15 px-3 py-1">Brand Book</span>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
