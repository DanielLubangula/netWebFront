import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService, { PublicMessage } from '../../services/chatService';
import { getSocket } from '../../socket';
import Toast from '../../components/ui/Toast';
import MessageBubble from '../../components/ui/MessageBubble';
import MessageInput from '../../components/ui/MessageInput';

interface ReplyToMessage {
  messageId: string;
  username: string;
  text: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
}

const PublicChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<PublicMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<ReplyToMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Vérifier le token au chargement
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Token présent:', !!token);
    console.log('User:', user);
    
    if (!token) {
      setToast({ message: 'Vous devez être connecté pour accéder au chat', type: 'error' });
      return;
    }
    
    loadMessages();
    joinPublicChat();
    
    return () => {
      leavePublicChat();
    };
  }, [user]);

  // Écouter les nouveaux messages en temps réel
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on('publicMessageReceived', (message: PublicMessage) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('publicMessageDeleted', ({ messageId }: { messageId: string }) => {
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
    });

    socket.on('publicMessageError', ({ message }: { message: string }) => {
      setToast({ message, type: 'error' });
    });

    socket.on('publicMessageSent', ({ message }: { message: string }) => {
      setToast({ message, type: 'success' });
    });

    // Écouter les nouvelles notifications en temps réel
    socket.on('newNotification', (notification: Notification) => {
      console.log('Nouvelle notification reçue:', notification);
      // Afficher une notification toast pour informer l'utilisateur
      setToast({ 
        message: `${notification.title}: ${notification.message}`, 
        type: 'info' 
      });
    });

    return () => {
      socket.off('publicMessageReceived');
      socket.off('publicMessageDeleted');
      socket.off('publicMessageError');
      socket.off('publicMessageSent');
      socket.off('newNotification');
    };
  }, []);

  // Auto-scroll vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setToast({ message: 'Token d\'authentification manquant', type: 'error' });
        return;
      }
      
      const response = await chatService.getPublicMessages();
      setMessages(response.messages);
    } catch (error: unknown) {
      console.error('Erreur détaillée:', error);
      if (error && typeof error === 'object' && 'response' in error && error.response && typeof error.response === 'object' && 'status' in error.response && error.response.status === 401) {
        setToast({ message: 'Session expirée, veuillez vous reconnecter', type: 'error' });
      } else {
        setToast({ message: 'Erreur lors du chargement des messages', type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const joinPublicChat = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('joinPublicChat');
    }
  };

  const leavePublicChat = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('leavePublicChat');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageData = {
        text: newMessage.trim(),
        ...(replyingTo && { replyTo: { messageId: replyingTo.messageId } })
      };

      const socket = getSocket();
      if (socket) {
        socket.emit('newPublicMessage', messageData);
      }
      setNewMessage('');
      setReplyingTo(null);
    } catch {
      setToast({ message: 'Erreur lors de l\'envoi du message', type: 'error' });
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit('deletePublicMessage', { messageId });
      }
      setShowMenu(null);
    } catch {
      setToast({ message: 'Erreur lors de la suppression', type: 'error' });
    }
  };

  const handleReplyToMessage = (message: PublicMessage) => {
    console.log('Réponse à:', message);
    setReplyingTo({
      messageId: message._id,
      username: message.username,
      text: message.text
    });
    setShowMenu(null);
    
    // Scroll vers le message de référence avec un délai pour s'assurer que le DOM est mis à jour
    setTimeout(() => {
      const messageElement = messageRefs.current[message._id];
      console.log('Message element:', messageElement);
      if (messageElement) {
        messageElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        // Ajouter un effet de surbrillance temporaire
        messageElement.classList.add('ring-2', 'ring-indigo-300', 'ring-opacity-50');
        setTimeout(() => {
          messageElement.classList.remove('ring-2', 'ring-indigo-300', 'ring-opacity-50');
        }, 2000);
      }
    }, 200);
  };

  const scrollToBottom = () => {
    console.log('Scrolling to bottom', messagesEndRef.current);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isOwnMessage = (message: PublicMessage) => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn('User data not found in localStorage');
      return false;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user || !user.username) {
        console.warn('User not found or username is missing');
        return false;
      }
      const username = user.username;
      return message.username === username;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  };

  const setMessageRef = (messageId: string, element: HTMLDivElement | null) => {
    messageRefs.current[messageId] = element;
  };

  // Vérifier si l'utilisateur est connecté
  if (!user) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-indigo-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-semibold">Chat Public</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder au chat</p>
            <div className="space-y-2 mb-4">
              <p className="text-sm text-gray-500">Token: {localStorage.getItem('token') ? 'Présent' : 'Absent'}</p>
              <p className="text-sm text-gray-500">User: {user ? 'Connecté' : 'Non connecté'}</p>
            </div>
            <button 
              onClick={() => window.location.href = '/auth'}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <header className="bg-indigo-600 text-white p-4 shadow-md">
          <h1 className="text-xl font-semibold">Chat Public</h1>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-indigo-600 text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Chat Public</h1>
        <p className="text-indigo-200 text-sm">Discutez avec la communauté</p>
      </header>

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const ownMessage = isOwnMessage(message);
          return (
            <div
              key={message._id}
              ref={(el) => setMessageRef(message._id, el)}
              className={`transition-all duration-300 ${
                ownMessage ? 'bg-indigo-50 rounded-lg p-2 -m-2' : ''
              }`}
            >
          <MessageBubble
            message={message}
                isOwnMessage={ownMessage}
            showMenu={showMenu}
            onShowMenu={setShowMenu}
            onReply={handleReplyToMessage}
            onDelete={handleDeleteMessage}
          />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <MessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        onSendMessage={handleSendMessage}
        sending={sending}
      />

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PublicChat; 