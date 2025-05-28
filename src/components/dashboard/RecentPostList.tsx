"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchRecentPosts } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ArrowRightIcon, ArrowUpIcon, ChatBubbleLeftIcon, EyeIcon, HeartIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/formatDate";
import { IPost } from "@/models/Post";
import { useRouter } from "next/navigation";

export default function RecentPostList() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(false);

  const {
    data: recentPostsResponse,
    isLoading: loading,
    error
  } = useQuery<Awaited<ReturnType<typeof fetchRecentPosts>>, Error, IPost[]>({
    queryKey: ['dashboard', 'recentPosts'],
    queryFn: () => fetchRecentPosts(5),
    select: (response) => {
      if (response.success) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch recent posts');
    }
  });

  const recentPosts = recentPostsResponse || [];

  useEffect(() => {
    if (loading) {
      setShowContent(false);
    } else {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <Card className={cn("py-3 gap-4 group flex flex-col h-[25rem]", loading && !showContent ? "items-center justify-center" : "")}>
      {loading && !showContent ? (
        <LoadingSpinner />
      ) : (
        <>
          <CardHeader className={cn("transition-opacity duration-300 ease-in-out w-full", showContent ? "opacity-100" : "opacity-0")}>
            <div className="flex items-center justify-between h-full">
              <CardTitle className="flex items-center">
                <ArrowUpIcon className="w-5 h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />
                최근 게시물
              </CardTitle>
              <Link href="/dashboard/posts" passHref>
                <button
                  type="button"
                  className="text-sm text-muted-foreground hover:text-foreground font-medium flex items-center gap-1 cursor-pointer"
                  onClick={() => router.push('/dashboard/posts')}
                >
                  전체보기
                  <ArrowRightIcon className="w-4 h-4 ml-1" aria-hidden="true" />
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className={cn("flex-1 overflow-hidden w-full transition-opacity duration-300 ease-in-out", showContent ? "opacity-100" : "opacity-0")}>
            {error ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-destructive">오류: {error.message}</p>
              </div>
            ) : recentPosts.length === 0 && !loading ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">최근 게시물이 없습니다.</p>
              </div>
            ) : (
              <ul className="flex flex-col h-full overflow-y-auto hover-scrollbar">
                {recentPosts.map((post) => (
                  <li key={post._id.toString()} className="flex items-center gap-4 border-b border-border last:border-b-0 py-4 px-1">
                    <Link href={`/dashboard/posts/${post._id}`} passHref>
                      <div className="w-18 h-18 px-4 text-xs bg-background rounded-md border cursor-pointer flex items-center justify-center text-center break-all">
                        {post.tags && post.tags.length > 0 ? post.tags[0] : "태그없음"}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/dashboard/posts/${post._id}`} passHref>
                        <div className="font-medium truncate cursor-pointer hover:underline">{post.title}</div>
                      </Link>
                      <div className="text-xs text-muted-foreground mt-1">{formatDate(post.createdAt || post.updatedAt)}</div>
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" />
                          {post.view || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          {post.like || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ChatBubbleLeftIcon className="w-4 h-4" />
                          {post.cmtnum || 0}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
