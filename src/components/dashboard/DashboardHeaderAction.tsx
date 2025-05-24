'use client'

import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export default function DashboardHeaderAction() {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.resetQueries({ queryKey: ['dashboard'] });
  }, [queryClient]);

  return (
    <Button
      variant="default"
      onClick={handleRefresh}
      aria-label="데이터 새로고침"
    >
      <ArrowPathIcon className="size-4" />
      새로고침
    </Button>
  );
}
