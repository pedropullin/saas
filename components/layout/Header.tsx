"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MARKETING_NAV } from "@/lib/constants";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { EASE_EDITORIAL } from "@/lib/motion/easing";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-ink/8 bg-off-white/85 backdrop-blur-md"
      animate={{ paddingTop: scrolled ? 10 : 20, paddingBottom: scrolled ? 10 : 20 }}
      transition={{ duration: 0.35, ease: EASE_EDITORIAL }}
    >
      <Container className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5" data-cursor="view" data-cursor-label="Início">
          <VMark variant="solid" size={22} tone="ink" />
          <Wordmark className="text-lg" />
        </Link>

        <nav className="hidden items-center gap-9 lg:flex">
          {MARKETING_NAV.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.8125rem] font-medium text-neutral-600 transition-colors hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="hidden text-[0.8125rem] font-medium text-ink transition-colors hover:text-accent-dim sm:block"
          >
            Entrar
          </Link>
          <div className="hidden sm:block">
            <Button href="/app/criar" size="sm">
              Criar minha marca
            </Button>
          </div>
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
              className="h-[1.5px] w-5 bg-ink"
            />
            <motion.span
              animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -3 : 0 }}
              transition={{ duration: 0.25, ease: EASE_EDITORIAL }}
              className="h-[1.5px] w-5 bg-ink"
            />
          </button>
        </div>
      </Container>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE_EDITORIAL }}
            className="overflow-hidden border-t border-ink/8 lg:hidden"
          >
            <Container className="flex flex-col gap-1 py-5">
              {MARKETING_NAV.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-[0.9375rem] font-medium text-ink"
                >
                  {link.label}
                </a>
              ))}
              <Link
                href="/app"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-[0.9375rem] font-medium text-ink sm:hidden"
              >
                Entrar
              </Link>
              <Button href="/app/criar" className="mt-3 w-full sm:hidden">
                Criar minha marca
              </Button>
            </Container>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
