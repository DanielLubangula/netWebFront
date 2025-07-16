import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Circle, User, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../../socket"; // adapte le chemin

// Définir le type pour les joueurs en ligne
interface OnlinePlayer {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  level: number;
  socketId: string;
}

export const OnlinePlayers: React.FC = () => {
  const navigate = useNavigate();
  const [onlinePlayers, setOnlinePlayers] = useState<OnlinePlayer[]>([]);
  const [loading, setLoading] = useState(false); // État pour gérer le chargement

  const fetchOnlinePlayers = async () => {
    const socket = getSocket();
    if (!socket) {
      // const resp = await fetch('http://localhost:5000/api/online-users');
      // const data = await resp.json();
      // console.log('socket non dispo')
      // setOnlinePlayers(data);
      // setLoading(false); // Désactiver le chargement
      return; // Si le socket n'est pas disponible, on utilise l'API
    
    }

    setLoading(true); // Activer le chargement
    
    socket.emit("getOnlineUsers", "Demande de liste des utilisateurs connectés");

    const handleOnlineUsers = (users: OnlinePlayer[]) => {
      setOnlinePlayers(users);
      setLoading(false); // Désactiver le chargement
    };

    socket.on("onlineUsersList", handleOnlineUsers);

    // Nettoyage
    return () => {
      socket.off("onlineUsersList", handleOnlineUsers);
    };
  };

  useEffect(() => {
    fetchOnlinePlayers(); // Charger les joueurs en ligne au montage
  }, []);

  return (          
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-gray-800 rounded-lg md:rounded-2xl p-4 md:p-6 border border-gray-700 mx-2 md:mx-0"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
          <h2 className="text-lg md:text-xl font-bold truncate">Joueurs en ligne</h2>
          <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 md:px-2 md:py-1 rounded-full whitespace-nowrap">
            {onlinePlayers.length} en ligne
          </span>
        </div>
        <button
          onClick={fetchOnlinePlayers}
          disabled={loading}
          className={`p-2 rounded-full transition-colors ${
            loading
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          <RefreshCcw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Liste des joueurs */}
      <div className="space-y-2 md:space-y-3">
        {onlinePlayers.map((player, index) => (
          <motion.div
            key={player._id}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => navigate(`/profile/${player._id}`)} // ➤ Redirection dynamique
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                backgroundImage: player.profilePicture
                  ? `url(${player.profilePicture})`
                  : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {!player.profilePicture && <User className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </div>

            {/* Infos joueur */}
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-1 md:gap-2">
                <span className="font-medium text-sm md:text-base truncate">
                  {player.username}
                </span>
                <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded whitespace-nowrap">
                  N.{player.level}
                </span>
              </div>
              <div className="flex items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-400">
                <Circle className="w-3 h-3 flex-shrink-0 text-green-400" />
                <span className="truncate">En ligne</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bouton voir tous */}
      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-700">
        <button
          onClick={() => navigate("/players/online")}
          className="w-full bg-blue-600 hover:bg-blue-700 py-1.5 md:py-2 rounded-lg text-sm md:text-base font-medium transition-colors active:scale-95"
        >
          Voir tous les joueurs
        </button>
      </div>
    </motion.div>
  );
};
