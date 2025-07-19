import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, MessageCircle, User } from 'lucide-react';
import { getMatchComments, addMatchComment, deleteMatchComment, MatchComment } from '../../../services/matchCommentService';
import { useAuth } from '../../../context/AuthContext';
import dayjs from 'dayjs';
import 'dayjs/locale/fr';

interface MatchCommentsProps {
  matchId: string;
  isVisible: boolean;
}

export const MatchComments: React.FC<MatchCommentsProps> = ({ matchId, isVisible }) => {
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isVisible && matchId) {
      loadComments();
    }
  }, [isVisible, matchId]);

  const loadComments = async () => {
     const token = localStorage.getItem("token");
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const data = await getMatchComments(matchId, token);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
      setError('Erreur lors du chargement des commentaires');
    } finally {
      setLoading(false);
    }
  };

  const handleSendComment = async () => {
    if (!newMessage.trim()) {
      setError('Le message ne peut pas être vide');
      return;
    }
     const token = localStorage.getItem("token");
    
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    setSending(true);
    setError(null);
    try {
      console.log('Sending comment:', { matchId, message: newMessage.trim() });
      const token = localStorage.getItem("token");
      if (!token){
        return alert('Votre session a expiré réconnectez vous')
      }
      const newComment = await addMatchComment(matchId, newMessage.trim(), token);
      setComments(prev => [newComment, ...prev]);
      setNewMessage('');
      console.log('Comment sent successfully');
    } catch (error) {
      console.error('Error sending comment:', error);
      setError('Erreur lors de l\'envoi du commentaire');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
     const token = localStorage.getItem("token");
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }

    try {
      await deleteMatchComment(commentId, token);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Erreur lors de la suppression du commentaire');
    }
  };

  const formatTime = (dateString: string) => {
    return dayjs(dateString).locale('fr').format('DD/MM/YYYY à HH:mm');
  };

  const getCleanImageUrl = (url?: string) => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    if (!url) return '/default-profile.png';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `${API_BASE_URL}${url}`;
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-gray-800 rounded-lg p-4 border border-gray-700"
    >
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Commentaires</h3>
        <span className="text-sm text-gray-400">({comments.length})</span>
      </div>

      {/* Zone de saisie */}
      <div className="mb-4">
        {error && (
          <div className="mb-3 p-2 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendComment()}
            placeholder="Ajouter un commentaire..."
            className="flex-1 bg-gray-700 text-white px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none text-sm sm:text-base"
            maxLength={500}
          />
          <button
            onClick={handleSendComment}
            disabled={sending || !newMessage.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 transition-colors text-sm sm:text-base whitespace-nowrap"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{sending ? 'Envoi...' : 'Envoyer'}</span>
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {newMessage.length}/500 caractères
        </div>
      </div>

      {/* Liste des commentaires */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center text-gray-400 py-4">
            Chargement des commentaires...
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            Aucun commentaire pour le moment. Soyez le premier à commenter !
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-700 rounded-lg p-3"
              >
                <div className="flex items-start gap-3">
                  {/* Photo de profil */}
                  <div className="flex-shrink-0">
                    <img
                      src={getCleanImageUrl(comment.author.profilePicture)}
                      alt={comment.author.username}
                      className="w-8 h-8 rounded-full object-cover border border-gray-600"
                    />
                  </div>

                  {/* Contenu du commentaire */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {comment.author.username}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-200 text-sm break-words">
                      {comment.message}
                    </p>
                  </div>

                  {/* Bouton supprimer (seulement pour l'auteur) */}
                  {user?.id === comment.author._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors p-1"
                      title="Supprimer le commentaire"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}; 