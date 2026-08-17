"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/mock/projects";
import { identities } from "@/lib/mock/identities";
import { designers } from "@/lib/mock/designers";
import { Reveal } from "@/components/motion/Reveal";
import { FilterBar } from "@/components/admin/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { VMark } from "@/components/ui/VMark";
import { SlideOver } from "@/components/admin/SlideOver";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/lib/types";

const STATUS_LABEL: Record<ProjectStatus, string> = {
  rascunho: "Rascunho",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

const STATUS_TONE: Record<ProjectStatus, "neutral" | "outline" | "accent"> = {
  rascunho: "neutral",
  em_andamento: "outline",
  concluido: "accent",
};

export default function AdminProjetosPage() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.ownerName.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const identity = selected ? identities.find((i) => i.id === selected.identityId) : undefined;
  const designer = selected ? designers.find((d) => d.id === selected.designerId) : undefined;

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Projetos</p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{projects.length} projetos na plataforma</h1>
      </Reveal>

      <Reveal delay={0.06} className="mt-8">
        <FilterBar search={search} onSearchChange={setSearch} placeholder="Buscar por projeto ou responsável..." />
      </Reveal>

      <Reveal delay={0.1} className="mt-6">
        <Table>
          <TableHead>
            <TableHeadCell>Projeto</TableHeadCell>
            <TableHeadCell>Responsável</TableHeadCell>
            <TableHeadCell>Plano</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Data</TableHeadCell>
          </TableHead>
          <TableBody>
            {filtered.map((project) => (
              <TableRow key={project.id} className="cursor-pointer" onClick={() => setSelected(project)}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell className="text-neutral-600">{project.ownerName}</TableCell>
                <TableCell className="text-neutral-600">{project.plan}</TableCell>
                <TableCell>
                  <Badge tone={STATUS_TONE[project.status]}>{STATUS_LABEL[project.status]}</Badge>
                </TableCell>
                <TableCell className="text-neutral-500">{formatDate(project.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Reveal>

      <SlideOver open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-ink/8 px-6 py-5">
              <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
                Detalhe do projeto
              </p>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Fechar"
                className="text-neutral-400 transition-colors hover:text-ink"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 px-6 py-6">
              <p className="text-[1.0625rem] font-medium text-ink">{selected.name}</p>

              <dl className="mt-6 space-y-4 text-[0.8125rem]">
                <Row label="Usuário" value={selected.ownerName} />
                <Row label="Segmento" value={selected.segment} />
                <Row label="Plano" value={selected.plan} />
                <Row label="Status">
                  <Badge tone={STATUS_TONE[selected.status]}>{STATUS_LABEL[selected.status]}</Badge>
                </Row>
                <Row label="Criado em" value={formatDate(selected.createdAt)} />
                <Row label="Designer" value={designer?.name ?? "Nenhum designer conectado"} />
              </dl>

              {identity && (
                <div className="mt-8 border-t border-ink/8 pt-6">
                  <p className="mb-3 text-[0.75rem] uppercase tracking-[0.06em] text-neutral-500">
                    Identidade gerada
                  </p>
                  <div className="flex items-center gap-3">
                    <VMark variant={identity.symbolVariant} size={26} tone="ink" />
                    <span className="text-[0.9375rem] font-medium text-ink">{identity.brandName}</span>
                  </div>
                  <div className="mt-4 flex gap-1.5">
                    {identity.colors.map((c) => (
                      <span key={c.hex} className="h-6 w-6 rounded-[3px]" style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {identity.personalityTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-ink/10 px-3 py-1 text-[0.75rem] text-neutral-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}

function Row({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/6 pb-3">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-ink">{children ?? value}</dd>
    </div>
  );
}
