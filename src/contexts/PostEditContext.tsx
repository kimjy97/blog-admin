'use client';

import { createContext, useRef, useContext, ReactNode, RefObject } from 'react';
import { PostEditorHandle } from '@/components/post/PostEditor/PostEditor';

interface PostEditContextType {
  editorRef: RefObject<PostEditorHandle | null>;
}

const PostEditContext = createContext<PostEditContextType | null>(null);

export function PostEditContextProvider({ children }: { children: ReactNode }) {
  const editorRef = useRef<PostEditorHandle>(null);
  return (
    <PostEditContext.Provider value={{ editorRef }}>
      {children}
    </PostEditContext.Provider>
  );
}

export function usePostEditContext() {
  const context = useContext(PostEditContext);
  if (!context) {
    throw new Error('usePostEditContext must be used within a PostEditContextProvider');
  }
  return context;
}
