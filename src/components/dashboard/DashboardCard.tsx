import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import React, { ReactNode, useEffect, useState } from "react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  icon: ReactNode;
  title: string;
  value: ReactNode;
  badge?: ReactNode;
  description?: string;
  className?: string;
  isLoading?: boolean;
}

const DashboardCard = React.memo(function DashboardCard({
  icon,
  title,
  value,
  badge,
  description,
  className,
  isLoading = false
}: DashboardCardProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setShowContent(false);
    } else {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <Card className={cn("flex flex-col h-[9rem] !py-5 !gap-0 justify-between", className, isLoading ? "items-center justify-center" : "")}>
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <CardHeader className={cn("transition-opacity duration-300 ease-in-out", showContent ? "opacity-100" : "opacity-0")}>
            <CardTitle className="md:text-base text-sm flex items-center">
              {icon}
              {title}
            </CardTitle>
          </CardHeader>
          <CardContent className={cn("transition-opacity duration-300 ease-in-out", showContent ? "opacity-100" : "opacity-0")}>
            <div className="flex items-center text-2xl md:text-4xl font-medium">
              {value}
              {badge && <span className="ml-3">{badge}</span>}
            </div>
            {description && (
              <div className="text-xs md:text-xs mt-2 text-muted-foreground">{description}</div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.isLoading === nextProps.isLoading;
});

export default DashboardCard;
