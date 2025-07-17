import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChallengeData {
  theme: string;
  questionCount: number;
  fromUser: {
    username: string;
    profilePicture: string;
    id: string;
    level: string;
  };
}

interface ChallengeNotificationProps {
  challengeData: ChallengeData | null;
  onAccept: () => void;
  onDecline: () => void;
}

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://netwebback.onrender.com${url}`;
}

export const ChallengeNotification: React.FC<ChallengeNotificationProps> = ({
  challengeData,
  onAccept,
  onDecline,
}) => {
  if (!challengeData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-gray-800 text-white rounded-lg shadow-lg p-6 w-full max-w-md"
        >
          <div className="flex items-center mb-4">
            <img
              src={getCleanImageUrl(challengeData.fromUser.profilePicture)}
              alt={challengeData.fromUser.username}
              className="w-14 h-14 rounded-full border-2 border-blue-500 mr-4"
            />
            <div>
              <p className="font-bold text-lg">{challengeData.fromUser.username}</p>
              <p className="text-sm text-gray-400">Niveau {challengeData.fromUser.level}</p>
            </div>
          </div>
          <div className="mb-4">
            <p className="text-sm">
              Vous avez reçu un défi sur le thème <span className="font-bold">{challengeData.theme}</span> avec{" "}
              <span className="font-bold">{challengeData.questionCount}</span> questions.
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onDecline}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Refuser
            </button>
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Accepter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChallengeNotification;