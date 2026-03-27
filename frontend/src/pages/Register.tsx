import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { QUARTIERS } from '../types/index.tsx';

export const Register: React.FC = () => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [quartier, setQuartier] = useState(QUARTIERS[0]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleNext = () => {
    if (step === 1 && (!firstName || !lastName || !quartier)) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (step === 2 && (!email || !password || !confirmPassword)) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    if (step === 2 && password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setError('');
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({ firstName, lastName, email, password, quartier });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'inscription');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-blue-600">Rejoindre Génération Noisy</h1>
        <p className="text-center text-gray-600 mb-8">Étape {step} sur 3</p>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Étape 1 — Identité */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dupont"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Votre quartier</label>
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
              <button
                type="button"
                onClick={handleNext}
                className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
              >
                Suivant →
              </button>
            </div>
          )}

          {/* Étape 2 — Email + Mot de passe */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="vous@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400"
                >
                  ← Retour
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Étape 3 — Confirmation */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-700 mb-2"><strong>Nom :</strong> {firstName} {lastName}</p>
                <p className="text-sm text-gray-700 mb-2"><strong>Email :</strong> {email}</p>
                <p className="text-sm text-gray-700"><strong>Quartier :</strong> {quartier}</p>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Inscription...' : 'Confirmer et rejoindre'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full bg-gray-300 text-gray-700 font-bold py-2 rounded-lg hover:bg-gray-400"
              >
                ← Retour
              </button>
            </div>
          )}

        </form>

        <p className="text-center text-gray-600 mt-4">
          Déjà inscrit ? <Link to="/login" className="text-blue-600 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};