import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Loader } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';

export const ThemeContent: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const [content, setContent] = useState('');
  const [currentName, setCurrentName] = useState(name || '');
  const [newName, setNewName] = useState(name || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Chargement initial
  useEffect(() => {
    const fetchThemeContent = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://netwebback.onrender.com/api/questions/theme/${currentName}`);
        if (!response.ok) throw new Error('Erreur lors de la récupération du contenu du thème');
        const data = await response.json();
        setContent(data.content);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
        else setError('Une erreur inconnue est survenue.');
      } finally {
        setLoading(false);
      }
    };

    fetchThemeContent();
  }, [currentName]);

  // Mise à jour
  const handleUpdate = async () => {
    if (!newName.trim() || !content.trim()) {
      alert('Le nom du thème et le contenu sont requis.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`https://netwebback.onrender.com/api/questions/theme/${currentName}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newName: newName.trim(),
          newContent: content.trim(),
        }),
      });

      if (!response.ok) throw new Error('Erreur lors de la mise à jour');

      alert('Thème mis à jour avec succès !');

      if (newName !== currentName) {
        setCurrentName(newName);
      }
    } catch (err) {
      console.error('Erreur de mise à jour', err);
      alert('Échec de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-400">Chargement...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-5xl mx-auto space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold">Modifier le thème : {currentName}</h1>

      {/* Modifier le nom */}
      <div>
        <label className="text-sm font-semibold block mb-2">Nom du thème</label>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
        />
      </div>

      {/* Zone d'édition + aperçu */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">Contenu Markdown</label>
          <Textarea
            rows={20}
            className="w-full text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold mb-2 block">Aperçu</label>
          <div className="prose prose-sm sm:prose-base max-w-full text-gray-200 bg-gray-900 p-4 rounded-md overflow-auto">
            <ReactMarkdown>{content || '_Prévisualisation vide_'}</ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Bouton d'enregistrement */}
      <div className="flex justify-end">
        <Button
          onClick={handleUpdate}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            'Mettre à jour le thème'
          )}
        </Button>
      </div>
    </div>
  );
};
