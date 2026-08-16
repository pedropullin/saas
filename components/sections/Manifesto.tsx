import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { VMark } from "@/components/ui/VMark";

export function Manifesto() {
  return (
    <section id="manifesto" className="relative overflow-hidden py-40 md:py-56">
      <VMark
        variant="outline"
        size={520}
        tone="ink"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.035]"
      />
      <Container className="relative max-w-3xl text-center">
        <Reveal>
          <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
            Manifesto
          </p>
          <h2 className="mt-6 text-display font-medium text-ink text-balance">
            Marcas não deveriam começar com uma tela em branco.
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mx-auto mt-8 max-w-xl text-body-lg text-neutral-600 text-pretty">
            A VEYRO combina inteligência artificial, design e experiência humana para transformar
            ideias em marcas completas.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
