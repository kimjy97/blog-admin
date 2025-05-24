"use client";

import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";
import { fetchPosts, PostsApiResponse } from "@/lib/api";
import usePostsStore from "@/store/postsStore";

const BoardList = () => {
  const { showDrafts, selectedBoard, setSelectedBoard } = usePostsStore();

  const {
    data: postsApiResponse,
    isLoading,
    error,
  } = useQuery<PostsApiResponse, Error>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
  });

  const postList = postsApiResponse?.data;
  const tagCounts = postsApiResponse?.tagCounts;
  const totalPosts = postsApiResponse?.totalPosts;

  const boardList = postList
    ? Array.from(
      new Set(
        postList
          ?.map((post) => (post.tags && post.tags.length > 0 ? post.tags[0] : null))
          .filter(Boolean) as string[]
      )
    )
    : [];

  if (isLoading) {
    return (
      <div className="flex gap-2 gap-y-3 flex-wrap overflow-x-auto items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="w-22 h-9" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-destructive text-sm">
        게시판 정보를 불러오는 중 오류가 발생했습니다.
      </p>
    );
  }

  if (showDrafts) {
    return <p className="text-lg text-muted-foreground">임시저장된 게시글 목록입니다.</p>;
  }

  if (boardList.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 gap-y-3 flex-wrap overflow-x-auto items-center">
      <Button
        variant={selectedBoard === null ? 'default' : 'outline'}
        onClick={() => setSelectedBoard(null)}
      >
        전체 <span className="text-accent">{totalPosts !== undefined && totalPosts}</span>
      </Button>
      {boardList.map((board) => (
        <Button
          key={board}
          variant={selectedBoard === board ? 'default' : 'outline'}
          onClick={() => setSelectedBoard(board)}
        >
          {board} <span className="text-accent">{tagCounts && tagCounts[board] !== undefined && tagCounts[board]}</span>
        </Button>
      ))}
    </div>
  );
};

export default BoardList;
