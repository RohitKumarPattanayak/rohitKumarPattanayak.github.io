import axios from "axios"

const baseUrl = import.meta.env.VITE_BASE_API_URL
const authApiKey = import.meta.env.VITE_AUTH_API_KEY

export const api = axios.create({
    baseURL: baseUrl,
    // withCredentials: true,
    headers: authApiKey
      ? { Authorization: `Bearer ${authApiKey}` }
      : {},
  })