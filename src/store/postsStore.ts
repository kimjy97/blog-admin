import { create } from 'zustand';

interface PostsState {
  selectedBoard: string | null;
  showDrafts: boolean;
  setSelectedBoard: (board: string | null) => void;
  setShowDrafts: (show: boolean) => void;
}

const usePostsStore = create<PostsState>((set) => ({
  selectedBoard: null,
  showDrafts: false,
  setSelectedBoard: (board) => set({ selectedBoard: board, showDrafts: false }),
  setShowDrafts: (show) => set({ showDrafts: show, selectedBoard: null }),
}));

export default usePostsStore;
