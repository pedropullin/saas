"use client";

import { Crosshair, GlobeHemisphereWest, Lock, MapPin } from "@phosphor-icons/react";
import Link from "next/link";
import { searchActions, useSearch } from "@/client/search-store";
import { useApp } from "@/components/shell/AppContext";
import { Checkbox, Field, Input, Select } from "@/components/ui/form";
import type { SortKey, Tri } from "@/lib/filters";
import { CATEGORIES, countries } from "@/lib/search";
import { cn } from "@/lib/utils";

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-mute">{title}</legend>
      {children}
    </fieldset>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: Array<{ value: T; label: string; icon?: React.ReactNode }>; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-flow-col gap-1 rounded-xl border border-line-2 bg-ink-2 p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={cn(
            "inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2 text-[13px] font-medium transition-colors",
            value === option.value ? "bg-paper text-ink" : "text-mute-2 hover:text-paper",
          )}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
}

function Locked({ children, locked }: { children: React.ReactNode; locked: boolean }) {
  if (!locked) return <>{children}</>;
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="pointer-events-none opacity-45">{children}</div>
      <Link href="/app/planos" className="inline-flex items-center gap-1 text-[11px] font-medium text-brand hover:underline" title="Disponível no Pro">
        <Lock size={12} weight="fill" /> Pro
      </Link>
    </div>
  );
}

