import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../services/api'
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const navigate = useNavigate()

  const fetchNotifications = async () => {
    try {
      const res = await notificationsAPI.getAll()
      setNotifications(res.data.notifications)
    } catch (err) {
      console.error('Erreur:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchNotifications() }, [])

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      console.error('Erreur:', err)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsAPI.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Erreur:', err)
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
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const filtered = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-blue-600">
              🔔 Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              <CheckCheck size={16} />
              Tout marquer lu
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-6">

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            Toutes ({notifications.length})
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'unread'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            Non lues ({unreadCount})
          </button>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400">Chargement...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">
              {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              Vous êtes à jour ! 🎉
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {filtered.map((notif, index) => (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkAsRead(notif.id)}
                className={`flex items-start gap-4 px-6 py-4 border-b last:border-0 transition cursor-pointer hover:bg-gray-50 ${
                  !notif.read ? 'bg-blue-50 hover:bg-blue-100' : ''
                }`}
              >
                <span className="text-2xl flex-shrink-0 mt-0.5">{getIcon(notif.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && (
                      <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatDate(notif.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
