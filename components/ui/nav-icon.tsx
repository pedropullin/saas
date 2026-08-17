import type { Icon, IconProps } from "@phosphor-icons/react";
import {
  Archive,
  BookOpen,
  ChartLineUp,
  CreditCard,
  FileText,
  GearSix,
  Plus,
  Shapes,
  Stack,
  SquaresFour,
  User,
  Users,
  Wallet,
} from "@phosphor-icons/react";

/** Maps the plain string `icon` keys in lib/constants.ts to Phosphor icon components. */
const ICON_MAP: Record<string, Icon> = {
  grid: SquaresFour,
  layers: Stack,
  plus: Plus,
  archive: Archive,
  book: BookOpen,
  users: Users,
  user: User,
  settings: GearSix,
  symbol: Shapes,
  card: CreditCard,
  wallet: Wallet,
  file: FileText,
  chart: ChartLineUp,
};

export function NavIcon({ name, ...props }: { name: string } & IconProps) {
  const IconComponent = ICON_MAP[name] ?? SquaresFour;
  return <IconComponent weight="regular" {...props} />;
}
