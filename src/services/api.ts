// Centralisation de l'URL de base de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

import axios from 'axios';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
}); 

// Intercepteur pour ajouter automatiquement le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide, rediriger vers la page de connexion
      localStorage.removeItem('token');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// fetchApi wrapper pour fetch avec baseURL
export async function fetchApi(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${API_BASE_URL}${input.startsWith('/') ? '' : '/'}${input}`;
  return fetch(url, init);
}

// Récupérer les statistiques du dashboard admin
export async function getDashboardStats() {
  const response = await api.get('/api/admin/dashboard');
  return response.data; 
}

// Récupérer les matchs terminés récents
export async function getRecentCompletedMatches() {
  const response = await api.get('/api/all-matches/completed/recent');
  return response.data;
} 

