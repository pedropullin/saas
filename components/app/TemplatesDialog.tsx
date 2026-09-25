"use client";

import { Check, Plus, Trash } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { Modal } from "@/components/ui/Modal";
import { setSettings, useSettings } from "@/lib/settings";
import type { Place } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fillTemplate, TEMPLATE_VARIABLES } from "@/lib/whatsapp";
import { useMyName } from "./AppSession";

const SAMPLE_PLACE: Place = {
  id: "exemplo",
  name: "Barbearia Exemplo",
  category: "Barbearia",
  address: null,
  city: "São Paulo",
  location: null,
  rating: 4.8,
  reviewCount: 312,
  phone: null,
  whatsapp: null,
  website: null,
  social: null,
  mapsUrl: null,
  openNow: true,
  status: "OPERATIONAL",
  priceLevel: 2,
};

export function TemplatesDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const settings = useSettings();
  const myName = useMyName();
  const [editingId, setEditingId] = useState<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const current =
    settings.templates.find((t) => t.id === (editingId ?? settings.activeTemplateId)) ?? settings.templates[0]!;

  function patchTemplate(patch: { name?: string; body?: string }) {
    setSettings((prev) => ({
      ...prev,
      templates: prev.templates.map((t) => (t.id === current.id ? { ...t, ...patch } : t)),
    }));
  }

  function insertVariable(key: string) {
    const textarea = bodyRef.current;
    const token = `{${key}}`;
    if (!textarea) return patchTemplate({ body: current.body + token });
    const start = textarea.selectionStart ?? current.body.length;
    const end = textarea.selectionEnd ?? current.body.length;
    patchTemplate({ body: current.body.slice(0, start) + token + current.body.slice(end) });
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    });
  }

  function addTemplate() {
    const id = `modelo-${Date.now().toString(36)}`;
    setSettings((prev) => ({
      ...prev,
      templates: [...prev.templates, { id, name: "Nova mensagem", body: "Olá, {empresa}! Meu nome é {meu_nome}." }],
    }));
    setEditingId(id);
  }

  function removeTemplate() {
    if (settings.templates.length <= 1) return;
    setSettings((prev) => {
      const templates = prev.templates.filter((t) => t.id !== current.id);
      return {
        ...prev,
        templates,
        activeTemplateId: prev.activeTemplateId === current.id ? templates[0]!.id : prev.activeTemplateId,
      };
    });
    setEditingId(null);
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Mensagens do WhatsApp"
      description="As variáveis entre chaves são trocadas pelos dados de cada empresa na hora de enviar."
    >
      <div className="grid gap-6 p-6 md:grid-cols-[200px_1fr]">
        <div className="space-y-5">
          <label className="block">
            <span className="text-xs font-medium uppercase tracking-wider text-mute">Seu nome</span>
            <input
              value={settings.myName}
              onChange={(e) => setSettings((prev) => ({ ...prev, myName: e.target.value }))}
              placeholder={myName || "Como você assina"}
              className="mt-2 h-10 w-full rounded-lg border border-line-2 bg-ink px-3 text-sm outline-none placeholder:text-mute focus:border-brand"
            />
          </label>
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-mute">Modelos</span>
            <ul className="mt-2 space-y-1">
              {settings.templates.map((template) => (
                <li key={template.id}>
                  <button
                    type="button"
                    onClick={() => setEditingId(template.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm",
                      template.id === current.id ? "bg-white/[0.07] text-paper" : "text-mute-2 hover:bg-white/[0.04]",
                    )}
                  >
                    <span className="truncate">{template.name || "Sem título"}</span>
                    {template.id === settings.activeTemplateId && (
                      <span className="rounded bg-brand px-1.5 py-0.5 text-[10px] font-semibold uppercase text-white">
                        padrão
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={addTemplate} className={buttonClass("ghost", "sm", "mt-2 w-full justify-start")}>
              <Plus size={14} /> Novo modelo
            </button>
          </div>
        </div>

        <div className="min-w-0 space-y-4">
          <input
            value={current.name}
            onChange={(e) => patchTemplate({ name: e.target.value })}
            aria-label="Nome do modelo"
            className="h-10 w-full rounded-lg border border-line-2 bg-ink px-3 text-sm font-medium outline-none focus:border-brand"
          />
          <textarea
            ref={bodyRef}
            value={current.body}
            onChange={(e) => patchTemplate({ body: e.target.value })}
            rows={6}
            aria-label="Texto da mensagem"
            className="w-full resize-y rounded-lg border border-line-2 bg-ink p-3 text-sm leading-relaxed outline-none focus:border-brand"
          />
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_VARIABLES.map((variable) => (
              <button
                key={variable.key}
                type="button"
                title={variable.label}
                onClick={() => insertVariable(variable.key)}
                className="rounded-md border border-line-2 px-2 py-1 font-mono text-[11px] text-mute-2 hover:border-brand hover:text-paper"
              >
                {`{${variable.key}}`}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-line bg-ink p-4">
            <p className="text-[11px] font-medium uppercase tracking-wider text-mute">Prévia com empresa de exemplo</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-mute-2">
              {fillTemplate(current.body, SAMPLE_PLACE, myName || "Seu nome")}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={removeTemplate}
              disabled={settings.templates.length <= 1}
              className={buttonClass("ghost", "sm")}
            >
              <Trash size={14} /> Excluir
            </button>
            <button
              type="button"
              onClick={() => setSettings((prev) => ({ ...prev, activeTemplateId: current.id }))}
              disabled={settings.activeTemplateId === current.id}
              className={buttonClass("outline", "sm")}
            >
              <Check size={14} /> Usar como padrão
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
