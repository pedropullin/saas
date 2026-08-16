import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";

const BENEFITS = [
  {
    number: "01",
    title: "Velocidade",
    description: "Sua primeira identidade começa em minutos.",
  },
  {
    number: "02",
    title: "Precisão",
    description: "A IA transforma suas respostas em decisões visuais coerentes.",
  },
  {
    number: "03",
    title: "Sistema",
    description: "Não criamos apenas um logo. Criamos uma linguagem visual.",
  },
  {
    number: "04",
    title: "Evolução",
    description: "Comece com IA e refine com especialistas quando precisar.",
  },
];

export function Benefits() {
  return (
    <section id="recursos" className="bg-ink py-28 text-off-white md:py-36">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Por que a VEYRO"
            title={<span className="text-off-white">Um sistema, não um gerador de logos.</span>}
          />
        </Reveal>

        <div className="mt-16 divide-y divide-off-white/10 border-y border-off-white/10">
          {BENEFITS.map((benefit, index) => (
            <Reveal key={benefit.number} delay={index * 0.06}>
              <div className="grid gap-4 py-10 md:grid-cols-[100px_1fr_1.4fr] md:items-center md:gap-10">
                <span className="text-[0.8125rem] font-medium tabular-nums text-off-white/40">
                  {benefit.number}
                </span>
                <h3 className="text-h2 font-medium text-off-white">{benefit.title}</h3>
                <p className="max-w-md text-body-lg text-off-white/60">{benefit.description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
