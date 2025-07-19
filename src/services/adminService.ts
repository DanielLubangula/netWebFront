import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/admin`;

// Dashboard
export const getDashboardStats = async () => {
  const res = await axios.get(`${API_URL}/dashboard`, { withCredentials: true });
  return res.data;
};

// Users
export const getAllUsers = async () => {
  const res = await axios.get(`${API_URL}/users`, { withCredentials: true });
  return res.data;
};
export const updateUser = async (id: string, data: any) => {
  const res = await axios.put(`${API_URL}/users/${id}`, data, { withCredentials: true });
  return res.data;
};
export const deleteUser = async (id: string) => {
  const res = await axios.delete(`${API_URL}/users/${id}`, { withCredentials: true });
  return res.data;
};

// Themes
export const getThemes = async () => {
  const res = await axios.get(`${API_URL}/themes`, { withCredentials: true });
  return res.data;
};
export const createTheme = async (theme: string, content: string) => {
  const res = await axios.post(`${API_URL}/themes`, { theme, content }, { withCredentials: true });
  return res.data;
};
export const updateTheme = async (theme: string, content: string) => {
  const res = await axios.put(`${API_URL}/themes`, { theme, content }, { withCredentials: true });
  return res.data;
};
export const deleteTheme = async (theme: string) => {
  const res = await axios.delete(`${API_URL}/themes/${theme}`, { withCredentials: true });
  return res.data;
};

// Global settings
export const getGlobalSettings = async () => {
  const res = await axios.get(`${API_URL}/settings`, { withCredentials: true });
  return res.data;
};
export const updateGlobalSettings = async (data: any) => {
  const res = await axios.put(`${API_URL}/settings`, data, { withCredentials: true });
  return res.data;
}; 