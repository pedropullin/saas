"use client";

import { Camera, Plus, SignOut, SpinnerGap, Trash } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "@/client/toast";
import { LocationPicker } from "@/components/shell/LocationPicker";
import { useApp } from "@/components/shell/AppContext";
import { buttonClass } from "@/components/ui/button";
import { Field, Input, Select, Switch, Textarea } from "@/components/ui/form";
import { Avatar, Card, PageHeader } from "@/components/ui/misc";
import { SERVICES, type ServiceFocus } from "@/lib/opportunity";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fillTemplate, TEMPLATE_VARIABLES, type MessageTemplate } from "@/lib/whatsapp";
import { signOutAction } from "@/server/auth/actions";
import { changePasswordAction, updateOrgNameAction, updateProfileAction } from "@/server/settings/actions";

const SAMPLE: Place = {
  id: "exemplo",
  name: "Barbearia Exemplo",
  category: "Barbearia",
  types: [],
  address: null,
  neighborhood: null,
  city: "Curitiba",
  state: null,
  country: null,
  postalCode: null,
  location: null,
  rating: 4.8,
  reviewCount: 312,
  phone: null,
  whatsapp: null,
  website: null,
  instagram: null,
  facebook: null,
  mapsUrl: null,
  openNow: null,
  hours: [],
  status: null,
  priceLevel: null,
  photos: [],
};

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="grid gap-5 p-5 md:grid-cols-[260px_1fr] md:p-6">
      <div>
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 text-sm text-mute">{description}</p>}
      </div>
      <div className="min-w-0">{children}</div>
    </Card>
  );
}

/** Reduz a foto para 256px (WebP) no navegador antes de enviar. */
async function resizeImage(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const scale = Math.max(size / bitmap.width, size / bitmap.height);
  const w = bitmap.width * scale;
  const h = bitmap.height * scale;
  ctx.drawImage(bitmap, (size - w) / 2, (size - h) / 2, w, h);
  return canvas.toDataURL("image/webp", 0.85);
}

