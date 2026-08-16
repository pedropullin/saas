import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Stagger, StaggerItem } from "@/components/motion/Stagger";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Free",
    price: "R$ 0",
    period: "para começar",
    features: ["1 identidade ativa", "Paleta e tipografia geradas", "Exportação básica"],
    highlighted: false,
  },
  {
    name: "Pro",
    price: "R$ 149",
    period: "/ mês",
    features: ["Identidades ilimitadas", "Brand book completo", "Refinamento com designer"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "Sob consulta",
    period: "para equipes",
    features: ["Múltiplas marcas e equipe", "Designer dedicado", "Suporte prioritário"],
    highlighted: false,
  },
];

export function PricingTeaser() {
  return (
    <section id="precos" className="border-y border-ink/8 py-28 md:py-36">
      <Container>
        <Reveal>
          <SectionHeading eyebrow="Preços" title="Comece grátis. Evolua quando fizer sentido." />
        </Reveal>

        <Stagger className="mt-14 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <StaggerItem key={plan.name}>
              <div
                className={cn(
                  "flex h-full flex-col justify-between rounded-md border p-8",
                  plan.highlighted ? "border-ink bg-ink text-off-white" : "border-ink/10 bg-paper text-ink"
                )}
              >
                <div>
                  <p
                    className={cn(
                      "text-label font-medium uppercase tracking-[0.08em]",
                      plan.highlighted ? "text-off-white/50" : "text-neutral-500"
                    )}
                  >
                    {plan.name}
                  </p>
                  <p className="mt-4 text-3xl font-medium">
                    {plan.price}
                    <span
                      className={cn(
                        "ml-1.5 text-[0.8125rem] font-normal",
                        plan.highlighted ? "text-off-white/50" : "text-neutral-500"
                      )}
                    >
                      {plan.period}
                    </span>
                  </p>
                  <ul className="mt-6 space-y-2.5 text-[0.875rem]">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className={cn(
                          "border-t pt-2.5 first:border-0 first:pt-0",
                          plan.highlighted ? "border-off-white/10" : "border-ink/6"
                        )}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                <Button
                  href="/app/criar"
                  variant={plan.highlighted ? "primary" : "secondary"}
                  className="mt-8 w-full"
                >
                  Criar minha marca
                </Button>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}
