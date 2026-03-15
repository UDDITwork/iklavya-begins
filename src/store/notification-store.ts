'use client'

import { create } from 'zustand'

export interface AppNotification {
  id: string
  type: string
  title: string
  message: string | null
  link: string | null
  is_read: number
  created_at: string
}

interface NotificationState {
  unreadCount: number
  notifications: AppNotification[]
  knownIds: Set<string>
  seeded: boolean
  setUnreadCount: (count: number) => void
  setNotifications: (notifs: AppNotification[]) => void
  markRead: (id: string) => void
  markAllRead: () => void
  detectNewNotifications: (notifs: AppNotification[]) => AppNotification[]
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  unreadCount: 0,
  notifications: [],
  knownIds: new Set<string>(),
  seeded: false,
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setNotifications: (notifications) => set({ notifications }),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: 1 } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, is_read: 1 })),
      unreadCount: 0,
    })),
  detectNewNotifications: (notifs) => {
    const { knownIds, seeded } = get()
    const incomingIds = new Set(notifs.map((n) => n.id))

    if (!seeded) {
      // First call: seed with all current IDs, don't show toasts
      set({ knownIds: incomingIds, seeded: true })
      return []
    }

    // Find truly new notifications
    const newNotifs = notifs.filter((n) => !knownIds.has(n.id))

    if (newNotifs.length > 0) {
      const updated = new Set(knownIds)
      for (const n of notifs) updated.add(n.id)
      set({ knownIds: updated })
    }

    return newNotifs
  },
}))
