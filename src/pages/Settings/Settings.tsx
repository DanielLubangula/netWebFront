import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Volume2, Globe, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserSettings {
  username: string;
  email: string;
  notifications: {
    challenges: boolean;
    achievements: boolean;
    tournaments: boolean;
    news: boolean;
  };
  privacy: {
    showProfile: boolean;
    showStats: boolean;
    allowChallenges: boolean;
  };
  preferences: {
    theme: string;
    language: string;
    soundEffects: boolean;
    animations: boolean;
  };
}

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState<UserSettings>({
    username: '',
    email: '',
    notifications: {
      challenges: true,
      achievements: true,
      tournaments: false,
      news: true
    },
    privacy: {
      showProfile: true,
      showStats: true,
      allowChallenges: true
    },
    preferences: {
      theme: 'dark',
      language: 'fr',
      soundEffects: true,
      animations: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Confidentialité', icon: Shield },
    { id: 'preferences', label: 'Préférences', icon: Palette },
  ];
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [profileRes, settingsRes] = await Promise.all([
          api.get('/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          api.get('/api/user/settings', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setSettings({
          username: profileRes.data.username || '',
          email: profileRes.data.email || '',
          notifications: settingsRes.data.notifications || {
            challenges: true,
            achievements: true,
            tournaments: false,
            news: true
          },
          privacy: settingsRes.data.privacy || {
            showProfile: true,
            showStats: true,
            allowChallenges: true
          },
          preferences: settingsRes.data.preferences || {
            theme: 'dark',
            language: 'fr',
            soundEffects: true,
            animations: true
          }
        });
      } catch (err) {
        setError('Erreur lors du chargement des données');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [user]);

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validatePasswordChange = () => {
    let isValid = true;
    const newErrors = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (passwordData.newPassword || passwordData.currentPassword || passwordData.confirmPassword) {
      if (!passwordData.currentPassword) {
        newErrors.currentPassword = 'Le mot de passe actuel est requis';
        isValid = false;
      }
      if (!passwordData.newPassword) {
        newErrors.newPassword = 'Le nouveau mot de passe est requis';
        isValid = false;
      } else if (passwordData.newPassword.length < 6) {
        newErrors.newPassword = 'Le mot de passe doit contenir au moins 6 caractères';
        isValid = false;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
        isValid = false;
      }
    }

    setPasswordErrors(newErrors);
    return isValid;
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError('');
      setSuccess('');
      setPasswordErrors({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      if (!validatePasswordChange()) {
        return;
      }

      const profileUpdateData: any = {
        username: settings.username,
        email: settings.email
      };

      if (passwordData.currentPassword && passwordData.newPassword) {
        profileUpdateData.currentPassword = passwordData.currentPassword;
        profileUpdateData.newPassword = passwordData.newPassword;
      }

      const response = await api.put(
        '/api/user/profile',
        profileUpdateData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Profil mis à jour avec succès');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setSettings(prev => ({
        ...prev,
        username: response.data.username,
        email: response.data.email
      }));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
      
      if (errorMessage.toLowerCase().includes('mot de passe actuel incorrect')) {
        setPasswordErrors(prev => ({
          ...prev,
          currentPassword: 'Mot de passe actuel incorrect'
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      setLoading(true);
      setError('');
      setSuccess('');

      const { username, email, ...userSettings } = settings;

      await api.put(
        '/api/user/settings', 
        userSettings,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setSuccess('Paramètres sauvegardés avec succès');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom d'utilisateur</label>
              <input
                type="text"
                value={settings.username}
                onChange={(e) => setSettings(prev => ({ ...prev, username: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                Changer le mot de passe
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Mot de passe actuel</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value=""
                    onChange={handlePasswordChange}
                    className={`w-full bg-gray-700 border ${passwordErrors.currentPassword ? 'border-red-500' : 'border-gray-600'} rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Entrez votre mot de passe actuel"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={`w-full bg-gray-700 border ${passwordErrors.newPassword ? 'border-red-500' : 'border-gray-600'} rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Entrez votre nouveau mot de passe (min. 6 caractères)"
                  />
                  {passwordErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Confirmer le nouveau mot de passe</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={`w-full bg-gray-700 border ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-gray-600'} rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                    placeholder="Confirmez votre nouveau mot de passe"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={handleProfileUpdate}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : null}
                Mettre à jour le profil
              </button>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base capitalize">{key}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {key === 'challenges' && 'Notifications pour les défis'}
                    {key === 'achievements' && 'Notifications pour les succès'}
                    {key === 'tournaments' && 'Notifications pour les tournois'}
                    {key === 'news' && 'Notifications pour les actualités'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : null}
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 sm:space-y-6">
            {Object.entries(settings.privacy).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-medium text-sm sm:text-base capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {key === 'showProfile' && 'Afficher votre profil'}
                    {key === 'showStats' && 'Afficher vos statistiques'}
                    {key === 'allowChallenges' && 'Autoriser les défis'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                    className="sr-only peer"
                    disabled={loading}
                  />
                  <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
                </label>
              </div>
            ))}
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : null}
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Thème</label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => updateSetting('preferences', 'theme', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="dark">Sombre</option>
                <option value="light">Clair</option>
                <option value="auto">Automatique</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Langue</label>
              <select
                value={settings.preferences.language}
                onChange={(e) => updateSetting('preferences', 'language', e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 sm:px-4 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <div>
                  <h3 className="font-medium text-sm sm:text-base">Effets sonores</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Sons dans l'interface</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.soundEffects}
                  onChange={(e) => updateSetting('preferences', 'soundEffects', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <div>
                  <h3 className="font-medium text-sm sm:text-base">Animations</h3>
                  <p className="text-xs sm:text-sm text-gray-400">Animations de l'interface</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.preferences.animations}
                  onChange={(e) => updateSetting('preferences', 'animations', e.target.checked)}
                  className="sr-only peer"
                  disabled={loading}
                />
                <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={saveSettings}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                ) : null}
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
            Paramètres
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Personnalisez votre expérience</p>
        </motion.div>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4"
          >
            {error}
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg mb-4"
          >
            {success}
          </motion.div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:block"
          >
            <div className="lg:hidden flex overflow-x-auto pb-2 -mx-4 px-4">
              <nav className="flex space-x-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                    disabled={loading}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
            
            <nav className="hidden lg:block bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 sm:px-4 sm:py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    disabled={loading}
                  >
                    <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base">{tab.label}</span>
                  </button>
                ))}
              </div>
            </nav>
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3 bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700"
          >
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
              {tabs.find(tab => tab.id === activeTab)?.label}
            </h2>
            
            {renderTabContent()}
          </motion.div>
        </div>
      </div>
    </div>
  );
};