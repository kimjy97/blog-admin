"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarMenuItemProps {
  href: string;
  label: string;
  outlineIcon: React.ElementType;
  solidIcon: React.ElementType;
  isCompact: boolean;
  onLinkClick?: () => void;
}

export default function SidebarMenuItem({
  href,
  label,
  outlineIcon: OutlineIcon,
  solidIcon: SolidIcon,
  isCompact,
  onLinkClick,
}: SidebarMenuItemProps) {
  const pathname = usePathname();
  let active = false;

  if (href === "/dashboard") {
    active = pathname === "/dashboard";
  } else {
    active = pathname === href || pathname.startsWith(href + "/");
  }

  const Icon = active ? SolidIcon : OutlineIcon;

  if (isCompact) {
    return (
      <Link
        href={href}
        className={
          "group relative flex items-center justify-center w-12 h-12 rounded-md " +
          (active
            ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
            : "hover:bg-foreground/10")
        }
        style={{ minWidth: 0 }}
        title={label}
        onClick={onLinkClick}
      >
        <Icon className="w-6 h-6" aria-hidden />
        {/* Tooltip */}
        <span className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-background border border-border rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150">
          {label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={
        "flex items-center gap-2 px-3 py-2.5 rounded-md font-medium " +
        (active
          ? "bg-sidebar-primary font-semibold text-sidebar-primary-foreground"
          : "hover:bg-primary/10 dark:hover:bg-foreground/5")
      }
      onClick={onLinkClick}
    >
      <Icon className="w-4 h-4" aria-hidden />
      <span className="text-sm">{label}</span>
    </Link>
  );
}
