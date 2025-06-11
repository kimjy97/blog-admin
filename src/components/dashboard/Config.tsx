import React from 'react';
import { ArrowUpIcon, EyeIcon, DocumentTextIcon, ChatBubbleLeftIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { IVisit } from '@/models/Visit';

export const renderBadge = (value: number | string | undefined): React.JSX.Element => (
  <span className="px-2 py-1 rounded-lg flex items-center text-xs md:text-base border border-border text-[var(--color-accent)] bg-transparent">
    <ArrowUpIcon className="w-3 h-3 mr-1 heroicon-sw-2" aria-hidden="true" />
    <span className="md:text-base text-xs">{value ?? 0}</span>
  </span>
);

export interface DashboardCardData {
  isLoading: boolean;
  icon: React.JSX.Element;
  title: string;
  value: React.JSX.Element;
  badge: React.JSX.Element;
  description: string;
}

export const getDashboardCardsConfig = (
  visitsData: { totalViews?: number; todayViews?: number } | undefined,
  postsStats: { totalPosts?: number; todayPublishedPostsCount?: number } | undefined,
  commentsStats: { totalComments?: number; todayCommentsCount?: number } | undefined,
  draftCount: number,
): Omit<DashboardCardData, 'isLoading'>[] => [
    {
      icon: <EyeIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />,
      title: "블로그 조회수",
      value: <span className="text-3xl font-bold tracking-tight">{(visitsData?.totalViews ?? 0).toLocaleString()}</span>,
      badge: renderBadge(visitsData?.todayViews),
      description: "전체 누적",
    },
    {
      icon: <DocumentTextIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />,
      title: "총 게시물 수",
      value: <span className="text-3xl font-bold tracking-tight">{(postsStats?.totalPosts ?? 0).toLocaleString()}</span>,
      badge: renderBadge(postsStats?.todayPublishedPostsCount),
      description: "전체 게시글",
    },
    {
      icon: <ChatBubbleLeftIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />,
      title: "총 댓글 수",
      value: <span className="text-3xl font-bold tracking-tight">{(commentsStats?.totalComments ?? 0).toLocaleString()}</span>,
      badge: renderBadge(commentsStats?.todayCommentsCount),
      description: "전체 댓글",
    },
    {
      icon: <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 inline-block align-text-bottom text-muted-foreground" />,
      title: "임시 저장글",
      value: <span className="text-3xl font-bold tracking-tight">{draftCount}</span>,
      badge: <></>,
      description: "임시 저장된 글",
    },
  ];
