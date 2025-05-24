'use client'

import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

const AnalyticsHeaderAction = () => {
  const queryClient = useQueryClient();

  const handleRefresh = useCallback(async () => {
    await queryClient.resetQueries({ queryKey: ['visits'] });
  }, [queryClient]);

  return (
    <Button key="refresh-button" variant="default" onClick={handleRefresh} aria-label="데이터 새로고침">
      <ArrowPathIcon className="size-4" />
      새로고침
    </Button>
  );
}

export default AnalyticsHeaderAction;
