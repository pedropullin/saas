import Link from "next/link";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { Container } from "@/components/ui/Container";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#how-it-works" },
      { label: "Aplicações", href: "#product" },
      { label: "Planos", href: "#pricing" },
      { label: "Criar identidade", href: "/app/criar" },
    ],
  },
  {
    title: "Plataforma",
    links: [
      { label: "Dashboard", href: "/app" },
      { label: "Brand Books", href: "/app/brandbook" },
      { label: "Biblioteca", href: "/app/biblioteca" },
      { label: "Painel admin", href: "/admin/login" },
    ],
  },
  {
    title: "Rede",
    links: [
      { label: "Designers", href: "#designers" },
      { label: "Seja um designer", href: "mailto:rede@veyro.app" },
      { label: "Contato", href: "mailto:ola@veyro.app" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-off-white">
      <Container className="grid gap-14 py-16 md:py-20 lg:grid-cols-[1.1fr_2fr]">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5" aria-label="veyro — início">
            <VMark variant="solid" size={22} tone="ink" />
            <Wordmark className="text-lg" />
          </Link>
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-neutral-600">
            Branding profissional, simplificado pela IA — com designers humanos quando o projeto
            pedir.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-label font-medium uppercase tracking-[0.12em] text-neutral-400">
                {column.title}
              </p>
              <ul className="mt-5 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="link-underline text-[0.875rem] text-neutral-600 transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <Container className="flex flex-col items-start justify-between gap-3 border-t border-ink/8 py-6 text-[0.75rem] text-neutral-400 sm:flex-row sm:items-center">
        <p>© {new Date().getFullYear()} veyro. Todos os direitos reservados.</p>
        <nav className="flex gap-6" aria-label="Legal">
          <Link href="/app" className="transition-colors hover:text-ink">
            Entrar
          </Link>
          <a href="mailto:ola@veyro.app" className="transition-colors hover:text-ink">
            ola@veyro.app
          </a>
        </nav>
      </Container>
    </footer>
  );
}
