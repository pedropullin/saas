export type VMarkVariant =
  | "solid"
  | "outline"
  | "split"
  | "cropped"
  | "stacked"
  | "mono";

export type PlanTier = "Free" | "Pro" | "Business";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  plan: PlanTier;
  projectsCount: number;
  status: "active" | "invited" | "suspended";
  lastActivityAt: string;
  createdAt: string;
}

export type ProjectStatus = "rascunho" | "em_andamento" | "concluido";

export interface Project {
  id: string;
  name: string;
  ownerId: string;
  ownerName: string;
  segment: string;
  status: ProjectStatus;
  identityId?: string;
  designerId?: string;
  plan: PlanTier;
  createdAt: string;
  updatedAt: string;
}

export interface BrandColor {
  name: string;
  hex: string;
  role: "primária" | "secundária" | "neutra" | "destaque";
}

export interface Identity {
  id: string;
  projectId: string;
  brandName: string;
  segment: string;
  personalityTags: string[];
  colors: BrandColor[];
  typography: {
    display: string;
    body: string;
  };
  symbolVariant: VMarkVariant;
  logoVariants: {
    type: "principal" | "secundaria" | "simbolo";
    description: string;
  }[];
  applications: { label: string }[];
  brandBoardModules: { id: string; type: string; label: string }[];
  createdAt: string;
}

export interface BrandBookSection {
  id: string;
  title: string;
  body: string;
}

export interface BrandBook {
  id: string;
  identityId: string;
  sections: BrandBookSection[];
}

export interface Designer {
  id: string;
  name: string;
  initials: string;
  specialty: string;
  experienceYears: number;
  rating: number;
  projectsCount: number;
  bio: string;
  availability: "disponível" | "com fila" | "indisponível";
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface AdminMetrics {
  totalUsers: number;
  newUsersThisMonth: number;
  identitiesCreated: number;
  activeProjects: number;
  activeDesigners: number;
  revenue: number;
  conversionRate: number;
  usersOverTime: SeriesPoint[];
  revenueOverTime: SeriesPoint[];
  planDistribution: { label: string; value: number }[];
}

export interface GenerationStep {
  id: string;
  label: string;
  durationMs: number;
}

export interface NavLink {
  label: string;
  href: string;
}
