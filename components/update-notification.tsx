'use client'

import { useEffect, useState } from 'react'
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'error'
  timestamp: string
}

export function UpdateNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Set up WebSocket or Server-Sent Events connection
    const eventSource = new EventSource('/api/notifications')

    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data)
      setNotifications(prev => [...prev, notification])

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id))
      }, 5000)
    }

    return () => eventSource.close()
  }, [])

  return (
    <ToastProvider>
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            variant={notification.type === 'error' ? 'destructive' : 'default'}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <div>
                <div className="font-semibold">{notification.title}</div>
                <div className="text-sm">{notification.message}</div>
              </div>
            </div>
          </Toast>
        ))}
      </div>
      <ToastViewport />
    </ToastProvider>
  )
} 