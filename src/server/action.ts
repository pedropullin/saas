import "server-only";
import { unstable_rethrow } from "next/navigation";
import { ZodError } from "zod";
import { requireAuth, type AuthContext } from "./auth/session";
import { AppError, type ActionResult } from "./errors";

/** Envolve uma Server Action: exige sessão e converte erros em mensagens para o usuário. */
export async function withAuth<T>(fn: (auth: AuthContext) => Promise<T>): Promise<ActionResult<T>> {
  try {
    const auth = await requireAuth();
    return { ok: true, data: await fn(auth) };
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof AppError) return { ok: false, error: error.message, code: error.code };
    if (error instanceof ZodError) return { ok: false, error: error.issues[0]?.message ?? "Dados inválidos.", code: "invalido" };
    console.error("[action]", error);
    return { ok: false, error: "Algo deu errado. Tente novamente.", code: "erro" };
  }
}
