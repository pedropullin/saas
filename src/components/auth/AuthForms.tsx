"use client";

import { ArrowRight, SpinnerGap } from "@phosphor-icons/react";
import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { buttonClass } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { acceptInviteAction, signInAction, signUpAction, type AuthFormState } from "@/server/auth/actions";

function ErrorBox({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl border border-brand/50 bg-brand/10 px-3 py-2.5 text-sm">
      {message}
    </p>
  );
}

function Submit({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={pending} className={buttonClass("primary", "lg", "w-full")}>
      {pending ? <SpinnerGap size={18} className="animate-spin" /> : children}
      {!pending && <ArrowRight size={17} weight="bold" />}
    </button>
  );
}

export function SignInForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signInAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className="h-12" />
      </Field>
      <Field label="Senha">
        <Input name="password" type="password" autoComplete="current-password" required className="h-12" />
      </Field>
      <ErrorBox message={state.error} />
      <Submit pending={pending}>Entrar</Submit>
      <p className="text-center text-sm text-mute">
        Ainda não tem conta?{" "}
        <Link href={`/cadastro${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-paper hover:text-brand">
          Criar conta grátis
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm({ next, invite, orgName }: { next?: string; invite?: string; orgName?: string }) {
  const [state, action, pending] = useActionState<AuthFormState, FormData>(signUpAction, {});
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      {invite && <input type="hidden" name="invite" value={invite} />}
      <Field label="Seu nome">
        <Input name="name" autoComplete="name" required defaultValue={state.values?.name} className="h-12" />
      </Field>
      <Field label="E-mail">
        <Input name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} className="h-12" />
      </Field>
      <Field label="Senha" hint="Mínimo de 8 caracteres.">
        <Input name="password" type="password" autoComplete="new-password" minLength={8} required className="h-12" />
      </Field>
      {!invite && (
        <Field label="Nome da empresa ou equipe (opcional)">
          <Input name="orgName" placeholder="Ex.: Agência Norte" defaultValue={state.values?.orgName} className="h-12" />
        </Field>
      )}
      {invite && orgName && (
        <p className="rounded-xl border border-line-2 bg-ink-3 px-3 py-2.5 text-sm text-mute-2">
          Você vai entrar na equipe <strong className="text-paper">{orgName}</strong>.
        </p>
      )}
      <ErrorBox message={state.error} />
      <Submit pending={pending}>Criar conta</Submit>
      <p className="text-center text-sm text-mute">
        Já tem conta?{" "}
        <Link href={`/entrar${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-medium text-paper hover:text-brand">
          Entrar
        </Link>
      </p>
    </form>
  );
}

export function AcceptInvite({ token, orgName }: { token: string; orgName: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string>();
  return (
    <div className="space-y-4">
      <ErrorBox message={error} />
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const result = await acceptInviteAction(token);
            if (result?.error) setError(result.error);
          })
        }
        className={buttonClass("primary", "lg", "w-full")}
      >
        {pending ? <SpinnerGap size={18} className="animate-spin" /> : `Entrar na equipe ${orgName}`}
      </button>
    </div>
  );
}
