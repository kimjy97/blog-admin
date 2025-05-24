"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Bars3Icon, WrenchScrewdriverIcon } from "@heroicons/react/24/solid";
import BlogLink from "@/components/layout/Sidebar/BlogLink";
import SidebarMenuGroup from "@/components/layout/Sidebar/SidebarMenuGroup";
import SidebarUserProfile from "@/components/layout/Sidebar/SidebarUserProfile";
import { useSession } from "next-auth/react";
import { menuGroupsData } from "@/components/layout/Sidebar/Sidebar";

export default function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className="md:hidden fixed bottom-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="default" size="icon" className="w-13 h-13 rounded-full shadow-lg dark:bg-muted bg-secondary !border !border-border">
              <Bars3Icon className="size-7 text-secondary-foreground dark:text-foreground" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 bg-sidebar flex flex-col gap-0">
            <div className="flex items-center gap-2 p-4 border-b">
              <span className="inline-flex items-center bg-background justify-center w-10 h-10 rounded-lg text-accent-foreground">
                <WrenchScrewdriverIcon className="w-5 h-5 text-red-400" aria-hidden="true" />
              </span>
              <span className="font-bold text-lg tracking-tight select-none">블로그 관리자</span>
            </div>

            <nav className="flex-grow flex flex-col gap-1 p-3 overflow-y-auto">
              {menuGroupsData.map((group, groupIndex) => (
                <SidebarMenuGroup
                  key={group.title}
                  group={group}
                  isCompact={false}
                  groupIndex={groupIndex}
                  onLinkClick={handleLinkClick}
                />
              ))}
            </nav>

            <div className="mt-auto px-4 py-5">
              <BlogLink isCompact={false} onLinkClick={handleLinkClick} />
            </div>
            <div className="px-4 py-5 border-t">
              {session?.user && <SidebarUserProfile user={session.user} isCompact={false} />}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
