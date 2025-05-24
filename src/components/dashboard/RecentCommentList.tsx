"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  fetchRecentCommentsWithPost,
  fetchRecentGuestbookComments,
  CommentWithPost,
  GuestbookCommentData,
  ApiResponse
} from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatBubbleLeftIcon, ArrowUpRightIcon, UsersIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import mongoose from "mongoose";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { cn } from "@/lib/utils";

type DisplayComment = (CommentWithPost | GuestbookCommentData) & {
  _id: mongoose.Types.ObjectId | string;
  nickname: string;
  content: string;
  createdAt: string;
};

export default function RecentCommentList() {
  const [dataType, setDataType] = useState<'comment' | 'guestbook'>('comment');
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const queryKey = dataType === 'comment' ? 'recentCommentsWithPost' : 'recentGuestbookComments';
  const queryFn = dataType === 'comment' ? fetchRecentCommentsWithPost : fetchRecentGuestbookComments;

  const {
    data: items,
    isLoading: loading,
    error
  } = useQuery<ApiResponse<CommentWithPost[] | GuestbookCommentData[]>, Error, DisplayComment[]>({
    queryKey: ['dashboard', queryKey, dataType],
    queryFn: () => queryFn(10),
    select: (response: ApiResponse<CommentWithPost[] | GuestbookCommentData[]>) => {
      if (response.success && response.data) {
        return response.data.map(item => ({
          ...item,
          _id: typeof item._id === 'string' ? item._id : item._id
        })) as DisplayComment[];
      }
      if (response.message) {
        console.error(`API Error for ${dataType}: ${response.message}`);
      }
      return [];
    },
  });

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const cardTitle = dataType === 'comment' ? "최근 댓글" : "최근 방명록";
  const icon = dataType === 'comment' ? <ChatBubbleLeftIcon className="w-5 h-5 mr-2 inline-block align-text-bottom text-muted-foreground" /> : <UsersIcon className="w-5 h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />;

  const RenderHeader = () => (
    <CardHeader className={cn("w-full", !loading ? "opacity-100" : "opacity-0")}>
      <div className="flex items-center justify-between h-full">
        <CardTitle className="flex items-center">
          {icon}
          {cardTitle}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant={dataType === 'comment' ? 'default' : 'outline'}
            onClick={() => setDataType('comment')}
            disabled={loading}
          >
            댓글
          </Button>
          <Button
            variant={dataType === 'guestbook' ? 'default' : 'outline'}
            onClick={() => setDataType('guestbook')}
            disabled={loading}
          >
            방명록
          </Button>
        </div>
      </div>
    </CardHeader>
  );

  return (
    <Card className={cn("py-3 gap-4 group flex flex-col h-[25rem]", loading ? "items-center justify-center" : "")}>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <RenderHeader />
          <CardContent className={cn("flex-1 overflow-hidden w-full", !loading ? "opacity-100" : "opacity-0")}>
            {error ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-destructive">오류: {error.message}</p>
              </div>
            ) : items && items.length > 0 ? (
              <ul className="flex flex-col h-full overflow-y-auto hover-scrollbar">
                {items.map((item) => {
                  const lineCount = item.content.split(/\r?\n/).length;
                  const isLong = item.content.length > 120 || lineCount > 3;
                  const itemId = typeof item._id === 'string' ? item._id : item._id;
                  const expanded = expandedItems[itemId];

                  const post = (item as CommentWithPost).post;
                  const postLink = post?._id
                    ? `/dashboard/posts/${typeof post._id === 'string' ? post._id : post._id}`
                    : "#";

                  return (
                    <li key={itemId} className="flex items-start gap-3 border-b border-border last:border-b-0 py-3 pr-3 px-1">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 font-medium truncate">
                          {item.nickname}
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-sm mt-2">
                          <span
                            className={
                              isLong && !expanded
                                ? "block line-clamp-3 whitespace-pre-line"
                                : "block whitespace-pre-line"
                            }
                            style={{ display: "-webkit-box", WebkitLineClamp: isLong && !expanded ? 3 : 'unset', WebkitBoxOrient: "vertical", overflow: isLong && !expanded ? "hidden" : "visible" }}
                          >
                            {item.content}
                          </span>
                          {isLong && (
                            <button
                              type="button"
                              className="mt-1 text-sm text-muted-foreground hover:opacity-80 focus:outline-none hover:underline"
                              onClick={() => toggleItem(itemId)}
                            >
                              {expanded ? "접기" : "더보기"}
                            </button>
                          )}
                        </div>
                        {dataType === 'comment' && post && (
                          <div className="text-sm text-accent mt-2 flex items-center gap-1">
                            <Link
                              href={postLink}
                              className="hover:underline flex items-center gap-1 group w-0 flex-1 min-w-0"
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`[${post.tags?.[0] || '태그없음'}] ${post.title}`}
                            >
                              <span className="truncate min-w-0 flex-1 flex items-center">
                                {`[${post.tags?.[0] || '태그없음'}] ${post.title}`}
                                <ArrowUpRightIcon className="w-3 h-3 ml-1 text-muted-foreground opacity-70 group-hover:opacity-100 transition-opacity" aria-label="게시물로 이동" />
                              </span>
                            </Link>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">{`${cardTitle}이(가) 없습니다.`}</p>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
