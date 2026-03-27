import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Search, Plus, ArrowLeftRight, UserCircle, Shield, List } from 'lucide-react';
import { NotificationBell } from '../components/NotificationBell';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Génération Noisy</h1>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
            >
              <LogOut size={18} />
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 py-12">

        <h2 className="text-3xl font-bold mb-2">Bienvenue, {user.firstName} ! 👋</h2>
        <p className="text-gray-500 mb-8">Quartier : {user.quartier}</p>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Solde crédits</h3>
            <p className="text-3xl font-bold text-blue-600">{user.credits} crédit(s)</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Rôle</h3>
            <p className="text-3xl font-bold text-green-600">{user.role}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Membre depuis</h3>
            <p className="text-xl font-bold text-purple-600">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Récemment'}
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Link to="/feed"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Search size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Voir les annonces</h3>
              <p className="text-gray-500 text-sm">Parcourir les offres et demandes</p>
            </div>
          </Link>

          <Link to="/create-service"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Plus size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Créer une annonce</h3>
              <p className="text-gray-500 text-sm">Proposer ou demander un service</p>
            </div>
          </Link>

          <Link to="/my-services"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <List size={24} className="text-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Mes Annonces</h3>
              <p className="text-gray-500 text-sm">Gérer vos annonces publiées</p>
            </div>
          </Link>

          <Link to="/my-matches"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <ArrowLeftRight size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Mes Échanges</h3>
              <p className="text-gray-500 text-sm">Suivre vos échanges en cours</p>
            </div>
          </Link>

          <Link to="/profile"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <UserCircle size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Mon Profil</h3>
              <p className="text-gray-500 text-sm">Voir et modifier votre profil</p>
            </div>
          </Link>

          {(user.role === 'SUPER_ADMIN' || user.role === 'COORDINATOR') && (
            <Link to="/admin"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Shield size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Administration</h3>
                <p className="text-gray-500 text-sm">Gérer les utilisateurs et litiges</p>
              </div>
            </Link>
          )}

        </div>
      </div>
    </div>
  )
}
