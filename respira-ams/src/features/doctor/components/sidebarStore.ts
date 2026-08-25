import { create } from "zustand";

interface SidebarState {
    collapsed: boolean;
    toggle: () => void;
    collapse: () => void;
    expand: () => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    collapsed: false,
    toggle: () => set((state) => ({ collapsed: !state.collapsed })),
    collapse: () => set({ collapsed: true }),
    expand: () => set({ collapsed: false }),
}));
