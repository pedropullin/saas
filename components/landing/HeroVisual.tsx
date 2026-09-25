import { Phone, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";
import { Stars } from "@/components/ui/Stars";

const PINS = [
  { left: 16, top: 26, n: 1 },
  { left: 34, top: 46, n: 2 },
  { left: 60, top: 44, n: 3, active: true },
  { left: 76, top: 70, n: 4 },
  { left: 86, top: 34, n: 5 },
  { left: 62, top: 86, n: 6 },
  { left: 42, top: 20, n: 7 },
];

/** Ilustração do produto (dados de exemplo, não é uma empresa real). */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[560px]" aria-label="Ilustração do produto com dados de exemplo" role="img">
      <div className="map-grid relative isolate aspect-[5/4] overflow-hidden rounded-[28px] border border-line-2">
        <div className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[150%] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute inset-[10%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[25%] rounded-full border border-white/[0.05]" />
          <div className="absolute inset-[40%] rounded-full border border-white/[0.06]" />
          <div
            className="animate-scan absolute inset-0 rounded-full"
            style={{ background: "conic-gradient(from 0deg, rgba(255,46,46,0.22), transparent 18%)" }}
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#070707_100%)]" />
        {PINS.map((pin) => (
          <span key={pin.n} className="absolute" style={{ left: `${pin.left}%`, top: `${pin.top}%` }}>
            {pin.active && <span className="animate-ping-slow absolute -left-2 -top-2 h-4 w-4 rounded-full bg-brand" />}
            <span className="pin" data-active={pin.active ? "true" : undefined} style={{ position: "absolute" }}>
              <span>{pin.n}</span>
            </span>
          </span>
        ))}
      </div>

      <div className="animate-fade-up absolute z-10 -bottom-10 left-4 right-4 rounded-2xl border border-line-2 bg-ink-2/95 p-4 shadow-2xl backdrop-blur sm:-left-8 sm:right-auto sm:w-[330px]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold tracking-tight">Barbearia Exemplo</p>
            <p className="text-xs text-mute">Barbearia · Centro</p>
          </div>
          <span className="grid h-6 w-6 place-items-center rounded-full bg-paper text-[11px] font-bold text-ink">3</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-sm">
          <span className="font-semibold">4,8</span>
          <Stars value={4.8} size={13} />
          <span className="text-mute">(312)</span>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-md border border-brand/50 px-2 py-0.5 text-[11px] text-brand">Celular · provável WhatsApp</span>
          <span className="rounded-md border border-line-2 px-2 py-0.5 text-[11px] text-mute-2">Sem site</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-brand text-[13px] font-medium text-white">
            <WhatsappLogo size={16} weight="fill" /> WhatsApp
          </span>
          <span className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-paper text-[13px] font-medium text-ink">
            <Phone size={15} weight="fill" /> Ligar
          </span>
        </div>
      </div>

      <div className="animate-fade-up absolute z-10 -right-2 -top-6 hidden max-w-[240px] rounded-2xl rounded-tr-sm bg-paper p-3.5 text-[13px] leading-snug text-ink shadow-2xl [animation-delay:200ms] sm:block">
        Olá! Encontrei a <strong>Barbearia Exemplo</strong> no Google Maps e vi a nota 4,8. Posso te mostrar uma ideia rápida?
        <span className="mt-1.5 block text-right text-[10px] text-ink/50">mensagem pronta ✓✓</span>
      </div>
    </div>
  );
}
