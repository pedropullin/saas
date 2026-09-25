import {
  ArrowRight,
  At,
  ChartBar,
  CheckCircle,
  ClockCounterClockwise,
  DownloadSimple,
  Envelope,
  FunnelSimple,
  GlobeHemisphereWest,
  GridFour,
  Heart,
  InstagramLogo,
  Kanban,
  ListBullets,
  MagnifyingGlass,
  MapPin,
  MapTrifold,
  Phone,
  Plus,
  Sparkle,
  Star,
  UploadSimple,
  UsersThree,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { DashboardPreview } from "@/components/marketing/DashboardPreview";
import { PlanCards } from "@/components/marketing/PlanCards";
import { buttonClass } from "@/components/ui/button";
import { Stars } from "@/components/ui/Stars";
import { SEARCH_EXAMPLES } from "@/lib/search";

const NAV = [
  ["#como-funciona", "Como funciona"],
  ["#recursos", "Recursos"],
  ["#planos", "Planos"],
  ["#faq", "FAQ"],
];

const STEPS = [
  { icon: MagnifyingGlass, title: "Pesquise", text: "Segmento e local, em qualquer país: “Clínicas odontológicas em São Paulo”." },
  { icon: FunnelSimple, title: "Filtre", text: "Sem site, com WhatsApp, nota mínima, número de avaliações, aberto agora." },
  { icon: MapPin, title: "Veja os dados", text: "Endereço, horário, fotos, site, redes sociais e avaliações de cada empresa." },
  { icon: WhatsappLogo, title: "Entre em contato", text: "WhatsApp com mensagem pronta ou ligação direta, em um clique." },
  { icon: Kanban, title: "Salve o lead", text: "Leve a empresa para o funil, anote a conversa e acompanhe até fechar." },
];

const CITIES = ["Curitiba", "São Paulo", "Miami", "Londres", "Lisboa", "Buenos Aires", "Madri", "Toronto", "Tóquio", "Cidade do México", "Paris", "Recife"];

const DATA_POINTS = [
  "Nome e categoria",
  "Endereço, bairro, cidade e CEP",
  "Horário de funcionamento",
  "Fotos do perfil",
  "Website, quando existe",
  "Instagram e Facebook",
  "Telefone e WhatsApp",
  "E-mail publicado no site",
  "Nota e número de avaliações",
  "Link direto no Google Maps",
];

const FEATURES = [
  { icon: GridFour, title: "Varredura de área", text: "Divide a cidade em regiões e busca em cada uma para ir além dos 60 resultados por pesquisa." },
  { icon: Sparkle, title: "Análise de oportunidade", text: "Painel automático que aponta potencial com base só nos dados encontrados." },
  { icon: MapTrifold, title: "Mapa interativo", text: "Tela cheia, com marcadores, raio ajustável e ações rápidas em cada empresa." },
  { icon: ListBullets, title: "Listas personalizadas", text: "“Restaurantes Curitiba”, “Empresas sem site”, “Prospects São Paulo”." },
  { icon: Heart, title: "Favoritos", text: "Guarde empresas para depois, sem poluir o funil de vendas." },
  { icon: ClockCounterClockwise, title: "Histórico", text: "Todas as pesquisas salvas para repetir com um clique." },
  { icon: DownloadSimple, title: "Exportação CSV", text: "Leads, listas ou empresas selecionadas direto para a sua planilha ou CRM." },
  { icon: UploadSimple, title: "Importação", text: "Traga leads que você já tem para dentro do funil." },
  { icon: UsersThree, title: "Equipe", text: "Convide amigos, atribua leads e acompanhe a atividade de cada um." },
  { icon: ChartBar, title: "Analytics", text: "Empresas encontradas, leads contatados, em negociação e taxa de contato." },
];

const FAQ = [
  {
    q: "De onde vêm os dados das empresas?",
    a: "Da API oficial do Google Places, a mesma base do Google Maps. E-mails e redes sociais são lidos das páginas públicas do site de cada empresa. Nada é inventado: quando um dado não existe, mostramos “Não encontrado”.",
  },
  {
    q: "Todas as empresas têm WhatsApp?",
    a: "Não. O Google não informa se um número tem WhatsApp. Marcamos como confirmado quando a empresa publica um link de WhatsApp, e como provável quando o número é de celular. Telefones fixos aparecem com o aviso de que o WhatsApp é incerto.",
  },
  {
    q: "Posso prospectar em outros países?",
    a: "Sim. A busca funciona em qualquer cidade do mundo, por texto, por raio em quilômetros ou em modo mundial.",
  },
  {
    q: "Por que existe limite de resultados por pesquisa?",
    a: "O Google entrega até 60 empresas por pesquisa. A varredura de área divide a região em partes para encontrar mais empresas em uma única busca.",
  },
  {
    q: "Posso usar com meus amigos ou minha equipe?",
    a: "Sim. No plano Business você convida pessoas para a mesma conta. Leads e listas são compartilhados só dentro da equipe, e favoritos e histórico continuam pessoais.",
  },
  {
    q: "A plataforma cobra hoje?",
    a: "Não. Nesta versão os planos podem ser ativados sem cobrança. A integração de pagamento está preparada para ser ligada depois.",
  },
  {
    q: "É permitido entrar em contato com essas empresas?",
    a: "Os dados são públicos e comerciais. Mesmo assim, seja respeitoso: identifique-se, ofereça algo relevante e pare de contatar quem pedir. Siga a LGPD e as regras do WhatsApp para mensagens comerciais.",
  },
];

function SectionTitle({ eyebrow, title, text, center }: { eyebrow: string; title: React.ReactNode; text?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{eyebrow}</p>
      <h2 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">{title}</h2>
      {text && <p className="mt-4 text-base leading-relaxed text-mute md:text-lg">{text}</p>}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="overflow-x-clip">
      <header className="sticky top-0 z-40 border-b border-white/[0.04] bg-ink/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-mute md:flex" aria-label="Seções">
            {NAV.map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-paper">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/entrar" className={buttonClass("ghost", "sm", "hidden sm:inline-flex")}>
              Entrar
            </Link>
            <Link href="/cadastro" className={buttonClass("primary", "sm")}>
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative px-5 pb-20 pt-16 md:px-8 md:pt-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-brand/[0.12] blur-[140px]" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl text-center">
            <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line-2 bg-ink-3/70 px-3 py-1 text-xs text-mute-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping-slow absolute inline-flex h-full w-full rounded-full bg-brand" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-brand" />
              </span>
              Sales intelligence com dados públicos do Google Maps
            </p>
            <h1 className="animate-fade-up mt-7 text-[clamp(2.6rem,7.5vw,5.8rem)] font-semibold leading-[0.95] tracking-[-0.045em] [animation-delay:60ms]">
              Encontre empresas.
              <br />
              <span className="text-brand">Encontre oportunidades.</span>
            </h1>
            <p className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-relaxed text-mute-2 [animation-delay:120ms] md:text-lg">
              Pesquise empresas em qualquer lugar do mundo, encontre contatos e transforme dados públicos em oportunidades comerciais.
            </p>
            <div className="animate-fade-up mt-9 flex flex-col items-center justify-center gap-3 [animation-delay:180ms] sm:flex-row">
              <Link href="/cadastro" className={buttonClass("primary", "xl", "w-full sm:w-auto")}>
                Começar a prospectar <ArrowRight size={18} weight="bold" />
              </Link>
              <Link href="/app/prospectar" className={buttonClass("outline", "xl", "w-full sm:w-auto")}>
                Explorar empresas
              </Link>
            </div>
            <div className="animate-fade-up mt-6 flex flex-wrap justify-center gap-2 [animation-delay:240ms]">
              {SEARCH_EXAMPLES.map((example) => (
                <Link
                  key={example}
                  href={`/app/prospectar?q=${encodeURIComponent(example)}`}
                  className="rounded-full border border-line px-3 py-1 text-[13px] text-mute transition-colors hover:border-brand hover:text-paper"
                >
                  {example}
                </Link>
              ))}
            </div>
          </div>
          <div className="animate-fade-up relative mx-auto mt-16 max-w-6xl [animation-delay:300ms]">
            <DashboardPreview />
          </div>
        </section>

        <section id="como-funciona" className="border-t border-line bg-ink-2 px-5 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Como funciona" title="Da pesquisa ao primeiro contato em poucos cliques." />
            <ol className="mt-14 grid gap-3 md:grid-cols-5">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="group relative rounded-2xl border border-line bg-ink-3 p-5 transition-colors hover:border-brand/50">
                  <span className="font-mono text-xs text-mute">0{i + 1}</span>
                  <span className="mt-4 grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon size={20} />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="px-5 py-24 md:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <SectionTitle
              eyebrow="Busca global"
              title={
                <>
                  Qualquer cidade.
                  <br />
                  Qualquer país.
                </>
              }
              text="Pesquise por texto livre, filtre por país, estado, cidade, bairro e CEP, defina um raio em quilômetros a partir da sua localização ou faça uma busca mundial."
            />
            <div className="map-grid relative overflow-hidden rounded-3xl border border-line p-6 md:p-8">
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-[80px]" aria-hidden="true" />
              <GlobeHemisphereWest size={40} className="relative text-brand" />
              <div className="relative mt-6 flex flex-wrap gap-2">
                {CITIES.map((city, i) => (
                  <span key={city} className={`rounded-full border px-3 py-1.5 text-sm ${i % 4 === 0 ? "border-brand/60 bg-brand/10 text-paper" : "border-line-2 bg-ink-3/80 text-mute-2"}`}>
                    {city}
                  </span>
                ))}
              </div>
              <div className="relative mt-8 grid grid-cols-3 gap-2 text-center text-xs text-mute">
                {["Texto livre", "Raio em km", "Mundial"].map((mode) => (
                  <span key={mode} className="rounded-xl border border-line bg-ink-3/80 px-2 py-3">
                    {mode}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-ink-2 px-5 py-24 md:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2">
            <SectionTitle
              eyebrow="Dados das empresas"
              title="Tudo o que é público, organizado em um lugar."
              text="Cada empresa vem com os dados disponíveis no Google Maps e no site dela. O que não existe aparece como “Não encontrado”, sem estimativas."
            />
            <ul className="grid gap-2 sm:grid-cols-2">
              {DATA_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 rounded-xl border border-line bg-ink-3 px-4 py-3 text-sm">
                  <CheckCircle size={18} weight="fill" className="shrink-0 text-brand" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="px-5 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Contatos" title="Fale com o dono do negócio em um clique." center />
            <div className="mt-14 grid gap-4 md:grid-cols-4">
              {[
                { icon: WhatsappLogo, title: "WhatsApp", text: "Abre a conversa direto no número disponível, com mensagem personalizada." },
                { icon: Phone, title: "Ligação", text: "No celular, o botão Ligar disca na hora. No computador, abre seu app de chamadas." },
                { icon: Envelope, title: "E-mail", text: "Encontrado nas páginas públicas do site da empresa, quando existe." },
                { icon: InstagramLogo, title: "Instagram", text: "Perfil da empresa, vindo do Google ou do próprio site dela." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-line bg-ink-3 p-6">
                  <Icon size={26} weight="fill" className="text-brand" />
                  <h3 className="mt-5 text-lg font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-line bg-ink-2 px-5 py-24 md:px-8">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
            <div className="order-2 rounded-3xl border border-line bg-ink-3 p-8 lg:order-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-mute">Exemplo de exibição</p>
              <div className="mt-6 flex items-end gap-5">
                <span className="text-7xl font-semibold leading-none tracking-tighter">4,8</span>
                <div className="pb-1">
                  <Stars value={4.8} size={22} />
                  <p className="mt-2 text-sm text-mute">683 avaliações</p>
                </div>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-2 text-center text-xs">
                {["Maior avaliação", "Mais avaliações", "Mais relevantes"].map((sort) => (
                  <span key={sort} className="rounded-xl border border-line-2 px-2 py-2.5 text-mute-2">
                    {sort}
                  </span>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionTitle
                eyebrow="Avaliações"
                title="Reputação real para priorizar quem abordar."
                text="Nota e número de avaliações vêm do Google, junto com os comentários mais recentes. Filtre por nota mínima, nota máxima e quantidade de avaliações. Nenhum número é fabricado."
              />
              <p className="mt-6 flex items-center gap-2 text-sm text-mute-2">
                <Star size={16} weight="fill" className="text-brand" /> Empresa sem avaliações aparece como “Não encontrado”.
              </p>
            </div>
          </div>
        </section>

        <section className="px-5 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Organização de leads" title="Um CRM simples, feito para prospecção." text="Arraste os leads entre as etapas, registre cada conversa e veja o funil andar." />
            <div className="no-scrollbar mt-12 flex gap-3 overflow-x-auto pb-2">
              {[
                ["Novo", 12],
                ["Contatado", 8],
                ["Em negociação", 4],
                ["Cliente", 3],
                ["Sem resposta", 5],
                ["Não interessado", 2],
              ].map(([column, count], i) => (
                <div key={column} className="w-56 shrink-0 rounded-2xl border border-line bg-ink-3 p-3">
                  <div className="flex items-center justify-between px-1 pb-3 text-sm">
                    <span className="font-medium">{column}</span>
                    <span className={`rounded-full px-2 text-xs ${i === 3 ? "bg-brand text-white" : "bg-white/[0.06] text-mute"}`}>{count}</span>
                  </div>
                  {Array.from({ length: i < 3 ? 2 : 1 }, (_, k) => (
                    <div key={k} className="mb-2 rounded-xl border border-line bg-ink-2 p-3">
                      <div className="h-2.5 w-3/4 rounded bg-line-2" />
                      <div className="mt-2 h-2 w-1/2 rounded bg-line" />
                      <div className="mt-3 flex gap-1.5">
                        <span className="h-5 w-12 rounded bg-brand/25" />
                        <span className="h-5 w-10 rounded bg-white/[0.06]" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="recursos" className="border-t border-line bg-ink-2 px-5 py-24 md:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Recursos da plataforma" title="Feito para prospectar em escala." />
            <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
              {FEATURES.map(({ icon: Icon, title, text }) => (
                <article key={title} className="group bg-ink-3 p-6 transition-colors hover:bg-ink-4">
                  <Icon size={22} className="text-mute-2 transition-colors group-hover:text-brand" />
                  <h3 className="mt-5 font-semibold tracking-tight">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="planos" className="px-5 py-24 md:px-8">
          <div className="mx-auto max-w-6xl">
            <SectionTitle eyebrow="Planos" title="Comece grátis. Cresça quando precisar." text="Nesta versão não há cobrança: os planos podem ser ativados sem pagamento." center />
            <div className="mt-14">
              <PlanCards
                actions={{
                  free: (
                    <Link href="/cadastro" className={buttonClass("outline", "lg", "w-full")}>
                      Começar grátis
                    </Link>
                  ),
                  pro: (
                    <Link href="/cadastro?plano=pro" className={buttonClass("primary", "lg", "w-full")}>
                      Assinar o Pro
                    </Link>
                  ),
                  business: (
                    <Link href="/cadastro?plano=business" className={buttonClass("light", "lg", "w-full")}>
                      Assinar o Business
                    </Link>
                  ),
                }}
              />
            </div>
          </div>
        </section>

        <section id="faq" className="border-t border-line bg-ink-2 px-5 py-24 md:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.4fr]">
            <SectionTitle eyebrow="FAQ" title="Perguntas frequentes" />
            <div className="divide-y divide-line rounded-2xl border border-line bg-ink-3">
              {FAQ.map((item) => (
                <details key={item.q} className="group px-5 py-4 md:px-6">
                  <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                    {item.q}
                    <Plus size={16} className="shrink-0 text-mute transition-transform group-open:rotate-45 group-open:text-brand" />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-mute">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-24 md:px-8">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-brand/40 bg-ink-3 px-8 py-16 text-center md:py-20">
            <div className="pointer-events-none absolute inset-x-0 -top-24 mx-auto h-56 w-[600px] rounded-full bg-brand/30 blur-[100px]" aria-hidden="true" />
            <h2 className="relative text-3xl font-semibold tracking-tighter md:text-6xl">O próximo cliente já está no mapa.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-mute-2">Crie sua conta em menos de um minuto e faça sua primeira pesquisa.</p>
            <Link href="/cadastro" className={buttonClass("primary", "xl", "relative mt-8")}>
              Começar a prospectar <ArrowRight size={18} weight="bold" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-mute md:flex-row md:items-center md:justify-between md:px-8">
          <Logo />
          <p className="flex items-center gap-1.5">
            <At size={14} /> Dados de empresas via Google Maps Platform. Respeite quem pedir para não ser contatado.
          </p>
        </div>
      </footer>
    </div>
  );
}
