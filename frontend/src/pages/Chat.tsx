import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchesAPI } from '../services/api';
import { io, Socket } from 'socket.io-client';
import { ArrowLeft, Send } from 'lucide-react';

interface MessageSender {
  id: string
  firstName: string
  lastName: string
  avatar?: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  sender: MessageSender
  senderId: string
}

interface MatchInfo {
  id: string
  status: string
  service: { title: string; credits: number }
  seeker: { id: string; firstName: string; lastName: string }
  helper: { id: string; firstName: string; lastName: string }
}

export const Chat: React.FC = () => {
  const { matchId } = useParams<{ matchId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [matchInfo, setMatchInfo] = useState<MatchInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [connected, setConnected] = useState(false)

  const socketRef = useRef<Socket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const token = localStorage.getItem('token')

  // ✅ Charger l'historique des messages
  const fetchMessages = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/messages/${matchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setMessages(data)
    } catch (err) {
      console.error('Erreur chargement messages:', err)
    }
  }

  // ✅ Charger les infos du match
  const fetchMatchInfo = async () => {
    try {
      const res = await matchesAPI.getMy()
      const match = res.data.find((m: MatchInfo) => m.id === matchId)
      setMatchInfo(match ?? null)
    } catch (err) {
      console.error('Erreur chargement match:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Connexion Socket.io
  useEffect(() => {
    if (!matchId || !user) return

    fetchMessages()
    fetchMatchInfo()

    // Créer la connexion Socket
    const socket = io('http://localhost:5000', {
      transports: ['websocket'],
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setConnected(true)
      socket.emit('join_match', matchId)
    })

    socket.on('disconnect', () => {
      setConnected(false)
    })

    // ✅ Recevoir un message en temps réel
    socket.on('receive_message', (message: Message) => {
      setMessages(prev => [...prev, message])
    })

    socket.on('error', (err: { message: string }) => {
      console.error('Socket error:', err.message)
    })

    return () => {
      socket.emit('leave_match', matchId)
      socket.disconnect()
    }
  }, [matchId, user])

  // ✅ Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ✅ Envoyer un message
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !socketRef.current || !user) return

    setSending(true)
    socketRef.current.emit('send_message', {
      matchId,
      senderId: user.id,
      content: newMessage.trim(),
    })
    setNewMessage('')
    setSending(false)
  }

  const getOtherUser = () => {
    if (!matchInfo || !user) return null
    return matchInfo.seeker.id === user.id ? matchInfo.helper : matchInfo.seeker
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Chargement du chat...</p>
    </div>
  )

  const otherUser = getOtherUser()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/my-matches')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-800">
              {otherUser ? `💬 ${otherUser.firstName} ${otherUser.lastName}` : 'Chat'}
            </h1>
            {matchInfo && (
              <p className="text-sm text-gray-500">{matchInfo.service.title}</p>
            )}
          </div>
          {/* Indicateur connexion */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-400'}`} />
            <span className="text-xs text-gray-500">{connected ? 'Connecté' : 'Déconnecté'}</span>
          </div>
        </div>
      </nav>

      {/* Info échange */}
      {matchInfo && (
        <div className="max-w-3xl mx-auto w-full px-6 py-3">
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 flex justify-between items-center text-sm">
            <span className="text-blue-700 font-medium">📋 {matchInfo.service.title}</span>
            <span className="text-blue-600">💰 {matchInfo.service.credits} crédit(s)</span>
          </div>
        </div>
      )}

      {/* Zone messages */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-500">Aucun message pour l'instant</p>
            <p className="text-gray-400 text-sm mt-1">Démarrez la conversation !</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMe = msg.senderId === user?.id
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  {/* Avatar (autres) */}
                  {!isMe && (
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm mr-2 flex-shrink-0">
                      {msg.sender.firstName[0]}
                    </div>
                  )}
                  <div className={`max-w-xs lg:max-w-md ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-xs text-gray-400 mb-1">
                        {msg.sender.firstName}
                      </span>
                    )}
                    <div className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-sm'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {/* Avatar (moi) */}
                  {isMe && (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-bold text-sm ml-2 flex-shrink-0">
                      {user?.firstName[0]}
                    </div>
                  )}
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Zone saisie */}
      <div className="bg-white border-t shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={handleSend} className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!connected}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || !connected || sending}
              className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </form>
          {!connected && (
            <p className="text-xs text-red-400 mt-2 text-center">
              ⚠️ Connexion au chat perdue. Rechargez la page.
            </p>
          )}
        </div>
      </div>

    </div>
  )
}