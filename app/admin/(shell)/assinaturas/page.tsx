import type { Metadata } from "next";
import { users } from "@/lib/mock/users";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PlanTier } from "@/lib/types";

export const metadata: Metadata = { title: "Assinaturas — Admin" };

const PLAN_PRICE: Record<PlanTier, number> = { Free: 0, Pro: 149, Business: 490 };
const subscribers = users.filter((u) => u.status !== "suspended");

export default function AdminAssinaturasPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Assinaturas
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{subscribers.length} assinaturas ativas</h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-8">
        <Table>
          <TableHead>
            <TableHeadCell>Usuário</TableHeadCell>
            <TableHeadCell>Plano</TableHeadCell>
            <TableHeadCell>Valor mensal</TableHeadCell>
            <TableHeadCell>Próxima renovação</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
          </TableHead>
          <TableBody>
            {subscribers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="text-neutral-600">{user.plan}</TableCell>
                <TableCell className="text-neutral-600">{formatCurrency(PLAN_PRICE[user.plan])}</TableCell>
                <TableCell className="text-neutral-500">
                  {formatDate(new Date(new Date(user.lastActivityAt).getTime() + 30 * 86400000).toISOString())}
                </TableCell>
                <TableCell>
                  <Badge tone={user.plan === "Free" ? "neutral" : "accent"}>
                    {user.plan === "Free" ? "Gratuita" : "Paga"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Reveal>
    </div>
  );
}
