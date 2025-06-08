import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import PostComments from '@/components/post/PostComments';

interface PostCommentsModalProps {
  isCommentsModalOpen: boolean;
  setIsCommentsModalOpen: (isOpen: boolean) => void;
  selectedPostId: number | null;
}

const PostCommentsModal: React.FC<PostCommentsModalProps> = ({
  isCommentsModalOpen,
  setIsCommentsModalOpen,
  selectedPostId,
}) => {
  return (
    <Dialog open={isCommentsModalOpen} onOpenChange={setIsCommentsModalOpen}>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px] max-h-[80vh]">
        <DialogTitle>댓글 목록</DialogTitle>
        <PostComments postId={selectedPostId} />
      </DialogContent>
    </Dialog>
  );
};

export default PostCommentsModal;
