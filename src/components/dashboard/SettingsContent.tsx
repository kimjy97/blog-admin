"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SettingsContent() {
  const { data: session, status } = useSession();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const newIsDarkMode = !isDarkMode;
    if (newIsDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    setIsDarkMode(newIsDarkMode);
  };

  useEffect(() => {
    const themePreference = localStorage.getItem("theme");
    if (themePreference === "dark") {
      document.documentElement.classList.add("dark");
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDarkMode(false);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-[40rem]">
      {status === "loading" && (
        <Card>
          <CardHeader className="!h-auto">
            <CardTitle className="mb-2">프로필</CardTitle>
            <CardDescription>현재 로그인된 사용자 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Skeleton className="h-13 w-13 rounded-full bg-foreground/5 dark:bg-foreground/5" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px] bg-foreground/5 dark:bg-foreground/5" />
              <Skeleton className="h-4 w-[130px] bg-foreground/5 dark:bg-foreground/5" />
            </div>
            <Skeleton className="h-9 w-[82px] ml-auto dark:bg-foreground/5" />
          </CardContent>
        </Card>
      )}
      {status === "authenticated" && session?.user && (
        <Card>
          <CardHeader className="!h-auto">
            <CardTitle className="mb-2">프로필</CardTitle>
            <CardDescription>현재 로그인된 사용자 정보입니다.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center space-x-4">
            <Avatar className="h-13 w-13">
              <AvatarImage src={session.user.image ?? undefined} alt={session.user.name ?? "User"} />
              <AvatarFallback>{session.user.name?.charAt(0).toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
            <div className="overflow-hidden">
              <div className="flex items-center space-x-2">
                <p className="text-lg font-semibold truncate">{session.user.name}</p>
                {session.user.role && (
                  <Badge variant="outline">
                    {String(session.user.role).charAt(0).toUpperCase() + String(session.user.role).slice(1)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
            </div>
            <Button variant="outline" onClick={() => signOut()} className="ml-auto">
              로그아웃
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="!h-auto">
          <CardTitle className="mb-2">화면 설정</CardTitle>
          <CardDescription>테마 등 화면 표시 설정을 변경합니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isDarkMode ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
              <div>
                <h3 className="text-md font-medium">다크 모드</h3>
                <p className="text-sm text-muted-foreground">
                  {isDarkMode ? "활성화됨" : "비활성화됨"}
                </p>
              </div>
            </div>
            <Switch
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
              aria-label={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
