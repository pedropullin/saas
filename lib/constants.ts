import type { NavLink } from "./types";

export const MARKETING_NAV: NavLink[] = [
  { label: "Product", href: "#product" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Designers", href: "#designers" },
  { label: "Pricing", href: "#pricing" },
];

export const PRODUCT_NAV: { label: string; href: string; icon: string }[] = [
  { label: "Dashboard", href: "/app", icon: "grid" },
  { label: "Projetos", href: "/app/projetos", icon: "layers" },
  { label: "Criar identidade", href: "/app/criar", icon: "plus" },
  { label: "Biblioteca", href: "/app/biblioteca", icon: "archive" },
  { label: "Brand Books", href: "/app/brandbook", icon: "book" },
  { label: "Equipe", href: "/app/equipe", icon: "users" },
  { label: "Configurações", href: "/app/configuracoes", icon: "settings" },
];

export const ADMIN_NAV: { label: string; href: string; icon: string }[] = [
  { label: "Visão geral", href: "/admin", icon: "grid" },
  { label: "Usuários", href: "/admin/usuarios", icon: "users" },
  { label: "Projetos", href: "/admin/projetos", icon: "layers" },
  { label: "Identidades geradas", href: "/admin/identidades", icon: "symbol" },
  { label: "Designers", href: "/admin/designers", icon: "user" },
  { label: "Assinaturas", href: "/admin/assinaturas", icon: "card" },
  { label: "Pagamentos", href: "/admin/pagamentos", icon: "wallet" },
  { label: "Conteúdo", href: "/admin/conteudo", icon: "file" },
  { label: "Analytics", href: "/admin/analytics", icon: "chart" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export const ONBOARDING_QUESTIONS = [
  {
    id: "brandName",
    question: "Qual é o nome da sua marca?",
    placeholder: "Ex.: Norte",
    type: "text" as const,
  },
  {
    id: "segment",
    question: "Em qual segmento ela atua?",
    placeholder: "Ex.: Arquitetura, moda, tecnologia...",
    type: "text" as const,
  },
  {
    id: "perception",
    question: "Como você quer que sua marca seja percebida?",
    placeholder: "Descreva em poucas palavras a percepção desejada",
    type: "textarea" as const,
  },
  {
    id: "keywords",
    question: "Escolha palavras que representam sua marca.",
    placeholder: "Moderna, Minimalista, Sofisticada...",
    type: "tags" as const,
  },
  {
    id: "audience",
    question: "Quem é seu público?",
    placeholder: "Descreva o público que sua marca deve atrair",
    type: "textarea" as const,
  },
  {
    id: "inspiration",
    question: "Quais marcas inspiram sua direção visual?",
    placeholder: "Cite referências que admira",
    type: "text" as const,
  },
];
