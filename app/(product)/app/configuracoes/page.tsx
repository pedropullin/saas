import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";

export const metadata: Metadata = { title: "Configurações" };

export default function ConfiguracoesPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Configurações
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">Conta e preferências</h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-12">
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Perfil</p>
        <div className="mt-4 space-y-4">
          <FieldRow label="Nome" value="Marina Costa" />
          <FieldRow label="E-mail" value="marina@norte.studio" />
          <FieldRow label="Plano" value="Business" />
        </div>
      </Reveal>

      <Divider className="my-10" />

      <Reveal delay={0.14}>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Notificações
        </p>
        <div className="mt-4 space-y-4">
          <ToggleRow label="E-mail ao finalizar uma identidade" enabled />
          <ToggleRow label="Novidades e recursos da VEYRO" enabled={false} />
          <ToggleRow label="Mensagens de designers" enabled />
        </div>
      </Reveal>

      <Divider className="my-10" />

      <Reveal delay={0.2} className="flex items-center justify-between">
        <div>
          <p className="text-[0.9375rem] font-medium text-ink">Encerrar sessão</p>
          <p className="text-[0.8125rem] text-neutral-500">Você retornará à tela inicial.</p>
        </div>
        <Button variant="secondary" href="/">
          Sair
        </Button>
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
      <span
        className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? "bg-accent" : "bg-neutral-200"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-paper shadow-subtle transition-transform ${
            enabled ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </span>
    </div>
  );
}
