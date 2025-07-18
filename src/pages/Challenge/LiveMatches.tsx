import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../socket";

type Match = {
  roomId: string;
  players: Array<{ username: string; profilePicture?: string }>;
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
              className="cursor-pointer border p-2 my-2 rounded hover:bg-gray-100"
              onClick={() => navigate(`/challenge/room/${match.roomId}`)}
            >
              <div>
                <b>Thème :</b> {match.theme}
              </div>
              <div>
                <b>Joueurs :</b> {match.players.map((p) => p.username).join(" vs ")}
              </div>
              <div>
                <b>Début :</b> {new Date(match.createdAt).toLocaleTimeString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LiveMatches; 