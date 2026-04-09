import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'

export const adminAxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

adminAxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('billbook_admin_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