export function FiltersPanel() {
  const { form, filters, sort } = useSearch();
  const { prefs, plan } = useApp();
  const setForm = searchActions.setForm;
  const setFilters = searchActions.setFilters;
  const advanced = !plan.advancedFilters;

  return (
    <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-[1.35fr_1fr_1fr_0.85fr_0.8fr]">
      <Section title="Localização">
        <Segmented
          value={form.scope}
          onChange={(scope) => setForm({ scope })}
          options={[
            { value: "local", label: "Local", icon: <MapPin size={14} /> },
            { value: "raio", label: "Raio", icon: <Crosshair size={14} /> },
            { value: "mundial", label: "Mundial", icon: <GlobeHemisphereWest size={14} /> },
          ]}
        />
        {form.scope === "mundial" ? (
          <p className="mt-3 text-xs text-mute">Sem restrição de local: o Google busca no mundo todo pelo texto digitado.</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Field label="País" className="col-span-2">
              <Select value={form.country} onChange={(e) => setForm({ country: e.target.value })}>
                <option value="">Qualquer país</option>
                {countries().map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Estado/Província">
              <Input value={form.state} onChange={(e) => setForm({ state: e.target.value })} placeholder="PR" maxLength={80} />
            </Field>
            <Field label="Cidade">
              <Input value={form.city} onChange={(e) => setForm({ city: e.target.value })} placeholder="Curitiba" maxLength={80} />
            </Field>
            <Field label="Bairro">
              <Input value={form.neighborhood} onChange={(e) => setForm({ neighborhood: e.target.value })} placeholder="Batel" maxLength={80} />
            </Field>
            <Field label="CEP">
              <Input value={form.postalCode} onChange={(e) => setForm({ postalCode: e.target.value })} placeholder="80000-000" maxLength={20} inputMode="numeric" />
            </Field>
          </div>
        )}
        {form.scope !== "mundial" && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-mute-2">Raio em km</span>
              <span className="tabular-nums text-paper">{form.radiusKm} km</span>
            </div>
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={form.radiusKm}
              onChange={(e) => setForm({ radiusKm: Number(e.target.value) })}
              aria-label="Raio em km"
              className="mt-2 w-full accent-[var(--color-brand)]"
            />
            <p className="mt-1 text-[11px] text-mute">
              {form.scope === "raio"
                ? `Centro: ${[form.neighborhood, form.city, form.postalCode].some(Boolean) ? "local informado acima" : (prefs.location?.label ?? "defina sua localização atual no topo")}`
                : prefs.location
                  ? `Sem cidade informada, usa ${prefs.location.label}.`
                  : "Usado quando não há cidade e você define a localização atual."}
            </p>
          </div>
        )}
        {form.scope !== "mundial" && (
          <Field label="Busca em escala (varredura)" className="mt-3" hint="Divide a área em regiões para passar do limite de 60 empresas por pesquisa. Conta 1 pesquisa por região.">
            <Select value={form.sweep} onChange={(e) => setForm({ sweep: Number(e.target.value) as 1 | 2 | 3 })}>
              <option value={1}>Desligada</option>
              <option value={2} disabled={plan.sweep < 2}>
                2×2 · 4 regiões {plan.sweep < 2 ? "(Pro)" : ""}
              </option>
              <option value={3} disabled={plan.sweep < 3}>
                3×3 · 9 regiões {plan.sweep < 3 ? "(Business)" : ""}
              </option>
            </Select>
          </Field>
        )}
      </Section>

      <Section title="Categoria">
        <div className="flex flex-wrap gap-1.5">
          {[...CATEGORIES.map((c) => ({ id: c.id as string, label: c.label })), { id: "custom", label: "Personalizada" }].map((c) => {
            const active = form.category === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setForm({ category: active ? "" : c.id })}
                className={cn(
                  "h-8 rounded-full border px-3 text-[13px] transition-colors",
                  active ? "border-brand bg-brand text-white" : "border-line-2 text-mute-2 hover:border-mute hover:text-paper",
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>
        {form.category === "custom" && (
          <Input className="mt-3" value={form.customCategory} onChange={(e) => setForm({ customCategory: e.target.value })} placeholder="Ex.: estúdios de tatuagem" maxLength={80} autoFocus />
        )}
      </Section>

      <Section title="Dados da empresa">
        <Field label="Website">
          <Select value={filters.website} onChange={(e) => setFilters({ website: e.target.value as Tri })}>
            <option value="todos">Com ou sem site</option>
            <option value="com">Possui site</option>
            <option value="sem">Não possui site</option>
          </Select>
        </Field>
        <div className="mt-3 space-y-2.5">
          <Checkbox checked={filters.whatsapp} onChange={(whatsapp) => setFilters({ whatsapp })} label="Possui WhatsApp" />
          <Checkbox checked={filters.phone} onChange={(phone) => setFilters({ phone })} label="Possui telefone" />
          <Locked locked={advanced}>
            <Checkbox checked={filters.instagram} onChange={(instagram) => setFilters({ instagram })} label="Possui Instagram" />
          </Locked>
          <Locked locked={advanced}>
            <Checkbox checked={filters.facebook} onChange={(facebook) => setFilters({ facebook })} label="Possui Facebook" />
          </Locked>
          <Locked locked={advanced}>
            <Checkbox checked={filters.email} onChange={(email) => setFilters({ email })} label="Possui e-mail" />
          </Locked>
          <Checkbox checked={filters.openNow} onChange={(openNow) => setFilters({ openNow })} label="Aberto agora" />
          <Checkbox checked={false} onChange={() => undefined} disabled label="Empresa verificada" hint="O Google não informa verificação de perfil pela API oficial." />
          <p className="pl-7 text-[11px] text-mute">Verificação não é informada pela API do Google.</p>
        </div>
      </Section>

      <Section title="Avaliações">
        <div className="space-y-3">
          <Field label="Nota mínima">
            <Select value={filters.minRating} onChange={(e) => setFilters({ minRating: Number(e.target.value) })}>
              {[0, 3, 3.5, 4, 4.3, 4.5, 4.8].map((v) => (
                <option key={v} value={v}>
                  {v === 0 ? "Qualquer" : `${v.toLocaleString("pt-BR")}+`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Nota máxima">
            <Select value={filters.maxRating} onChange={(e) => setFilters({ maxRating: Number(e.target.value) })}>
              {[5, 4.5, 4, 3.5, 3, 2].map((v) => (
                <option key={v} value={v}>
                  {v === 5 ? "Qualquer" : `até ${v.toLocaleString("pt-BR")}`}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Quantidade mínima de avaliações">
            <Select value={filters.minReviews} onChange={(e) => setFilters({ minReviews: Number(e.target.value) })}>
              {[0, 5, 10, 30, 50, 100, 300, 500, 1000].map((v) => (
                <option key={v} value={v}>
                  {v === 0 ? "Qualquer" : `${v.toLocaleString("pt-BR")}+`}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Section>

      <Section title="Outros">
        <Field label="Ordenar por">
          <Select value={sort} onChange={(e) => searchActions.setSort(e.target.value as SortKey)}>
            <option value="relevancia">Relevância</option>
            <option value="avaliacoes">Mais avaliações</option>
            <option value="nota">Melhor avaliação</option>
            <option value="distancia">Distância</option>
            <option value="recentes" disabled>
              Mais recentes (indisponível na fonte)
            </option>
          </Select>
        </Field>
        <Checkbox className="mt-3" checked={filters.hideClosed} onChange={(hideClosed) => setFilters({ hideClosed })} label="Ocultar fechadas" />
        <button type="button" onClick={() => searchActions.resetFilters()} className="mt-4 text-xs text-mute underline-offset-4 hover:text-paper hover:underline">
          Limpar filtros
        </button>
      </Section>
    </div>
  );
}
