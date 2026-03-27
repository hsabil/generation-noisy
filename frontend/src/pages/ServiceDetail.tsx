import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI, matchesAPI } from '../services/api';
import type { Service } from '../types/index.tsx';
import { CATEGORIES } from '../types/index.tsx';
import { ArrowLeft, MapPin, Star, Clock, Check, X } from 'lucide-react';

// ✅ Types étendus
interface MatchInService {
  id: string
  status: string
  createdAt: string
  seeker: {
    id: string
    firstName: string
    lastName: string
    avatar?: string
  }
}

interface ServiceWithMatches extends Service {
  matches?: MatchInService[]
  _count?: { matches: number }
}

// ✅ Badge statut
const StatusBadge = ({ service }: { service: ServiceWithMatches }) => {
  const propositions = service._count?.matches ?? 0
  if (service.status === 'COMPLETED')
    return <span className="text-sm font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700">🏆 Service rendu</span>
  if (service.status === 'MATCHED')
    return <span className="text-sm font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">🤝 Matchée</span>
  if (service.status === 'CANCELLED')
    return <span className="text-sm font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-500">❌ Annulée</span>
  if (service.status === 'ACTIVE' && propositions > 0)
    return <span className="text-sm font-bold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">💬 {propositions} proposition(s)</span>
  return <span className="text-sm font-bold px-3 py-1 rounded-full bg-green-100 text-green-700">🟢 Active</span>
}

