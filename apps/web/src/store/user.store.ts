import { create } from "zustand"

type UserMode = "recruiter" | "candidate"

interface UserState {
  name: string | null
  mode: UserMode | null
  setUser: (name: string, mode: UserMode) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  name: null,
  mode: null,
  setUser: (name, mode) => set({ name, mode }),
  clearUser: () => set({ name: null, mode: null }),
}))