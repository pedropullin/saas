"use client";

import { useMemo, useState } from "react";
import { projects } from "@/lib/mock/projects";
import { identities } from "@/lib/mock/identities";
import { designers } from "@/lib/mock/designers";
import { Reveal } from "@/components/motion/Reveal";
import { FilterBar } from "@/components/admin/FilterBar";
import { Badge } from "@/components/ui/Badge";
import { VMark } from "@/components/ui/VMark";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import type { ProjectStatus } from "@/lib/types";

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
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? "");

  const filtered = useMemo(
    () =>
      projects.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.ownerName.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const selected = projects.find((p) => p.id === selectedId) ?? projects[0]!;
  const identity = identities.find((i) => i.id === selected.identityId);
  const designer = designers.find((d) => d.id === selected.designerId);

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Projetos</p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{projects.length} projetos na plataforma</h1>
      </Reveal>

      <Reveal delay={0.06} className="mt-8">
        <FilterBar search={search} onSearchChange={setSearch} placeholder="Buscar por projeto ou responsável..." />
      </Reveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <Reveal delay={0.1}>
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
                <TableRow
                  key={project.id}
                  className={`cursor-pointer ${selectedId === project.id ? "bg-off-white" : ""}`}
                  onClick={() => setSelectedId(project.id)}
                >
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

        <Reveal delay={0.16}>
          <div className="rounded-md border border-ink/8 p-6">
            <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
              Detalhe do projeto
            </p>
            <p className="mt-3 text-[1rem] font-medium text-ink">{selected.name}</p>

            <dl className="mt-5 space-y-3 text-[0.8125rem]">
              <Row label="Usuário" value={selected.ownerName} />
              <Row label="Segmento" value={selected.segment} />
              <Row label="Plano" value={selected.plan} />
              <Row label="Status" value={STATUS_LABEL[selected.status]} />
              <Row label="Criado em" value={formatDate(selected.createdAt)} />
              <Row label="Designer" value={designer?.name ?? "Nenhum designer conectado"} />
            </dl>

            {identity && (
              <div className="mt-6 border-t border-ink/8 pt-5">
                <p className="mb-3 text-[0.75rem] text-neutral-500">Identidade gerada</p>
                <div className="flex items-center gap-3">
                  <VMark variant={identity.symbolVariant} size={24} tone="ink" />
                  <span className="text-[0.875rem] font-medium text-ink">{identity.brandName}</span>
                </div>
                <div className="mt-3 flex gap-1.5">
                  {identity.colors.map((c) => (
                    <span key={c.hex} className="h-4 w-4 rounded-[2px]" style={{ backgroundColor: c.hex }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-ink/6 pb-2.5">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
