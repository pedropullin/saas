"use server";

import { z } from "zod";
import { getPlan } from "@/lib/plans";
import { withAuth } from "../action";
import { logActivity } from "../activity/service";
import { PlanLimitError } from "../errors";
import { changePlan } from "./service";
import { addUsage } from "./usage";

export async function changePlanAction(planId: string) {
  return withAuth((auth) => changePlan(auth, z.enum(["free", "pro", "business"]).parse(planId)));
}

/** Autoriza e registra uma exportação feita no navegador (empresas selecionadas). */
export async function authorizeExportAction(count: number) {
  return withAuth(async (auth) => {
    const plan = getPlan(auth.org.plan);
    if (!plan.export) throw new PlanLimitError(`Exportação não está no plano ${plan.name}. Mude para o Pro para exportar CSV.`);
    await addUsage(auth.org.id, { exports: 1 });
    await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "exportacao", summary: `exportou ${z.number().int().min(0).parse(count)} empresas` });
    return true;
  });
}
