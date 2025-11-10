import axios from 'axios'

import { getCsrfToken } from '@/utils/csrf'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

const http = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
})

http.interceptors.request.use((config) => {
  const method = (config.method ?? 'get').toUpperCase()
  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    const token = getCsrfToken()
    if (token) {
      config.headers = config.headers ?? {}
      config.headers['X-CSRFToken'] = token
    }
  }
  return config
})

export default http
