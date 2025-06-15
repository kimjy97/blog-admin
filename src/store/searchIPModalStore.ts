import { create } from 'zustand';

interface SearchIPModalState {
  isSearchIPModalOpen: boolean;
  searchIP: string | undefined;
  setIsSearchIPModalOpen: (show: boolean) => void;
  setSearchIP: (ip: string | undefined) => void;
}

const useSearchIPModalStore = create<SearchIPModalState>((set) => ({
  isSearchIPModalOpen: false,
  searchIP: undefined,
  setIsSearchIPModalOpen: (show) => set({ isSearchIPModalOpen: show }),
  setSearchIP: (ip) => set({ searchIP: ip }),
}));

export default useSearchIPModalStore;
