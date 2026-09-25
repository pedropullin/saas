import {
  ArrowRight,
  ChatCircleText,
  Crosshair,
  DownloadSimple,
  GlobeHemisphereWest,
  ListChecks,
  Phone,
  Star,
  UsersThree,
  WhatsappLogo,
  WifiSlash,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { HeroVisual } from "@/components/landing/HeroVisual";
import { buttonClass } from "@/components/ui/button";

const SEGMENTS = [
  "Dentistas",
  "Barbearias",
  "Academias",
  "Clínicas de estética",
  "Restaurantes",
  "Imobiliárias",
  "Pet shops",
  "Advogados",
  "Oficinas mecânicas",
  "Salões de beleza",
  "Escolas de idiomas",
  "Contabilidades",
  "Hotéis",
  "Farmácias",
];

const FEATURES = [
  {
    icon: GlobeHemisphereWest,
    title: "Qualquer lugar do mundo",
    text: "Busque por segmento em qualquer cidade, bairro ou país. Os dados vêm direto do Google Maps.",
  },
  {
    icon: WhatsappLogo,
    title: "WhatsApp em um clique",
    text: "Detectamos celulares e links de WhatsApp da empresa e abrimos a conversa com a mensagem já escrita.",
  },
  {
    icon: Phone,
    title: "Ligação direta",
    text: "Toque em ligar no celular ou no computador. Cada contato fica registrado na sua lista.",
  },
  {
    icon: Star,
    title: "Avaliações e reputação",
    text: "Nota, número de avaliações, comentários recentes e horário de funcionamento de cada empresa.",
  },
  {
    icon: WifiSlash,
    title: "Filtro “sem site”",
    text: "Encontre quem ainda não tem presença digital. Ouro para quem vende site, tráfego ou social media.",
  },
  {
    icon: ListChecks,
    title: "Funil de prospecção",
    text: "Salve leads, marque Contatado, Negociando ou Fechado, anote tudo e exporte em CSV.",
  },
];

const STEPS = [
  { n: "01", title: "Busque", text: "“Dentistas em Recife”, “Barbearias em Lisboa”, ou várias cidades de uma vez." },
  { n: "02", title: "Filtre", text: "Nota 4,5+, 100+ avaliações, com WhatsApp, sem site, aberto agora." },
  { n: "03", title: "Chame", text: "Mensagem personalizada com o nome da empresa, pronta no WhatsApp." },
];

export default function Home() {
  return (
    <div className="overflow-x-clip">
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <Logo />
          <nav className="flex items-center gap-1 text-sm md:gap-6">
            <a href="#recursos" className="hidden text-mute transition-colors hover:text-paper md:inline">
              Recursos
            </a>
            <a href="#como-funciona" className="hidden text-mute transition-colors hover:text-paper md:inline">
              Como funciona
            </a>
            <Link href="/prospectar" className={buttonClass("light", "sm", "h-9 px-4")}>
              Entrar <ArrowRight size={14} weight="bold" />
            </Link>
          </nav>
        </div>
      </header>

      <section className="relative pb-28 pt-32 md:pb-36 md:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-brand/[0.13] blur-[140px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-20 px-5 md:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-line-2 px-3 py-1 text-xs text-mute-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Prospecção B2B com dados do Google Maps
            </p>
            <h1 className="mt-6 text-[clamp(2.75rem,7vw,5.6rem)] font-semibold leading-[0.92] tracking-[-0.045em]">
              Qualquer empresa
              <br />
              do mundo.
              <br />
              <span className="text-brand">A um clique</span>
              <br />
              do WhatsApp.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-mute-2">
              Encontre negócios por segmento e cidade, veja nota e avaliações, filtre quem não tem site e chame o dono no
              WhatsApp ou por ligação. Feito para você e seus amigos fecharem mais.
            </p>
            <div className="mt-9 max-w-2xl">
              <HeroSearch />
            </div>
          </div>
          <HeroVisual />
        </div>
      </section>

      <div className="border-y border-line bg-ink-2 py-5" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-10 whitespace-nowrap text-2xl font-semibold tracking-tight text-mute/60 md:text-3xl">
          {[...SEGMENTS, ...SEGMENTS].map((segment, i) => (
            <span key={i} className="flex items-center gap-10">
              {segment}
              <span className="text-brand">✦</span>
            </span>
          ))}
        </div>
      </div>

      <section id="recursos" className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Recursos</p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1] tracking-tighter md:text-6xl">
            Tudo o que você precisa para prospectar. Nada que atrapalhe.
          </h2>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="group bg-ink p-8 transition-colors hover:bg-ink-2">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-line-2 text-paper transition-colors group-hover:border-brand group-hover:bg-brand group-hover:text-white">
                <Icon size={21} />
              </span>
              <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-2 leading-relaxed text-mute">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="border-t border-line bg-paper text-ink">
        <div className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-strong">Como funciona</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1] tracking-tighter md:text-6xl">
                Da busca à conversa
                <br />
                em três passos.
              </h2>
            </div>
            <p className="max-w-sm text-ink/60">
              Sem planilha, sem copiar e colar número. Cada contato vira um lead com status e anotações.
            </p>
          </div>
          <ol className="mt-16 grid gap-10 md:grid-cols-3 md:gap-6">
            {STEPS.map((step) => (
              <li key={step.n} className="border-t-2 border-ink pt-6">
                <span className="font-mono text-sm text-brand-strong">{step.n}</span>
                <h3 className="mt-3 text-3xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/65">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8 md:py-32">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Para você e seus amigos</p>
            <h2 className="mt-4 text-4xl font-semibold leading-[1] tracking-tighter md:text-5xl">
              Um código de acesso.
              <br />
              Cada um com seu nome.
            </h2>
            <p className="mt-5 max-w-lg leading-relaxed text-mute-2">
              Compartilhe o código com quem prospecta com você. Cada pessoa assina as mensagens com o próprio nome e pode
              trocar a lista de leads com os outros por backup.
            </p>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: UsersThree, text: "Acesso protegido por código" },
              { icon: ChatCircleText, text: "Modelos de mensagem com variáveis" },
              { icon: Crosshair, text: "Busca perto de mim com raio" },
              { icon: DownloadSimple, text: "Exporta CSV para planilha ou CRM" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 rounded-2xl border border-line bg-ink-2 p-5">
                <Icon size={22} className="shrink-0 text-brand" />
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="px-5 pb-24 md:px-8">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-brand px-8 py-16 text-white md:px-16 md:py-24">
          <div className="map-grid pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply" />
          <div className="relative flex flex-col items-start justify-between gap-10 md:flex-row md:items-end">
            <h2 className="max-w-3xl text-4xl font-semibold leading-[0.95] tracking-tighter md:text-7xl">
              O próximo cliente já está no mapa.
            </h2>
            <Link href="/prospectar" className={buttonClass("light", "lg", "h-14 px-8 text-base")}>
              Começar agora <ArrowRight size={18} weight="bold" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-mute md:flex-row md:items-center md:justify-between md:px-8">
          <Logo />
          <p>Dados de empresas via Google Maps Platform. Respeite quem pedir para não ser contatado.</p>
        </div>
      </footer>
    </div>
  );
}
