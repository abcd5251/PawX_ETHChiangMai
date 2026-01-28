import { v4 as uuidv4 } from 'uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type AuthState = {
  token: string | null;
  clientId: string;
  setToken: (token: string | null) => void;
  setClientId: (clientId: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      token: null,
      clientId: uuidv4(), // Initial clientId will be generated if not found in storage
      setToken: token => set({ token }),
      setClientId: clientId => set({ clientId }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        clientId: state.clientId,
        token: state.token,
      }),
    },
  ),
);
