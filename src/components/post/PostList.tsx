"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { IPost } from '@/models/Post';
import { fetchPosts, PostsApiResponse } from "@/lib/api";
import usePostsStore from "@/store/postsStore";
import PostCommentsModal from '@/components/post/PostCommentsModal';
import PostItem from './PostItem';
import { PostActionsProvider } from '@/contexts/PostActionsContext';
import { useDeletePostMutation } from '@/hooks/useDeletePostMutation';
import { Skeleton } from "@/components/ui/skeleton";

interface PostListProps {
  showEditButton?: boolean;
  showLinkButton?: boolean;
  showDeleteButton?: boolean;
}

export default function PostList({
  showEditButton = true,
  showLinkButton = true,
  showDeleteButton = true,
}: PostListProps) {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const deletePostMutation = useDeletePostMutation();
  const { selectedBoard, showDrafts } = usePostsStore();

  const {
    data: postsApiResponse,
    isLoading,
    error,
  } = useQuery<PostsApiResponse, Error>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const postList = postsApiResponse?.data;

  const handleDeletePostWithConfirmation = (id: string) => {
    deletePostMutation.mutate(id);
  };

  const handleSelectPostForComments = (postId: number) => {
    setSelectedPostId(postId);
    setIsCommentsModalOpen(true);
  };

  const filteredPosts = postList?.filter(post => {
    const matchesBoard = selectedBoard
      ? post.tags && post.tags.length > 0 && post.tags[0] === selectedBoard
      : true;

    const matchesDraftStatus = showDrafts ? !post.status : true;

    return matchesBoard && matchesDraftStatus;
  });

  if (isLoading) {
    return (
      <div className='flex-1'>
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="mb-8">
            <div className='flex flex-row items-center gap-6 mb-8'>
              <div className="flex-1 h-[1px] bg-border" />
              <Skeleton key={i} className="w-[66px] h-[24px]" />
              <div className="flex-1 h-[1px] bg-border" />
            </div>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 5 }).map((_, ii) => (
                <Skeleton key={ii} className="w-[334px] h-[187px]" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive">
        게시글을 불러오는 중 오류가 발생했습니다: ${error.message}
      </p>
    );
  }

  if (!filteredPosts || filteredPosts.length === 0) {
    return (
      <p>
        {showDrafts
          ? "임시저장된 게시글이 없습니다."
          : selectedBoard
            ? `'${selectedBoard}' 게시판에 게시글이 없습니다.`
            : "게시글이 없습니다."}
      </p>
    );
  }

  const groupedPosts = filteredPosts.reduce((acc, post) => {
    const date = new Date(post.updatedAt || post.createdAt);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const yearMonth = `${year}. ${month.toString().padStart(2, '0')}`;

    if (!acc[yearMonth]) {
      acc[yearMonth] = [];
    }
    acc[yearMonth].push(post);
    return acc;
  }, {} as Record<string, IPost[]>);

  const sortedGroups = Object.keys(groupedPosts).sort((a, b) => b.localeCompare(a));
  console.log(sortedGroups);

  const isDeletingPostChecker = (postId: string) => {
    return deletePostMutation.isPending && deletePostMutation.variables === postId;
  };

  return (
    <PostActionsProvider
      deletePostHandler={handleDeletePostWithConfirmation}
      selectPostHandler={handleSelectPostForComments}
      isDeletingPostChecker={isDeletingPostChecker}
    >
      <div className='flex-1'>
        {sortedGroups.map((yearMonth) => (
          <div key={yearMonth} className="mb-8">
            <div className='flex flex-row items-center gap-6 mb-8'>
              <div className="flex-1 h-[1px] bg-border" />
              <h2 className="text-base text-muted-foreground">{yearMonth}</h2>
              <div className="flex-1 h-[1px] bg-border" />
            </div>
            <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {groupedPosts[yearMonth].sort((a, b) => {
                const dateA = new Date(a.createdAt || a.updatedAt).getTime();
                const dateB = new Date(b.createdAt || b.updatedAt).getTime();
                return dateB - dateA;
              }).map((post) => (
                <PostItem
                  key={post._id.toString()}
                  post={post}
                  showEditButton={showEditButton}
                  showLinkButton={showLinkButton}
                  showDeleteButton={showDeleteButton}
                />
              ))}
            </div>
          </div>
        ))}
        <PostCommentsModal
          isCommentsModalOpen={isCommentsModalOpen}
          setIsCommentsModalOpen={setIsCommentsModalOpen}
          selectedPostId={selectedPostId}
        />
      </div>
    </PostActionsProvider>
  );
}
