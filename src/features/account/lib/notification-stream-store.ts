import { create } from "zustand";

type NotificationStreamState = {
  connected: boolean;
  setConnected: (connected: boolean) => void;
};

export const useNotificationStreamStore = create<NotificationStreamState>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),
}));
