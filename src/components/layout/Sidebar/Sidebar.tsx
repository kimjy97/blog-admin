"use client";

import BlogLink from "@/components/layout/Sidebar/BlogLink";
import SidebarMenuGroup from "@/components/layout/Sidebar/SidebarMenuGroup";
import SidebarUserProfile from "@/components/layout/Sidebar/SidebarUserProfile";
import {
  Squares2X2Icon as HomeOutline,
  DocumentTextIcon as FileTextOutline,
  ChartBarIcon as ChartOutline,
  Cog6ToothIcon as SettingsOutline,
  UserGroupIcon as LogOutline,
} from "@heroicons/react/24/outline";
import {
  Squares2X2Icon as HomeSolid,
  DocumentTextIcon as FileTextSolid,
  ChartBarIcon as ChartSolid,
  Cog6ToothIcon as SettingsSolid,
  UserGroupIcon as LogSolid,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";
import { useSession } from "next-auth/react";

export interface MenuItem {
  href: string;
  label: string;
  outline: React.ElementType;
  solid: React.ElementType;
}

export interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const menuGroupsData: MenuGroup[] = [
  {
    title: "메인",
    items: [
      {
        href: "/dashboard",
        label: "대시보드",
        outline: HomeOutline,
        solid: HomeSolid,
      },
    ],
  },
  {
    title: "콘텐츠 관리",
    items: [
      {
        href: "/dashboard/posts",
        label: "게시글 관리",
        outline: FileTextOutline,
        solid: FileTextSolid,
      },
    ],
  },
  {
    title: "사이트 분석",
    items: [
      {
        href: "/dashboard/analytics",
        label: "통계/분석",
        outline: ChartOutline,
        solid: ChartSolid,
      },
      {
        href: "/dashboard/visitorslog",
        label: "방문자 로그",
        outline: LogOutline,
        solid: LogSolid,
      },
    ],
  },
  {
    title: "설정",
    items: [
      {
        href: "/dashboard/settings",
        label: "환경설정",
        outline: SettingsOutline,
        solid: SettingsSolid,
      },
    ],
  },
];

export default function Sidebar() {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";

  return (
    <>
      {/* md 이상 ~ xl 미만: compact 사이드바 (아이콘-only, 툴팁) */}
      <aside className="sticky hidden md:flex xl:hidden flex-col w-20 border-r bg-sidebar min-h-screen p-0">
        <nav className="flex flex-col gap-3 p-0 py-4 items-center">
          {menuGroupsData.map((group) => (
            <SidebarMenuGroup key={group.title} group={group} isCompact={true} />
          ))}
        </nav>
        <div className="mt-auto flex justify-center items-center py-5">
          <BlogLink isCompact={true} />
        </div>
        <div className="px-4 py-5 border-t">
          <SidebarUserProfile user={session?.user} isCompact={true} isLoading={isLoading} />
        </div>
      </aside>

      {/* xl 이상: 전체 사이드바 (아이콘+텍스트) */}
      <aside className="hidden xl:flex flex-col w-60 border-r bg-sidebar p-0 pt-1 min-h-screen">
        <div className="hidden items-center gap-2 md:flex p-3">
          <span className="inline-flex items-center bg-background justify-center w-10 h-10 rounded-lg text-accent-foreground">
            <WrenchScrewdriverIcon className="w-5 h-5 text-red-400" aria-hidden />
          </span>
          <span className="font-bold text-base tracking-tight select-none">블로그 관리자</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {menuGroupsData.map((group, groupIndex) => (
            <SidebarMenuGroup
              key={group.title}
              group={group}
              isCompact={false}
              groupIndex={groupIndex}
            />
          ))}
        </nav>
        <div className="mt-auto px-4 py-5">
          <BlogLink isCompact={false} />
        </div>
        <div className="px-4 py-5 border-t">
          <SidebarUserProfile user={session?.user} isCompact={false} isLoading={isLoading} />
        </div>
      </aside>
    </>
  );
}
