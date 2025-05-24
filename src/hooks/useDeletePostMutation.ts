"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/apiClient";

const deletePostFn = async (id: string): Promise<void> => {
  await apiClient.delete(`/posts/${id}`);
};

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePostFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (err: Error) => {
      console.error("게시글 삭제 실패:", err);
      alert(`게시글 삭제 중 오류가 발생했습니다: ${err.message}`);
    },
  });
};
