import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, ChevronRight, Flame, Zap, Calendar, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchApi } from '../../../services/api';

interface TopPlayer {
  _id: string;
  username: string;
  profilePicture: string;
  level: number;
  totalScore: number;
}

export const TopPlayers: React.FC = () => {
  const navigate = useNavigate();
  const [topPlayers, setTopPlayers] = useState<TopPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"global" | "daily" | "weekly" | "monthly">("global");

  function getCleanImageUrl(url?: string) {
    if (!url) return '/default-profile.png';
     if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://netwebback.onrender.com${url}`;
  }
  useEffect(() => {
    // Fonction utilitaire pour corriger l'URL d'image
    const fetchTopPlayers = async () => {
      try {
        setLoading(true);
        const response = await fetchApi('/api/profil/leaderboard');
        const data = await response.json();
        console.log("data",data)
        setTopPlayers(data[activeTab].slice(0, 5)); // Prendre les 5 premiers
      } catch (error) {
        console.error("Error fetching top players:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopPlayers();
  }, [activeTab]);



  const getTabIcon = () => {
    switch (activeTab) {
      case "daily": return <Flame className="w-4 h-4" />;
      case "weekly": return <Zap className="w-4 h-4" />;
      case "monthly": return <Calendar className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-3 mx-2 mt-4">
      {/* En-tête avec onglets */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-400 w-5 h-5" />
          <h2 className="text-md font-bold">Meilleurs Joueurs</h2>
          <div className="ml-2 text-blue-400 flex items-center">
            {getTabIcon()}
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as any)}
              className="ml-1 bg-gray-700 text-xs text-white rounded px-1 py-0.5 border border-gray-600"
            >
              <option value="global">Global</option>
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdo</option>
              <option value="monthly">Mensuel</option>
            </select>
          </div>
        </div>
        <button 
          onClick={() => navigate("/leaderboard")} 
          className="text-xs text-blue-400 flex items-center"
        >
          Tout voir <ChevronRight className="w-3 h-3 ml-0.5" />
        </button>
      </div>

      {/* Liste des joueurs */}
      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : topPlayers.length === 0 ? (
        <div className="text-center py-3 text-gray-400 text-sm">
          Aucun joueur trouvé
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto pb-2 hide-scrollbar">
            <div className="flex space-x-3 w-max">
              {topPlayers.map((player, index) => (
                <motion.div
                  key={player._id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/profile/${player._id}`)}
                  className={`flex flex-col items-center rounded-lg p-2 cursor-pointer ${
                    index === 0 
                      ? "bg-gradient-to-br from-yellow-600/20 to-amber-500/20 border border-amber-400" 
                      : "bg-gray-700/50 border border-gray-600"
                  }`}
                  style={{ minWidth: "90px" }}
                >
                  {/* Badge de rang */}
                  <div className={`text-xs flex items-center justify-center w-6 h-6 rounded-full mb-1 ${
                    index === 0 ? "bg-amber-400 text-amber-900" :
                    index === 1 ? "bg-gray-300 text-gray-800" :
                    index === 2 ? "bg-amber-600 text-white" :
                    "bg-gray-600 text-gray-300"
                  }`}>
                    {index === 0 ? <Crown size={12} /> : index + 1}
                  </div>

                  {/* Avatar */}
                  <div className={`${
                    index === 0 
                      ? "w-12 h-12 border-2 border-amber-400 shadow-sm shadow-amber-400/30" 
                      : "w-10 h-10 border border-gray-500"
                  } rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-1 overflow-hidden`}
                  style={{
                    backgroundImage: player.profilePicture ? `url(${getCleanImageUrl(player.profilePicture)})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}>
                    {!player.profilePicture && (
                      <span className="text-white font-bold text-lg">
                        {player.username.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Infos joueur */}
                  <div className="text-center w-full">
                    <p className={`text-xs ${
                      index === 0 ? "text-amber-300 font-semibold" : "text-white"
                    } truncate px-1`}>
                      {player.username}
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <p className="text-[10px] text-gray-400">N.{player.level}</p>
                      {index === 0 && (
                        <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                      )}
                      <p className="text-[10px] text-blue-400">{player.totalScore}pts</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};