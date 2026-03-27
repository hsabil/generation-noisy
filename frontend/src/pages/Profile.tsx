import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileAPI, ratingsAPI, matchesAPI } from '../services/api';
import { QUARTIERS } from '../types/index.tsx';
import { ArrowLeft, Edit2, Save, X, Star, Lock } from 'lucide-react';

interface Rating {
  id: string
  score: number
  comment?: string
  createdAt: string
  giver: { id: string; firstName: string; lastName: string }
}

interface Match {
  id: string
  status: string
  createdAt: string
  service: { id: string; title: string; credits: number }
  seeker: { id: string; firstName: string; lastName: string }
  helper: { id: string; firstName: string; lastName: string }
}

export const Profile: React.FC = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  // États édition profil
  const [editing, setEditing]         = useState(false)
  const [firstName, setFirstName]     = useState('')
  const [lastName, setLastName]       = useState('')
  const [quartier, setQuartier]       = useState('')
  const [bio, setBio]                 = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveError, setSaveError]     = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // États changement mot de passe
  const [showPassword, setShowPassword]           = useState(false)
  const [currentPassword, setCurrentPassword]     = useState('')
  const [newPassword, setNewPassword]             = useState('')
  const [confirmPassword, setConfirmPassword]     = useState('')
  const [pwdLoading, setPwdLoading]               = useState(false)
  const [pwdError, setPwdError]                   = useState('')
  const [pwdSuccess, setPwdSuccess]               = useState(false)

  // Données
  const [ratings, setRatings]   = useState<Rating[]>([])
  const [matches, setMatches]   = useState<Match[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName)
      setLastName(user.lastName)
      setQuartier(user.quartier)
      setBio(user.bio ?? '')
      fetchData()
    }
  }, [user])

  const fetchData = async () => {
    try {
      const [ratingsRes, matchesRes] = await Promise.all([
        ratingsAPI.getByUser(user!.id),
        matchesAPI.getMy(),
      ])
      setRatings(ratingsRes.data.ratings ?? [])
      setMatches(matchesRes.data ?? [])
    } catch (err) {
      console.error('Erreur chargement profil:', err)
    } finally {
      setLoading(false)
    }
  }

  // ✅ Sauvegarder le profil
  const handleSave = async () => {
    setSaveLoading(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      await profileAPI.update({ firstName, lastName, quartier, bio })
      setSaveSuccess(true)
      setEditing(false)
      // Recharger l'utilisateur
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (err: any) {
      setSaveError(err.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setSaveLoading(false)
    }
  }

  // ✅ Changer le mot de passe
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      setPwdError('Les mots de passe ne correspondent pas')
      return
    }
    if (newPassword.length < 6) {
      setPwdError('Le mot de passe doit faire au moins 6 caractères')
      return
    }
    setPwdLoading(true)
    setPwdError('')
    try {
      await profileAPI.changePassword({ currentPassword, newPassword })
      setPwdSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowPassword(false)
      setTimeout(() => setPwdSuccess(false), 3000)
    } catch (err: any) {
      setPwdError(err.response?.data?.error || 'Erreur lors du changement')
    } finally {
      setPwdLoading(false)
    }
  }

  const averageRating = ratings.length
    ? (ratings.reduce((s, r) => s + r.score, 0) / ratings.length).toFixed(1)
    : null

  const completedMatches = matches.filter(m => m.status === 'COMPLETED').length

  const renderStars = (score: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={14}
        className={i < score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
      />
    ))

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Mon Profil</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* ✅ Carte profil principale */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-gray-500">📍 {user.quartier}</p>
                <p className="text-sm text-gray-400 mt-1">
                  Membre depuis {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Récemment'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              {editing ? <X size={16} /> : <Edit2 size={16} />}
              {editing ? 'Annuler' : 'Modifier'}
            </button>
          </div>

          {/* Stats rapides */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{user.credits}</p>
              <p className="text-xs text-gray-500">Crédits</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedMatches}</p>
              <p className="text-xs text-gray-500">Échanges</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {averageRating ? `⭐ ${averageRating}` : '—'}
              </p>
              <p className="text-xs text-gray-500">Note moyenne</p>
            </div>
          </div>

          {/* Formulaire d'édition */}
          {editing ? (
            <div className="space-y-4">
              {saveError && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{saveError}</div>}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
                <select value={quartier} onChange={e => setQuartier(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                  {QUARTIERS.map(q => <option key={q} value={q}>{q}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea value={bio} onChange={e => setBio(e.target.value)} rows={3}
                  placeholder="Présentez-vous en quelques mots..."
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
              <button onClick={handleSave} disabled={saveLoading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                <Save size={16} />
                {saveLoading ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
            </div>
          ) : (
            <div>
              {user.bio ? (
                <p className="text-gray-600 italic">"{user.bio}"</p>
              ) : (
                <p className="text-gray-400 text-sm italic">Aucune bio — cliquez sur Modifier pour en ajouter une.</p>
              )}
            </div>
          )}

          {/* ✅ Message succès */}
          {saveSuccess && (
            <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg">
              ✅ Profil mis à jour avec succès !
            </div>
          )}
        </div>

        {/* ✅ Changer le mot de passe */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="flex items-center gap-2 text-gray-700 font-bold hover:text-blue-600"
          >
            <Lock size={18} />
            Changer le mot de passe
            <span className="text-gray-400">{showPassword ? '▲' : '▼'}</span>
          </button>

          {showPassword && (
            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
              {pwdError   && <div className="bg-red-100 text-red-700 p-3 rounded-lg">{pwdError}</div>}
              {pwdSuccess && <div className="bg-green-100 text-green-700 p-3 rounded-lg">✅ Mot de passe changé !</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe actuel</label>
                <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
                <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le nouveau mot de passe</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
              </div>
              <button type="submit" disabled={pwdLoading}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {pwdLoading ? 'Changement...' : 'Changer le mot de passe'}
              </button>
            </form>
          )}
        </div>

        {/* ✅ Notes reçues */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            ⭐ Notes reçues ({ratings.length})
            {averageRating && <span className="ml-2 text-yellow-500">— Moyenne : {averageRating}/5</span>}
          </h3>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : ratings.length === 0 ? (
            <p className="text-gray-400 italic">Aucune note reçue pour l'instant.</p>
          ) : (
            <div className="space-y-4">
              {ratings.map(rating => (
                <div key={rating.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                        {rating.giver.firstName[0]}
                      </div>
                      <span className="font-medium text-gray-700">
                        {rating.giver.firstName} {rating.giver.lastName}
                      </span>
                    </div>
                    <div className="flex gap-1">{renderStars(rating.score)}</div>
                  </div>
                  {rating.comment && (
                    <p className="text-gray-600 text-sm italic">"{rating.comment}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(rating.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Historique des échanges */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🔄 Historique des échanges ({matches.length})
          </h3>
          {loading ? (
            <p className="text-gray-400">Chargement...</p>
          ) : matches.length === 0 ? (
            <p className="text-gray-400 italic">Aucun échange pour l'instant.</p>
          ) : (
            <div className="space-y-3">
              {matches.map(match => {
                const isSeeker = match.seeker.id === user.id
                const other = isSeeker ? match.helper : match.seeker
                const statusColors: Record<string, string> = {
                  PROPOSED:    'bg-yellow-100 text-yellow-700',
                  ACCEPTED:    'bg-blue-100 text-blue-700',
                  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
                  COMPLETED:   'bg-green-100 text-green-700',
                  DISPUTED:    'bg-red-100 text-red-700',
                  CANCELLED:   'bg-gray-100 text-gray-500',
                }
                const statusLabels: Record<string, string> = {
                  PROPOSED:    '⏳ En attente',
                  ACCEPTED:    '✅ Accepté',
                  IN_PROGRESS: '🔄 En cours',
                  COMPLETED:   '🏆 Terminé',
                  DISPUTED:    '⚠️ Litige',
                  CANCELLED:   '❌ Annulé',
                }
                return (
                  <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-sm">
                        {other.firstName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{match.service.title}</p>
                        <p className="text-xs text-gray-500">
                          {isSeeker ? 'Demandeur' : 'Aidant'} · avec {other.firstName} {other.lastName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-500">💰 {match.service.credits}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[match.status] ?? 'bg-gray-100'}`}>
                        {statusLabels[match.status] ?? match.status}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
