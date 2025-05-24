'use client';

import PostEditor from '@/components/post/PostEditor/PostEditor';
import { usePostEditContext } from '@/contexts/PostEditContext';

export default function EditorContent() {
  const { editorRef } = usePostEditContext();
  return <PostEditor ref={editorRef} />;
}
