import { create } from 'zustand';

interface UIStore {
  isMobileMenuOpen: boolean;
  isModalOpen: boolean;
  toggleMobileMenu: () => void;
  openModal: () => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  isModalOpen: false,
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  openModal: () => set({ isModalOpen: true }),
  closeModal: () => set({ isModalOpen: false }),
}));
