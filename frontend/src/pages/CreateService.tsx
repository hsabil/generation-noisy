import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI } from '../services/api';
import { QUARTIERS, CATEGORIES } from '../types/index.tsx';
import { ArrowLeft } from 'lucide-react';

export const CreateService: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState('OFFER')
  const [category, setCategory] = useState('AUTRE')
  const [credits, setCredits] = useState('1')
  const [quartier, setQuartier] = useState(user?.quartier || QUARTIERS[0])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await servicesAPI.create({
        title,
        description,
        type,
        category,
        credits: parseFloat(credits),
        quartier,
      })
      navigate('/feed')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/feed" className="text-gray-500 hover:text-gray-700">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-blue-600">Créer une annonce</h1>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm">

          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'annonce
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('OFFER')}
                  className={`p-4 rounded-lg border-2 font-bold transition-colors ${
                    type === 'OFFER'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  ✅ J'offre un service
                </button>
                <button
                  type="button"
                  onClick={() => setType('REQUEST')}
                  className={`p-4 rounded-lg border-2 font-bold transition-colors ${
                    type === 'REQUEST'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  🙏 J'ai besoin d'aide
                </button>
              </div>
            </div>

            {/* Titre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Titre de l'annonce
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Aide pour installer Windows"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Décrivez votre service ou votre besoin..."
                required
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Crédits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valeur en crédits
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: '0.5', label: '0.5', desc: '30 min' },
                  { value: '1', label: '1', desc: '1 heure' },
                  { value: '1.5', label: '1.5', desc: 'Technique' },
                  { value: '2', label: '2', desc: 'Spécialisé' },
                ].map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCredits(c.value)}
                    className={`p-3 rounded-lg border-2 text-center transition-colors ${
                      credits === c.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold">{c.label}</div>
                    <div className="text-xs">{c.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quartier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quartier
              </label>
              <select
                value={quartier}
                onChange={(e) => setQuartier(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {QUARTIERS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-lg"
            >
              {loading ? 'Création...' : '✅ Publier l\'annonce'}
            </button>

          </form>
        </div>
      </div>
    </div>
  )
}