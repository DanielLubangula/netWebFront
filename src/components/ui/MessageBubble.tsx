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

  // console.log('MessageBubble render:', { 
  //   messageId: message._id, 
  //   username: message.username, 
  //   isOwnMessage,
  //   showMenu: showMenu === message._id 
  // });

  return (
    <div className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
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
        <div className={`rounded-lg p-3 shadow-sm border ${
          isOwnMessage 
            ? 'bg-indigo-500 text-white border-indigo-400' 
            : 'bg-white text-gray-900 border-gray-200'
        }`}>
          {/* En-tête du message */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className={`font-semibold ${isOwnMessage ? 'text-white' : 'text-gray-900'}`}>
                {message.username}
                {isOwnMessage && <span className="ml-1 text-xs opacity-75">(Vous)</span>}
              </span>
              <span className={`text-xs ${isOwnMessage ? 'text-indigo-100' : 'text-gray-500'}`}>
                {formatTime(message.createdAt)}
              </span>
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
            <div className={`rounded p-2 mb-2 border-l-2 ${
              isOwnMessage 
                ? 'bg-indigo-400 border-indigo-300 text-indigo-900' 
                : 'bg-gray-50 border-indigo-300 text-gray-700'
            }`}>
              <div className={`text-xs mb-1 ${
                isOwnMessage ? 'text-indigo-800' : 'text-gray-600'
              }`}>
                Réponse à <span className="font-medium">{message.replyTo.username}</span>
              </div>
              <div className={`text-sm truncate ${
                isOwnMessage ? 'text-indigo-800' : 'text-gray-700'
              }`}>
                {message.replyTo.text}
              </div>
            </div>
          )}

          {/* Texte du message */}
          <div className={`whitespace-pre-wrap break-words ${
            isOwnMessage ? 'text-white' : 'text-gray-900'
          }`}>
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble; 