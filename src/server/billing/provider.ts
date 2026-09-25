import "server-only";
import type { Plan } from "@/lib/plans";

/**
 * Integração de pagamento. Nesta versão não há cobrança: o modo "test" aplica o plano na hora
 * (útil para você e sua equipe usarem os recursos). Para cobrar de verdade, implemente um
 * provedor (Stripe, Pagar.me, Mercado Pago…) com este contrato e ative com BILLING_MODE.
 */
export interface BillingProvider {
  id: "test" | "disabled";
  /** true quando a troca é aplicada na hora, sem pagamento. */
  appliesInstantly: boolean;
  startCheckout(input: { orgId: string; plan: Plan; userEmail: string }): Promise<{ applied: boolean; redirectUrl?: string }>;
}

const testProvider: BillingProvider = {
  id: "test",
  appliesInstantly: true,
  async startCheckout() {
    return { applied: true };
  },
};

const disabledProvider: BillingProvider = {
  id: "disabled",
  appliesInstantly: false,
  async startCheckout() {
    return { applied: false };
  },
};

export function getBillingProvider(): BillingProvider {
  return process.env.BILLING_MODE === "disabled" ? disabledProvider : testProvider;
}
