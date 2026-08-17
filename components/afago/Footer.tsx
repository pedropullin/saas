import Link from "next/link";
import { InstagramLogo } from "@phosphor-icons/react/dist/ssr";
import { AFAGO } from "@/lib/afago/data";

const LINKS = [
  { label: "Início", href: "#inicio" },
  { label: "Experiência", href: "#experiencia" },
  { label: "Cardápio", href: "#cardapio" },
  { label: "Contato", href: "#contato" },
];

export function Footer() {
  return (
    <footer className="border-t border-afago-line bg-afago-void">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-10 px-6 py-16 md:px-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Link href="#inicio" className="font-serif text-3xl italic text-afago-cream">
            Afago
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-afago-cream-dim/70">
            Restaurante &amp; Petiscaria — {AFAGO.neighborhood}, {AFAGO.city} - {AFAGO.state}
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-8 gap-y-3">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-afago-cream/60 transition-colors hover:text-afago-gold-soft"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={AFAGO.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[0.8125rem] font-medium text-afago-cream/80 transition-colors hover:text-afago-terracotta-soft"
        >
          <InstagramLogo size={18} weight="regular" />
          {AFAGO.instagramHandle}
        </a>
      </div>

      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 border-t border-afago-line px-6 py-6 text-[0.7rem] text-afago-cream/40 md:flex-row md:items-center md:justify-between md:px-10">
        <p>{AFAGO.addressFull}</p>
        <p>© {new Date().getFullYear()} {AFAGO.fullName}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
}
