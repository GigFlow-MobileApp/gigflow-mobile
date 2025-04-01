import { create } from 'zustand';
import { RelativePathString } from 'expo-router/build/types';

type ValidRoute = RelativePathString;

type PlatformState = {
  platform: string | null;
  setPlatform: (name: string) => void;
  clearPlatform: () => void;
  totalAmount: number;
  setTotalAmount: (amount: number) => void;
  lastPagetoNotification: ValidRoute | null;
  setLastPagetoNotification: (page: ValidRoute) => void;
};

export const usePlatformStore = create<PlatformState>((set) => ({
  platform: 'uber',
  setPlatform: (name: string) => set({ platform: name}),
  clearPlatform: () => set({ platform: null }),
  totalAmount: 0,
  setTotalAmount: (amount: number) => set({ totalAmount: amount }),
  lastPagetoNotification: null,
  setLastPagetoNotification: (page: ValidRoute) => set({ lastPagetoNotification: page }),
}));
