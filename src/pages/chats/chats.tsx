import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiCornerUpLeft, FiX } from 'react-icons/fi';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'other';
  timestamp: Date;
  replyTo?: {
    id: string;
    text: string;
    sender: 'user' | 'other';
  };
};

const ChatApp: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Bonjour ! Comment puis-je vous aider aujourd\'hui ?',
      sender: 'other', 
      timestamp: new Date(Date.now() - 3600000),
    },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: replyingTo.sender,
        },
      }),
    };

    setMessages([...messages, message]);
    setNewMessage('');
    setReplyingTo(null);

    // Simuler une réponse après un délai
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: getRandomResponse(),
        sender: 'other',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
    }, 1000 + Math.random() * 2000);
  };

  const getRandomResponse = () => {
    const responses = [
      'Je vois, merci pour votre message.',
      'Pouvez-vous me donner plus de détails ?',
      'Je vais vérifier cela pour vous.',
      'Merci pour votre patience.',
      'Je comprends votre demande.',
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Chat</h1>
      </header>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            onClick={() => setReplyingTo(message)}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 ${message.sender === 'user'
                ? 'bg-indigo-500 text-white rounded-br-none'
                : 'bg-white text-gray-800 rounded-bl-none shadow'
                }`}
            >
              {message.replyTo && (
                <div
                  className={`text-xs p-2 mb-2 rounded ${message.sender === 'user'
                    ? 'bg-indigo-400'
                    : 'bg-gray-100'
                    }`}
                >
                  <div className="font-medium">
                    {message.replyTo.sender === 'user' ? 'Vous' : 'Support'}
                  </div>
                  <div className="truncate">{message.replyTo.text}</div>
                </div>
              )}
              <div>{message.text}</div>
              <div
                className={`text-xs mt-1 ${message.sender === 'user' ? 'text-indigo-100' : 'text-gray-500'
                  }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Zone de réponse en cours */}
      {replyingTo && (
        <div className="bg-gray-100 p-2 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FiCornerUpLeft className="text-gray-500" />
            <div className="text-sm text-gray-600 truncate max-w-xs">
              Réponse à: {replyingTo.text}
            </div>
          </div>
          <button
            onClick={() => setReplyingTo(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez un message..."
              className="w-full border border-gray-300 rounded-full py-2 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none max-h-20"
              rows={1}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full ${newMessage.trim()
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 text-gray-400'
              }`}
          >
            <FiSend />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;