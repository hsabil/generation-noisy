import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { servicesAPI } from '../services/api'
import { CATEGORIES, QUARTIERS } from '../types/index.tsx'
import { NotificationBell } from '../components/NotificationBell'
import { ArrowLeft, Plus, Edit2, Trash2, Eye } from 'lucide-react'

interface Service {
  id: string
  title: string
  description: string
  type: string
  category: string
  credits: number
  quartier: string
  status: string
  createdAt: string
  expiresAt: string
  _count?: { matches: number }
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    ACTIVE:    'bg-green-100 text-green-700',
    MATCHED:   'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-purple-100 text-purple-700',
    CANCELLED: 'bg-gray-100 text-gray-500',
  }
  const labels: Record<string, string> = {
    ACTIVE:    '✅ Active',
    MATCHED:   '🤝 Matchée',
    COMPLETED: '🏆 Terminée',
    CANCELLED: '❌ Annulée',
  }
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] ?? 'bg-gray-100'}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ✅ Modal d'édition
const EditModal = ({
  service,
  onClose,
  onSave,
}: {
  service: Service
  onClose: () => void
  onSave: (id: string, data: any) => void
}) => {
  const [title, setTitle]           = useState(service.title)
  const [description, setDescription] = useState(service.description)
  const [category, setCategory]     = useState(service.category)
  const [credits, setCredits]       = useState(service.credits)
  const [quartier, setQuartier]     = useState(service.quartier)
  const [loading, setLoading]       = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await onSave(service.id, { title, description, category, credits, quartier })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-gray-800 mb-6">✏️ Modifier l'annonce</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)}
              rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
              <select value={category} onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Crédits</label>
              <select value={credits} onChange={e => setCredits(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value={0.5}>0.5</option>
                <option value={1}>1</option>
                <option value={1.5}>1.5</option>
                <option value={2}>2</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
            <select value={quartier} onChange={e => setQuartier(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {QUARTIERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">
              Annuler
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Sauvegarde...' : '💾 Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export const MyServices: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [services, setServices]     = useState<Service[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState('')
  const [editModal, setEditModal]   = useState<Service | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [filter, setFilter]         = useState('ALL')

  const fetchServices = async () => {
    try {
      const res = await servicesAPI.getMy()
      setServices(res.data)
    } catch (err) {
      setError('Erreur lors du chargement de vos annonces')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchServices() }, [])

  const handleSave = async (id: string, data: any) => {
    setActionLoading(true)
    try {
      await servicesAPI.update(id, data)
      setEditModal(null)
      await fetchServices()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la modification')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setActionLoading(true)
    try {
      await servicesAPI.delete(id)
      setDeleteConfirm(null)
      await fetchServices()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la suppression')
    } finally {
      setActionLoading(false)
    }
  }

  const filtered = filter === 'ALL'
    ? services
    : services.filter(s => s.status === filter)

  const counts = {
    ALL:       services.length,
    ACTIVE:    services.filter(s => s.status === 'ACTIVE').length,
    MATCHED:   services.filter(s => s.status === 'MATCHED').length,
    COMPLETED: services.filter(s => s.status === 'COMPLETED').length,
    CANCELLED: services.filter(s => s.status === 'CANCELLED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal édition */}
      {editModal && (
        <EditModal
          service={editModal}
          onClose={() => setEditModal(null)}
          onSave={handleSave}
        />
      )}

      {/* Modal confirmation suppression */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <p className="text-4xl mb-4">🗑️</p>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Supprimer l'annonce ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Cette action est irréversible. L'annonce sera marquée comme annulée.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={actionLoading}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 disabled:opacity-50">
                {actionLoading ? '...' : '🗑️ Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-blue-600">Mes Annonces</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <Link to="/create-service"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
              <Plus size={18} />
              Nouvelle
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {/* Filtres */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {([
            { key: 'ALL',       label: `📋 Toutes (${counts.ALL})` },
            { key: 'ACTIVE',    label: `✅ Actives (${counts.ACTIVE})` },
            { key: 'MATCHED',   label: `🤝 Matchées (${counts.MATCHED})` },
            { key: 'COMPLETED', label: `🏆 Terminées (${counts.COMPLETED})` },
            { key: 'CANCELLED', label: `❌ Annulées (${counts.CANCELLED})` },
          ]).map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Chargement */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement de vos annonces...</p>
          </div>
        )}

        {/* Liste vide */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-500 font-medium text-lg">Aucune annonce trouvée</p>
            <Link to="/create-service"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
              <Plus size={18} className="inline mr-2" />
              Créer une annonce
            </Link>
          </div>
        )}

        {/* Liste des annonces */}
        <div className="space-y-4">
          {filtered.map(service => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm p-6">

              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                      service.type === 'OFFER'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {service.type === 'OFFER' ? '✅ Offre' : '🙏 Demande'}
                    </span>
                    <StatusBadge status={service.status} />
                    {(service._count?.matches ?? 0) > 0 && (
                      <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        💬 {service._count?.matches} proposition(s)
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">{service.title}</h3>
                </div>
                <span className="text-sm font-bold text-blue-600 ml-4">
                  💰 {service.credits} crédit(s)
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm mb-3 line-clamp-2">{service.description}</p>

              {/* Infos */}
              <div className="flex gap-4 text-xs text-gray-400 mb-4">
                <span>
                  {CATEGORIES.find(c => c.value === service.category)?.emoji}{' '}
                  {CATEGORIES.find(c => c.value === service.category)?.label}
                </span>
                <span>📍 {service.quartier}</span>
                <span>📅 Expire le {new Date(service.expiresAt).toLocaleDateString('fr-FR')}</span>
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Créée le {new Date(service.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <div className="flex gap-2">
                  {/* Voir */}
                  <button onClick={() => navigate(`/services/${service.id}`)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-200">
                    <Eye size={14} />
                    Voir
                  </button>
                  {/* Modifier — seulement si ACTIVE */}
                  {service.status === 'ACTIVE' && (
                    <button onClick={() => setEditModal(service)}
                      className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-200">
                      <Edit2 size={14} />
                      Modifier
                    </button>
                  )}
                  {/* Supprimer — seulement si ACTIVE */}
                  {service.status === 'ACTIVE' && (
                    <button onClick={() => setDeleteConfirm(service.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200">
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
