import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignInForm } from "@/components/auth/AuthForms";
import { safeNextPath } from "@/lib/utils";
import { getAuth } from "@/server/auth/session";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getAuth()) redirect(safeNextPath(next));
  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta para continuar prospectando.">
      <SignInForm next={next} />
    </AuthShell>
  );
}
