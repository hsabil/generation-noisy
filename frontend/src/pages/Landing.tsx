import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, Zap } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-sm">
        <h1 className="text-2xl font-bold text-blue-600">Génération Noisy</h1>
        <div className="space-x-4">
          <Link to="/login" className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded">
            Se connecter
          </Link>
          <Link to="/register" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Rejoindre
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center py-20 px-4">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">À Noisy, on s'entraide</h2>
        <p className="text-xl text-gray-600 mb-8">Échangez compétences, temps et passions avec vos voisins</p>
        <Link to="/register" className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg hover:bg-blue-700">
          Commencer →
        </Link>
      </section>

      {/* How it works */}
      <section className="py-16 px-8 bg-gray-50">
        <h3 className="text-3xl font-bold text-center mb-12">Comment ça marche</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-blue-600" size={32} />
            </div>
            <h4 className="font-bold mb-2">1. Rejoignez</h4>
            <p className="text-gray-600">Inscrivez-vous en quelques clics</p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="text-green-600" size={32} />
            </div>
            <h4 className="font-bold mb-2">2. Proposez</h4>
            <p className="text-gray-600">Partagez vos talents et compétences</p>
          </div>
          <div className="text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="text-yellow-600" size={32} />
            </div>
            <h4 className="font-bold mb-2">3. Échangez</h4>
            <p className="text-gray-600">Connectez-vous avec d'autres membres</p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-purple-600" size={32} />
            </div>
            <h4 className="font-bold mb-2">4. Grandissez</h4>
            <p className="text-gray-600">Ensemble, créons une communauté</p>
          </div>
        </div>
      </section>

      {/* Credit system */}
      <section className="py-16 px-8">
        <h3 className="text-3xl font-bold text-center mb-8">Système de crédits</h3>
        <div className="max-w-2xl mx-auto bg-blue-50 p-8 rounded-lg text-center">
          <p className="text-lg text-gray-700 mb-4">
            <strong>1 crédit = 1 heure d'aide</strong>
          </p>
          <p className="text-gray-600">
            Vous aidez quelqu'un → vous gagnez des crédits. Vous recevez de l'aide → vous dépensez des crédits. C'est équitable et transparent.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white text-center py-8">
        <p>&copy; 2026 Génération Noisy. Tous droits réservés.</p>
      </footer>
    </div>
  );
};
