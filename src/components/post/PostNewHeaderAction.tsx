'use client'

import { Button } from "@/components/ui/button";
import { createPost } from "@/lib/api";
import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const PostNewHeaderAction = (editorRef: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/dashboard/posts");
    },
    onError: (err: Error) => {
      console.error("게시글 작성 실패:", err);
      alert(`게시글 작성 중 오류가 발생했습니다: ${err.message}`);
    },
  });

  return (
    <div className="flex gap-3">
      <Button key="back" onClick={() => router.back()} variant="outline" disabled={mutation.isPending}>
        <ChevronLeftIcon className="size-4" />
        돌아가기
      </Button>
      <Button key="submit" onClick={() => editorRef.current?.submit()} disabled={mutation.isPending}>
        <CheckIcon className="size-4" />
        {mutation.isPending ? "등록 중..." : "작성 완료"}
      </Button>
    </div>
  );
}

export default PostNewHeaderAction;
