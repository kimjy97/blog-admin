'use client';

import PostEditor from '@/components/post/PostEditor/PostEditor';
import { usePostEditContext } from '@/contexts/PostEditContext';

const EditorContent = ({ isNewPost }: { isNewPost?: boolean }) => {
  const { editorRef } = usePostEditContext();
  return <PostEditor ref={editorRef} isNewPost={isNewPost} />;
}

export default EditorContent;