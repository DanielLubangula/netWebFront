import React from 'react';
import { PublicMessage } from '../../services/chatService';
import MessageMenu from './MessageMenu';

interface MessageBubbleProps {
  message: PublicMessage;
  isOwnMessage: boolean;
  showMenu: string | null;
  onShowMenu: (messageId: string | null) => void;
  onReply: (message: PublicMessage) => void;
  onDelete: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showMenu,
  onShowMenu,
  onReply,
  onDelete
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="flex items-start space-x-3">
      {/* Photo de profil */}
      <div className="flex-shrink-0">
        <img
          src={message.profilePicture}
          alt={message.username}
          className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/uploads/profil/default_profil.webp';
          }}
        />
      </div>

      {/* Contenu du message */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
          {/* En-tête du message */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-gray-900">{message.username}</span>
              <span className="text-xs text-gray-500">{formatTime(message.createdAt)}</span>
            </div>
            
            {/* Menu des options */}
            <MessageMenu
              messageId={message._id}
              isOwnMessage={isOwnMessage}
              onReply={() => onReply(message)}
              onDelete={() => onDelete(message._id)}
              isOpen={showMenu === message._id}
              onToggle={() => onShowMenu(showMenu === message._id ? null : message._id)}
            />
          </div>

          {/* Message de réponse */}
          {message.replyTo && (
            <div className="bg-gray-50 rounded p-2 mb-2 border-l-2 border-indigo-300">
              <div className="text-xs text-gray-600 mb-1">
                Réponse à <span className="font-medium">{message.replyTo.username}</span>
              </div>
              <div className="text-sm text-gray-700 truncate">
                {message.replyTo.text}
              </div>
            </div>
          )}

          {/* Texte du message */}
          <div className="text-gray-900 whitespace-pre-wrap break-words">
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 