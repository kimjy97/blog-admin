"use client";

import { createContext, useContext, ReactNode } from 'react';

interface PostActionsContextType {
  handleDeletePost: (id: string) => void;
  handleSelectPostForComments: (postId: number) => void;
  isDeletingPost: (postId: string) => boolean;
}

const PostActionsContext = createContext<PostActionsContextType | undefined>(undefined);

export const usePostActions = () => {
  const context = useContext(PostActionsContext);
  if (!context) {
    throw new Error('usePostActions must be used within a PostActionsProvider');
  }
  return context;
};

interface PostActionsProviderProps {
  children: ReactNode;
  deletePostHandler: (id: string) => void;
  selectPostHandler: (postId: number) => void;
  isDeletingPostChecker: (postId: string) => boolean;
}

export const PostActionsProvider = ({
  children,
  deletePostHandler,
  selectPostHandler,
  isDeletingPostChecker,
}: PostActionsProviderProps) => {
  return (
    <PostActionsContext.Provider
      value={{
        handleDeletePost: deletePostHandler,
        handleSelectPostForComments: selectPostHandler,
        isDeletingPost: isDeletingPostChecker,
      }}
    >
      {children}
    </PostActionsContext.Provider>
  );
};
