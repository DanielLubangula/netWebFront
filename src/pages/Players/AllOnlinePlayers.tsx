import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Circle, User, RefreshCcw, ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../socket"; // adapte le chemin
import { fetchApi } from '../../services/api';

// Définir le type pour les joueurs en ligne
interface OnlinePlayer {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  level: number;
  socketId: string;
}

export const AllOnlinePlayers: React.FC = () => {
  const navigate = useNavigate();
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  function getCleanImageUrl(url?: string) {
    if (!url) return '/default-profile.png';
    console.log("url", url)
    console.log("url.startsWith('http://')", url.startsWith('http://'))
    console.log("url.startsWith('https://')", url.startsWith('https://'))
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://netwebback.onrender.com${url}`;
  }

  const fetchOnlinePlayers = async () => {
    const socket = getSocket();
    setLoading(true);
    
    if (!socket) {
      // Fallback si le socket n'est pas disponible
      try {
        const resp = await fetchApi('/api/online-users');
        const data = await resp.json();
        setOnlinePlayers(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des joueurs en ligne", error);
      } finally {
        setLoading(false);
      }
      return;
    }

    socket.emit("getOnlineUsers", "Demande de liste des utilisateurs connectés");

    const handleOnlineUsers = (users: OnlinePlayer[]) => {
      setOnlinePlayers(users);
      setLoading(false);
    };

    socket.on("onlineUsersList", handleOnlineUsers);

    // Nettoyage
    return () => {
      socket.off("onlineUsersList", handleOnlineUsers);
    };
  };

  useEffect(() => {
    fetchOnlinePlayers();
  }, []);

  // Filtrer les joueurs en fonction de la recherche
  const filteredPlayers = onlinePlayers.filter(player =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20">
      {/* Header fixe */}
      <header className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="text-blue-400" />
            Joueurs en ligne
          </h1>
          
          <button
            onClick={fetchOnlinePlayers}
            disabled={loading}
            className={`p-2 rounded-full ${loading ? "text-gray-500" : "text-blue-400 hover:bg-gray-700"}`}
          >
            <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
        
        {/* Barre de recherche */}
        <div className="mt-3 relative">
          <input
            type="text"
            placeholder="Rechercher un joueur..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-700 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Compteur */}
        <div className="mt-2 flex justify-between items-center text-sm text-gray-400">
          <span>{filteredPlayers.length} joueur(s) trouvé(s)</span>
          <span className="flex items-center gap-1">
            <Circle className="w-3 h-3 text-green-400" />
            {onlinePlayers.length} en ligne
          </span>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-10">
            <div className="mx-auto w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Users className="w-12 h-12 text-gray-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-300">
              {searchQuery ? "Aucun joueur trouvé" : "Aucun joueur en ligne"}
            </h3>
            <p className="text-gray-500 mt-1">
              {searchQuery 
                ? "Essayez une autre recherche" 
                : "Revenez plus tard pour voir les joueurs connectés"}
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 gap-3"
          >
            {filteredPlayers.map((player, index) => (
              <motion.div
                key={player._id}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                onClick={() => navigate(`/profile/${player._id}`)}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundImage: player.profilePicture
                        ? `url(${getCleanImageUrl(player.profilePicture)})`
                        : "none",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {!player.profilePicture && <User className="w-5 h-5 text-white" />}
                  </div>

                  {/* Infos joueur */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium truncate">{player.username}</h3>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap">
                        N.{player.level}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                      <Circle className="w-3 h-3 text-green-400" />
                      <span>En ligne</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
};