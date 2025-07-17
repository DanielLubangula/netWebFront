import React from 'react';
import { UserProfile } from '../types';

interface ProfileHeaderProps {
  user: UserProfile;
  onChallengeClick: () => void;
}

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://netwebback.onrender.com${url}`;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onChallengeClick }) => {
  const experiencePercent = (user.experience / user.nextLevelExp) * 100;

  return (
    <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-6 border border-gray-700">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative">
          <img
            src={getCleanImageUrl(user.profilePicture)}
            alt={`${user.username}'s profile`}
            className="w-24 h-24 rounded-full border-4 border-blue-500 object-cover"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user.username}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 mb-4">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full font-medium">
              Niveau {user.level}
            </span>
            <span className="text-gray-300">
              {user.experience} / {user.nextLevelExp} XP
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${experiencePercent}%` }}
            />
          </div>
          <p className="text-sm text-gray-400">
            {user.nextLevelExp - user.experience} XP pour le niveau suivant
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={onChallengeClick}
          className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
        >
          Proposer un match
        </button>
      </div>
    </div>
  );
};