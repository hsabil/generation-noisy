import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Heart, Users, Zap, Star, ArrowRight, MapPin,
  MessageCircle, Shield, ChevronDown, Check
} from 'lucide-react'

export const Landing: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ========== NAVBAR ========== */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm shadow-sm'
      }`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Heart size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Génération Noisy</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#how" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Comment ça marche</a>
            <a href="#categories" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Services</a>
            <a href="#trust" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition">Confiance</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition">
              Se connecter
            </Link>
            <Link to="/register" className="px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm flex items-center gap-1.5">
              Rejoindre
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div className="space-y-1.5">
              <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-gray-700 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </div>
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
            <a href="#how" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Comment ça marche</a>
            <a href="#categories" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Services</a>
            <a href="#trust" className="block text-sm font-medium text-gray-700 py-2" onClick={() => setMenuOpen(false)}>Confiance</a>
            <div className="pt-2 flex flex-col gap-2 border-t border-gray-100">
              <Link to="/login" className="block text-center py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700">Se connecter</Link>
              <Link to="/register" className="block text-center py-2.5 bg-blue-600 rounded-xl text-sm font-bold text-white">Rejoindre gratuitement</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ========== HERO ========== */}
      <section className="pt-28 pb-20 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-8 shadow-sm">
            <MapPin size={14} />
            Noisy-le-Grand &amp; alentours
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
            Vos voisins ont<br />
            <span className="text-blue-600">des talents.</span>
          </h1>

          <p className="text-xl text-gray-600 mb-4 max-w-2xl mx-auto leading-relaxed">
            La première plateforme d'échange de services entre habitants de Noisy-le-Grand.
            Solidaire, local et gratuit.
          </p>
          <p className="text-base font-semibold text-blue-500 mb-10 tracking-wide">
            Aidez · Échangez · Grandissez ensemble
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-14">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 hover:shadow-blue-300"
            >
              Créer mon compte gratuit
              <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl text-lg hover:bg-gray-50 transition border-2 border-gray-200 hover:border-gray-300"
            >
              J'ai déjà un compte
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex -space-x-2">
              {['HB', 'ML', 'AF', 'KD', 'SR'].map((initiales, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm"
                  style={{ backgroundColor: ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'][i] }}
                >
                  {initiales}
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center sm:items-start">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-medium text-gray-600 mt-0.5">
                Rejoignez des centaines de voisins solidaires
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <a href="#how" className="flex flex-col items-center gap-1 text-gray-400 hover:text-blue-500 transition animate-bounce">
            <span className="text-xs font-medium tracking-wider uppercase">Découvrir</span>
            <ChevronDown size={20} />
          </a>
        </div>
      </section>

      {/* ========== STATS ========== */}
      <section className="py-12 px-6 bg-white border-y border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '100%',    label: 'Gratuit',             color: 'text-blue-600' },
              { value: '5 min',   label: "Pour s'inscrire",     color: 'text-green-600' },
              { value: '12',      label: 'Quartiers couverts',  color: 'text-purple-600' },
              { value: '1 crédit',label: "= 1 heure d'aide",    color: 'text-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="p-4">
                <p className={`text-3xl font-extrabold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMMENT ÇA MARCHE ========== */}
      <section id="how" className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              En 4 étapes simples, commencez à échanger avec vos voisins
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                icon: <Users size={26} className="text-blue-600" />,
                bg: 'bg-blue-100',
                step: '01',
                title: 'Inscrivez-vous',
                desc: 'Créez votre compte en 2 minutes avec votre quartier de Noisy-le-Grand',
                color: 'text-blue-600',
              },
              {
                icon: <Heart size={26} className="text-green-600" />,
                bg: 'bg-green-100',
                step: '02',
                title: 'Publiez',
                desc: "Proposez vos compétences ou exprimez une demande d'aide",
                color: 'text-green-600',
              },
              {
                icon: <MessageCircle size={26} className="text-purple-600" />,
                bg: 'bg-purple-100',
                step: '03',
                title: 'Échangez',
                desc: 'Chattez en temps réel et organisez votre échange en toute confiance',
                color: 'text-purple-600',
              },
              {
                icon: <Star size={26} className="text-yellow-500" />,
                bg: 'bg-yellow-100',
                step: '04',
                title: 'Évaluez',
                desc: "Notez l'échange et construisez votre réputation dans la communauté",
                color: 'text-yellow-600',
              },
            ].map((item, i) => (
              <div key={i} className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center hover:shadow-md transition group">
                <div className="text-xs font-bold text-gray-300 mb-4 tracking-widest">{item.step}</div>
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h3 className={`font-bold text-lg ${item.color} mb-2`}>{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 z-10 transform -translate-y-1/2">
                    <ArrowRight size={18} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CATÉGORIES ========== */}
      <section id="categories" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Des services pour tout le monde
            </h2>
            <p className="text-gray-500 text-lg">Explorez les dizaines de catégories proposées par vos voisins</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[
              { emoji: '💻', label: 'Informatique',    bg: 'bg-blue-50',    hover: 'hover:bg-blue-100',    text: 'text-blue-700' },
              { emoji: '📚', label: 'Cours & Devoirs', bg: 'bg-green-50',   hover: 'hover:bg-green-100',   text: 'text-green-700' },
              { emoji: '🔧', label: 'Bricolage',        bg: 'bg-orange-50',  hover: 'hover:bg-orange-100',  text: 'text-orange-700' },
              { emoji: '🍳', label: 'Cuisine',          bg: 'bg-red-50',     hover: 'hover:bg-red-100',     text: 'text-red-700' },
              { emoji: '🌿', label: 'Jardinage',        bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', text: 'text-emerald-700' },
              { emoji: '🚗', label: 'Transport',        bg: 'bg-yellow-50',  hover: 'hover:bg-yellow-100',  text: 'text-yellow-700' },
              { emoji: '🐾', label: 'Animaux',          bg: 'bg-purple-50',  hover: 'hover:bg-purple-100',  text: 'text-purple-700' },
              { emoji: '🎨', label: 'Créativité',       bg: 'bg-pink-50',    hover: 'hover:bg-pink-100',    text: 'text-pink-700' },
            ].map((cat, i) => (
              <div key={i} className={`${cat.bg} ${cat.hover} rounded-2xl p-5 text-center cursor-pointer transition group`}>
                <p className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{cat.emoji}</p>
                <p className={`font-semibold text-sm ${cat.text}`}>{cat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== SYSTÈME DE CRÉDITS ========== */}
      <section className="py-20 px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            💰 Le système de crédits
          </h2>
          <p className="text-blue-100 text-lg mb-12 max-w-xl mx-auto">
            Un système équitable où chaque heure compte autant pour tout le monde
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { emoji: '🤝', title: 'Vous aidez',      desc: 'Vous gagnez des crédits en rendant service à vos voisins',              featured: false },
              { emoji: '⚖️', title: '1 crédit = 1h',   desc: "Chaque heure d'aide vaut exactement 1 crédit, équitable pour tous",     featured: true  },
              { emoji: '🎁', title: 'Vous recevez',    desc: "Dépensez vos crédits pour obtenir de l'aide à votre tour",              featured: false },
            ].map((item, i) => (
              <div
                key={i}
                className={`rounded-2xl p-7 text-left transition ${
                  item.featured
                    ? 'bg-white text-gray-900 shadow-xl scale-105'
                    : 'bg-blue-500/50 text-white border border-blue-400/30'
                }`}
              >
                <p className="text-4xl mb-4">{item.emoji}</p>
                <h3 className={`font-bold text-xl mb-2 ${item.featured ? 'text-blue-600' : 'text-white'}`}>
                  {item.title}
                </h3>
                <p className={`text-sm leading-relaxed ${item.featured ? 'text-gray-600' : 'text-blue-100'}`}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CONFIANCE & SÉCURITÉ ========== */}
      <section id="trust" className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              100% transparent, 100% local
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: <Shield size={28} className="text-blue-600" />,
                bg: 'bg-blue-100',
                title: 'Échanges tracés',
                desc: 'Chaque échange est enregistré et suivi de bout en bout pour votre sécurité',
              },
              {
                icon: <Star size={28} className="text-yellow-500" />,
                bg: 'bg-yellow-100',
                title: 'Système de notation',
                desc: "Après chaque service, les deux parties s'évaluent pour renforcer la confiance",
              },
              {
                icon: <Zap size={28} className="text-purple-600" />,
                bg: 'bg-purple-100',
                title: 'Résolution des litiges',
                desc: 'Un coordinateur peut intervenir en cas de désaccord pour trouver une solution juste',
              },
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-md transition">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                  {item.icon}
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-blue-50 rounded-2xl p-8 border border-blue-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Inscription gratuite et sans engagement',
                'Profil vérifié par quartier',
                'Chat sécurisé intégré',
                'Historique complet des échanges',
                'Notifications en temps réel',
                'Gestion des litiges par un coordinateur',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA FINAL ========== */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Rejoignez la communauté<br />de Noisy-le-Grand
          </h2>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            Des centaines de voisins s'entraident déjà. C'est gratuit, local et solidaire.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-3 px-10 py-4 bg-white text-blue-600 font-extrabold rounded-2xl text-lg hover:bg-blue-50 transition shadow-2xl shadow-blue-900/30"
          >
            Créer mon compte gratuitement
            <ArrowRight size={22} />
          </Link>
          <p className="text-blue-200 text-sm mt-6">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-white font-semibold underline hover:no-underline">
              Se connecter →
            </Link>
          </p>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Heart size={15} className="text-white" />
                </div>
                <span className="font-bold text-lg">Génération Noisy</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
                La plateforme solidaire d'échange de services entre habitants de Noisy-le-Grand.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Navigation</p>
              <Link to="/register" className="text-gray-400 hover:text-white transition text-sm">S'inscrire</Link>
              <Link to="/login" className="text-gray-400 hover:text-white transition text-sm">Se connecter</Link>
              <a href="#how" className="text-gray-400 hover:text-white transition text-sm">Comment ça marche</a>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Localisation</p>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} />
                <span>Noisy-le-Grand, 93160</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <MapPin size={14} />
                <span>Seine-Saint-Denis, Île-de-France</span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-gray-500 text-sm">© 2026 Génération Noisy. Fait avec ❤️ à Noisy-le-Grand.</p>
            <div className="flex items-center gap-1 text-yellow-400">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="fill-yellow-400" />)}
              <span className="text-gray-400 text-xs ml-1">Plateforme solidaire</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
