import React, { useState } from 'react';
import axios from 'axios';
import Toast from '../../components/ui/Toast';

const API_URL = import.meta.env.VITE_API_URL || 'https://netwebback.onrender.com/api/notifications';

const typeOptions = [
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Succès' },
  { value: 'warning', label: 'Avertissement' },
  { value: 'error', label: 'Erreur' },
  { value: 'challenge', label: 'Défi' },
];

const SendNotification: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [target, setTarget] = useState<'all' | 'user'>('all');
  const [userId, setUserId] = useState('');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!token) throw new Error('Non autorisé');
      if (!title || !message) throw new Error('Titre et message requis');
      if (target === 'user' && !userId) throw new Error('ID utilisateur requis');
      if (target === 'all') {
        console.log("API_URL : ", API_URL)
        await axios.post(`${API_URL}/admin/broadcast`, { title, message, type }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      } else {
        await axios.post(API_URL, { userId, title, message, type }, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
      }
      setToast({ message: 'Notification envoyée !', type: 'success' });
      setTitle(''); setMessage(''); setUserId('');
    } catch (err: any) {
      setToast({ message: err?.response?.data?.error || err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-white">Envoyer une notification</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-300 mb-1">Titre</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Message</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Type</label>
          <select value={type} onChange={e => setType(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white">
            {typeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-gray-300 mb-1">Cible</label>
          <select value={target} onChange={e => setTarget(e.target.value as 'all' | 'user')} className="w-full p-2 rounded bg-gray-700 text-white">
            <option value="all">Tous les utilisateurs</option>
            <option value="user">Utilisateur spécifique</option>
          </select>
        </div>
        {target === 'user' && (
          <div>
            <label className="block text-gray-300 mb-1">ID de l'utilisateur</label>
            <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full p-2 rounded bg-gray-700 text-white" required />
          </div>
        )}
        <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold w-full mt-4 disabled:opacity-50">
          {loading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default SendNotification; 