import axios from 'axios'

const client = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '')
    .replace(/\/$/, '')
    .replace(/\/api$/, ''),
  headers: {
    'Content-Type': 'application/json',
  },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default client
