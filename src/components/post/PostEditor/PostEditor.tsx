'use client'

import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { IPost } from "@/models/Post";
import PostEditorForm from "./PostEditorForm";
import PostEditorPreview from "@/components/post/PostEditor/PostEditorPreview";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPost, fetchPostById, fetchPostsForTags, updatePost } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export interface PostEditorHandle {
  submit: () => Promise<IPost | void>;
}

export interface PostEditorProps {
  isNewPost?: boolean;
}

const PostEditor = forwardRef<PostEditorHandle, PostEditorProps>(({
  isNewPost = false
}, ref) => {
  const [postData, setPostData] = useState<Partial<IPost>>({});
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const {
    data: initialData,
    isLoading: isLoadingPost,
    error: queryError,
  } = useQuery<IPost, Error>({
    queryKey: ["post", id],
    queryFn: () => fetchPostById(id),
    enabled: !!id && !isNewPost,
  });

  const mutation = useMutation<IPost, Error, Partial<IPost>>({
    mutationFn: async (currentPostData: Partial<IPost>) => {
      if (isNewPost) {
        return createPost(currentPostData);
      } else {
        if (!id) {
          console.error("Post ID is missing for update operation.");
          throw new Error("게시글 ID가 없어 업데이트할 수 없습니다.");
        }
        return updatePost({ id, data: currentPostData });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (!isNewPost && id) {
        queryClient.invalidateQueries({ queryKey: ["post", id] });
      }
      router.push("/dashboard/posts");
    },
    onError: (err: Error) => {
      console.error(isNewPost ? "게시글 작성 실패:" : "게시글 수정 실패:", err);
    },
  });

  const { data: postsForTags, isLoading: isLoadingPostsForTags, error: postsError } = useQuery({
    queryKey: ["allPostsForTags"],
    queryFn: fetchPostsForTags,
    staleTime: 1000 * 60 * 5,
  });

  const existingTags = postsForTags
    ? Array.from(
      new Set(
        postsForTags
          ?.map((post) => (post.tags && post.tags.length > 0 ? post.tags[0] : null))
          .filter(Boolean) as string[]
      )
    )
    : [];

  useEffect(() => {
    if (isNewPost) {
      setPostData({
        title: '',
        description: '',
        content: '',
        name: '',
        tags: [],
        status: false,
      });
    } else if (initialData) {
      setPostData(initialData);
    }
  }, [initialData, isNewPost]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      return handleEditorSubmit(postData);
    }
  }));

  const handleDataChange = (data: Partial<IPost>) => {
    setPostData(prevData => ({ ...prevData, ...data }));
  };

  const handleEditorSubmit = async (currentPostData: Partial<IPost>) => {
    if (isNewPost) {
      if (!currentPostData.title || currentPostData.title.trim() === '' || !currentPostData.content || currentPostData.content.trim() === '') {
        alert("제목과 내용은 필수입니다.");
        throw new Error("제목과 내용은 필수입니다.");
      }
    }
    return mutation.mutateAsync(currentPostData);
  };

  if ((!isNewPost && isLoadingPost) || isLoadingPostsForTags) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isNewPost && queryError) {
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
          initialData={isNewPost ? postData : initialData}
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