export function SettingsView({ email }: { email: string }) {
  const router = useRouter();
  const { user, org, role, prefs, setPrefs } = useApp();
  const [name, setName] = useState(user.name);
  const [title, setTitle] = useState(user.title ?? "");
  const [avatar, setAvatar] = useState(user.avatarUrl);
  const [orgName, setOrgName] = useState(org.name);
  const [templates, setTemplates] = useState<MessageTemplate[]>(prefs.templates);
  const [editing, setEditing] = useState(prefs.activeTemplateId);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const current = templates.find((t) => t.id === editing) ?? templates[0]!;

  async function run(key: string, fn: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    setBusy(key);
    const result = await fn();
    setBusy(null);
    if (!result.ok) toast.error(result.error ?? "Erro.");
    else {
      toast.success(success);
      router.refresh();
    }
  }

  function patchTemplate(patch: Partial<MessageTemplate>) {
    setTemplates((all) => all.map((t) => (t.id === current.id ? { ...t, ...patch } : t)));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 md:px-8">
      <PageHeader eyebrow="Conta" title="Configurações" />

      <Section title="Perfil" description="Seu nome aparece nas mensagens e para a equipe.">
        <div className="flex items-center gap-4">
          <Avatar name={name || user.name} src={avatar} size={64} />
          <input
            ref={file}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) setAvatar(await resizeImage(f));
            }}
          />
          <button type="button" onClick={() => file.current?.click()} className={buttonClass("outline", "sm")}>
            <Camera size={15} /> Trocar foto
          </button>
          {avatar && (
            <button type="button" onClick={() => setAvatar(null)} className={buttonClass("ghost", "sm")}>
              Remover
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field label="Nome">
            <Input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
          </Field>
          <Field label="Cargo">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: Vendedor, Sócio" maxLength={60} />
          </Field>
          <Field label="E-mail" className="sm:col-span-2">
            <Input value={email} disabled />
          </Field>
        </div>
        <button
          type="button"
          disabled={busy !== null}
          onClick={() => run("profile", () => updateProfileAction({ name, title: title || null, avatarUrl: avatar }), "Perfil atualizado.")}
          className={buttonClass("primary", "md", "mt-4")}
        >
          {busy === "profile" && <SpinnerGap size={15} className="animate-spin" />} Salvar perfil
        </button>
      </Section>

      <Section title="Prospecção" description="Como a plataforma analisa oportunidades e busca empresas para você.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Serviço que você vende" hint="Ajusta a análise de oportunidade.">
            <Select value={prefs.service} onChange={(e) => void setPrefs({ service: e.target.value as ServiceFocus })}>
              {SERVICES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Raio padrão (km)">
            <Select value={prefs.defaultRadiusKm} onChange={(e) => void setPrefs({ defaultRadiusKm: Number(e.target.value) })}>
              {[1, 2, 5, 10, 15, 25, 50].map((r) => (
                <option key={r} value={r}>
                  {r} km
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <p className="mb-1.5 text-xs font-medium text-mute-2">Localização atual</p>
            <LocationPicker />
          </div>
          <div className="flex items-start justify-between gap-4 rounded-xl border border-line p-4 sm:col-span-2">
            <div>
              <p className="text-sm font-medium">Ler sites automaticamente</p>
              <p className="mt-0.5 text-xs text-mute">Depois de cada pesquisa, procura e-mail, Instagram e Facebook nas páginas públicas das empresas.</p>
            </div>
            <Switch checked={prefs.autoEnrich} onChange={(autoEnrich) => void setPrefs({ autoEnrich })} label="Ler sites automaticamente" />
          </div>
        </div>
      </Section>

      <Section title="Mensagens do WhatsApp" description="Modelos com variáveis trocadas pelos dados de cada empresa.">
        <div className="flex flex-wrap gap-1.5">
          {templates.map((t) => (
            <button key={t.id} type="button" onClick={() => setEditing(t.id)} className={cn("h-8 rounded-lg px-3 text-[13px]", t.id === current.id ? "bg-paper text-ink" : "border border-line-2 text-mute-2 hover:text-paper")}>
              {t.name}
              {t.id === prefs.activeTemplateId && " ★"}
            </button>
          ))}
          <button
            type="button"
            disabled={templates.length >= 20}
            onClick={() => {
              const id = `modelo-${Date.now().toString(36)}`;
              setTemplates((all) => [...all, { id, name: "Nova mensagem", body: "Olá, {empresa}! Meu nome é {meu_nome}." }]);
              setEditing(id);
            }}
            className={buttonClass("ghost", "sm")}
          >
            <Plus size={14} /> Novo
          </button>
        </div>
        <div className="mt-3 grid gap-3">
          <Input value={current.name} onChange={(e) => patchTemplate({ name: e.target.value })} aria-label="Nome do modelo" maxLength={60} />
          <Textarea value={current.body} onChange={(e) => patchTemplate({ body: e.target.value })} rows={5} aria-label="Texto do modelo" maxLength={2000} />
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLES.map((v) => (
              <button key={v.key} type="button" title={v.label} onClick={() => patchTemplate({ body: `${current.body} {${v.key}}` })} className="rounded-md border border-line-2 px-2 py-1 font-mono text-[11px] text-mute-2 hover:border-brand hover:text-paper">
                {`{${v.key}}`}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-ink-2 p-4">
            <p className="text-[11px] uppercase tracking-wider text-mute">Prévia</p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm text-mute-2">{fillTemplate(current.body, SAMPLE, user.name.split(" ")[0] ?? user.name)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={async () => {
                setBusy("templates");
                const ok = await setPrefs({ templates });
                setBusy(null);
                if (ok) toast.success("Modelos salvos.");
              }}
              className={buttonClass("primary", "md")}
            >
              {busy === "templates" && <SpinnerGap size={15} className="animate-spin" />} Salvar modelos
            </button>
            <button type="button" onClick={() => void setPrefs({ activeTemplateId: current.id, templates })} disabled={prefs.activeTemplateId === current.id} className={buttonClass("outline", "md")}>
              Usar como padrão
            </button>
            <button
              type="button"
              disabled={templates.length <= 1}
              onClick={() => {
                const rest = templates.filter((t) => t.id !== current.id);
                setTemplates(rest);
                setEditing(rest[0]!.id);
              }}
              className={buttonClass("ghost", "md")}
            >
              <Trash size={15} /> Excluir
            </button>
          </div>
        </div>
      </Section>

      {(role === "owner" || role === "admin") && (
        <Section title="Equipe" description="Nome da conta compartilhada.">
          <div className="flex gap-2">
            <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} maxLength={80} aria-label="Nome da equipe" />
            <button type="button" disabled={busy !== null} onClick={() => run("org", () => updateOrgNameAction(orgName), "Nome da equipe atualizado.")} className={buttonClass("primary", "md")}>
              Salvar
            </button>
          </div>
        </Section>
      )}

      <Section title="Segurança" description="Troque sua senha de acesso.">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Senha atual">
            <Input type="password" autoComplete="current-password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </Field>
          <Field label="Nova senha" hint="Mínimo de 8 caracteres.">
            <Input type="password" autoComplete="new-password" value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy !== null || !passwords.current || passwords.next.length < 8}
            onClick={async () => {
              await run("password", () => changePasswordAction(passwords.current, passwords.next), "Senha alterada.");
              setPasswords({ current: "", next: "" });
            }}
            className={buttonClass("primary", "md")}
          >
            Alterar senha
          </button>
          <form action={signOutAction}>
            <button type="submit" className={buttonClass("ghost", "md")}>
              <SignOut size={16} /> Sair da conta
            </button>
          </form>
        </div>
      </Section>
    </div>
  );
}
