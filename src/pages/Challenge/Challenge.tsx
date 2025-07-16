import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../../socket";

export const ChallengeRoom = () => {
  const { roomId } = useParams();
  const socket = getSocket();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit("joinRoom", { roomId });

    socket.on("messageInRoom", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit("leaveRoom", { roomId });
      socket.off("messageInRoom");
    };
  }, [socket, roomId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("messageInRoom", { roomId, text: input });
    setMessages((prev) => [...prev, { text: input, self: true }]);
    setInput("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col p-4">
      <h1 className="text-xl sm:text-2xl font-bold text-center mb-4">Salon de jeu - {roomId}</h1>

      <div className="flex-1 overflow-y-auto border border-gray-700 rounded p-4 bg-gray-800 space-y-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-2 rounded-md max-w-xs ${
              msg.self ? "ml-auto bg-blue-600" : "mr-auto bg-gray-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          className="flex-1 p-2 rounded bg-gray-700 text-white"
          placeholder="Envoyer un message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-600 hover:bg-blue-700 rounded px-4 py-2"
        >
          Envoyer
        </button>
      </div>
    </div>
  );
};
