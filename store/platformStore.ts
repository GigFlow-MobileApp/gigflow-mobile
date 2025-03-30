import { create } from 'zustand';

type PlatformState = {
  platform: string | null;
  setPlatform: (name: string) => void;
  clearPlatform: () => void;
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  lastPagetoNotification: string | null;
  setLastPagetoNotification: (page: string) => void;
};

export const usePlatformStore = create<PlatformState>((set) => ({
  platform: 'uber',
  setPlatform: (name: string) => set({ platform: name}),
  clearPlatform: () => set({ platform: null }),
  totalAmount: 0,
  setTotalAmount: (amount: number) => set({ totalAmount: amount }),
  lastPagetoNotification: null,
  setLastPagetoNotification: (page: string) => set({ lastPagetoNotification: page }),
}));
