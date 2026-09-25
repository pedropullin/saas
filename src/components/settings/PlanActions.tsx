"use client";

import { SpinnerGap } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/client/toast";
import { buttonClass } from "@/components/ui/button";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/plans";
import { changePlanAction } from "@/server/billing/actions";

export function PlanButton({ plan, current, canManage, highlight }: { plan: PlanId; current: PlanId; canManage: boolean; highlight?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  if (plan === current) return <span className={buttonClass("subtle", "lg", "pointer-events-none w-full")}>Plano atual</span>;
  const upgrade = PLAN_ORDER.indexOf(plan) > PLAN_ORDER.indexOf(current);
  return (
    <button
      type="button"
      disabled={!canManage || busy}
      title={canManage ? undefined : "Só o dono ou administradores podem mudar o plano."}
      onClick={async () => {
        setBusy(true);
        const result = await changePlanAction(plan);
        setBusy(false);
        if (!result.ok) return toast.error(result.error);
        if (result.data.redirectUrl) {
          window.location.href = result.data.redirectUrl;
          return;
        }
        toast.success(`Plano ${PLANS[plan].name} ativado.`);
        router.refresh();
      }}
      className={buttonClass(highlight || upgrade ? "primary" : "outline", "lg", "w-full")}
    >
      {busy && <SpinnerGap size={16} className="animate-spin" />}
      {upgrade ? `Mudar para o ${PLANS[plan].name}` : `Voltar para o ${PLANS[plan].name}`}
    </button>
  );
}
