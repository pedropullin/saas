import { contactFacts, hasFact } from "./contact";
import type { Enrichment, Place } from "./types";

export type ServiceFocus = "sites" | "marketing" | "design" | "tecnologia" | "outro";

export const SERVICES: Array<{ id: ServiceFocus; label: string }> = [
  { id: "sites", label: "Criação de sites" },
  { id: "marketing", label: "Marketing e tráfego" },
  { id: "design", label: "Design e identidade visual" },
  { id: "tecnologia", label: "Tecnologia e sistemas" },
  { id: "outro", label: "Outro serviço B2B" },
];

export interface Opportunity {
  score: number;
  level: "alta" | "media" | "baixa";
  potential: boolean;
  headline: string;
  reasons: string[];
  noWebsite: boolean;
}

/**
 * Análise automática feita só com dados encontrados. Nada é estimado:
 * se um dado não existe, ele não entra na conta.
 */
export function analyzeOpportunity(
  place: Place,
  enrichment: Enrichment | null | undefined,
  service: ServiceFocus = "sites",
): Opportunity {
  const facts = contactFacts(place, enrichment);
  const reviews = place.reviewCount ?? 0;
  const rating = place.rating;
  const noWebsite = !hasFact(facts.website);
  const hasSocial = hasFact(facts.instagram) || hasFact(facts.facebook);
  const reachable = hasFact(facts.whatsapp) || hasFact(facts.phone);
  const strongLocal = reviews >= 30 && (rating ?? 0) >= 4.3;
  const reasons: string[] = [];
  let score = 30;
  let headline = "Empresa com dados de contato disponíveis.";

  if (noWebsite) {
    score += service === "sites" ? 35 : service === "design" || service === "marketing" ? 20 : 15;
    reasons.push("Nenhum website identificado.");
  } else {
    reasons.push("Já possui website.");
  }

  if (strongLocal) {
    score += 15;
    reasons.push(`Boa reputação local: nota ${rating?.toLocaleString("pt-BR")} com ${reviews.toLocaleString("pt-BR")} avaliações.`);
  } else if (rating != null && rating < 3.8 && reviews >= 10) {
    score += service === "marketing" ? 20 : 8;
    reasons.push(`Reputação abaixo da média: nota ${rating.toLocaleString("pt-BR")}.`);
  } else if (reviews > 0 && reviews < 15) {
    score += service === "marketing" ? 15 : 5;
    reasons.push(`Poucas avaliações no Google (${reviews}).`);
  }

  if (hasSocial) {
    score += 5;
    reasons.push(noWebsite ? "Presença em redes sociais, mas sem site próprio." : "Ativa em redes sociais.");
  }

  if (hasFact(facts.whatsapp)) {
    score += 10;
    reasons.push("WhatsApp disponível para contato direto.");
  } else if (hasFact(facts.phone)) {
    score += 5;
    reasons.push("Telefone disponível para contato.");
  } else {
    score -= 20;
    reasons.push("Nenhum canal de contato direto encontrado.");
  }

  if (place.status === "CLOSED_PERMANENTLY") {
    score = 0;
    reasons.unshift("Empresa fechada permanentemente.");
  }

  if (place.status === "CLOSED_PERMANENTLY") headline = "Empresa fechada permanentemente.";
  else if (noWebsite && strongLocal) headline = "Empresa com presença local forte e sem website identificado.";
  else if (noWebsite && hasSocial) headline = "Usa redes sociais como vitrine e ainda não tem site próprio.";
  else if (noWebsite) headline = "Sem website identificado: presença digital ainda pequena.";
  else if (rating != null && rating < 3.8 && reviews >= 10) headline = "Tem site, mas a reputação no Google pede atenção.";
  else if (reviews > 0 && reviews < 15) headline = "Negócio com pouca visibilidade no Google.";
  else if (!reachable) headline = "Dados de contato insuficientes para uma abordagem direta.";
  else headline = "Empresa estruturada: avalie a qualidade do site e das redes.";

  score = Math.max(0, Math.min(100, score));
  const level = score >= 70 ? "alta" : score >= 50 ? "media" : "baixa";
  return { score, level, potential: score >= 55 && reachable, headline, reasons, noWebsite };
}
