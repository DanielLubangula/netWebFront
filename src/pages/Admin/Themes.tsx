import React, { useEffect, useState } from 'react';
import { getThemes, createTheme, updateTheme, deleteTheme } from '../../services/adminService';
import { fetchApi } from '../../services/api';

export const Themes: React.FC = () => {
  const [themes, setThemes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<string | null>(null);
  const [themeName, setThemeName] = useState('');
  const [themeContent, setThemeContent] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchThemes = () => {
    setLoading(true);
    getThemes()
      .then(setThemes)
      .catch(() => setError('Erreur lors du chargement des thèmes.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  // Pour édition, on va charger le contenu du thème (API questions existante)
  const loadThemeContent = async (theme: string) => {
    setShowEdit(theme);
    setThemeName(theme);
    setThemeContent('');
    setLoading(true);
    try {
      const res = await fetchApi(`/api/questions/theme/${theme}`);
      const data = await res.json();
      setThemeContent(data.content || '');
    } catch {
      setThemeContent('Erreur lors du chargement du contenu.');
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    setSaving(true);
    await createTheme(themeName, themeContent);
    setShowAdd(false);
    setThemeName('');
    setThemeContent('');
    setSaving(false);
    fetchThemes();
  };

  const handleEdit = async () => {
    setSaving(true);
    await updateTheme(themeName, themeContent);
    setShowEdit(null);
    setThemeName('');
    setThemeContent('');
    setSaving(false);
    fetchThemes();
  };

  const handleDelete = async (theme: string) => {
    if (!window.confirm('Supprimer ce thème ?')) return;
    await deleteTheme(theme);
    fetchThemes();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Gestion des Thèmes</h1>
      {loading && <p className="text-gray-400">Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-4"
        onClick={() => { setShowAdd(true); setThemeName(''); setThemeContent(''); }}
      >
        Ajouter un thème
      </button>
      <table className="w-full bg-gray-800 rounded-xl overflow-hidden mt-2">
        <thead>
          <tr className="bg-gray-700 text-gray-200">
            <th className="p-3 text-left">Nom du thème</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {themes.map((theme) => (
            <tr key={theme} className="border-b border-gray-700 hover:bg-gray-700/50">
              <td className="p-3">{theme}</td>
              <td className="p-3 flex gap-2 justify-center">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                  onClick={() => loadThemeContent(theme)}
                >
                  Éditer
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                  onClick={() => handleDelete(theme)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale d'ajout */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Ajouter un thème</h2>
            <label className="block mb-2">Nom du thème</label>
            <input
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700"
              value={themeName}
              onChange={e => setThemeName(e.target.value)}
            />
            <label className="block mb-2">Contenu (Markdown)</label>
            <textarea
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 min-h-[120px]"
              value={themeContent}
              onChange={e => setThemeContent(e.target.value)}
            />
            <div className="flex gap-4 justify-end mt-6">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowAdd(false)}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleAdd}
                disabled={saving}
              >
                {saving ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale d'édition */}
      {showEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-8 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Éditer le thème</h2>
            <label className="block mb-2">Nom du thème</label>
            <input
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700"
              value={themeName}
              onChange={e => setThemeName(e.target.value)}
              disabled
            />
            <label className="block mb-2">Contenu (Markdown)</label>
            <textarea
              className="w-full mb-4 p-2 rounded bg-gray-800 border border-gray-700 min-h-[120px]"
              value={themeContent}
              onChange={e => setThemeContent(e.target.value)}
            />
            <div className="flex gap-4 justify-end mt-6">
              <button
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
                onClick={() => setShowEdit(null)}
                disabled={saving}
              >
                Annuler
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                onClick={handleEdit}
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