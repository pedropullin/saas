import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AcceptInvite, SignUpForm } from "@/components/auth/AuthForms";
import { buttonClass } from "@/components/ui/button";
import { findInvitation } from "@/server/auth/accounts";
import { getAuth } from "@/server/auth/session";

export const metadata: Metadata = { title: "Convite" };

export default async function ConvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = /^[A-Za-z0-9_-]{20,64}$/.test(token) ? await findInvitation(token) : null;

  if (!invite?.valid) {
    return (
      <AuthShell title="Convite indisponível" subtitle="Este link expirou, foi revogado ou já foi usado. Peça um novo convite a quem enviou.">
        <Link href="/entrar" className={buttonClass("outline", "lg", "w-full")}>
          Ir para o login
        </Link>
      </AuthShell>
    );
  }

  const auth = await getAuth();
  if (auth) {
    return (
      <AuthShell title={`Convite para ${invite.orgName}`} subtitle={`Você está conectado como ${auth.user.email}.`}>
        <AcceptInvite token={token} orgName={invite.orgName} />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title={`Junte-se a ${invite.orgName}`}
      subtitle={
        <>
          Crie sua conta para prospectar com a equipe. Já tem conta?{" "}
          <Link href={`/entrar?next=/convite/${token}`} className="text-paper underline-offset-4 hover:underline">
            Entre primeiro
          </Link>
          .
        </>
      }
    >
      <SignUpForm invite={token} orgName={invite.orgName} next="/app" />
    </AuthShell>
  );
}
