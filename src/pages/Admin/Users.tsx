import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, updateUser } from '../../services/adminService';

interface Rank {
  daily: number;
  weekly: number;
  monthly: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  experience: number;
  level: number;
  gamesPlayed: number;
  totalScore: number;
  profilePicture: string;
  rank: Rank;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<{ username: string; email: string }>({ username: '', email: '' });
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    getAllUsers()
      .then(setUsers)
      .catch(() => setError('Erreur lors du chargement des utilisateurs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    await deleteUser(id);
    fetchUsers();
  };

  const handleEdit = (user: User) => {
    setEditUser(user);
    setEditData({ username: user.username, email: user.email });
  };

  const handleSave = async () => {
    if (!editUser) return;
    setSaving(true);
    await updateUser(editUser._id, editData);
    setEditUser(null);
    setSaving(false);
    fetchUsers();
  };

  return (
    <div className="text-white">
      <h1 className="text-xl md:text-2xl font-bold mb-4">👥 Gestion des Utilisateurs</h1>
      {loading && <p className="text-gray-400">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="overflow-x-auto rounded-lg shadow-md border border-gray-700">
        <table className="min-w-full bg-gray-900">
          <thead>
            <tr className="bg-gray-700 text-xs md:text-sm text-gray-300">
              <th className="p-3 text-left">Profil</th>
              <th className="p-3 text-left">Nom</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Niveau</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-800 border-t border-gray-700 text-xs md:text-sm">
                <td className="p-3">
                  <img
                    src={"http://localhost:5000" + user.profilePicture}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </td>
                <td className="p-3 font-semibold">{user.username}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">Lv {user.level}</td>
                <td className="p-3">{user.totalScore} pts</td>
                <td className="p-3 flex flex-col sm:flex-row gap-2 justify-center items-center">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                    onClick={() => handleEdit(user)}
                  >
                    Éditer
                  </button>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                    onClick={() => handleDelete(user._id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale d'édition */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">✏️ Modifier l'utilisateur</h2>
            <label className="block mb-2 text-sm">Nom d'utilisateur</label>
            <input
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-white"
              value={editData.username}
              onChange={e => setEditData(d => ({ ...d, username: e.target.value }))}
            />
            <label className="block mb-2 text-sm">Email</label>
            <input
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-white"
              value={editData.email}
              onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-1 rounded"
                onClick={() => setEditUser(null)}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
