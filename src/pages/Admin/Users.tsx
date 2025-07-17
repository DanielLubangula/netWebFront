import React, { useEffect, useState } from 'react';
import { getAllUsers, deleteUser, updateUser } from '../../services/adminService';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, ChevronUp, Edit2, Trash2, Info } from 'lucide-react';

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
  bestStreak?: number;
  currentStreak?: number;
  nextLevelExp?: number;
  winRate?: number;
  googleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editData, setEditData] = useState<{ username: string; email: string }>({ username: '', email: '' });
  const [saving, setSaving] = useState(false);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

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

  const toggleUserDetails = (userId: string) => {
    setExpandedUser(expandedUser === userId ? null : userId);
  };

  const getProfilePictureUrl = (profilePicture: string) => {
    if (profilePicture.startsWith('https://')) {
      return profilePicture;
    }
    return `https://netwebback.onrender.com${profilePicture}`;
  };

  return (
    <div className="text-white p-4">
      <h1 className="text-xl md:text-2xl font-bold mb-6">👥 Gestion des Utilisateurs</h1>
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
              <React.Fragment key={user._id}>
                <tr className="hover:bg-gray-800 border-t border-gray-700 text-xs md:text-sm">
                  <td className="p-3">
                    <img
                      src={getProfilePictureUrl(user.profilePicture)}
                      alt={user.username}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                      }}
                    />
                  </td>
                  <td className="p-3 font-semibold">{user.username}</td>
                  <td className="p-3 truncate max-w-[120px] md:max-w-none">{user.email}</td>
                  <td className="p-3">Lv {user.level}</td>
                  <td className="p-3">{user.totalScore} pts</td>
                  <td className="p-3">
                    <div className="flex flex-col sm:flex-row gap-2 justify-center items-center">
                      <button
                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Éditer</span>
                      </button>
                      <button
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                        onClick={() => handleDelete(user._id)}
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                      <button
                        className="flex items-center gap-1 bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs"
                        onClick={() => toggleUserDetails(user._id)}
                      >
                        <Info className="w-3 h-3" />
                        <span className="hidden sm:inline">Détails</span>
                        {expandedUser === user._id ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Détails supplémentaires */}
                <AnimatePresence>
                  {expandedUser === user._id && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="bg-gray-800"
                    >
                      <td colSpan={6} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs md:text-sm">
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">ID Utilisateur</h3>
                            <p className="break-all">{user._id}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Google ID</h3>
                            <p className="break-all">{user.googleId || 'Non connecté avec Google'}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Date de création</h3>
                            <p>{new Date(user.createdAt || '').toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Dernière mise à jour</h3>
                            <p>{new Date(user.updatedAt || '').toLocaleDateString('fr-FR')}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Statistiques</h3>
                            <p>Parties jouées: {user.gamesPlayed}</p>
                            <p>Taux de victoire: {user.winRate || 0}%</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Séries</h3>
                            <p>Meilleure série: {user.bestStreak || 0}</p>
                            <p>Série actuelle: {user.currentStreak || 0}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Expérience</h3>
                            <p>Actuelle: {user.experience}</p>
                            <p>Prochain niveau: {user.nextLevelExp || 0}</p>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-400 mb-1">Classement</h3>
                            <p>Quotidien: #{user.rank.daily}</p>
                            <p>Hebdomadaire: #{user.rank.weekly}</p>
                            <p>Mensuel: #{user.rank.monthly}</p>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modale d'édition */}
      {editUser && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 p-6 rounded-xl w-full max-w-sm border border-gray-700"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">✏️ Modifier l'utilisateur</h2>
              <button onClick={() => setEditUser(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <label className="block mb-2 text-sm">Nom d'utilisateur</label>
            <input
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={editData.username}
              onChange={e => setEditData(d => ({ ...d, username: e.target.value }))}
            />
            <label className="block mb-2 text-sm">Email</label>
            <input
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={editData.email}
              onChange={e => setEditData(d => ({ ...d, email: e.target.value }))}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-1"
                onClick={() => setEditUser(null)}
                disabled={saving}
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-1"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};