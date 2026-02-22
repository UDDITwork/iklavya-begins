'use client'

import { create } from 'zustand'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  college: string
  role: 'student' | 'admin'
  profile_image?: string | null
  profile_completed: number
  created_at: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}))
