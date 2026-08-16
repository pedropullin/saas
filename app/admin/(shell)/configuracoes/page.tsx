import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Divider } from "@/components/ui/Divider";

export const metadata: Metadata = { title: "Configurações — Admin" };

export default function AdminConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Configurações
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Preferências da plataforma</h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-12">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Recursos
        </p>
        <div className="mt-4 space-y-4">
          <ToggleRow label="Marketplace de designers" enabled />
          <ToggleRow label="Geração automática de brand book" enabled />
          <ToggleRow label="Cadastro público (Free)" enabled />
          <ToggleRow label="Modo de manutenção" enabled={false} />
        </div>
      </Reveal>

      <Divider className="my-10" />

      <Reveal delay={0.14}>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Equipe interna
        </p>
        <div className="mt-4 space-y-4">
          <FieldRow label="Usuário admin" value="peeale12" />
          <FieldRow label="Ambiente" value="Demonstração" />
        </div>
      </Reveal>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/6 pb-3">
      <span className="text-[0.8125rem] text-neutral-500">{label}</span>
      <span className="text-[0.9375rem] font-medium text-ink">{value}</span>
    </div>
  );
}

function ToggleRow({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[0.9375rem] text-ink">{label}</span>
      <span className={`relative h-6 w-11 rounded-full ${enabled ? "bg-accent" : "bg-neutral-200"}`}>
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow-subtle transition-transform ${
            enabled ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </div>
  );
}
