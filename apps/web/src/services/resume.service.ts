import { api } from "./api"

export const getResumes = async () => {
  const response = await api.get("/resume") // adjust endpoint
  return response.data
}