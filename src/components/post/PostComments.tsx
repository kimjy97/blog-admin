"use client";

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IComment } from '@/models/Comment';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CommentsApiResponse, fetchCommentsForPost, updateComment } from '@/lib/api';


const PostComments = ({ postId }: { postId: number | null }) => {
  const queryClient = useQueryClient();

  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState<string>('');

  const {
    data: commentsData,
    isLoading,
    error,
  } = useQuery<CommentsApiResponse, Error>({
    queryKey: ['postComments', postId],
    queryFn: () => fetchCommentsForPost(postId),
    enabled: postId !== null,
  });

  const comments = commentsData?.data;

  const updateMutation = useMutation({
    mutationFn: updateComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['postComments', postId] });
      setEditingCommentId(null);
      setEditingCommentContent('');
    },
    onError: (err: Error) => {
      console.error("댓글 업데이트 실패:", err);
      alert(`댓글 업데이트 중 오류가 발생했습니다: ${err.message}`);
    },
  });

  const handleEditClick = (comment: IComment) => {
    setEditingCommentId(comment._id.toString());
    setEditingCommentContent(comment.content);
  };

  const handleCancelClick = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleSaveClick = (commentId: string) => {
    if (editingCommentContent.trim() === '') {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    updateMutation.mutate({ id: commentId, content: editingCommentContent });
  };

  const handleToggleEdited = (commentId: string, isEdited: boolean) => {
    updateMutation.mutate({ id: commentId, isEdited: isEdited });
  };

  const handleToggleShow = (commentId: string, isShow: boolean) => {
    updateMutation.mutate({ id: commentId, isShow: isShow });
  };


  if (!postId) {
    return <div className="h-[60vh] text-center">
      게시물을 선택하면 댓글이 표시됩니다.
    </div>;
  }

  if (isLoading) {
    return (
      <div className="h-[60vh] flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] text-destructive">
        댓글을 불러오는 중 오류가 발생했습니다: {error.message}
      </div>
    );
  }

  const visibleComments = comments;

  return (
    <div className="h-[60vh] overflow-y-auto scrollbar">
      {visibleComments && visibleComments.length > 0 ? (
        <ul>
          {visibleComments.map((comment) => (
            <li key={comment._id.toString()} className="border-b py-4">
              {editingCommentId === comment._id.toString() ? (
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={editingCommentContent}
                    onChange={(e) => setEditingCommentContent(e.target.value)}
                    rows={3}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelClick}
                      disabled={updateMutation.isPending}
                    >
                      취소
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveClick(comment._id.toString())}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? '저장 중...' : '저장'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-muted-foreground">
                      <span className='text-sm font-bold text-muted-foreground mr-1'>{comment.nickname}</span>
                      <span className='text-xs text-muted-foreground'>({comment.userIp})</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p>{comment.content}</p>
                  <div className="flex justify-between mt-2">
                    <div className='flex gap-4'>
                      <div className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          id={`isEdited-${comment._id.toString()}`}
                          checked={comment.isEdited}
                          onCheckedChange={(checked: boolean) => handleToggleEdited(comment._id.toString(), checked)}
                          disabled={updateMutation.isPending}
                        />
                        <Label className="cursor-pointer" htmlFor={`isEdited-${comment._id.toString()}`}>수정됨</Label>
                      </div>
                      <div className="flex items-center space-x-2 cursor-pointer">
                        <Checkbox
                          id={`isShow-${comment._id.toString()}`}
                          checked={comment.isShow}
                          onCheckedChange={(checked: boolean) => handleToggleShow(comment._id.toString(), checked)}
                          disabled={updateMutation.isPending}
                        />
                        <Label className="cursor-pointer" htmlFor={`isShow-${comment._id.toString()}`}>표시</Label>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleEditClick(comment)}>수정</Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className='flex justify-center items-center h-full'>
          <p>댓글이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default PostComments;
