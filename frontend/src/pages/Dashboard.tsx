import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Génération Noisy</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-12">
        <h2 className="text-3xl font-bold mb-4">Bienvenue, {user.firstName} !</h2>
        <p className="text-gray-600 mb-8">Vous êtes connecté à Génération Noisy.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">Crédit</h3>
            <p className="text-3xl font-bold text-blue-600">0 crédits</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">Services offerts</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-bold mb-2">Échanges</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-4">Prochaines étapes</h3>
          <ul className="space-y-3 text-gray-700">
            <li>✓ Créer votre profil</li>
            <li>○ Proposer vos services</li>
            <li>○ Trouver des échanges</li>
            <li>○ Devenir un pilier de la communauté</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
