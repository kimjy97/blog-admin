'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { IPost } from "@/models/Post";
import PostEditorForm from "./PostEditorForm";
import PostEditorPreview from "@/components/post/PostEditor/PostEditorPreview";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPostById, fetchPostsForTags, updatePost } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export interface PostEditorHandle {
  submit: () => void;
}

const PostEditor = forwardRef<PostEditorHandle>(({
}, ref) => {
  const [postData, setPostData] = useState<Partial<IPost>>({});
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: initialData,
    isLoading,
    error: queryError,
  } = useQuery<IPost, Error>({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
    enabled: !!id,
  });

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

  const { data: posts, isLoading: isLoadingPosts, error: postsError } = useQuery({
    queryKey: ["allPostsForTags"],
    queryFn: fetchPostsForTags,
    staleTime: 1000 * 60 * 5,
  });

  const existingTags = posts
    ? Array.from(
      new Set(
        posts
          ?.map((post) => (post.tags && post.tags.length > 0 ? post.tags[0] : null))
          .filter(Boolean) as string[]
      )
    )
    : [];

  useEffect(() => {
    if (initialData) {
      setPostData(initialData);
    }
  }, [initialData]);

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleEditorSubmit(postData);
    }
  }));

  const handleDataChange = (data: Partial<IPost>) => {
    setPostData(prevData => ({ ...prevData, ...data }));
  };

  const handleEditorSubmit = async (postData: Partial<IPost>) => {
    mutation.mutate(postData);
  };

  if (isLoading || isLoadingPosts) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (queryError) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading post data: {queryError.message}</p>
      </div>
    );
  }

  if (postsError) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">Error loading existing tags: {postsError.message}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8 w-full pb-20">
      <div className="w-full pt-0 lg:w-1/2">
        <PostEditorForm
          initialData={initialData}
          onDataChange={handleDataChange}
          isSubmitting={mutation.isPending}
          existingTags={existingTags}
        />
      </div>
      <PostEditorPreview
        postData={postData}
      />
    </div>
  );
});

PostEditor.displayName = "PostEditor";
export default PostEditor;
