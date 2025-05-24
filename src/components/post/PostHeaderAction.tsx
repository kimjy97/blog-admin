"use client"

import usePostsStore from "@/store/postsStore";
import { Button } from "@/components/ui/button";
import { ClockIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { PostsApiResponse, fetchPosts } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

const PostHeaderAction = () => {
  const { showDrafts, setShowDrafts } = usePostsStore();
  const {
    data: postsApiResponse,
    isLoading,
    error,
  } = useQuery<PostsApiResponse, Error>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const postList = postsApiResponse?.data;

  const draftCount = postList?.filter(post => !post.status).length || 0;

  const handleShowDrafts = () => {
    setShowDrafts(!showDrafts);
  };

  return (
    <div className="flex gap-3">
      <Button
        key="drafts-button"
        variant={showDrafts ? 'destructive' : 'outline'}
        onClick={handleShowDrafts}
        disabled={isLoading || !!error}
      >
        <ClockIcon className="size-4" />
        임시저장 {isLoading ? <span className="text-accent">0</span> : <span className="text-accent">{draftCount}</span>}
      </Button>
      <Link key="new-post-link" href="/dashboard/posts/new" passHref>
        <Button>
          <PencilSquareIcon className="size-4" />
          게시글 작성
        </Button>
      </Link>
    </div>
  );
}

export default PostHeaderAction;
