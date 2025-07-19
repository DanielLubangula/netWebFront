import axios from 'axios';

export interface NewsInterface {
  _id: string;
  title: string;
  summary: string;
  date: string;
  author: string;
  category: string;
  image: string;
  featured?: boolean;
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/news`;

export const getAllNews = async (): Promise<NewsInterface[]> => {
  const res = await axios.get(`${API_URL}`);
  return res.data.data;
};

export const getFeaturedNews = async (): Promise<{ featured: NewsInterface | null; regular: NewsInterface[] }> => {
  const res = await axios.get(`${API_URL}/featured`);
  return res.data.data;
};

export const getNewsById = async (id: string): Promise<NewsInterface> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data.data;
};

// ADMIN ONLY
export const createNews = async (formData: FormData): Promise<NewsInterface> => {
  const res = await axios.post(`${API_URL}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return res.data.data;
};

export const updateNews = async (id: string, formData: FormData): Promise<NewsInterface> => {
  const res = await axios.put(`${API_URL}/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    withCredentials: true,
  });
  return res.data.data;
};

export const deleteNews = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`, { withCredentials: true });
}; 