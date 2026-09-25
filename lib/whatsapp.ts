import type { Place, WhatsAppInfo } from "./types";

export interface MessageTemplate {
  id: string;
  name: string;
  body: string;
}

export const TEMPLATE_VARIABLES = [
  { key: "empresa", label: "Nome da empresa" },
  { key: "primeiro_nome_empresa", label: "Primeira palavra do nome" },
  { key: "categoria", label: "Segmento" },
  { key: "cidade", label: "Cidade" },
  { key: "nota", label: "Nota no Google" },
  { key: "avaliacoes", label: "Nº de avaliações" },
  { key: "meu_nome", label: "Seu nome" },
] as const;

export const DEFAULT_TEMPLATES: MessageTemplate[] = [
  {
    id: "apresentacao",
    name: "Apresentação",
    body:
      "Olá! Tudo bem? Encontrei a {empresa} no Google Maps e gostaria de apresentar uma ideia rápida que pode trazer mais clientes para vocês. Meu nome é {meu_nome}. Posso te mandar os detalhes por aqui?",
  },
  {
    id: "elogio",
    name: "Elogio às avaliações",
    body:
      "Oi, pessoal da {empresa}! Vi que vocês têm nota {nota} com {avaliacoes} avaliações no Google, parabéns pelo trabalho. Sou {meu_nome} e ajudo negócios de {categoria} em {cidade} a crescer. Posso te mostrar como em 2 minutos?",
  },
  {
    id: "sem-site",
    name: "Sem site",
    body:
      "Olá! Procurei a {empresa} no Google e não encontrei um site de vocês. Meu nome é {meu_nome} e crio sites que transformam buscas em clientes no WhatsApp. Posso te mostrar um exemplo?",
  },
];

function formatRating(rating: number | null): string {
  return rating == null ? "" : rating.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** Troca {variáveis} pelos dados da empresa. Variáveis desconhecidas ficam como estão. */
export function fillTemplate(body: string, place: Place, myName: string): string {
  const values: Record<string, string> = {
    empresa: place.name,
    primeiro_nome_empresa: place.name.split(/\s+/)[0] ?? place.name,
    categoria: (place.category ?? "").toLowerCase(),
    cidade: place.city ?? "",
    nota: formatRating(place.rating),
    avaliacoes: place.reviewCount ? place.reviewCount.toLocaleString("pt-BR") : "",
    meu_nome: myName.trim(),
  };
  return body
    .replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? values[key]! : match))
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/** Monta o link que abre a conversa. Links curtos (wa.link) não aceitam texto. */
export function whatsappUrl(info: WhatsAppInfo, message?: string): string | null {
  if (info.number) {
    const text = message?.trim() ? `?text=${encodeURIComponent(message.trim())}` : "";
    return `https://wa.me/${info.number}${text}`;
  }
  return info.link;
}

export const CONFIDENCE_LABEL: Record<WhatsAppInfo["confidence"], string> = {
  confirmado: "WhatsApp confirmado",
  provavel: "Provável WhatsApp",
  possivel: "Fixo · pode ter WhatsApp",
};

export const CONFIDENCE_HINT: Record<WhatsAppInfo["confidence"], string> = {
  confirmado: "A empresa publicou um link de WhatsApp no Google.",
  provavel: "O número cadastrado é de celular.",
  possivel: "O número é fixo. Muitas empresas usam WhatsApp Business em fixo, mas não é garantido.",
};
