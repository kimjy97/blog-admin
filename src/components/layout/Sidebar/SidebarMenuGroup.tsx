"use client";

import { MenuItem } from "@/components/layout/Sidebar/Sidebar";
import SidebarMenuItem from "@/components/layout/Sidebar/SidebarMenuItem";

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

interface SidebarMenuGroupProps {
  group: MenuGroup;
  isCompact: boolean;
  groupIndex?: number;
  onLinkClick?: () => void;
}

export default function SidebarMenuGroup({ group, isCompact, groupIndex, onLinkClick }: SidebarMenuGroupProps) {
  return (
    <div className={!isCompact && groupIndex !== undefined && groupIndex > 0 ? "mt-3" : ""}>
      {!isCompact && (
        <h3 className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {group.title}
        </h3>
      )}
      <div className={`flex flex-col ${isCompact ? "gap-3 items-center" : "gap-2"}`}>
        {group.items.map((item) => (
          <SidebarMenuItem
            key={item.href}
            href={item.href}
            label={item.label}
            outlineIcon={item.outline}
            solidIcon={item.solid}
            isCompact={isCompact}
            onLinkClick={onLinkClick}
          />
        ))}
      </div>
    </div>
  );
}
