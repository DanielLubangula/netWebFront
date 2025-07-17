import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Trash2, Edit, Plus, Loader2, X, Check } from 'lucide-react';
import { motion } from "framer-motion";

interface NewsItem {
  _id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  category: string;
  image: string;
  featured: boolean;
  date: string;
}

const NewsManager: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentNews, setCurrentNews] = useState<Partial<NewsItem>>({
    title: '',
    summary: '',
    content: '',
    author: '',
    category: 'Nouveautés',
    featured: false
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const categories = ['Nouveautés', 'Mise à jour', 'Événement', 'Éducation', 'Rapport'];

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/news/featured');
      setFeaturedNews(response.data.data.featured);
      setNews(response.data.data.regular);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des actualités');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentNews(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setCurrentNews(prev => ({ ...prev, [name]: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', currentNews.title || '');
      formData.append('summary', currentNews.summary || '');
      formData.append('content', currentNews.content || '');
      formData.append('author', currentNews.author || '');
      formData.append('category', currentNews.category || 'Nouveautés');
      formData.append('featured', String(currentNews.featured || false));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (currentNews._id) {
        // Mise à jour
        await api.put(`/api/news/${currentNews._id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Création
        await api.post('https://netwebback.onrender.com/api/news', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
      }

      resetForm();
      fetchNews();
    } catch (err) {
      setError('Erreur lors de la sauvegarde. Vérifiez que tous les champs requis sont remplis.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (newsItem: NewsItem) => {
    setCurrentNews(newsItem);
    setImagePreview(newsItem.image ? `https://netwebback.onrender.com${newsItem.image}` : null);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette actualité ?')) return;
    
    try {
      setLoading(true);
      await api.delete(`/api/news/${id}`);
      fetchNews();
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentNews({
      title: '',
      summary: '',
      content: '',
      author: '',
      category: 'Nouveautés',
      featured: false
    });
    setImagePreview(null);
    setImageFile(null);
    setIsEditing(false);
    setShowForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Gestion des Actualités</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-700">
            {isEditing ? 'Modifier une actualité' : 'Liste des actualités'}
          </h2>
          <button
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            {showForm ? <X className="mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
            {showForm ? 'Annuler' : 'Ajouter'}
          </button>
        </div>

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-md p-6 mb-8"
          >
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 mb-2">Titre *</label>
                  <input
                    style={{color: 'black'}}
                    type="text"
                    name="title"
                    value={currentNews.title || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={120}
                  />
                  <p className="text-xs text-gray-500 mt-1">{currentNews.title?.length || 0}/120 caractères</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Auteur *</label>
                  <input
                    type="text"
                    name="author"
                    style={{color: 'black'}}
                    value={currentNews.author || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-1">{currentNews.author?.length || 0}/50 caractères</p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Catégorie *</label>
                  <select
                    name="category"
                    value={currentNews.category || 'Nouveautés'}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2">Image *</label>
                  <input
                    style={{color: 'black'}}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={!isEditing}
                  />
                </div>

                <div className="flex items-center">
                  <input
                    style={{color: 'black'}}
                    type="checkbox"
                    name="featured"
                    checked={currentNews.featured || false}
                    onChange={handleCheckboxChange}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label className="ml-2 text-gray-700">À la une</label>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Résumé *</label>
                  <textarea
                    name="summary"
                    style={{color: 'black'}}
                    value={currentNews.summary || ''}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    maxLength={300}
                  />
                  <p className="text-xs text-gray-500 mt-1">{currentNews.summary?.length || 0}/300 caractères</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-gray-700 mb-2">Contenu *</label>
                  <textarea
                    name="content"
                    style={{color: 'black'}}
                    value={currentNews.content || ''}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {imagePreview && (
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 mb-2">Aperçu de l'image</label>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" size={18} />
                  ) : (
                    <Check className="mr-2" size={18} />
                  )}
                  {isEditing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {loading && !showForm ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : (
          <>
            {featuredNews && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">À la une</h3>
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={`https://netwebback.onrender.com${featuredNews.image}`}
                    alt={featuredNews.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{featuredNews.title}</h3>
                        <p className="text-gray-600 mb-2">{formatDate(featuredNews.date)}</p>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
                          {featuredNews.category}
                        </span>
                      </div>
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        À la une
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2 font-medium">{featuredNews.summary}</p>
                    <p className="text-gray-700 mb-4">{featuredNews.content.substring(0, 200)}...</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500">Par {featuredNews.author}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(featuredNews)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(featuredNews._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <h3 className="text-lg font-semibold text-gray-700 mb-4">Autres actualités</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map(item => (
                <div key={item._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={`https://netwebback.onrender.com${item.image}`}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-800">{item.title}</h3>
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">{formatDate(item.date)}</p>
                    <p className="text-gray-700 font-medium mb-2">{item.summary.substring(0, 80)}...</p>
                    <p className="text-gray-700 mb-4 text-sm">{item.content.substring(0, 100)}...</p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">Par {item.author}</p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NewsManager;