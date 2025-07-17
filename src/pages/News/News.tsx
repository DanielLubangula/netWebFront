import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Calendar, User, ChevronRight } from 'lucide-react';
import { getFeaturedNews, NewsInterface } from '../../services/newsService';

export const News: React.FC = () => {
  const [featuredArticle, setFeaturedArticle] = useState<NewsInterface | null>(null);
  const [regularArticles, setRegularArticles] = useState<NewsInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getFeaturedNews()
      .then((data) => {
        setFeaturedArticle(data.featured);
        setRegularArticles(data.regular);
        setError(null);
      })
      .catch(() => {
        setError('Erreur lors du chargement des actualités.');
      })
      .finally(() => setLoading(false));
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nouveautés': return 'bg-blue-600';
      case 'Mise à jour': return 'bg-green-600';
      case 'Événement': return 'bg-purple-600';
      case 'Éducation': return 'bg-yellow-600';
      case 'Rapport': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Actualités
          </h1>
          <p className="text-xl text-gray-300">
            Restez informé des dernières nouveautés de NetWebQuiz
          </p>
        </motion.div>

        {loading && (
          <div className="text-center text-gray-400 py-12">Chargement des actualités...</div>
        )}
        {error && (
          <div className="text-center text-red-500 py-12">{error}</div>
        )}

        {/* Featured Article */}
        {!loading && !error && featuredArticle && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer group">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={`https://netwebback.onrender.com${featuredArticle.image}`} 
                    alt={featuredArticle.title}
                    className="w-full h-64 md:h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(featuredArticle.category)}`}>
                      {featuredArticle.category}
                    </span>
                    <span className="text-xs bg-yellow-600 text-white px-2 py-1 rounded-full">
                      À la une
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-300 mb-6">
                    {featuredArticle.summary}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(featuredArticle.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {featuredArticle.author}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Articles Grid */}
        {!loading && !error && (
          <div className="grid md:grid-cols-2 gap-6">
            {regularArticles.map((article, index) => (
              <motion.div
                key={article._id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 + index * 0.1 }}
              >
                <div className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 cursor-pointer group hover:scale-105">
                  <img 
                    src={`https://netwebback.onrender.com${article.image}`} 
                    alt={article.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(article.category)}`}>
                        {article.category}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      {article.summary}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {new Date(article.date).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3" />
                        {article.author}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Newsletter Signup */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 bg-gradient-to-r from-blue-900 to-purple-900 rounded-2xl p-8 border border-gray-700 text-center"
        >
          <Newspaper className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Restez informé</h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Recevez les dernières actualités, nouveautés et événements directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors">
              S'abonner
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};