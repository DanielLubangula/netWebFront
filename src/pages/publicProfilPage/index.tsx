import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from '../../services/api';
import { motion } from "framer-motion";
import { getSocket } from "../../socket";
import { UserProfile, Match } from "./types";

import { ProfileHeader } from "./components/ProfileHeader";
import { StatsSection } from "./components/StatsSection";
import { RecentMatches } from "./components/RecentMatches";
import { RankingsSection } from "./components/RankingsSection";
import { Achievements } from "./components/Achievements";
import { ChallengeDrawer } from "./components/ChallengeDrawer";
import { SuccessMessage } from "./components/SuccessMessage";

export const PublicProfile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDrawer, setShowDrawer] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [themes, setThemes] = useState<string[]>([]);
  const [theme, setTheme] = useState("");
  const [questionCount, setQuestionCount] = useState(3);

  const handleChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    const socket = getSocket();
    if (!socket || !user) return;

    const storedUser = localStorage.getItem("user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;

    if (!currentUser) {
      alert("Erreur : Impossible de récupérer les informations de l'utilisateur.");
      return;
    }

    const challengeData = {
      theme,
      questionCount,
      fromUser: {
        username: currentUser.username,
        profilePicture: currentUser.profilePicture,
        id: currentUser._id,
        level: currentUser.level,
      },
    };

    socket.emit("sendChallenge", {
      toUserId: user._id,
      challengeData,
    });

    setShowDrawer(false);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [userRes, matchesRes] = await Promise.all([
          api.get(`/api/profil/public/${userId}`),
          api.get(`/api/profil/matches/user/${userId}`)
        ]);

        const userData = userRes.data;
        // console.log('matchesData : ', matchesRes.data);
        const matchesData = matchesRes.data.map((match: Match) => {
          const opponent = match.players.find(p => p.userId !== userId);
          const player = match.players.find(p => p.userId === userId);
          
          return {
            ...match,
            result: match.winner === userId ? 'win' : 
                   match.winner ? 'loss' : 'draw',
            opponent: opponent?.username || 'Inconnu',
            playerScore: player?.score || 0,
            opponentScore: opponent?.score || 0,
            date: match.completedAt || match.startedAt
          };
        });

        setUser({
          ...userData,
          matches: matchesData.slice(0, 15)
        });
      } catch (error) {
        console.error("Erreur de chargement des données:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const res = await api.get("/api/questions/themes");
        setThemes(res.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des thèmes :", error);
      }
    };

    fetchThemes();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-white text-xl">Chargement en cours...</div>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-red-500 text-xl">Utilisateur introuvable</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6 text-white relative overflow-hidden">
      <SuccessMessage 
        isVisible={showSuccessMessage} 
        username={user.username} 
      />

      <ChallengeDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        themes={themes}
        theme={theme}
        setTheme={setTheme}
        questionCount={questionCount}
        setQuestionCount={setQuestionCount}
        onSubmit={handleChallenge}
      />

      <div className="max-w-6xl mx-auto space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <ProfileHeader 
            user={user} 
            onChallengeClick={() => setShowDrawer(true)} 
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <StatsSection user={user} />
            {user.matches && (
              <RecentMatches 
                matches={user.matches} 
                currentUserId={userId || ''} 
              />
            )}
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <RankingsSection rank={user.rank} />
            <Achievements user={user} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};