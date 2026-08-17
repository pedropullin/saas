"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { RevealLines } from "@/components/landing/TextReveal";
import { CTAButton } from "@/components/landing/CTAButton";
import { PRICING_PLANS } from "@/lib/mock/landing";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-24 border-b border-ink/8 py-24 md:py-36">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-label font-medium uppercase tracking-[0.14em] text-neutral-500">
              Planos
            </p>
            <RevealLines
              as="h2"
              className="mt-5 text-h1 font-medium text-ink"
              lines={["Comece grátis.", "Chame um designer depois."]}
            />
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.1 }}
            className="max-w-sm text-[0.9375rem] leading-relaxed text-neutral-600 lg:text-right"
          >
            Sem cartão para gerar a primeira identidade. O refinamento humano é cobrado por projeto,
            não por assinatura.
          </motion.p>
        </div>

        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {PRICING_PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 0.85, ease: EASE_EDITORIAL, delay: index * 0.07 }}
              className={cn(
                "flex flex-col rounded-md border p-7 md:p-8",
                plan.highlighted
                  ? "border-ink bg-ink text-off-white"
                  : "border-ink/10 bg-paper text-ink"
              )}
            >
              <div className="flex items-baseline justify-between">
                <p
                  className={cn(
                    "text-label font-medium uppercase tracking-[0.12em]",
                    plan.highlighted ? "text-off-white/50" : "text-neutral-500"
                  )}
                >
                  {plan.name}
                </p>
                {plan.highlighted && (
                  <span className="rounded-full bg-accent px-2.5 py-1 text-[0.625rem] font-medium uppercase tracking-[0.08em] text-accent-ink">
                    Mais escolhido
                  </span>
                )}
              </div>

              <p className="mt-6 text-[2.25rem] font-medium leading-none tracking-[-0.04em]">
                {plan.price}
              </p>
              <p
                className={cn(
                  "mt-2 text-[0.8125rem]",
                  plan.highlighted ? "text-off-white/50" : "text-neutral-500"
                )}
              >
                {plan.period}
              </p>

              <p
                className={cn(
                  "mt-5 text-[0.875rem] leading-relaxed",
                  plan.highlighted ? "text-off-white/70" : "text-neutral-600"
                )}
              >
                {plan.summary}
              </p>

              <ul className="mt-7 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={cn(
                      "flex gap-3 border-t py-3 text-[0.875rem] first:border-0 first:pt-0",
                      plan.highlighted
                        ? "border-off-white/10 text-off-white/80"
                        : "border-ink/8 text-neutral-700"
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "mt-[0.45rem] h-1 w-1 shrink-0 rounded-full",
                        plan.highlighted ? "bg-accent" : "bg-neutral-300"
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <CTAButton
                href="/app/criar"
                size="md"
                variant={plan.highlighted ? "invert" : "secondary"}
                magnetic={false}
                arrow={false}
                className="mt-8 w-full"
              >
                {plan.cta}
              </CTAButton>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
