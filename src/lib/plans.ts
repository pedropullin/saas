export type PlanId = "free" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  tagline: string;
  /** Preço mensal exibido em reais. Ajuste aqui; nenhuma cobrança é feita nesta versão. */
  priceMonthly: number;
  searchesPerMonth: number;
  /** Máximo de páginas de 20 resultados por região buscada (o Google limita a 3). */
  pagesPerSearch: number;
  /** Divisão máxima da área em N×N regiões na busca em varredura. */
  sweep: 1 | 2 | 3;
  maxLeads: number;
  maxLists: number;
  maxMembers: number;
  export: boolean;
  advancedExport: boolean;
  advancedFilters: boolean;
  features: string[];
  highlight?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    tagline: "Para conhecer a plataforma",
    priceMonthly: 0,
    searchesPerMonth: 30,
    pagesPerSearch: 1,
    sweep: 1,
    maxLeads: 50,
    maxLists: 2,
    maxMembers: 1,
    export: false,
    advancedExport: false,
    advancedFilters: false,
    features: ["30 pesquisas por mês", "Até 20 empresas por pesquisa", "Até 50 leads salvos", "2 listas", "WhatsApp e ligação em um clique"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    tagline: "Para quem prospecta todo dia",
    priceMonthly: 97,
    searchesPerMonth: 600,
    pagesPerSearch: 3,
    sweep: 2,
    maxLeads: 5000,
    maxLists: 100,
    maxMembers: 1,
    export: true,
    advancedExport: false,
    advancedFilters: true,
    highlight: true,
    features: [
      "600 pesquisas por mês",
      "Até 60 empresas por região",
      "Varredura de área 2×2",
      "5.000 leads e listas ilimitadas",
      "Exportação CSV",
      "Filtros avançados: Instagram, Facebook, e-mail",
    ],
  },
  business: {
    id: "business",
    name: "Business",
    tagline: "Para equipes comerciais",
    priceMonthly: 297,
    searchesPerMonth: 3000,
    pagesPerSearch: 3,
    sweep: 3,
    maxLeads: 50000,
    maxLists: 1000,
    maxMembers: 10,
    export: true,
    advancedExport: true,
    advancedFilters: true,
    features: [
      "3.000 pesquisas por mês",
      "Varredura de área 3×3",
      "Até 10 membros na equipe",
      "Atribuição de leads e atividade da equipe",
      "Exportação avançada com notas, tags e responsável",
      "Tudo do Pro",
    ],
  },
};

export const PLAN_ORDER: PlanId[] = ["free", "pro", "business"];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS[(id as PlanId) in PLANS ? (id as PlanId) : "free"];
}

export function formatPrice(value: number): string {
  return value === 0 ? "Grátis" : value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}
