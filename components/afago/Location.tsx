"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { NavigationArrow } from "@phosphor-icons/react";
import { PlaceholderImage } from "@/components/afago/PlaceholderImage";
import { AfagoButton } from "@/components/afago/AfagoButton";
import { AFAGO, mapsDirectionsUrl, mapsEmbedUrl } from "@/lib/afago/data";

export function Location() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // The last restaurant frame shrinks from a full-bleed shot into a small
  // floating card as the map fades in behind it — one continuous transition,
  // not a hard cut between "last photo" and "map" section.
  const photoScale = useTransform(scrollYProgress, [0, 0.55], [1, 0.34]);
  const photoRadius = useTransform(scrollYProgress, [0, 0.55], [0, 20]);
  const photoX = useTransform(scrollYProgress, [0, 0.55], ["0%", "-28%"]);
  const photoY = useTransform(scrollYProgress, [0, 0.55], ["0%", "18%"]);
  const mapOpacity = useTransform(scrollYProgress, [0.15, 0.55], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 0.6], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.3, 0.6], [40, 0]);

  return (
    <section ref={ref} className="relative h-[220vh] bg-afago-char">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="absolute inset-0 z-0" style={{ opacity: mapOpacity }}>
          <iframe
            title={`Mapa — ${AFAGO.fullName}`}
            src={mapsEmbedUrl}
            loading="lazy"
            className="h-full w-full grayscale invert-[0.92] contrast-[1.1]"
            style={{ border: 0 }}
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div aria-hidden className="absolute inset-0 bg-afago-void/25" />
        </motion.div>

        <motion.div
          className="absolute inset-0 z-[1] origin-[80%_20%]"
          style={{ scale: photoScale, borderRadius: photoRadius, x: photoX, y: photoY, overflow: "hidden" }}
        >
          <PlaceholderImage
            label="Última cena — fachada / exterior do Afago"
            tone="void"
            className="h-full w-full"
          />
        </motion.div>

        <motion.div
          style={{ opacity: textOpacity, y: textY }}
          className="absolute inset-x-0 bottom-0 z-[2] flex flex-col items-start gap-6 p-8 sm:bottom-16 sm:left-16 sm:max-w-md sm:p-0"
        >
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.32em] text-afago-terracotta-soft">
              Localização
            </p>
            <h2 className="mt-4 font-serif text-afago-h2 text-afago-cream">Estamos em Curitiba.</h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-afago-cream-dim/85">
              {AFAGO.addressLine1}
              <br />
              {AFAGO.addressLine2}
            </p>
          </div>
          <AfagoButton
            href={mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="solid"
            icon={<NavigationArrow size={16} weight="fill" />}
            data-cursor-label="Maps"
          >
            Como Chegar
          </AfagoButton>
        </motion.div>
      </div>
    </section>
  );
}
