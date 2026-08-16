import type { Designer } from "../types";

export const designers: Designer[] = [
  {
    id: "d-1",
    name: "Cecília Amaral",
    initials: "CA",
    specialty: "Identidade verbal e naming",
    experienceYears: 11,
    rating: 4.9,
    projectsCount: 63,
    bio: "Especialista em construir sistemas de marca coerentes entre nome, voz e imagem para marcas de consumo.",
    availability: "disponível",
  },
  {
    id: "d-2",
    name: "Renato Vieira",
    initials: "RV",
    specialty: "Sistemas de identidade visual",
    experienceYears: 14,
    rating: 5.0,
    projectsCount: 88,
    bio: "Direção de arte para marcas de arquitetura e design, com foco em tipografia e grids editoriais.",
    availability: "com fila",
  },
  {
    id: "d-3",
    name: "Luiza Andrade",
    initials: "LA",
    specialty: "Direção de arte e brand book",
    experienceYears: 9,
    rating: 4.8,
    projectsCount: 47,
    bio: "Constrói brand books e diretrizes de aplicação que escalam de startups a operações multi-mercado.",
    availability: "disponível",
  },
  {
    id: "d-4",
    name: "Pedro Salgado",
    initials: "PS",
    specialty: "Design de embalagem",
    experienceYears: 8,
    rating: 4.7,
    projectsCount: 39,
    bio: "Traduz sistemas de marca para o mundo físico — embalagem, sinalização e materiais impressos.",
    availability: "disponível",
  },
  {
    id: "d-5",
    name: "Fernanda Lucca",
    initials: "FL",
    specialty: "Motion e identidade digital",
    experienceYears: 7,
    rating: 4.9,
    projectsCount: 34,
    bio: "Estende sistemas de marca estáticos para motion, interface e produto digital.",
    availability: "indisponível",
  },
  {
    id: "d-6",
    name: "Ícaro Bastos",
    initials: "IB",
    specialty: "Tipografia sob medida",
    experienceYears: 12,
    rating: 5.0,
    projectsCount: 52,
    bio: "Desenvolve famílias tipográficas exclusivas quando o sistema de marca exige uma voz própria.",
    availability: "com fila",
  },
];

export function getDesignerById(id: string): Designer | undefined {
  return designers.find((designer) => designer.id === id);
}
