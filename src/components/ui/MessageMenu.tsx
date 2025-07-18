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

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={onToggle}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Options du message"
      >
        <FiMoreVertical className="w-4 h-4 text-gray-500" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          <button
            onClick={() => {
              onReply();
              onToggle();
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
          >
            <FiMessageCircle className="w-4 h-4" />
            <span>Répondre</span>
          </button>
          {isOwnMessage && (
            <button
              onClick={() => {
                onDelete();
                onToggle();
              }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
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