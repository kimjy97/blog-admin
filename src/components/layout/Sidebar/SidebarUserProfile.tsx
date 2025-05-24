"use client";

import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { LogOutIcon } from "lucide-react";
import { Session } from "next-auth";

interface SidebarUserProfileProps {
  user?: Session["user"] | null;
  isCompact: boolean;
  isLoading?: boolean;
}

export default function SidebarUserProfile({ user, isCompact, isLoading }: SidebarUserProfileProps) {
  if (isLoading) {
    if (isCompact) {
      return (
        <div className="text-card-foreground">
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="h-10 w-10 rounded-full bg-foreground/5 dark:bg-foreground/5" />
            <Skeleton className="h-9 w-9 bg-transparent" />
          </div>
        </div>
      );
    }
    return (
      <div className="text-card-foreground">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full bg-foreground/5 dark:bg-foreground/5" />
          <div className="flex flex-col gap-1 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4 bg-foreground/5 dark:bg-foreground/5" />
            <Skeleton className="h-3 w-1/2 bg-foreground/5 dark:bg-foreground/5" />
          </div>
          <Skeleton className="h-8 w-8 bg-transparent" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (isCompact) {
    return (
      <div className="text-card-foreground">
        <div className="flex flex-col items-center gap-6">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
            <AvatarFallback className="select-none">{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
          </Avatar>
          <Button variant="ghost" size="icon" onClick={() => signOut()} title="로그아웃">
            <LogOutIcon className="size-5 text-muted-foreground hover:text-foreground" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-card-foreground">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User"} />
          <AvatarFallback className="select-none">{user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <p className="text-sm font-medium leading-none truncate" title={user.name ?? "사용자 이름"}>
            {user.name ?? "사용자 이름"}
          </p>
          <p className="text-xs text-muted-foreground truncate" title={user.email ?? "user@example.com"}>
            {user.email ?? "user@example.com"}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => signOut()} title="로그아웃">
          <LogOutIcon className="size-5 text-muted-foreground hover:text-foreground" />
        </Button>
      </div>
    </div>
  );
}
