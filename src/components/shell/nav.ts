import {
  ClockCounterClockwise,
  GearSix,
  Heart,
  House,
  Kanban,
  ListBullets,
  MagnifyingGlass,
  MapTrifold,
  Rocket,
  UsersThree,
} from "@phosphor-icons/react";

export const MAIN_NAV = [
  { href: "/app", label: "Dashboard", icon: House, exact: true },
  { href: "/app/prospectar", label: "Prospectar", icon: MagnifyingGlass },
  { href: "/app/mapa", label: "Mapa", icon: MapTrifold },
  { href: "/app/leads", label: "Leads", icon: Kanban },
  { href: "/app/listas", label: "Listas", icon: ListBullets },
  { href: "/app/favoritos", label: "Favoritos", icon: Heart },
  { href: "/app/historico", label: "Histórico", icon: ClockCounterClockwise },
  { href: "/app/configuracoes", label: "Configurações", icon: GearSix },
];

export const SECONDARY_NAV = [
  { href: "/app/equipe", label: "Minha equipe", icon: UsersThree },
  { href: "/app/planos", label: "Planos", icon: Rocket },
];

export function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
