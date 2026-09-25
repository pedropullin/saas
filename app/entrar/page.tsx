import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { LoginForm } from "@/components/landing/LoginForm";
import { isGateEnabled, readSessionToken, SESSION_COOKIE } from "@/lib/session";
import { safeNextPath } from "@/lib/validate";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next: rawNext } = await searchParams;
  const next = safeNextPath(rawNext);
  const gateEnabled = isGateEnabled();
  const session = await readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (session) redirect(next);

  return (
    <main className="grid min-h-dvh lg:grid-cols-2">
      <section className="map-grid relative hidden overflow-hidden border-r border-line p-12 lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div className="pointer-events-none absolute right-[-10%] top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-brand/20 blur-[120px]" />
        <div className="relative">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">Só para convidados</p>
          <h1 className="mt-4 text-6xl font-semibold leading-[0.95] tracking-tighter">
            Menos planilha.
            <br />
            Mais <span className="text-brand">conversa</span>
            <br />
            com cliente.
          </h1>
        </div>
        <p className="relative text-sm text-mute">Empresas do Google Maps · WhatsApp · ligação · avaliações</p>
      </section>

      <section className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-sm">
          <Logo className="lg:hidden" />
          <h2 className="mt-10 text-3xl font-semibold tracking-tight lg:mt-0">Entrar</h2>
          <p className="mt-2 text-sm text-mute">
            {gateEnabled
              ? "Use o código que você recebeu. Seu nome vai nas mensagens do WhatsApp."
              : "Seu nome vai nas mensagens do WhatsApp."}
          </p>
          <div className="mt-8">
            <LoginForm next={next} gateEnabled={gateEnabled} />
          </div>
        </div>
      </section>
    </main>
  );
}
