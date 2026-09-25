import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="map-grid grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <Logo />
        <p className="mt-10 text-7xl font-semibold tracking-tighter text-brand">404</p>
        <h1 className="mt-3 text-2xl font-semibold">Página não encontrada</h1>
        <p className="mt-2 text-sm text-mute">O endereço pode ter mudado ou não existe mais.</p>
        <Link href="/app" className={buttonClass("primary", "lg", "mt-8")}>
          Ir para o painel
        </Link>
      </div>
    </main>
  );
}
