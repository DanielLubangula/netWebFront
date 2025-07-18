import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://netwebback.onrender.com${url}`;
}

type Match = {
  roomId: string;
  players: Array<{ username: string; profilePicture?: string }>; // Peut-être adapter selon le back
  theme: string;
  createdAt: string;
};

const LiveMatches: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit("getLiveMatches");
    socket.on("liveMatchesList", (data) => {
      if (Array.isArray(data)) setMatches(data);
      setLoading(false);
    });
    return () => {
      socket.off("liveMatchesList");
    };
  }, []);

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Matchs en direct</h2>
      {matches.length === 0 ? (
        <div>Aucun match en direct</div>
      ) : (
        <ul>
          {matches.map((match) => (
            <li
              key={match.roomId}
              className="cursor-pointer border p-4 my-4 rounded-lg hover:bg-gray-100 bg-gray-800 flex flex-col gap-2 shadow"
              onClick={() => navigate(`/challenge/room/${match.roomId}`)}
            >
              <div className="flex items-center justify-center gap-6">
                {/* Joueur 1 */}
                <div className="flex flex-col items-center">
                  <img
                    src={getCleanImageUrl(match.players[0]?.profilePicture)}
                    alt={match.players[0]?.username}
                    className="w-12 h-12 rounded-full border-2 border-blue-500 mb-1"
                  />
                  <span className="font-bold text-sm text-center">{match.players[0]?.username}</span>
                </div>
                <span className="font-bold text-lg text-gray-400">VS</span>
                {/* Joueur 2 */}
                <div className="flex flex-col items-center">
                  <img
                    src={getCleanImageUrl(match.players[1]?.profilePicture)}
                    alt={match.players[1]?.username}
                    className="w-12 h-12 rounded-full border-2 border-red-500 mb-1"
                  />
                  <span className="font-bold text-sm text-center">{match.players[1]?.username}</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Thème : <b className="text-white">{match.theme}</b></span>
                <span>Début : {new Date(match.createdAt).toLocaleTimeString()}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveMatches; 