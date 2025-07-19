import React, { useEffect, useRef } from 'react';
import { FiMessageCircle, FiTrash2, FiMoreVertical } from 'react-icons/fi';

interface MessageMenuProps {
  messageId: string;
  isOwnMessage: boolean;
  onReply: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const MessageMenu: React.FC<MessageMenuProps> = ({
  messageId,
  isOwnMessage,
  onReply,
  onDelete,
  isOpen,
  onToggle
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle]);

  // console.log('MessageMenu render:', { messageId, isOwnMessage, isOpen });

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className={`p-1 hover:bg-opacity-20 rounded-full transition-colors ${
          isOwnMessage 
            ? 'hover:bg-white text-white hover:text-indigo-600' 
            : 'hover:bg-gray-100 text-gray-500'
        }`}
        aria-label="Options du message"
      >
        <FiMoreVertical className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          <button
            onClick={() => {
              // console.log('Reply clicked');
              onReply();
              onToggle();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 text-gray-700"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span>Répondre</span>
          </button>
          {isOwnMessage && (
            <button
              onClick={() => {
                // console.log('Delete clicked for message:', messageId);
                onDelete();
                onToggle();
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center space-x-2"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageMenu; 