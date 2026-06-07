import {
  LayoutDashboard,
  AlertTriangle,
  History,
  Users,
  Tags,
  MapPin,
  Flag,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reportes", label: "Reportes", icon: AlertTriangle },
  { href: "/historial", label: "Historial", icon: History },
  { href: "/usuarios", label: "Usuarios", icon: Users },
  { href: "/categorias", label: "Categorías", icon: Tags },
  { href: "/zonas", label: "Zonas", icon: MapPin },
  { href: "/estados", label: "Estados", icon: Flag },
  { href: "/administradores", label: "Administradores", icon: ShieldCheck },
];
