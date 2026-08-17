"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { List } from "@phosphor-icons/react";
import { MARKETING_NAV } from "@/lib/constants";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { CTAButton } from "@/components/landing/CTAButton";
import { Container } from "@/components/ui/Container";
import { Sheet, SheetTrigger, SheetContent, SheetClose } from "@/components/ui/sheet";
import { usePointerParallax } from "@/hooks/usePointerParallax";
import { EASE_EDITORIAL } from "@/lib/motion/easing";
import { cn } from "@/lib/utils";

const SECTION_IDS = MARKETING_NAV.map((link) => link.href.replace("#", ""));

/** Height of the band under the navbar used to decide which section it sits on. */
const NAV_BAND = 76;

/**
 * Inverts the navbar while it overlaps a section marked
 * `data-nav-theme="dark"`. Without this the light bar turns into a grey smear
 * over the two ink sections.
 */
function useNavTheme(): "light" | "dark" {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-theme='dark']")
    );
    if (targets.length === 0) return;

    const overlapping = new Set<Element>();
    let observer: IntersectionObserver | null = null;

    const connect = () => {
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) overlapping.add(entry.target);
            else overlapping.delete(entry.target);
          }
          setDark(overlapping.size > 0);
        },
        {
          // Shrink the root to just the strip the navbar occupies.
          rootMargin: `0px 0px -${Math.max(0, window.innerHeight - NAV_BAND)}px 0px`,
        }
      );
      targets.forEach((target) => observer?.observe(target));
    };

    connect();

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        overlapping.clear();
        connect();
      }, 200);
    };
    window.addEventListener("resize", onResize, { passive: true });

    return () => {
      clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
    };
  }, []);

  return dark ? "dark" : "light";
}

/** Marks the section currently occupying the middle band of the viewport. */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActive(visible[0]!.target.id);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function Navbar() {
  const { scrollY } = useScroll();
  const [condensed, setCondensed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const active = useActiveSection();
  const theme = useNavTheme();
  const dark = theme === "dark";
  const markDrift = usePointerParallax(3);

  // One boolean flip instead of a render per scroll event.
  useMotionValueEvent(scrollY, "change", (latest) => {
    const next = latest > 32;
    setCondensed((prev) => (prev === next ? prev : next));
  });

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASE_EDITORIAL, delay: 0.1 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <motion.div
        animate={{
          backgroundColor: condensed
            ? dark
              ? "rgba(10,10,9,0.7)"
              : "rgba(245,244,239,0.85)"
            : dark
              ? "rgba(10,10,9,0)"
              : "rgba(245,244,239,0)",
          borderBottomColor: condensed
            ? dark
              ? "rgba(245,244,239,0.12)"
              : "rgba(10,10,9,0.08)"
            : "rgba(10,10,9,0)",
          paddingTop: condensed ? 10 : 22,
          paddingBottom: condensed ? 10 : 22,
        }}
        transition={{ duration: 0.5, ease: EASE_EDITORIAL }}
        className={cn("border-b border-transparent", condensed && "backdrop-blur-xl")}
      >
        <Container className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2.5 transition-colors duration-500",
              dark ? "text-off-white" : "text-ink"
            )}
            aria-label="veyro — início"
            data-cursor="link"
          >
            <motion.span style={{ x: markDrift.x, y: markDrift.y }} className="flex">
              <VMark variant="solid" size={condensed ? 18 : 20} tone="current" />
            </motion.span>
            <Wordmark className="text-[1.0625rem]" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Seções">
            {MARKETING_NAV.map((link) => {
              const id = link.href.replace("#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "link-underline text-[0.8125rem] font-medium transition-colors duration-300",
                    dark
                      ? active === id
                        ? "text-off-white"
                        : "text-off-white/50 hover:text-off-white"
                      : active === id
                        ? "text-ink"
                        : "text-neutral-500 hover:text-ink"
                  )}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/app"
              className={cn(
                "hidden text-[0.8125rem] font-medium transition-colors duration-300 sm:block",
                dark ? "text-off-white/50 hover:text-off-white" : "text-neutral-500 hover:text-ink"
              )}
            >
              Entrar
            </Link>
            <div className="hidden sm:block">
              <CTAButton
                href="/app/criar"
                size="sm"
                arrow={false}
                magnetic={false}
                variant={dark ? "invert" : "primary"}
              >
                Create your brand
              </CTAButton>
            </div>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <button
                  type="button"
                  aria-label="Abrir menu"
                  className={cn(
                    "-mr-2 flex h-11 w-11 items-center justify-center transition-colors duration-500 lg:hidden",
                    dark ? "text-off-white" : "text-ink"
                  )}
                >
                  <List size={22} weight="regular" />
                </button>
              </SheetTrigger>
              <SheetContent side="top" aria-label="Menu de navegação" className="lg:hidden">
                <Container className="flex flex-col py-7">
                  <div className="mb-6 flex items-center gap-2.5">
                    <VMark variant="solid" size={20} tone="ink" />
                    <Wordmark className="text-lg" />
                  </div>
                  {MARKETING_NAV.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="border-t border-ink/8 py-4 text-[1.0625rem] font-medium text-ink"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}
                  <SheetClose asChild>
                    <Link
                      href="/app"
                      className="border-y border-ink/8 py-4 text-[1.0625rem] font-medium text-ink"
                    >
                      Entrar
                    </Link>
                  </SheetClose>
                  <CTAButton href="/app/criar" size="lg" className="mt-6 w-full" magnetic={false}>
                    Create your brand
                  </CTAButton>
                </Container>
              </SheetContent>
            </Sheet>
          </div>
        </Container>
      </motion.div>
    </motion.header>
  );
}
