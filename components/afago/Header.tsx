"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { List, X, WhatsappLogo } from "@phosphor-icons/react";
import { AFAGO, whatsappUrl } from "@/lib/afago/data";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Início", href: "#inicio" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Contato", href: "#contato" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        className={cn(
          "fixed inset-x-0 top-0 z-[80] transition-[background-color,border-color] duration-500",
          scrolled
            ? "border-b border-afago-line bg-afago-void/80 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        )}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.2 }}
      >
        <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between px-6 py-5 md:px-10">
          <Link
            href="#inicio"
            className="font-serif text-xl italic tracking-tight text-afago-cream"
            data-cursor="view"
          >
            Afago
          </Link>

          <nav className="hidden items-center gap-10 lg:flex">
            {NAV.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-afago-cream/70 transition-colors hover:text-afago-gold-soft"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <a
              href={whatsappUrl("Olá! Vim pelo site do Afago e gostaria de fazer uma reserva.")}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-full border border-afago-cream/25 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.14em] text-afago-cream transition-colors hover:border-afago-terracotta hover:text-afago-terracotta-soft sm:flex"
              data-cursor="view"
              data-cursor-label="WhatsApp"
            >
              <WhatsappLogo size={16} weight="fill" />
              WhatsApp
            </a>
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center text-afago-cream lg:hidden"
            >
              {menuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[75] flex flex-col justify-center bg-afago-void px-8"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE_EDITORIAL }}
          >
            <nav className="flex flex-col gap-2">
              {NAV.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + i * 0.07, ease: EASE_EDITORIAL }}
                  className="border-b border-afago-line py-4 font-serif text-4xl italic text-afago-cream"
                >
                  {link.label}
                </motion.a>
              ))}
            </nav>
            <motion.a
              href={whatsappUrl("Olá! Vim pelo site do Afago e gostaria de fazer uma reserva.")}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: EASE_EDITORIAL }}
              className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-afago-terracotta px-6 py-3 text-[0.8rem] font-medium uppercase tracking-[0.14em] text-afago-cream"
            >
              <WhatsappLogo size={18} weight="fill" />
              {AFAGO.phoneDisplay}
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
