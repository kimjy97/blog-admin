"use client";

import Link from 'next/link';
import { IPost } from '@/models/Post';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/utils/formatDate';
import { ChatBubbleLeftIcon, EyeIcon, HeartIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { usePostActions } from '@/contexts/PostActionsContext';

interface PostItemProps {
  post: IPost;
  showEditButton?: boolean;
  showLinkButton?: boolean;
  showDeleteButton?: boolean;
}

export default function PostItem({
  post,
  showEditButton = true,
  showLinkButton = true,
  showDeleteButton = true,
}: PostItemProps) {
  const { handleDeletePost, handleSelectPostForComments, isDeletingPost } = usePostActions();
  const isCurrentlyDeleting = isDeletingPost(post._id.toString());

  return (
    <Card
      className="flex flex-col gap-2 pb-2 pt-4 cursor-pointer hover:outline-1 hover:outline-primary"
    >
      <Link href={`/dashboard/posts/${post._id.toString()}`} passHref>
        <CardHeader className='h-auto px-5'>
          <p className='text-accent text-xs font-medium mb-2'>{post.tags && post.tags[0] || '태그없음'}</p>
          <CardTitle className="truncate text-base">
            <span className='text-muted-foreground font-normal'>{post.status ? '' : '[임시저장] '}</span>{post.title}
          </CardTitle>
          <div className="text-xs text-muted-foreground mt-2">
            {formatDate(post.createdAt || post.updatedAt)} · {post.name}
          </div>
        </CardHeader>
        <CardContent className="flex-grow mb-2 px-5">
          <div className="mt-2 truncate">
            {post.tags?.map((tag) => (
              <span className="mr-2 text-xs" key={tag}>
                #{tag}
              </span>
            ))}
          </div>
        </CardContent>
      </Link>
      <CardFooter className="flex justify-between items-center pr-3 border-t pt-2">
        <div className="flex gap-4 text-xs text-foreground">
          <span className="flex items-center gap-2">
            <EyeIcon className="w-3 h-3" />
            {post.view || 0}
          </span>
          <span className="flex items-center gap-2">
            <HeartIcon className="w-3 h-3" />
            {post.like || 0}
          </span>
          <span className="flex items-center gap-2">
            <ChatBubbleLeftIcon className="w-3 h-3" />
            {post.cmtnum || 0}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="lg" className="h-8 w-8 p-0">
              <span className="sr-only">메뉴 열기</span>
              <EllipsisVerticalIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {showLinkButton && (
              <DropdownMenuItem asChild>
                <a href={`${process.env.NEXT_PUBLIC_BLOG_URL}/post/${post.postId}`} target="_blank">
                  바로가기
                </a>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleSelectPostForComments(post.postId)}>
              댓글
            </DropdownMenuItem>
            {showEditButton && (
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/posts/${post._id.toString()}`} passHref>
                  수정
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {showDeleteButton && (
              <DropdownMenuItem
                onClick={() => {
                  if (confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
                    handleDeletePost(post._id.toString());
                  }
                }}
                disabled={isCurrentlyDeleting}
                className="text-destructive"
              >
                {isCurrentlyDeleting ? "삭제 중..." : "삭제"}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
