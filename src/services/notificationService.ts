import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/notifications`;

export const getNotifications = async (token: string) => {
  const res = await axios.get(API_URL, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  console.log(res.data)
  
  return res.data;
};

export const markNotificationAsRead = async (id: string, token: string) => {
  const res = await axios.patch(`${API_URL}/${id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
};

export const deleteNotification = async (id: string, token: string) => {
  const res = await axios.delete(`${API_URL}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  });
  return res.data;
}; 