import { create } from "zustand"

export interface PersonalInfo {
  name?: string
  email?: string
  phone?: string
  [key: string]: string | undefined
}

export interface ResumeOwnerPic {
  resume_owner_pic?: string
}

interface ActiveResumeState {
  resume_owner_pic: ResumeOwnerPic | null
  personal_info: PersonalInfo | null
  setResumeDetails: (pic: ResumeOwnerPic | null, info: PersonalInfo | null) => void
  clearResumeDetails: () => void
}

export const useActiveResumeStore = create<ActiveResumeState>((set) => ({
  resume_owner_pic: null,
  personal_info: null,
  setResumeDetails: (pic, info) => set({ resume_owner_pic: pic, personal_info: info }),
  clearResumeDetails: () => set({ resume_owner_pic: null, personal_info: null }),
}))
