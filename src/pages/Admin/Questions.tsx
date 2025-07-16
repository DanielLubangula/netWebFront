import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Textarea } from '../../components/ui/textarea';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Loader } from 'lucide-react';
import { fetchApi } from '../../services/api';

export const Questions: React.FC = () => {
  const [markdown, setMarkdown] = useState('');
  const [theme, setTheme] = useState('');
  const [loading, setLoading] = useState(false);
  const [themes, setThemes] = useState<string[]>([]); // État pour stocker les thèmes existants
  const [loadingThemes, setLoadingThemes] = useState(false); // État pour le chargement des thèmes
  const navigate = useNavigate(); // Utilisé pour la navigation

  // Fonction pour récupérer les thèmes depuis le serveur
  const fetchThemes = async () => {
    setLoadingThemes(true);
    try {
      const response = await fetchApi('/api/questions/themes');
      if (!response.ok) throw new Error('Erreur lors de la récupération des thèmes');
      const data = await response.json();
      setThemes(data); // Stocke les thèmes dans l'état
    } catch (error) {
      console.error('Erreur lors de la récupération des thèmes', error);
      alert("Échec de la récupération des thèmes");
    } finally {
      setLoadingThemes(false);
    }
  };

  // Récupère les thèmes au chargement du composant
  useEffect(() => {
    fetchThemes();
  }, []);

  const handleSave = async () => {
    if (!theme.trim() || !markdown.trim()) {
      alert('Veuillez remplir le thème et la question.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchApi('/api/questions/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          theme,
          content: markdown,
        }),
      });

      if (!response.ok) throw new Error('Erreur serveur');
      alert('Question enregistrée avec succès !');
      setMarkdown('');
      setTheme('');
      fetchThemes(); // Recharge les thèmes après l'enregistrement
    } catch (error) {
      console.error('Erreur lors de l’enregistrement', error);
      alert("Échec de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-4xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold">Gestion des Questions</h1>
      <p className="text-sm sm:text-base text-gray-400">
        Ajoutez vos questions en Markdown. Le fichier sera créé ou mis à jour selon le thème.
      </p>

      {/* Liste des thèmes existants */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-semibold block mb-2">Thèmes existants</label>
          {loadingThemes ? (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Chargement des thèmes...
            </div>
          ) : themes.length > 0 ? (
            <ul className="list-disc pl-5 text-sm text-gray-300">
              {themes.map((theme, index) => (
                <li key={index}>
                  <button
                    onClick={() => navigate(`/admin/questions/theme/${theme}`)}
                    className="text-blue-400 hover:underline"
                  >
                    {theme}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">Aucun thème disponible.</p>
          )}
        </CardContent>
      </Card>

      {/* Saisie du thème */}
      <Card>
        <CardContent className="p-4">
          <label className="text-sm font-semibold block mb-2">Thème (ex : modèle-osi)</label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-sm text-white"
            placeholder="Nom du thème (ex : modèle-osi)"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Éditeur Markdown */}
        <Card className="h-full">
          <CardContent className="p-4">
            <label className="text-sm font-semibold mb-2 block">Éditeur Markdown</label>
            <Textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows={20}
              className="w-full text-sm"
              placeholder="### QCM\n**Question :**\n...\n"
            />
          </CardContent>
        </Card>

        {/* Aperçu Markdown */}
        <Card className="h-full overflow-auto">
          <CardContent className="p-4">
            <label className="text-sm font-semibold mb-2 block">Aperçu</label>
            <div className="prose prose-sm sm:prose-base max-w-full text-gray-200">
              <ReactMarkdown>{markdown || '_Prévisualisation..._'}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton Sauvegarder */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          className="w-full sm:w-auto flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" /> Enregistrement...
            </>
          ) : (
            'Sauvegarder'
          )}
        </Button>
      </div>
    </div>
  );
};


