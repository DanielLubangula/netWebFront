import React, { useEffect, useState } from 'react';
import { getDashboardStats } from '../../services/adminService';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<{ userCount: number; newsCount: number; matchCount: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getDashboardStats()
      .then((data) => {
        setStats(data);
        setError(null);
      })
      .catch(() => setError('Erreur lors du chargement des statistiques.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {loading && <p className="text-gray-400">Chargement des statistiques...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-blue-400">{stats.userCount}</div>
            <div className="text-gray-300 mt-2">Utilisateurs</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-green-400">{stats.newsCount}</div>
            <div className="text-gray-300 mt-2">Actualités</div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <div className="text-4xl font-bold text-purple-400">{stats.matchCount}</div>
            <div className="text-gray-300 mt-2">Matchs</div>
          </div>
        </div>
      )}
    </div>
  );
};