export const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [service, setService] = useState<ServiceWithMatches | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [matchMessage, setMatchMessage] = useState('')
  const [matchLoading, setMatchLoading] = useState(false)
  const [matchSuccess, setMatchSuccess] = useState(false)
  const [showMatchForm, setShowMatchForm] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchService = async () => {
    try {
      const res = await servicesAPI.getById(id!)
      setService(res.data)
    } catch (err) {
      setError('Annonce non trouvée')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchService()
  }, [id])

  // ✅ Accepter ou refuser une proposition
  const handleMatchAction = async (matchId: string, newStatus: 'ACCEPTED' | 'CANCELLED') => {
    setActionLoading(matchId)
    try {
      await matchesAPI.updateStatus(matchId, newStatus)
      await fetchService() // Recharger l'annonce
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setActionLoading(null)
    }
  }

  const handleProposerEchange = async (e: React.FormEvent) => {
    e.preventDefault()
    setMatchLoading(true)
    try {
      await matchesAPI.create({ serviceId: id!, message: matchMessage })
      setMatchSuccess(true)
      setShowMatchForm(false)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la proposition')
    } finally {
      setMatchLoading(false)
    }
  }

  const categoryInfo = service ? CATEGORIES.find(c => c.value === service.category) : null

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Chargement...</p>
    </div>
  )

  if (error && !service) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-500 text-lg mb-4">{error}</p>
        <Link to="/feed" className="text-blue-600 hover:underline">← Retour aux annonces</Link>
      </div>
    </div>
  )

  if (!service) return null

  const isOwner = user?.id === service.author.id

  // ✅ Propositions reçues (status PROPOSED uniquement)
  const propositionsRecues = service.matches?.filter(m => m.status === 'PROPOSED') ?? []
  const matchAccepte = service.matches?.find(m => m.status === 'ACCEPTED' || m.status === 'IN_PROGRESS') ?? null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/feed')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Détail de l'annonce</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Colonne principale */}
          <div className="md:col-span-2 space-y-6">

            {/* Carte principale */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  service.type === 'OFFER' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {service.type === 'OFFER' ? '✅ Offre' : '🙏 Demande'}
                </span>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                  💰 {service.credits} crédit(s)
                </span>
                {/* ✅ Badge statut dynamique */}
                <StatusBadge service={service} />
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-4">{service.title}</h2>
              <p className="text-gray-600 leading-relaxed mb-6">{service.description}</p>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>{categoryInfo?.emoji}</span>
                  <span>{categoryInfo?.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{service.quartier}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>Expire le {new Date(service.expiresAt).toLocaleDateString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star size={16} />
                  <span>{service.credits} crédit(s)</span>
                </div>
              </div>
            </div>

            {/* ✅ PROPRIÉTAIRE — Liste des propositions reçues */}
            {isOwner && service.status === 'ACTIVE' && propositionsRecues.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  💬 Propositions reçues ({propositionsRecues.length})
                </h3>
                <div className="space-y-4">
                  {propositionsRecues.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                          {match.seeker.firstName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {match.seeker.firstName} {match.seeker.lastName}
                          </p>
                          <p className="text-xs text-gray-400">
                            Le {new Date(match.createdAt).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleMatchAction(match.id, 'ACCEPTED')}
                          disabled={actionLoading === match.id}
                          className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          <Check size={16} />
                          Accepter
                        </button>
                        <button
                          onClick={() => handleMatchAction(match.id, 'CANCELLED')}
                          disabled={actionLoading === match.id}
                          className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-600 text-sm font-bold rounded-lg hover:bg-red-200 disabled:opacity-50"
                        >
                          <X size={16} />
                          Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ✅ PROPRIÉTAIRE — Match accepté en cours */}
            {isOwner && matchAccepte && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 font-bold mb-1">🤝 Échange en cours</p>
                <p className="text-blue-600 text-sm">
                  Avec {matchAccepte.seeker.firstName} {matchAccepte.seeker.lastName}
                </p>
              </div>
            )}

            {/* ✅ PROPRIÉTAIRE — Aucune proposition */}
            {isOwner && service.status === 'ACTIVE' && propositionsRecues.length === 0 && !matchAccepte && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-700 font-medium">
                  📋 C'est votre annonce. En attente de propositions d'échange.
                </p>
              </div>
            )}

            {/* ✅ NON-PROPRIÉTAIRE — Formulaire de proposition */}
            {!isOwner && service.status === 'ACTIVE' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                {matchSuccess ? (
                  <div className="text-center py-4">
                    <p className="text-2xl mb-2">🎉</p>
                    <p className="text-green-600 font-bold text-lg">Proposition envoyée !</p>
                    <p className="text-gray-500 mt-2">
                      {service.author.firstName} va recevoir votre demande d'échange.
                    </p>
                    <Link to="/feed" className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Retour aux annonces
                    </Link>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">💬 Proposer un échange</h3>
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">{error}</div>}
                    {!showMatchForm ? (
                      <button
                        onClick={() => setShowMatchForm(true)}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
                      >
                        Je suis intéressé(e) !
                      </button>
                    ) : (
                      <form onSubmit={handleProposerEchange} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                          <textarea
                            value={matchMessage}
                            onChange={(e) => setMatchMessage(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Présentez-vous et expliquez votre intérêt..."
                          />
                        </div>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => setShowMatchForm(false)}
                            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                            Annuler
                          </button>
                          <button type="submit" disabled={matchLoading}
                            className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                            {matchLoading ? 'Envoi...' : 'Envoyer la proposition'}
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ✅ NON-PROPRIÉTAIRE — Annonce matchée */}
            {!isOwner && service.status === 'MATCHED' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-700 font-bold">🤝 Cette annonce a trouvé un partenaire</p>
                <p className="text-blue-600 text-sm mt-1">L'échange est en cours entre les deux membres.</p>
              </div>
            )}

            {/* ✅ NON-PROPRIÉTAIRE — Service rendu */}
            {!isOwner && service.status === 'COMPLETED' && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <p className="text-purple-700 font-bold">🏆 Service rendu</p>
                <p className="text-purple-600 text-sm mt-1">Cet échange a été complété avec succès.</p>
              </div>
            )}

          </div>

          {/* Colonne auteur */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">👤 Auteur</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                  {service.author.firstName[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{service.author.firstName} {service.author.lastName}</p>
                  <p className="text-sm text-gray-500">📍 {service.author.quartier}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                <p>💰 {service.author.credits} crédit(s)</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}