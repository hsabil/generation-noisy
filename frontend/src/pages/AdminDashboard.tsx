import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { NotificationBell } from '../components/NotificationBell'
import api from '../services/api'
import { ArrowLeft, Users, ShoppingBag, ArrowLeftRight, AlertTriangle, CheckCircle, Star } from 'lucide-react'

interface Stats {
  totalUsers: number
  totalServices: number
  totalMatches: number
  totalCompleted: number
  totalDisputes: number
  activeServices: number
}

interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  quartier: string
  credits: number
  role: string
  createdAt: string
  _count: { servicesOffered: number; matchesAsSeeker: number }
}

interface Dispute {
  id: string
  status: string
  createdAt: string
  service: { title: string; credits: number }
  seeker: { id: string; firstName: string; lastName: string; email: string }
  helper: { id: string; firstName: string; lastName: string; email: string }
}

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [stats, setStats]       = useState<Stats | null>(null)
  const [users, setUsers]       = useState<AdminUser[]>([])
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [tab, setTab]           = useState<'stats' | 'users' | 'disputes'>('stats')

  // États édition utilisateur
  const [editingUser, setEditingUser]   = useState<string | null>(null)
  const [editRole, setEditRole]         = useState('')
  const [editCredits, setEditCredits]   = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Vérifier que l'utilisateur est admin
  useEffect(() => {
    if (user && user.role !== 'SUPER_ADMIN' && user.role !== 'COORDINATOR') {
      navigate('/dashboard')
    }
  }, [user])

  const fetchAll = async () => {
    try {
      const [statsRes, usersRes, disputesRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/disputes'),
      ])
      setStats(statsRes.data)
      setUsers(usersRes.data)
      setDisputes(disputesRes.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur chargement admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleEditUser = async (userId: string) => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/users/${userId}`, {
        role: editRole || undefined,
        credits: editCredits !== '' ? editCredits : undefined,
      })
      setEditingUser(null)
      await fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur mise à jour')
    } finally {
      setActionLoading(false)
    }
  }

  const handleResolveDispute = async (disputeId: string, winner: 'seeker' | 'helper') => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/disputes/${disputeId}/resolve`, { winner })
      await fetchAll()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur résolution litige')
    } finally {
      setActionLoading(false)
    }
  }

  const roleColor = (role: string) => {
    if (role === 'SUPER_ADMIN')  return 'bg-red-100 text-red-700'
    if (role === 'COORDINATOR')  return 'bg-purple-100 text-purple-700'
    return 'bg-gray-100 text-gray-600'
  }

  if (!user || (user.role !== 'SUPER_ADMIN' && user.role !== 'COORDINATOR')) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-red-600">🛡️ Administration</h1>
          </div>
          <NotificationBell />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* Onglets */}
        <div className="flex gap-2 mb-8">
          {([
            { key: 'stats',    label: '📊 Statistiques' },
            { key: 'users',    label: '👥 Utilisateurs' },
            { key: 'disputes', label: `⚠️ Litiges (${disputes.length})` },
          ] as const).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                tab === t.key
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : (
          <>
            {/* ✅ Onglet Stats */}
            {tab === 'stats' && stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-500">Utilisateurs</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <ShoppingBag size={24} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-green-600">{stats.activeServices}</p>
                    <p className="text-sm text-gray-500">Annonces actives</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <ArrowLeftRight size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalMatches}</p>
                    <p className="text-sm text-gray-500">Échanges total</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} className="text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-yellow-600">{stats.totalCompleted}</p>
                    <p className="text-sm text-gray-500">Échanges terminés</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-red-600">{stats.totalDisputes}</p>
                    <p className="text-sm text-gray-500">Litiges en cours</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Star size={24} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-indigo-600">{stats.totalServices}</p>
                    <p className="text-sm text-gray-500">Annonces total</p>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ Onglet Utilisateurs */}
            {tab === 'users' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-gray-600">Utilisateur</th>
                      <th className="px-4 py-3 text-left text-gray-600">Quartier</th>
                      <th className="px-4 py-3 text-center text-gray-600">Crédits</th>
                      <th className="px-4 py-3 text-center text-gray-600">Annonces</th>
                      <th className="px-4 py-3 text-center text-gray-600">Rôle</th>
                      <th className="px-4 py-3 text-center text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
                              {u.firstName[0]}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-gray-400">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{u.quartier}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-600">{u.credits}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{u._count.servicesOffered}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${roleColor(u.role)}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {editingUser === u.id ? (
                            <div className="flex flex-col gap-2 items-center">
                              <select
                                value={editRole}
                                onChange={e => setEditRole(e.target.value)}
                                className="text-xs border rounded px-2 py-1 w-full"
                              >
                                <option value="">-- Rôle --</option>
                                <option value="MEMBER">MEMBER</option>
                                <option value="COORDINATOR">COORDINATOR</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              </select>
                              <input
                                type="number"
                                placeholder="Crédits"
                                value={editCredits}
                                onChange={e => setEditCredits(e.target.value)}
                                className="text-xs border rounded px-2 py-1 w-full"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleEditUser(u.id)}
                                  disabled={actionLoading}
                                  className="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                                >
                                  ✅ OK
                                </button>
                                <button
                                  onClick={() => setEditingUser(null)}
                                  className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300"
                                >
                                  ❌
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingUser(u.id)
                                setEditRole(u.role)
                                setEditCredits(String(u.credits))
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-600 text-xs font-bold rounded hover:bg-blue-200"
                            >
                              ✏️ Modifier
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ✅ Onglet Litiges */}
            {tab === 'disputes' && (
              <div>
                {disputes.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <CheckCircle size={48} className="mx-auto text-green-400 mb-4" />
                    <p className="text-gray-500 font-medium">Aucun litige en cours 🎉</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {disputes.map(dispute => (
                      <div key={dispute.id} className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-gray-800">{dispute.service.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              💰 {dispute.service.credits} crédit(s) en jeu
                            </p>
                          </div>
                          <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">
                            ⚠️ Litige
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Demandeur</p>
                            <p className="font-medium text-gray-800">
                              {dispute.seeker.firstName} {dispute.seeker.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{dispute.seeker.email}</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-gray-500 mb-1">Aidant</p>
                            <p className="font-medium text-gray-800">
                              {dispute.helper.firstName} {dispute.helper.lastName}
                            </p>
                            <p className="text-xs text-gray-400">{dispute.helper.email}</p>
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleResolveDispute(dispute.id, 'helper')}
                            disabled={actionLoading}
                            className="flex-1 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            ✅ Donner raison à l'aidant
                          </button>
                          <button
                            onClick={() => handleResolveDispute(dispute.id, 'seeker')}
                            disabled={actionLoading}
                            className="flex-1 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            ✅ Donner raison au demandeur
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
