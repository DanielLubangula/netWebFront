import axios from 'axios';

const API_URL = 'https://netwebback.onrender.com/api/user';

export const getUserSettings = async () => {
  const res = await axios.get(`${API_URL}/settings`, { withCredentials: true });
  return res.data;
};
export const updateUserSettings = async (settings: any) => {
  const res = await axios.put(`${API_URL}/settings`, settings, { withCredentials: true });
  return res.data;
};

export const getUserProfile = async () => {
  const res = await axios.get(`${API_URL}/profile`, { withCredentials: true });
  return res.data;
};
export const updateUserProfile = async (profile: any) => {
  const res = await axios.put(`${API_URL}/profile`, profile, { withCredentials: true });
  return res.data;
}; 