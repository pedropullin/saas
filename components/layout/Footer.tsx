import Link from "next/link";
import { VMark } from "@/components/ui/VMark";
import { Wordmark } from "@/components/ui/Wordmark";
import { Container } from "@/components/ui/Container";
import { MARKETING_NAV } from "@/lib/constants";

const COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Recursos", href: "#recursos" },
      { label: "Preços", href: "#precos" },
      { label: "Criar identidade", href: "/app/criar" },
    ],
  },
  {
    title: "Ecossistema",
    links: [
      { label: "Dashboard", href: "/app" },
      { label: "Brand Books", href: "/app/brandbook" },
      { label: "Designers", href: "/app/designers" },
      { label: "Painel admin", href: "/admin/login" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Manifesto", href: "#manifesto" },
      { label: "Designers parceiros", href: "#designers" },
      { label: "Contato", href: "mailto:ola@veyro.app" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/8 bg-ink text-off-white">
      <Container className="grid gap-16 py-20 lg:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <VMark variant="solid" size={24} tone="paper" />
            <Wordmark className="text-lg text-off-white" />
          </Link>
          <p className="mt-5 max-w-xs text-[0.9375rem] leading-relaxed text-off-white/55">
            A próxima geração de criação de marcas. Da ideia ao sistema visual completo.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-label font-medium uppercase tracking-[0.08em] text-off-white/40">
                {column.title}
              </p>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-[0.875rem] text-off-white/75 transition-colors hover:text-accent"
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

      <Container className="flex flex-col items-center justify-between gap-4 border-t border-off-white/10 py-6 text-[0.75rem] text-off-white/40 sm:flex-row">
        <p>© {new Date().getFullYear()} veyro. Todos os direitos reservados.</p>
        <nav className="flex gap-6">
          {MARKETING_NAV.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-off-white/70">
              {link.label}
            </a>
          ))}
        </nav>
      </Container>
    </footer>
  );
}
