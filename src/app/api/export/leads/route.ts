import { z } from "zod";
import { toCsv } from "@/lib/csv";
import { LEAD_STATUS_IDS, STATUS_LABEL } from "@/lib/leads";
import { getPlan } from "@/lib/plans";
import { logActivity } from "@/server/activity/service";
import { addUsage } from "@/server/billing/usage";
import { PlanLimitError } from "@/server/errors";
import { apiRoute } from "@/server/http";
import { listLeads } from "@/server/leads/service";

export async function GET(request: Request) {
  return apiRoute(request, async (auth) => {
    const plan = getPlan(auth.org.plan);
    if (!plan.export) throw new PlanLimitError(`Exportação não está no plano ${plan.name}. Mude para o Pro para exportar.`);
    const url = new URL(request.url);
    const ids = url.searchParams.get("ids")?.split(",").filter(Boolean);
    const status = url.searchParams.get("status");
    const leads = await listLeads(auth.org.id, {
      ids: ids?.length ? z.array(z.uuid()).max(5000).parse(ids) : undefined,
      status: status ? z.enum(LEAD_STATUS_IDS).parse(status) : undefined,
    });

    const header = ["Empresa", "Contato", "Telefone", "WhatsApp", "Website", "Instagram", "E-mail", "Segmento", "Cidade", "Nota", "Avaliações", "Status", "Tags", "Primeiro contato", "Último contato", "Criado em"];
    if (plan.advancedExport) header.push("Responsável", "Observações");
    const date = (iso: string | null) => (iso ? new Date(iso).toLocaleString("pt-BR") : "");
    const rows = leads.map((lead) => {
      const row = [
        lead.companyName,
        lead.contactName,
        lead.phone,
        lead.whatsapp,
        lead.website,
        lead.instagram,
        lead.email,
        lead.category,
        lead.city,
        lead.rating,
        lead.reviewCount,
        STATUS_LABEL[lead.status],
        lead.tags.join("; "),
        date(lead.firstContactAt),
        date(lead.lastContactAt),
        date(lead.createdAt),
      ];
      if (plan.advancedExport) row.push(lead.assignedName, lead.notes);
      return row;
    });

    await addUsage(auth.org.id, { exports: 1 });
    await logActivity({ orgId: auth.org.id, userId: auth.user.id, type: "exportacao", summary: `exportou ${leads.length} leads` });
    const filename = `prospecta-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    return new Response("﻿" + toCsv([header, ...rows]), {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="${filename}"`, "Cache-Control": "no-store" },
    });
  });
}
