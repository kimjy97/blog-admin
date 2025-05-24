'use client'

import { Button } from "@/components/ui/button";
import { updatePost } from "@/lib/api";
import { IPost } from "@/models/Post";
import { CheckIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";

const PostEditHeaderAction = ({ editorRef }: any) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();
  const id = params.id as string;

  const mutation = useMutation({
    mutationFn: (postData: Partial<IPost>) => updatePost({ id, data: postData }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/dashboard/posts");
    },
    onError: (err: Error) => {
      console.error("게시글 수정 실패:", err);
      alert(`게시글 수정 중 오류가 발생했습니다: ${err.message}`);
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
        {mutation.isPending ? "수정 중..." : "수정 완료"}
      </Button>
    </div>
  );
}

export default PostEditHeaderAction;
