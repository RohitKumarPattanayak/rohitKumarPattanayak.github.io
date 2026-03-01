import { api } from "./api"

// type UserMode = "recruiter" | "candidate"

// export const verifyUser = async (mode: UserMode) => {
//   const res = await api.post("/user/mode", { mode })
//   return res.data
// }

export const createUser = async (name: string, mode: string) => {
  const res = await api.post("/user/create", { name, mode })
  return res.data
}

