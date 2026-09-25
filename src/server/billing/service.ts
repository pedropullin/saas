import "server-only";
import { eq } from "drizzle-orm";
import { getPlan, type PlanId } from "@/lib/plans";
import { logActivity } from "../activity/service";
import type { AuthContext } from "../auth/session";
import { requireRole } from "../auth/session";
import { getDb } from "../db/client";
import { organizations } from "../db/schema";
import { AppError } from "../errors";
import { notifyAdmins } from "../notifications/service";
import { getBillingProvider } from "./provider";

export async function changePlan(auth: AuthContext, planId: PlanId) {
  requireRole(auth, ["owner", "admin"]);
  const plan = getPlan(planId);
  const provider = getBillingProvider();
  const result = await provider.startCheckout({ orgId: auth.org.id, plan, userEmail: auth.user.email });
  if (result.redirectUrl) return { redirectUrl: result.redirectUrl, applied: false };
  if (!result.applied) throw new AppError("Pagamentos ainda não estão disponíveis. Fale com o suporte para mudar de plano.");

  const db = await getDb();
  await db.update(organizations).set({ plan: plan.id, planUpdatedAt: new Date() }).where(eq(organizations.id, auth.org.id));
  await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "plano", summary: `mudou o plano para ${plan.name}` });
  await notifyAdmins(auth.org.id, auth.user.id, `Plano alterado para ${plan.name}`, `Por ${auth.user.name}.`, "/app/planos");
  return { applied: true };
}
