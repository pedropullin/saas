import type { BrandBook, Identity } from "../types";
import { identities } from "./identities";

function buildBrandBook(identity: Identity): BrandBook {
  const [primary] = identity.personalityTags;
  return {
    id: `bb-${identity.id}`,
    identityId: identity.id,
    sections: [
      {
        id: "posicionamento",
        title: "Posicionamento",
        body: `${identity.brandName} atua em ${identity.segment.toLowerCase()} com uma postura ${primary?.toLowerCase() ?? "própria"}. O sistema visual traduz essa posição em decisões consistentes de forma, cor e tipografia.`,
      },
      {
        id: "simbolo",
        title: "Símbolo",
        body: "O símbolo deriva de um grid modular único, com variações geométricas controladas — nunca um ícone solto. Área de proteção mínima e versão monocromática garantem legibilidade em qualquer aplicação.",
      },
      {
        id: "cor",
        title: "Sistema de cor",
        body: `A paleta combina tons neutros de base com um único destaque de contraste. A cor de destaque é reservada para estados ativos, indicadores e pequenos detalhes — nunca para grandes áreas.`,
      },
      {
        id: "tipografia",
        title: "Tipografia",
        body: `${identity.typography.display} conduz títulos e momentos de impacto; ${identity.typography.body} sustenta textos longos com alta legibilidade.`,
      },
      {
        id: "grid",
        title: "Grid e composição",
        body: "Toda composição parte de um grid modular editorial: blocos, recortes e espaço negativo substituem ornamentos. A hierarquia nasce de escala e contraste, não de decoração.",
      },
      {
        id: "aplicacoes",
        title: "Aplicações",
        body: `O sistema foi validado em ${identity.applications.map((a) => a.label.toLowerCase()).join(", ")}, mantendo coerência entre mídias físicas e digitais.`,
      },
    ],
  };
}

export const brandBooks: BrandBook[] = identities.map(buildBrandBook);

export function getBrandBookByIdentityId(identityId: string): BrandBook | undefined {
  return brandBooks.find((book) => book.identityId === identityId);
}
