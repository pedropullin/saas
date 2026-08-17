"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Flame, ForkKnife, Martini, CookingPot, type Icon } from "@phosphor-icons/react";
import { TextReveal } from "@/components/afago/TextReveal";
import { AfagoButton } from "@/components/afago/AfagoButton";
import { MENU_CATEGORIES, whatsappUrl } from "@/lib/afago/data";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

const ICONS: Record<string, Icon> = {
  petiscos: ForkKnife,
  grelhados: Flame,
  "pratos-da-casa": CookingPot,
  drinks: Martini,
};

export function Menu() {
  return (
    <section id="cardapio" className="relative overflow-hidden bg-afago-char-soft py-28 sm:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-0 h-[560px] w-[560px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "var(--color-afago-terracotta)" }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-terracotta-soft">
            Cardápio
          </p>
          <TextReveal
            as="h2"
            text="O sabor começa aqui."
            className="mt-5 justify-center font-serif text-afago-h2 text-afago-cream"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.3 }}
            className="mx-auto mt-5 max-w-md text-[0.95rem] leading-relaxed text-afago-cream-dim/75"
          >
            O cardápio completo do Afago — com todos os itens e valores atualizados —
            fica a um clique de distância, direto pelo WhatsApp da casa.
          </motion.p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-px overflow-hidden rounded-sm bg-afago-line sm:grid-cols-2">
          {MENU_CATEGORIES.map((cat, i) => {
            const IconCmp = ICONS[cat.id] ?? ForkKnife;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-10% 0px" }}
                transition={{ duration: 0.6, ease: EASE_EDITORIAL, delay: i * 0.08 }}
                className="group flex items-center gap-4 bg-afago-char-soft px-7 py-6 transition-colors hover:bg-afago-void"
              >
                <IconCmp size={22} weight="light" className="shrink-0 text-afago-gold-soft" />
                <div>
                  <p className="font-serif text-lg text-afago-cream">{cat.title}</p>
                  <p className="text-xs text-afago-cream-dim/60">{cat.tagline}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.4 }}
          className="mt-14 flex justify-center"
        >
          <AfagoButton
            href={whatsappUrl("Olá! Gostaria de ver o cardápio completo do Afago.")}
            variant="solid"
            icon={<ArrowUpRight size={16} weight="bold" />}
            data-cursor-label="WhatsApp"
          >
            Ver Cardápio Completo
          </AfagoButton>
        </motion.div>
      </div>
    </section>
  );
}
