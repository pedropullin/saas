"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { List } from "@phosphor-icons/react";
import { MARKETING_NAV } from "@/lib/constants";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

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

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Abrir menu"
                className={cn(
                  "flex h-9 w-9 items-center justify-center text-ink lg:hidden",
                  menuOpen && "invisible"
                )}
              >
                <List size={22} weight="regular" />
              </button>
            </SheetTrigger>
            <SheetContent side="top" aria-label="Menu de navegação" className="lg:hidden">
              <Container className="flex flex-col gap-1 py-8">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <VMark variant="solid" size={20} tone="ink" />
                    <Wordmark className="text-lg" />
                  </div>
                </div>
                {MARKETING_NAV.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <a href={link.href} className="border-t border-ink/6 py-3 text-[0.9375rem] font-medium text-ink first:border-0">
                      {link.label}
                    </a>
                  </SheetClose>
                ))}
                <SheetClose asChild>
                  <Link
                    href="/app"
                    className="border-t border-ink/6 py-3 text-[0.9375rem] font-medium text-ink sm:hidden"
                  >
                    Entrar
                  </Link>
                </SheetClose>
                <Button href="/app/criar" className="mt-4 w-full sm:hidden">
                  Criar minha marca
                </Button>
              </Container>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </motion.header>
  );
}
