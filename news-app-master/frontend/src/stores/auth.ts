import { isAxiosError } from 'axios'
import { defineStore } from 'pinia'

import http from '@/services/http'
import type { AuthResponse, User } from '@/types/api'
import { getCsrfToken } from '@/utils/csrf'

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'error'

interface LoginPayload {
  username: string
  password: string
}

interface RegisterPayload {
  username: string
  password: string
  email?: string
}

interface ApiErrorResponse {
  detail?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    status: 'idle' as AuthStatus,
    error: null as string | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.user),
  },
  actions: {
    clearError() {
      this.error = null
    },
    async ensureCsrf() {
      if (!getCsrfToken()) {
        await http.get('/auth/csrf')
      }
    },
    async bootstrap() {
      try {
        await this.ensureCsrf()
        await this.refreshSession()
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Unable to bootstrap auth session', error)
        }
      }
    },
    async refreshSession() {
      try {
        const { data } = await http.get<AuthResponse>('/auth/me')
        this.user = data.user ?? null
        this.status = this.user ? 'authenticated' : 'idle'
        this.error = null
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 401) {
          this.user = null
          this.status = 'idle'
          this.error = null
        } else {
          this.status = 'error'
          this.error = 'Unable to verify session'
        }
      }
    },
    async login(payload: LoginPayload) {
      this.status = 'loading'
      this.error = null
      try {
        await this.ensureCsrf()
        const { data } = await http.post<AuthResponse>('/auth/login', payload)
        this.user = data.user ?? null
        this.status = 'authenticated'
        return this.user
      } catch (error) {
        this.status = 'error'
        if (isAxiosError(error)) {
          const response = error.response?.data as ApiErrorResponse | undefined
          this.error = response?.detail ?? 'Unable to sign in. Please try again.'
        } else {
          this.error = 'Unable to sign in. Please try again.'
        }
        throw error
      }
    },
    async register(payload: RegisterPayload) {
      this.status = 'loading'
      this.error = null
      try {
        await this.ensureCsrf()
        const { data } = await http.post<AuthResponse>('/auth/register', payload)
        this.user = data.user ?? null
        this.status = 'authenticated'
        return this.user
      } catch (error) {
        this.status = 'error'
        if (isAxiosError(error)) {
          const response = error.response?.data as ApiErrorResponse | undefined
          this.error = response?.detail ?? 'Unable to register. Please try again.'
        } else {
          this.error = 'Unable to register. Please try again.'
        }
        throw error
      }
    },
    async logout() {
      this.status = 'loading'
      try {
        await this.ensureCsrf()
        await http.post('/auth/logout')
      } catch (error) {
        if (!(isAxiosError(error) && error.response?.status === 401)) {
          if (import.meta.env.DEV) {
            console.warn('Logout encountered an issue', error)
          }
        }
      } finally {
        this.user = null
        this.status = 'idle'
        this.error = null
      }
    },
  },
})
