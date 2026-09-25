import {
  BookmarkSimple,
  ChartLineUp,
  Clock,
  Funnel,
  GearSix,
  Heart,
  House,
  Kanban,
  ListBullets,
  MagnifyingGlass,
  MapTrifold,
  Phone,
  WhatsappLogo,
} from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/brand/Logo";
import { Stars } from "@/components/ui/Stars";

const RESULTS = [
  { n: 1, name: "Cantina Bella Nonna", cat: "Restaurante italiano", rating: 4.8, reviews: 683, site: false, active: true },
  { n: 2, name: "Bistrô Jardim", cat: "Restaurante", rating: 4.6, reviews: 412, site: true },
  { n: 3, name: "Sabor da Serra", cat: "Restaurante", rating: 4.4, reviews: 97, site: false },
];

const PINS = [
  [22, 30, 4],
  [38, 55, 2],
  [55, 36, 1, true],
  [70, 62, 5],
  [82, 28, 3],
  [48, 76, 6],
  [28, 70, 7],
] as const;

/** Prévia ilustrativa do dashboard (dados de exemplo, não são empresas reais). */
export function DashboardPreview() {
  return (
    <figure className="relative">
      <div className="pointer-events-none absolute -inset-x-10 -top-10 h-40 bg-brand/20 blur-[90px]" aria-hidden="true" />
      <div className="relative overflow-hidden rounded-[22px] border border-line-2 bg-ink-2 shadow-[0_40px_120px_-40px_rgba(229,9,20,0.45)]" role="img" aria-label="Prévia do painel com dados ilustrativos">
        <div className="flex h-10 items-center gap-2 border-b border-line px-4">
          <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
          <span className="h-2.5 w-2.5 rounded-full bg-line-2" />
          <span className="ml-4 hidden h-6 flex-1 items-center rounded-md bg-ink-3 px-3 text-[11px] text-mute sm:flex">app.prospecta.ai/prospectar</span>
        </div>
        <div className="grid grid-cols-[52px_1fr] md:grid-cols-[190px_1fr]">
          <aside className="border-r border-line bg-ink p-2 md:p-3">
            <div className="mb-4 flex items-center gap-2 px-1.5 pt-1">
              <LogoMark className="h-6 w-6" />
              <span className="hidden text-sm font-semibold md:inline">
                prospecta<span className="text-brand">.ai</span>
              </span>
            </div>
            {[
              [House, "Dashboard"],
              [MagnifyingGlass, "Prospectar", true],
              [MapTrifold, "Mapa"],
              [Kanban, "Leads"],
              [ListBullets, "Listas"],
              [Heart, "Favoritos"],
              [Clock, "Histórico"],
              [GearSix, "Configurações"],
            ].map(([Icon, label, active]) => {
              const I = Icon as typeof House;
              return (
                <div key={label as string} className={`mb-0.5 flex items-center gap-2.5 rounded-lg px-2 py-2 text-[12px] ${active ? "bg-brand/15 text-paper" : "text-mute"}`}>
                  <I size={15} weight={active ? "fill" : "regular"} className={active ? "text-brand" : ""} />
                  <span className="hidden md:inline">{label as string}</span>
                </div>
              );
            })}
          </aside>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
              <div className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line-2 bg-ink-3 px-3 text-[13px]">
                <MagnifyingGlass size={14} className="text-brand" />
                <span className="truncate">Restaurantes em Curitiba</span>
              </div>
              <span className="hidden h-9 items-center gap-1.5 rounded-lg border border-line-2 px-3 text-[12px] text-mute-2 sm:flex">
                <Funnel size={13} /> Sem site · Nota 4+
              </span>
              <span className="flex h-9 items-center rounded-lg bg-brand px-3 text-[12px] font-medium text-white">Encontrar empresas</span>
            </div>
            <div className="grid md:grid-cols-[1fr_1fr]">
              <div className="space-y-2 border-line p-3 md:border-r">
                {RESULTS.map((r) => (
                  <div key={r.n} className={`rounded-xl border p-3 ${r.active ? "border-brand/50 bg-brand/[0.05]" : "border-line bg-ink-3"}`}>
                    <div className="flex items-start gap-2.5">
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${r.active ? "bg-paper text-ink" : "bg-brand text-white"}`}>{r.n}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-[13px] font-semibold">{r.name}</p>
                          <BookmarkSimple size={14} className="shrink-0 text-mute" />
                        </div>
                        <p className="text-[11px] text-mute">{r.cat} · Curitiba</p>
                        <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                          <b>{r.rating.toLocaleString("pt-BR")}</b>
                          <Stars value={r.rating} size={11} />
                          <span className="text-mute">({r.reviews})</span>
                        </div>
                        {!r.site && (
                          <p className="mt-2 inline-flex rounded-md bg-brand px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white">OPORTUNIDADE · SEM SITE</p>
                        )}
                        <div className="mt-2 flex gap-1.5">
                          <span className="flex h-7 items-center gap-1 rounded-md bg-brand px-2 text-[11px] font-medium text-white">
                            <WhatsappLogo size={12} weight="fill" /> WhatsApp
                          </span>
                          <span className="flex h-7 items-center gap-1 rounded-md bg-paper px-2 text-[11px] font-medium text-ink">
                            <Phone size={11} weight="fill" /> Ligar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="map-grid relative hidden min-h-[330px] overflow-hidden md:block">
                <div className="absolute left-1/2 top-1/2 aspect-square w-[140%] -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute inset-[15%] rounded-full border border-white/[0.05]" />
                  <div className="absolute inset-[32%] rounded-full border border-white/[0.05]" />
                  <div className="animate-scan absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(229,9,20,0.18), transparent 18%)" }} />
                </div>
                {PINS.map(([left, top, n, active]) => (
                  <span key={n} className="pin" data-active={active ? "true" : undefined} style={{ left: `${left}%`, top: `${top}%` }}>
                    <span>{n}</span>
                  </span>
                ))}
                <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-line-2 bg-ink-2/95 p-3 backdrop-blur">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand">Oportunidade</p>
                  <p className="mt-1 text-[12px] leading-snug text-mute-2">Empresa com presença local forte e sem website identificado.</p>
                  <div className="mt-2 flex items-center gap-1 text-[11px] text-mute">
                    <ChartLineUp size={13} className="text-brand" /> Potencial alto · WhatsApp disponível
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-center text-[11px] text-mute">Prévia com dados ilustrativos</figcaption>
    </figure>
  );
}
