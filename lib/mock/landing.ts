import type { VMarkVariant } from "../types";

/**
 * Fictional identities the landing page generates on screen.
 *
 * Deliberate rule: the site chrome is ink, paper and grey — the only colour
 * anywhere on the page comes out of these palettes. Colour is the product's
 * output, never the interface's decoration.
 */
export interface BrandDirection {
  id: string;
  name: string;
  segment: string;
  markVariant: VMarkVariant;
  keywords: string[];
  palette: { hex: string; name: string }[];
  typography: { display: string; body: string };
  statement: string;
}

export const BRAND_DIRECTIONS: BrandDirection[] = [
  {
    id: "norte",
    name: "norte",
    segment: "Arquitetura",
    markVariant: "solid",
    keywords: ["Moderna", "Minimalista", "Sofisticada"],
    palette: [
      { hex: "#12130F", name: "Basalto" },
      { hex: "#F4F2EC", name: "Cal" },
      { hex: "#9A9384", name: "Areia" },
      { hex: "#C6F13A", name: "Sinal" },
    ],
    typography: { display: "Geist Medium", body: "Geist Regular" },
    statement: "Estúdio de arquitetura residencial e comercial.",
  },
  {
    id: "halo",
    name: "halo",
    segment: "Skincare",
    markVariant: "cropped",
    keywords: ["Calma", "Sensorial", "Precisa"],
    palette: [
      { hex: "#1B1714", name: "Terra" },
      { hex: "#F6F0E8", name: "Linho" },
      { hex: "#C08E6B", name: "Argila" },
      { hex: "#5C6B57", name: "Sálvia" },
    ],
    typography: { display: "Geist Medium", body: "Geist Regular" },
    statement: "Rotina de cuidado com formulação mínima.",
  },
  {
    id: "meridian",
    name: "meridian",
    segment: "Fintech",
    markVariant: "split",
    keywords: ["Direta", "Confiável", "Global"],
    palette: [
      { hex: "#0C1116", name: "Índigo" },
      { hex: "#EEF1F2", name: "Névoa" },
      { hex: "#3F5D57", name: "Profundo" },
      { hex: "#D7C9A7", name: "Latão" },
    ],
    typography: { display: "Geist Medium", body: "Geist Regular" },
    statement: "Infraestrutura de pagamentos para operações globais.",
  },
];

/** Section 2 — the four beats between a briefing and a finished identity. */
export const FLOW_STAGES = [
  {
    id: "briefing",
    index: "01",
    title: "Briefing",
    description:
      "Seis perguntas sobre nome, segmento, público e percepção desejada. Nada de formulário de agência com trinta campos.",
    meta: "≈ 2 min",
  },
  {
    id: "analise",
    index: "02",
    title: "Análise",
    description:
      "A VEYRO lê o briefing, extrai os atributos que importam e descarta as direções que contradizem a marca.",
    meta: "≈ 20 s",
  },
  {
    id: "criacao",
    index: "03",
    title: "Criação",
    description:
      "Símbolo, logotipo, paleta, tipografia e grid nascem como um sistema único — coerentes entre si desde a primeira versão.",
    meta: "≈ 90 s",
  },
  {
    id: "resultado",
    index: "04",
    title: "Resultado",
    description:
      "Uma identidade completa, aplicada e documentada em brand book, pronta para uso ou para refinamento humano.",
    meta: "≈ 4 min",
  },
] as const;

/** Section 3 — the order in which an identity is assembled on the canvas. */
export const BUILD_LAYERS = [
  { id: "logo", label: "Logo", caption: "Símbolo e logotipo" },
  { id: "palette", label: "Paleta", caption: "Cores e proporções" },
  { id: "typography", label: "Tipografia", caption: "Escala e pesos" },
  { id: "applications", label: "Aplicações", caption: "Digital e físico" },
  { id: "brandbook", label: "Brand Book", caption: "Diretrizes de uso" },
] as const;

/** Section 5 — where the system shows up once it exists. */
export const APPLICATIONS = [
  { id: "website", label: "Website", note: "Landing, produto e blog" },
  { id: "instagram", label: "Instagram", note: "Feed, stories e destaques" },
  { id: "packaging", label: "Packaging", note: "Caixa, rótulo e selo" },
  { id: "business-card", label: "Business card", note: "Frente, verso e papel" },
  { id: "social", label: "Social media", note: "Templates editoriais" },
  { id: "advertisement", label: "Advertisement", note: "Out-of-home e digital" },
] as const;

/** Section 6 — the commercial process, stated plainly. */
export const PROCESS_STEPS = [
  {
    index: "01",
    title: "Briefing",
    lead: "Você descreve a marca",
    description:
      "Um questionário curto captura nome, segmento, público e a percepção que a marca precisa provocar.",
    detail: "Sem conhecimento prévio de design",
  },
  {
    index: "02",
    title: "AI Generation",
    lead: "A VEYRO gera o sistema",
    description:
      "Símbolo, logotipo, paleta, tipografia, grid e aplicações são criados como um conjunto coerente.",
    detail: "Primeira versão em minutos",
  },
  {
    index: "03",
    title: "Refinement",
    lead: "Você ajusta o que importa",
    description:
      "Refine por instrução direta ou traga um designer profissional da rede VEYRO para assumir o projeto.",
    detail: "IA sozinha ou com designer",
  },
  {
    index: "04",
    title: "Final Brand",
    lead: "A marca fica pronta para uso",
    description:
      "Arquivos vetoriais, tokens, aplicações e brand book completo — entregues no seu domínio.",
    detail: "SVG, PDF e tokens",
  },
] as const;

export const PRICING_PLANS = [
  {
    name: "Starter",
    price: "R$ 0",
    period: "para começar",
    summary: "Uma identidade completa gerada por IA, para validar a direção.",
    features: [
      "1 identidade ativa",
      "Símbolo, paleta e tipografia",
      "Exportação PNG e SVG",
      "Brand book resumido",
    ],
    cta: "Criar grátis",
    highlighted: false,
  },
  {
    name: "Studio",
    price: "R$ 149",
    period: "por mês",
    summary: "Para quem cria marcas com frequência e precisa de sistema completo.",
    features: [
      "Identidades ilimitadas",
      "Brand book completo",
      "Aplicações e templates",
      "Tokens e arquivos editáveis",
      "Refinamento por instrução",
    ],
    cta: "Assinar Studio",
    highlighted: true,
  },
  {
    name: "Designer",
    price: "R$ 890",
    period: "por projeto",
    summary: "A base gerada pela IA, finalizada por um designer da rede VEYRO.",
    features: [
      "Tudo do Studio",
      "Designer dedicado ao projeto",
      "Duas rodadas de refinamento",
      "Revisão de aplicações",
      "Entrega assinada",
    ],
    cta: "Falar com a rede",
    highlighted: false,
  },
] as const;
