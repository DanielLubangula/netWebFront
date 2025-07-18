import React, { useRef, useEffect } from 'react';
import { FiSend, FiCornerUpLeft, FiX } from 'react-icons/fi';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  replyingTo: {
    messageId: string;
    username: string;
    text: string;
  } | null;
  setReplyingTo: (reply: any) => void;
  onSendMessage: () => void;
  sending: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  replyingTo,
  setReplyingTo,
  onSendMessage,
  sending
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize du textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newMessage]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <>
      {/* Zone de réponse en cours */}
      {replyingTo && (
        <div className="bg-gray-100 p-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FiCornerUpLeft className="text-indigo-500" />
              <div className="text-sm text-gray-700">
                <span className="font-medium">Réponse à {replyingTo.username}:</span>
                <span className="ml-2 text-gray-600 truncate max-w-xs">
                  {replyingTo.text}
                </span>
              </div>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Zone de saisie */}
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Écrivez votre message..."
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-900"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={onSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              newMessage.trim() && !sending
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <FiSend className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default MessageInput; 