import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchesAPI, ratingsAPI } from '../services/api';
import { ArrowLeft, Clock, MessageCircle, Star } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';

interface MatchUser {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  quartier?: string
}

interface MatchService {
  id: string
  title: string
  type: string
  category: string
  credits: number
  quartier: string
}

interface Rating {
  id: string
  score: number
  comment?: string
  giverId: string
}

interface Match {
  id: string
  status: string
  message?: string
  createdAt: string
  service: MatchService
  seeker: MatchUser
  helper: MatchUser
  rating?: Rating | null
}

// ✅ Badge statut échange
const MatchStatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PROPOSED:    'bg-yellow-100 text-yellow-700',
    ACCEPTED:    'bg-blue-100 text-blue-700',
    IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
    COMPLETED:   'bg-green-100 text-green-700',
    DISPUTED:    'bg-red-100 text-red-700',
    CANCELLED:   'bg-gray-100 text-gray-500',
  }
  const labels: Record<string, string> = {
    PROPOSED:    '⏳ En attente',
    ACCEPTED:    '✅ Accepté',
    IN_PROGRESS: '🔄 En cours',
    COMPLETED:   '🏆 Terminé',
    DISPUTED:    '⚠️ Litige',
    CANCELLED:   '❌ Annulé',
  }
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded-full ${styles[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {labels[status] ?? status}
    </span>
  )
}

// ✅ Boutons d'action selon le statut
const MatchActions = ({
  match, userId, onAction, loading,
}: {
  match: Match
  userId: string
  onAction: (matchId: string, status: string) => void
  loading: string | null
}) => {
  const isLoading = loading === match.id

  if (match.status === 'PROPOSED' && match.helper.id === userId) {
    return (
      <div className="flex gap-2">
        <button onClick={() => onAction(match.id, 'ACCEPTED')} disabled={isLoading}
          className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
          {isLoading ? '...' : '✅ Accepter'}
        </button>
        <button onClick={() => onAction(match.id, 'CANCELLED')} disabled={isLoading}
          className="px-3 py-1 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200 disabled:opacity-50">
          ❌ Refuser
        </button>
      </div>
    )
  }

  if (match.status === 'ACCEPTED') {
    return (
      <button onClick={() => onAction(match.id, 'IN_PROGRESS')} disabled={isLoading}
        className="px-3 py-1 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50">
        {isLoading ? '...' : '🔄 Démarrer'}
      </button>
    )
  }

  if (match.status === 'IN_PROGRESS') {
    return (
      <div className="flex gap-2">
        <button onClick={() => onAction(match.id, 'COMPLETED')} disabled={isLoading}
          className="px-3 py-1 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50">
          {isLoading ? '...' : '🏆 Terminer'}
        </button>
        <button onClick={() => onAction(match.id, 'DISPUTED')} disabled={isLoading}
          className="px-3 py-1 bg-orange-100 text-orange-600 text-sm font-bold rounded-lg hover:bg-orange-200 disabled:opacity-50">
          ⚠️ Litige
        </button>
      </div>
    )
  }

  return null
}

