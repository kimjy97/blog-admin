'use client';

import PostEditHeaderAction from '@/components/post/PostEditHeaderAction';
import PostNewHeaderAction from '@/components/post/PostNewHeaderAction';
import { usePostEditContext } from '@/contexts/PostEditContext';

interface HeaderActionProps {
  type: 'new' | 'edit';
}

export default function HeaderActions({ type }: HeaderActionProps) {
  const { editorRef } = usePostEditContext();

  if (type === 'new') return <PostNewHeaderAction editorRef={editorRef} />
  if (type === 'edit') return <PostEditHeaderAction editorRef={editorRef} />;
  return null;
}
