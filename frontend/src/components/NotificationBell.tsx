import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../services/api'
import { Bell } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const res = await notificationsAPI.getAll()
      setNotifications(res.data.notifications)
      setUnreadCount(res.data.unreadCount)
    } catch (err) {
      console.error('Erreur notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  // Polling toutes les 30 secondes
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fermer le dropdown en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleOpen = async () => {
    setOpen(!open)
    if (!open && unreadCount > 0) {
      try {
        await notificationsAPI.markAllAsRead()
        setUnreadCount(0)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      } catch (err) {
        console.error('Erreur markAllAsRead:', err)
      }
    }
  }

  const getIcon = (type: string) => {
    const icons: Record<string, string> = {
      MATCH_PROPOSED:   '🤝',
      MATCH_ACCEPTED:   '✅',
      MATCH_COMPLETED:  '🏆',
      MESSAGE_RECEIVED: '💬',
      RATING_RECEIVED:  '⭐',
      DISPUTE_OPENED:   '⚠️',
      DISPUTE_RESOLVED: '✔️',
      SERVICE_EXPIRED:  '⏰',
    }
    return icons[type] ?? '🔔'
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000)
    if (diff < 60)    return 'À l\'instant'
    if (diff < 3600)  return `Il y a ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`
    return d.toLocaleDateString('fr-FR')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton cloche */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-bold text-gray-800">🔔 Notifications</h3>
            <button
              onClick={() => { setOpen(false); navigate('/notifications') }}
              className="text-xs text-blue-600 hover:underline"
            >
              Voir tout
            </button>
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="text-center text-gray-400 py-6 text-sm">Chargement...</p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-gray-400 text-sm">Aucune notification</p>
              </div>
            ) : (
              notifications.slice(0, 8).map(notif => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b last:border-0 hover:bg-gray-50 transition ${
                    !notif.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">{getIcon(notif.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{notif.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t text-center">
              <button
                onClick={() => { setOpen(false); navigate('/notifications') }}
                className="text-sm text-blue-600 hover:underline"
              >
                Voir toutes les notifications ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