// ✅ Modal de notation
const RatingModal = ({
  match, userId, onClose, onSubmit,
}: {
  match: Match
  userId: string
  onClose: () => void
  onSubmit: (matchId: string, score: number, comment: string) => void
}) => {
  const [score, setScore]     = useState(5)
  const [comment, setComment] = useState('')
  const [hover, setHover]     = useState(0)
  const otherUser = match.seeker.id === userId ? match.helper : match.seeker

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-gray-800 mb-2">⭐ Laisser une note</h2>
        <p className="text-gray-500 text-sm mb-6">
          Évaluez votre échange avec <strong>{otherUser.firstName} {otherUser.lastName}</strong>
        </p>

        {/* Étoiles */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              onClick={() => setScore(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={36}
                className={`transition-colors ${
                  star <= (hover || score)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>

        <p className="text-center text-sm font-medium text-gray-600 mb-4">
          {score === 1 && '😞 Très décevant'}
          {score === 2 && '😕 Décevant'}
          {score === 3 && '😐 Correct'}
          {score === 4 && '😊 Bien'}
          {score === 5 && '🤩 Excellent !'}
        </p>

        {/* Commentaire */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Laissez un commentaire (optionnel)..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-4 text-sm"
        />

        {/* Boutons */}
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg hover:bg-gray-200">
            Annuler
          </button>
          <button onClick={() => onSubmit(match.id, score, comment)}
            className="flex-1 py-2 bg-yellow-400 text-white font-bold rounded-lg hover:bg-yellow-500">
            ⭐ Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}

export const MyMatches: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [matches, setMatches]           = useState<Match[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tab, setTab]                   = useState<'all' | 'active' | 'completed'>('active')
  const [ratingModal, setRatingModal]   = useState<Match | null>(null)

  const fetchMatches = async () => {
    try {
      const res = await matchesAPI.getMy()
      setMatches(res.data)
    } catch (err) {
      setError('Erreur lors du chargement des échanges')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchMatches() }, [])

  const handleAction = async (matchId: string, status: string) => {
    setActionLoading(matchId)
    try {
      await matchesAPI.updateStatus(matchId, status)
      await fetchMatches()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRatingSubmit = async (matchId: string, score: number, comment: string) => {
    try {
      await ratingsAPI.create({ matchId, score, comment: comment || undefined })
      setRatingModal(null)
      await fetchMatches()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la notation')
    }
  }

  const filteredMatches = matches.filter(m => {
    if (tab === 'active')    return ['PROPOSED', 'ACCEPTED', 'IN_PROGRESS'].includes(m.status)
    if (tab === 'completed') return ['COMPLETED', 'CANCELLED', 'DISPUTED'].includes(m.status)
    return true
  })

  const getOtherUser = (match: Match) =>
    match.seeker.id === user?.id ? match.helper : match.seeker

  const getMyRole = (match: Match) =>
    match.seeker.id === user?.id ? 'Demandeur' : 'Aidant'

  const canRate = (match: Match) =>
    match.status === 'COMPLETED' && !match.rating

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Modal notation */}
      {ratingModal && user && (
        <RatingModal
          match={ratingModal}
          userId={user.id}
          onClose={() => setRatingModal(null)}
          onSubmit={handleRatingSubmit}
        />
      )}

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-blue-600">Mes Échanges</h1>
          </div>
          <NotificationBell />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Onglets */}
        <div className="flex gap-2 mb-6">
          {([
            { key: 'active',    label: '🔄 En cours' },
            { key: 'completed', label: '🏆 Terminés' },
            { key: 'all',       label: '📋 Tous' },
          ] as const).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                tab === t.key ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des échanges...</p>
          </div>
        )}

        {!loading && filteredMatches.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Clock size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucun échange trouvé</p>
            <Link to="/feed"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
              Voir les annonces
            </Link>
          </div>
        )}

        {/* Liste des échanges */}
        <div className="space-y-4">
          {filteredMatches.map((match) => {
            const otherUser = getOtherUser(match)
            const myRole    = getMyRole(match)

            return (
              <div key={match.id} className="bg-white rounded-lg shadow-sm p-6">

                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{match.service.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Mon rôle : <span className="font-medium text-blue-600">{myRole}</span>
                    </p>
                  </div>
                  <MatchStatusBadge status={match.status} />
                </div>

                {/* Partenaire */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {otherUser.firstName[0]}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{otherUser.firstName} {otherUser.lastName}</p>
                    <p className="text-xs text-gray-400">
                      {myRole === 'Demandeur' ? 'Votre aidant' : 'Votre demandeur'}
                    </p>
                  </div>
                  <div className="ml-auto text-right text-sm text-gray-500">
                    <p>💰 {match.service.credits} crédit(s)</p>
                    <p>📍 {match.service.quartier}</p>
                  </div>
                </div>

                {/* Message de proposition */}
                {match.message && (
                  <div className="bg-blue-50 p-3 rounded-lg mb-4 text-sm text-blue-700 italic">
                    💬 "{match.message}"
                  </div>
                )}

                {/* Note existante */}
                {match.rating && (
                  <div className="bg-yellow-50 p-3 rounded-lg mb-4 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={14}
                          className={s <= match.rating!.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                      ))}
                    </div>
                    <span className="text-sm text-yellow-700 font-medium">{match.rating.score}/5</span>
                    {match.rating.comment && (
                      <span className="text-sm text-gray-500 italic">— "{match.rating.comment}"</span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-400">
                    Le {new Date(match.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                  <div className="flex items-center gap-2">
                    {/* Bouton Chat */}
                    {['ACCEPTED', 'IN_PROGRESS', 'COMPLETED'].includes(match.status) && (
                      <button onClick={() => navigate(`/chat/${match.id}`)}
                        className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-600 text-sm font-bold rounded-lg hover:bg-purple-200">
                        <MessageCircle size={16} />
                        Chat
                      </button>
                    )}
                    {/* ✅ Bouton Noter */}
                    {canRate(match) && (
                      <button onClick={() => setRatingModal(match)}
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-600 text-sm font-bold rounded-lg hover:bg-yellow-200">
                        <Star size={16} />
                        Noter
                      </button>
                    )}
                    <MatchActions
                      match={match}
                      userId={user?.id ?? ''}
                      onAction={handleAction}
                      loading={actionLoading}
                    />
                  </div>
                </div>

              </div>
            )
          })}
        </div>

      </div>
    </div>
  )
}
