import { useState, useCallback } from 'react'

type Variant = 'success' | 'error' | 'warning' | 'info'

interface NotificationData {
  title: string
  description: string
  variant?: Variant
}

export function useNotification() {
  const [notification, setNotification] = useState<NotificationData | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const show = useCallback((data: NotificationData) => {
    setNotification({
      title: data.title,
      description: data.description,
      variant: data.variant ?? 'info',
    })
    setIsOpen(true)
  }, [])

  const showSuccess = useCallback((title: string, description: string) => {
    show({ title, description, variant: 'success' })
  }, [show])

  const showError = useCallback((title: string, description: string) => {
    show({ title, description, variant: 'error' })
  }, [show])

  const showWarning = useCallback((title: string, description: string) => {
    show({ title, description, variant: 'warning' })
  }, [show])

  const hideNotification = useCallback(() => {
    setIsOpen(false)
  }, [])

  return {
    notification,
    isOpen,
    showSuccess,
    showError,
    showWarning,
    hideNotification,
  }
}