import { create } from "zustand"

type UserMode = "recruiter" | "candidate"

interface UserState {
  id: number | null
  username: string | null
  mode: UserMode | null
  setUser: (id: number, username: string, mode: UserMode) => void
  clearUser: () => void
}

export const useUserStore = create<UserState>((set) => ({
  id : null,
  username: null,
  mode: null,
  setUser: (id, username, mode) => set({ id, username, mode }),
  clearUser: () => set({ id: null, username: null, mode: null }),
}))