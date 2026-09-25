import { Logo } from "@/components/brand/Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: React.ReactNode; children: React.ReactNode }) {
  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="map-grid relative hidden overflow-hidden border-r border-line p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="pointer-events-none absolute right-[-10%] top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" aria-hidden="true" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Prospecção B2B</p>
          <h1 className="mt-4 text-6xl font-semibold leading-[0.95] tracking-tighter">
            Encontre empresas.
            <br />
            <span className="text-brand">Encontre oportunidades.</span>
          </h1>
        </div>
        <p className="relative text-sm text-mute">Pesquisar → Filtrar → Ver dados → WhatsApp/Ligar → Salvar lead</p>
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="lg:hidden" />
          <h2 className="mt-10 text-3xl font-semibold tracking-tight lg:mt-0">{title}</h2>
          <p className="mt-2 text-sm text-mute">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </section>
    </main>
  );
}
