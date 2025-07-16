// Centralisation de l'URL de base de l'API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

import axios from 'axios';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// fetchApi wrapper pour fetch avec baseURL
export async function fetchApi(input: string, init?: RequestInit) {
  const url = input.startsWith('http') ? input : `${API_BASE_URL}${input.startsWith('/') ? '' : '/'}${input}`;
  return fetch(url, init);
} 

