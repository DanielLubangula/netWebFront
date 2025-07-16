import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, Settings, User, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/images/logo.png';

interface HeaderProps {
  onMenuClick: () => void;
}

// Fonction utilitaire pour corriger l'URL d'image
function getCleanImageUrl(url?: string) {
  if (!url) return '/default-profile.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(3);

  const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  };

  const user = getUserFromLocalStorage();
  const token = localStorage.getItem('token');

  const menuRef = useRef<HTMLDivElement | null>(null);

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showUserMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-gray-800 border-b border-gray-700 p-4 relative z-50"
    >
      <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
        {/* Logo + Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-10 h-10 sm:w-14 sm:h-14" />
            <h1 className="text-md font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              NetWebQuiz
            </h1>
          </div>
        </div>

        {/* Notifications + Profil */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={handleNotificationClick}
            className="relative p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Bell className="w-6 h-6 text-white" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </button>

          {token ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={toggleUserMenu}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <img
                  src={getCleanImageUrl(user.profilePicture)}
                  alt="Profil"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  onError={e => { e.currentTarget.src = '/default_profil.webp'; }}
                />
                <span className="text-white font-medium text-sm truncate max-w-[100px] hidden sm:inline">
                  {user.username}
                </span>
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50"
                  >
                    <div className="p-2">
                      <button
                        onClick={() => {
                          navigate(`/profile/${user._id}`);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <UserCircle className="w-4 h-4" />
                        Mon profil
                      </button>
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <User className="w-4 h-4" />
                        Changer d'avatar
                      </button>
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center gap-3"
                      >
                        <Settings className="w-4 h-4" />
                        Paramètres
                      </button>
                      <hr className="my-2 border-gray-700" />
                      <button
                        onClick={() => {
                          localStorage.clear();
                          setTimeout(() => {
                            location.reload();
                          }, 1000);
                          navigate('/', { state: { isLogin: true } });
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors text-red-400"
                      >
                        Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={() => navigate('/auth', { state: { isLogin: true } })}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-colors"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </motion.header>
  );
};
