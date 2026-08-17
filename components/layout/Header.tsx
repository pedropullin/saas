"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MARKETING_NAV } from "@/lib/constants";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { Magnetic } from "@/components/ui/Magnetic";
import { Container } from "@/components/ui/Container";
import { TransitionLink } from "@/components/providers/TransitionLink";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

/**
 * The page alternates dark and light chapters throughout, so the header
 * never tries to match "what's behind it" — it stays off-white text the
 * whole time, and only gains a dark glass surface once scrolled. A light
 * chrome bar would collide with the dark hero for most of the first
 * viewport; a dark glass one reads fine floating over anything.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-500",
          scrolled ? "border-off-white/10 bg-ink/70 backdrop-blur-xl" : "border-transparent bg-transparent"
        )}
        animate={{ paddingTop: scrolled ? 10 : 22, paddingBottom: scrolled ? 10 : 22 }}
        transition={{ duration: 0.4, ease: EASE_EDITORIAL }}
      >
        <Container className="flex items-center justify-between">
          <TransitionLink
            href="/"
            className="flex items-center gap-2.5"
            data-cursor="view"
            data-cursor-label="Início"
          >
            <VMark variant="solid" size={22} tone="paper" />
            <Wordmark className="text-lg text-off-white" />
          </TransitionLink>

          <nav className="hidden items-center gap-9 lg:flex">
            {MARKETING_NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.8125rem] font-medium text-off-white/65 transition-colors hover:text-off-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <TransitionLink
              href="/login"
              className="hidden text-[0.8125rem] font-medium text-off-white transition-colors hover:text-accent sm:block"
            >
              Entrar
            </TransitionLink>
            <Magnetic className="hidden sm:block">
              <TransitionLink
                href="/app/criar"
                data-cursor="v"
                className="inline-flex items-center justify-center rounded-[3px] bg-off-white px-5 py-2.5 text-[0.8125rem] font-medium tracking-[-0.01em] text-ink transition-colors duration-200 hover:bg-accent hover:text-accent-ink"
              >
                Criar minha marca
              </TransitionLink>
            </Magnetic>
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] lg:hidden"
            >
              <motion.span
                animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 3 : 0 }}
                transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
                className="h-[1.5px] w-5 bg-off-white"
              />
              <motion.span
                animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -3 : 0 }}
                transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
                className="h-[1.5px] w-5 bg-off-white"
              />
            </button>
          </div>
        </Container>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
            className="fixed inset-0 z-40 flex flex-col justify-center overflow-hidden bg-ink lg:hidden"
          >
            <VMark
              variant="split"
              size={520}
              tone="paper"
              className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 opacity-[0.05]"
            />
            <Container className="relative flex flex-col gap-2">
              {MARKETING_NAV.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE_EDITORIAL }}
                  className="border-b border-off-white/10 py-4 text-3xl font-medium tracking-[-0.02em] text-off-white"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + MARKETING_NAV.length * 0.06, duration: 0.5, ease: EASE_EDITORIAL }}
                className="mt-8 flex flex-col gap-4"
              >
                <TransitionLink
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="text-[0.9375rem] font-medium text-off-white/70"
                >
                  Entrar
                </TransitionLink>
                <TransitionLink
                  href="/app/criar"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex w-full items-center justify-center rounded-[3px] bg-accent py-3.5 text-[0.9375rem] font-medium text-accent-ink"
                >
                  Criar minha marca
                </TransitionLink>
              </motion.div>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
