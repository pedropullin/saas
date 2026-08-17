import type { Metadata } from "next";
import { designers } from "@/lib/mock/designers";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";

export const metadata: Metadata = { title: "Designers — Admin" };

const AVAILABILITY_TONE = {
  "disponível": "accent",
  "com fila": "outline",
  "indisponível": "neutral",
} as const;

export default function AdminDesignersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">Designers</p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{designers.length} designers parceiros</h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-8">
        <Table>
          <TableHead>
            <TableHeadCell>Nome</TableHeadCell>
            <TableHeadCell>Especialidade</TableHeadCell>
            <TableHeadCell>Experiência</TableHeadCell>
            <TableHeadCell>Projetos</TableHeadCell>
            <TableHeadCell>Avaliação</TableHeadCell>
            <TableHeadCell>Disponibilidade</TableHeadCell>
          </TableHead>
          <TableBody>
            {designers.map((designer) => (
              <TableRow key={designer.id}>
                <TableCell className="font-medium">{designer.name}</TableCell>
                <TableCell className="text-neutral-600">{designer.specialty}</TableCell>
                <TableCell className="text-neutral-600">{designer.experienceYears} anos</TableCell>
                <TableCell className="text-neutral-600">{designer.projectsCount}</TableCell>
                <TableCell className="text-neutral-600">{designer.rating.toFixed(1)}</TableCell>
                <TableCell>
                  <Badge tone={AVAILABILITY_TONE[designer.availability]}>{designer.availability}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Reveal>
    </div>
  );
}
