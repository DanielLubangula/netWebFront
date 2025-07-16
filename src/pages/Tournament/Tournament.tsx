import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, Users, Trophy, Clock, Star, User } from 'lucide-react';

const tournaments = [
  {
    id: 1,
    name: 'Maîtres du Routage',
    description: 'Tournoi hebdomadaire sur les protocoles de routage',
    startDate: '2025-01-20',
    endDate: '2025-01-22',
    participants: 156,
    maxParticipants: 200,
    prize: '1000 XP + Badge Exclusif',
    status: 'upcoming',
    theme: 'Routage',
    difficulty: 'Avancé'
  },
  {
    id: 2,
    name: 'Champions TCP/IP',
    description: 'Compétition intensive sur les protocoles TCP/IP',
    startDate: '2025-01-15',
    endDate: '2025-01-17',
    participants: 89,
    maxParticipants: 100,
    prize: '750 XP + Titre Spécial',
    status: 'active',
    theme: 'TCP/IP',
    difficulty: 'Intermédiaire'
  },
  {
    id: 3,
    name: 'Débutants OSI',
    description: 'Tournoi d\'initiation au modèle OSI',
    startDate: '2025-01-10',
    endDate: '2025-01-12',
    participants: 234,
    maxParticipants: 250,
    prize: '500 XP + Certificat',
    status: 'completed',
    theme: 'OSI',
    difficulty: 'Débutant',
    winner: 'Alex_Network'
  }
];

const leaderboard = [
  { rank: 1, name: 'Alex_Network', score: 2450, matches: 12 },
  { rank: 2, name: 'Sophie_TCP', score: 2380, matches: 11 },
  { rank: 3, name: 'Max_Router', score: 2320, matches: 10 },
  { rank: 4, name: 'Emma_Switch', score: 2280, matches: 9 },
  { rank: 5, name: 'Lucas_VPN', score: 2250, matches: 8 },
];

export const Tournament: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'completed'>('active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'upcoming': return 'bg-blue-600';
      case 'completed': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'En cours';
      case 'upcoming': return 'À venir';
      case 'completed': return 'Terminé';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-600';
      case 'Intermédiaire': return 'bg-yellow-600';
      case 'Avancé': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const filteredTournaments = tournaments.filter(t => t.status === activeTab);

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Tournois
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Participez aux compétitions officielles et gagnez des récompenses exclusives
          </p>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs - Mobile version */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="lg:hidden flex overflow-x-auto pb-2 -mx-4 px-4"
            >
              {(['active', 'upcoming', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm mr-2 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab === 'active' && 'En cours'}
                  {tab === 'upcoming' && 'À venir'}
                  {tab === 'completed' && 'Terminés'}
                </button>
              ))}
            </motion.div>

            {/* Tabs - Desktop version */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="hidden lg:flex bg-gray-800 rounded-xl p-1 border border-gray-700"
            >
              {(['active', 'upcoming', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tab === 'active' && 'En cours'}
                  {tab === 'upcoming' && 'À venir'}
                  {tab === 'completed' && 'Terminés'}
                </button>
              ))}
            </motion.div>

            {/* Tournaments List */}
            <div className="space-y-4 sm:space-y-6">
              {filteredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold">{tournament.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getStatusColor(tournament.status)}`}>
                          {getStatusText(tournament.status)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full text-white ${getDifficultyColor(tournament.difficulty)}`}>
                          {tournament.difficulty}
                        </span>
                      </div>
                      <p className="text-sm sm:text-base text-gray-300 mb-4">{tournament.description}</p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(tournament.startDate).toLocaleDateString('fr-FR')} - {new Date(tournament.endDate).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                          <Users className="w-4 h-4" />
                          {tournament.participants}/{tournament.maxParticipants} participants
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                          <Trophy className="w-4 h-4" />
                          {tournament.prize}
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-400">
                          <Star className="w-4 h-4" />
                          Thème: {tournament.theme}
                        </div>
                      </div>

                      {tournament.winner && (
                        <div className="bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Crown className="w-4 h-4" />
                            <span className="text-sm sm:text-base font-medium">Vainqueur: {tournament.winner}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(tournament.participants / tournament.maxParticipants) * 100}%` }}
                      />
                    </div>
                    
                    <button
                      disabled={tournament.status === 'completed' || tournament.participants >= tournament.maxParticipants}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        tournament.status === 'completed' || tournament.participants >= tournament.maxParticipants
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : tournament.status === 'active'
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {tournament.status === 'completed' ? 'Terminé' :
                       tournament.participants >= tournament.maxParticipants ? 'Complet' :
                       tournament.status === 'active' ? 'Rejoindre' : 'S\'inscrire'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Current Tournament Leaderboard */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700"
            >
              <h3 className="text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Trophy className="w-5 h-5 text-yellow-400" />
                Classement actuel
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {leaderboard.map((player) => (
                  <div key={player.rank} className="flex items-center gap-2 sm:gap-3 p-2 bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6">
                      {player.rank === 1 ? <Crown className="w-4 h-4 text-yellow-400" /> :
                       player.rank === 2 ? <Trophy className="w-4 h-4 text-gray-400" /> :
                       player.rank === 3 ? <Trophy className="w-4 h-4 text-amber-600" /> :
                       <span className="text-xs sm:text-sm font-bold text-gray-400">{player.rank}</span>}
                    </div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{player.name}</div>
                      <div className="text-xs text-gray-400 truncate">{player.score} pts • {player.matches} matchs</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Tournament Rules */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700"
            >
              <h3 className="text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                Règles des tournois
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                  <span>Format: Élimination directe</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                  <span>10 questions par match</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                  <span>Temps limité: 5 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                  <span>Classement par points</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full mt-2"></div>
                  <span>Récompenses exclusives</span>
                </li>
              </ul>
            </motion.div>

            {/* Next Tournament */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700"
            >
              <h3 className="text-lg font-bold mb-2">Prochain tournoi</h3>
              <p className="text-xs sm:text-sm text-gray-300 mb-4">
                "Sécurité des Réseaux" commence dans 3 jours
              </p>
              <button className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded-lg text-sm sm:text-base font-medium transition-colors">
                Être notifié
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};