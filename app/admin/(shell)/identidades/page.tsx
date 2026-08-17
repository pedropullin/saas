import type { Metadata } from "next";
import { identities } from "@/lib/mock/identities";
import { projects } from "@/lib/mock/projects";
import { Reveal } from "@/components/motion/Reveal";
import { VMark } from "@/components/ui/VMark";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Identidades geradas — Admin" };

export default function AdminIdentidadesPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Identidades geradas
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{identities.length} identidades na plataforma</h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-8">
        <Table>
          <TableHeader>
            <TableHead>Símbolo</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Segmento</TableHead>
            <TableHead>Projeto</TableHead>
            <TableHead>Gerada em</TableHead>
          </TableHeader>
          <TableBody>
            {identities.map((identity) => {
              const project = projects.find((p) => p.identityId === identity.id);
              return (
                <TableRow key={identity.id}>
                  <TableCell>
                    <VMark variant={identity.symbolVariant} size={20} tone="ink" />
                  </TableCell>
                  <TableCell className="font-medium">{identity.brandName}</TableCell>
                  <TableCell className="text-neutral-600">{identity.segment}</TableCell>
                  <TableCell className="text-neutral-600">{project?.ownerName ?? "—"}</TableCell>
                  <TableCell className="text-neutral-500">{formatDate(identity.createdAt)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Reveal>
    </div>
  );
}
