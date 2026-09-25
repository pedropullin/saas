"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { safeNextPath } from "@/lib/utils";
import { AppError } from "../errors";
import { acceptInvitation, authenticate, registerUser } from "./accounts";
import { rateLimit } from "./rate-limit";
import { clientIp, createSession, destroySession, requireAuth, setSessionOrg } from "./session";

export interface AuthFormState {
  error?: string;
  values?: Record<string, string>;
}

const optionalText = z
  .string()
  .trim()
  .max(100)
  .optional()
  .transform((value) => value || undefined);

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Informe seu nome.").max(60, "Nome muito longo."),
  email: z.email("E-mail inválido.").max(160),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres.").max(200),
  orgName: optionalText,
  invite: optionalText,
  next: optionalText,
});

const signInSchema = z.object({
  email: z.email("E-mail inválido.").max(160),
  password: z.string().min(1, "Informe sua senha.").max(200),
  next: optionalText,
});

function keep(formData: FormData, keys: string[]): Record<string, string> {
  return Object.fromEntries(keys.map((key) => [key, String(formData.get(key) ?? "")]));
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = keep(formData, ["name", "email", "orgName"]);
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };
  if (!(await rateLimit(`cadastro:${await clientIp()}`, 10, 3600))) {
    return { error: "Muitas tentativas de cadastro. Tente novamente em uma hora.", values };
  }
  try {
    const { userId, orgId } = await registerUser({
      name: parsed.data.name,
      email: parsed.data.email,
      password: parsed.data.password,
      orgName: parsed.data.orgName,
      inviteToken: parsed.data.invite,
    });
    await createSession(userId, orgId);
  } catch (error) {
    if (error instanceof AppError) return { error: error.message, values };
    throw error;
  }
  redirect(safeNextPath(parsed.data.next));
}

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const values = keep(formData, ["email"]);
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };

  const ip = await clientIp();
  const okIp = await rateLimit(`login-ip:${ip}`, 30, 900);
  const okEmail = await rateLimit(`login-email:${parsed.data.email.toLowerCase()}`, 10, 900);
  if (!okIp || !okEmail) return { error: "Muitas tentativas. Aguarde 15 minutos e tente de novo.", values };

  const account = await authenticate(parsed.data.email, parsed.data.password);
  if (!account) return { error: "E-mail ou senha incorretos.", values };
  await createSession(account.userId, account.orgId);
  redirect(safeNextPath(parsed.data.next));
}

export async function signOutAction(): Promise<void> {
  await destroySession();
  redirect("/entrar");
}

export async function acceptInviteAction(token: string): Promise<{ error: string } | void> {
  const auth = await requireAuth();
  try {
    const orgId = await acceptInvitation(token, auth.user.id);
    await setSessionOrg(auth, orgId);
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    throw error;
  }
  redirect("/app");
}

export async function switchOrgAction(orgId: string): Promise<void> {
  const auth = await requireAuth();
  await setSessionOrg(auth, orgId);
  redirect("/app");
}
