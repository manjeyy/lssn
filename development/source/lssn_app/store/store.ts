import { create } from 'zustand';

export type UserRole = 'viewer' | 'creator' | 'admin';

export type User = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
};

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  clearUser: () => set({ user: null, isAuthenticated: false }),
}));
