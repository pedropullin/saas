"use client";

import { motion } from "framer-motion";
import { WhatsappLogo, PhoneCall, InstagramLogo } from "@phosphor-icons/react";
import { TextReveal } from "@/components/afago/TextReveal";
import { AfagoButton } from "@/components/afago/AfagoButton";
import { AFAGO, whatsappUrl, telUrl } from "@/lib/afago/data";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function Contact() {
  return (
    <section id="contato" className="relative overflow-hidden bg-afago-char-soft py-28 sm:py-36">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-terracotta-soft">
            Contato
          </p>
          <TextReveal
            as="h2"
            text="Vamos guardar sua mesa."
            highlight={["mesa."]}
            className="mt-5 justify-center font-serif text-afago-h2 text-afago-cream"
          />
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.3 }}
            className="mt-4 font-serif text-lg italic text-afago-cream-dim/75"
          >
            {AFAGO.fullName}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, ease: EASE_EDITORIAL, delay: 0.4 }}
            className="mt-10 flex flex-col items-center gap-4"
          >
            <AfagoButton
              href={whatsappUrl("Olá! Gostaria de falar com o Afago.")}
              variant="solid"
              icon={<WhatsappLogo size={17} weight="fill" />}
              className="px-9 py-4 text-sm"
              data-cursor-label="WhatsApp"
            >
              Chamar no WhatsApp
            </AfagoButton>

            <div className="mt-4 flex flex-col items-center gap-3 text-[0.9rem] text-afago-cream-dim/80 sm:flex-row sm:gap-8">
              <a href={telUrl} className="inline-flex items-center gap-2 transition-colors hover:text-afago-terracotta-soft">
                <PhoneCall size={16} />
                {AFAGO.phoneDisplay}
              </a>
              <a
                href={AFAGO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 transition-colors hover:text-afago-terracotta-soft"
              >
                <InstagramLogo size={16} />
                {AFAGO.instagramHandle}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
