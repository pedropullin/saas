import type { Metadata } from "next";
import { users } from "@/lib/mock/users";
import { Reveal } from "@/components/motion/Reveal";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Pagamentos — Admin" };

const PLAN_PRICE = { Free: 0, Pro: 149, Business: 490 } as const;

const payments = users
  .filter((u) => u.plan !== "Free")
  .map((user, index) => ({
    id: `pay-${index + 1}`,
    user,
    amount: PLAN_PRICE[user.plan],
    date: user.lastActivityAt,
    status: index % 7 === 0 ? ("pendente" as const) : ("pago" as const),
  }));

export default function AdminPagamentosPage() {
  const total = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <Reveal>
        <p className="text-label font-medium uppercase tracking-[0.08em] text-neutral-500">
          Pagamentos
        </p>
        <h1 className="mt-2 text-h1 font-medium text-ink">{formatCurrency(total)} processados</h1>
      </Reveal>

      <Reveal delay={0.08} className="mt-8">
        <Table>
          <TableHead>
            <TableHeadCell>Usuário</TableHeadCell>
            <TableHeadCell>Valor</TableHeadCell>
            <TableHeadCell>Data</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell className="font-medium">{payment.user.name}</TableCell>
                <TableCell className="text-neutral-600">{formatCurrency(payment.amount)}</TableCell>
                <TableCell className="text-neutral-500">{formatDate(payment.date)}</TableCell>
                <TableCell>
                  <Badge tone={payment.status === "pago" ? "accent" : "outline"}>
                    {payment.status === "pago" ? "Pago" : "Pendente"}
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
