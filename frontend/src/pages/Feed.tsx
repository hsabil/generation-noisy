import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { servicesAPI } from '../services/api';
import type { Service } from '../types/index.tsx';
import { QUARTIERS, CATEGORIES } from '../types/index.tsx';
import { Plus, Search, LogOut, User } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';

// ✅ Type étendu pour inclure _count et matches
interface ServiceWithCount extends Service {
  _count?: { matches: number }
}

// ✅ Badge statut
const StatusBadge = ({ service }: { service: ServiceWithCount }) => {
  const propositions = service._count?.matches ?? 0

  if (service.status === 'COMPLETED') {
    return <span className="text-xs font-bold px-2 py-1 rounded-full bg-purple-100 text-purple-700">🏆 Service rendu</span>
  }
  if (service.status === 'MATCHED') {
    return <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">🤝 Matchée</span>
  }
  if (service.status === 'CANCELLED') {
    return <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">❌ Annulée</span>
  }
  if (service.status === 'ACTIVE' && propositions > 0) {
    return <span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">💬 {propositions} proposition(s)</span>
  }
  return <span className="text-xs font-bold px-2 py-1 rounded-full bg-green-100 text-green-700">✅ Active</span>
}

// ✅ Options du filtre statut
const STATUS_OPTIONS = [
  { value: '',          label: 'Actives' },
  { value: 'ALL',       label: 'Toutes' },
  { value: 'ACTIVE',    label: '✅ Actives' },
  { value: 'MATCHED',   label: '🤝 Matchées' },
  { value: 'COMPLETED', label: '🏆 Services rendus' },
  { value: 'CANCELLED', label: '❌ Annulées' },
]

export const Feed: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [services, setServices] = useState<ServiceWithCount[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [type, setType]         = useState('');
  const [category, setCategory] = useState('');
  const [quartier, setQuartier] = useState('');
  const [status, setStatus]     = useState('');
  const [page, setPage]         = useState(1);
  const totalPages = Math.ceil(total / 10);

  const fetchServices = async () => {
    setLoading(true)
    try {
      const res = await servicesAPI.getAll({
        type:     type     || undefined,
        category: category || undefined,
        quartier: quartier || undefined,
        status:   status   || undefined,
        page,
        limit: 10,
      } as any)
      setServices(res.data.services)
      setTotal(res.data.total)
    } catch (err) {
      setError('Erreur lors du chargement des annonces')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [type, category, quartier, status, page])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const creditColor = (credits: number) => {
    if (credits === 0.5) return 'bg-green-100 text-green-700'
    if (credits === 1)   return 'bg-blue-100 text-blue-700'
    if (credits === 1.5) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            Génération Noisy
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              💰 {user?.credits} crédit(s)
            </span>
            <NotificationBell />
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <User size={16} />
              {user?.firstName}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Annonces</h1>
            <p className="text-gray-500 mt-1">{total} annonce(s) disponible(s)</p>
          </div>
          <Link
            to="/create-service"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Créer une annonce
          </Link>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="OFFER">Offres</option>
              <option value="REQUEST">Demandes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier</label>
            <select
              value={quartier}
              onChange={(e) => { setQuartier(e.target.value); setPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les quartiers</option>
              {QUARTIERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Erreur */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
        )}

        {/* Chargement */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">Chargement des annonces...</p>
          </div>
        )}

        {/* Liste vide */}
        {!loading && services.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <Search size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Aucune annonce trouvée</p>
            <p className="text-gray-400 mt-2">Soyez le premier à créer une annonce !</p>
            <Link
              to="/create-service"
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700"
            >
              Créer une annonce
            </Link>
          </div>
        )}

        {/* Grille des annonces */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 cursor-pointer"
              onClick={() => navigate(`/services/${service.id}`)}
            >
              {/* Ligne 1 : Type + Crédits */}
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  service.type === 'OFFER'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {service.type === 'OFFER' ? '✅ Offre' : '🙏 Demande'}
                </span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${creditColor(service.credits)}`}>
                  💰 {service.credits} crédit(s)
                </span>
              </div>

              {/* ✅ Ligne 2 : Badge statut */}
              <div className="mb-3">
                <StatusBadge service={service} />
              </div>

              {/* Titre */}
              <h3 className="text-lg font-bold text-gray-800 mb-2">{service.title}</h3>

              {/* Description */}
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{service.description}</p>

              {/* Catégorie + Quartier */}
              <div className="flex justify-between items-center text-xs text-gray-400">
                <span>
                  {CATEGORIES.find(c => c.value === service.category)?.emoji}{' '}
                  {CATEGORIES.find(c => c.value === service.category)?.label}
                </span>
                <span>📍 {service.quartier}</span>
              </div>

              {/* Auteur */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                  {service.author.firstName[0]}
                </div>
                <span className="text-sm text-gray-600">
                  {service.author.firstName} {service.author.lastName}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              ← Précédent
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 hover:bg-gray-50"
            >
              Suivant →
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
