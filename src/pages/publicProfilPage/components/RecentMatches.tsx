import React from 'react';
import { Match } from '../types';
import { Clock, Crown, AlertCircle, Trophy, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

interface RecentMatchesProps {
  matches: Match[];
  currentUserId: string;
}

export const RecentMatches: React.FC<RecentMatchesProps> = ({ matches, currentUserId }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Historique des matchs</h2>
      </div>

      <div className="space-y-3">
        {matches.length > 0 ? (
          matches.map((match, index) => (
            <MatchItem
              key={match._id}
              match={match}
              index={index}
              currentUserId={currentUserId}
            />
          ))
        ) : (
          <div className="text-center py-4 text-gray-400 bg-gray-700 rounded-lg">
            Aucun match récent
          </div>
        )}
      </div>
    </div>
  );
};

const MatchItem: React.FC<{ match: Match; index: number; currentUserId: string }> = ({
  match,
  index,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const player = match.players.find((p) => p.userId === currentUserId);
  const opponent = match.players.find((p) => p.userId !== currentUserId);
  const isWinner = match.winner === currentUserId;
  const isDraw = !match.winner;

  const dateStr = dayjs(match.completedAt || match.createdAt)
    .locale('fr')
    .format('DD MMM [à] HH:mm');

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/challenge/room/${match.roomId}`)}
      className={`p-3 rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isWinner ? 'bg-green-900/30 hover:bg-green-900/40' :
        isDraw ? 'bg-gray-700 hover:bg-gray-600' :
        'bg-red-900/30 hover:bg-red-900/40'
      }`}
    >
      {/* En-tête avec date et thème */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400">{dateStr}</span>
        <span className="text-xs px-2 py-1 bg-gray-600 rounded-full text-gray-200">
          {match.theme}
        </span>
      </div>

      {/* Corps du match */}
      <div className="flex items-center justify-between gap-2">
        {/* Joueur actuel */}
        <PlayerCard 
          player={player}
          isWinner={isWinner}
          isCurrentUser
          onClick={() => navigate(`/profile/${player?.userId}`)}
        />

        {/* Score et résultat */}
        <div className="flex flex-col items-center min-w-[80px]">
          <div className="flex items-center justify-center gap-1 mb-1">
            {isWinner ? (
              <Trophy className="w-4 h-4 text-yellow-400" />
            ) : isDraw ? (
              <Zap className="w-4 h-4 text-gray-400" />
            ) : null}
            <span className={`text-sm font-semibold ${
              isWinner ? 'text-green-400' :
              isDraw ? 'text-gray-300' :
              'text-red-400'
            }`}>
              {isWinner ? 'Victoire' : isDraw ? 'Égalité' : 'Défaite'}
            </span>
          </div>
          
          <div className="text-xl font-bold text-white px-3 py-1 bg-gray-700 rounded-lg">
            {player?.score ?? 0} - {opponent?.score ?? 0}
          </div>
          
          <span className="text-xs text-gray-400 mt-1">
            {player?.correctAnswers ?? 0}/{match.questions?.length ?? 'N/A'} bonnes réponses
          </span>
        </div>

        {/* Adversaire */}
        <PlayerCard 
          player={opponent}
          isWinner={match.winner === opponent?.userId}
          onClick={() => navigate(`/profile/${opponent?.userId}`)}
        />
      </div>
    </motion.div>
  );
};

const PlayerCard: React.FC<{
  player?: {
    userId: string;
    username: string;
    profilePicture: string;
    abandoned?: boolean;
  };
  isWinner: boolean;
  isCurrentUser?: boolean;
  onClick: () => void;
}> = ({ player, isWinner, isCurrentUser, onClick }) => {
  if (!player) return null;

  // Fonction utilitaire pour corriger l'URL d'image
  function getCleanImageUrl(url?: string) {
    if (!url) return '/default-profile.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  }

  return (
    <div 
      className={`flex flex-col items-center flex-1 p-2 rounded-lg transition-all ${
        isWinner ? 'bg-gradient-to-b from-yellow-900/30 to-transparent' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <div className="relative">
        <img
          src={getCleanImageUrl(player.profilePicture)}
          alt={player.username}
          className={`w-12 h-12 rounded-full object-cover border-2 ${
            isWinner ? 'border-yellow-400 shadow-md shadow-yellow-400/30' :
            player.abandoned ? 'border-red-500' :
            'border-gray-500'
          }`}
        />
        {isWinner && (
          <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-0.5">
            <Crown className="w-3 h-3 text-yellow-800" />
          </div>
        )}
        {player.abandoned && (
          <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5">
            <AlertCircle className="w-3 h-3 text-white" />
          </div>
        )}
      </div>
      
      <div className="mt-2 text-center">
        <p className={`text-sm font-medium ${
          player.abandoned ? 'text-red-400 line-through' : 'text-white'
        }`}>
          {isCurrentUser ? 'Vous' : player.username}
        </p>
        {player.abandoned && (
          <p className="text-xs text-red-400">Abandon</p>
        )}
      </div>
    </div>
  );
};