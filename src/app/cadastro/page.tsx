import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignUpForm } from "@/components/auth/AuthForms";
import { safeNextPath } from "@/lib/utils";
import { getAuth } from "@/server/auth/session";

export const metadata: Metadata = { title: "Criar conta" };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ next?: string; plano?: string }> }) {
  const { next, plano } = await searchParams;
  const target = plano && ["pro", "business"].includes(plano) ? `/app/planos?escolher=${plano}` : safeNextPath(next);
  if (await getAuth()) redirect(target);
  return (
    <AuthShell title="Criar conta grátis" subtitle="Comece no plano Free. Sem cartão de crédito.">
      <SignUpForm next={target} />
    </AuthShell>
  );
}
