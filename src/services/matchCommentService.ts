import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/match-comments`;

export interface MatchComment {
  _id: string;
  matchId: string;
  author: {
    _id: string;
    username: string;
    profilePicture?: string;
  };
  message: string;
  createdAt: string;
}

// Fonction pour nettoyer et valider l'ID de match
const cleanMatchId = (matchId: string): string => {
  // Si l'ID contient des caractères non-hexadécimaux, on le traite comme un ID personnalisé
  if (matchId.includes('_') || matchId.length !== 24) {
    console.log('Using custom match ID format:', matchId);
    return matchId;
  }
  return matchId;
};

export const getMatchComments = async (matchId: string, token: string) => {
  try {
    const cleanedMatchId = cleanMatchId(matchId);
    console.log('Fetching comments for match:', cleanedMatchId);
    const res = await axios.get(`${API_URL}/${cleanedMatchId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    console.log('Comments fetched successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
};

export const addMatchComment = async (matchId: string, message: string, token: string) => {
  try {
    const cleanedMatchId = cleanMatchId(matchId);
    console.log('Adding comment for match:', cleanedMatchId);
    console.log('Message:', message);
    console.log('API URL:', `${API_URL}/${cleanedMatchId}`);
    
    const res = await axios.post(`${API_URL}/${cleanedMatchId}`, { message }, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    
    console.log('Comment added successfully:', res.data);
    return res.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    throw error;
  }
};

export const deleteMatchComment = async (commentId: string, token: string) => {
  try {
    console.log('Deleting comment:', commentId);
    const res = await axios.delete(`${API_URL}/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    console.log('Comment deleted successfully');
    return res.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}; 