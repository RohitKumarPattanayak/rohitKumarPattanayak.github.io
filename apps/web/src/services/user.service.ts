import { api } from "./api"

type UserMode = "recruiter" | "candidate"

export const fetchAllUser = async (params = {}) => {
  const res = await api.get("/user/fetch_all_users", { params })
  return res.data
}

export const createUser = async (params : {username: string, mode: UserMode}) => {
  const res = await api.post("/user/create", params )
  return res.data
}

export const updateUser = async (params : {user_id: number, mode: UserMode}) => {
  const res = await api.patch(`/user/mode?user_id=${params.user_id}&mode=${params.mode}`)
  return res.data
}

