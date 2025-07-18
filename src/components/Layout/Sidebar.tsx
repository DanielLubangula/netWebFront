import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Brain,
  Trophy,
  Swords,
  Newspaper,
  User,
  X,
  Network,
  Settings,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// Simulez l'état de connexion de l'utilisateur
const isLoggedIn = true; // Changez cette valeur pour tester les deux cas

const menuItems = [
  { icon: Home, label: "Accueil", path: "/" },
  { icon: Brain, label: "Quiz Solo", path: "/quiz", requiresLogin: true },
  { icon: Swords, label: "Défis", path: "/players/online", requiresLogin: true },
  // { icon: Crown, label: "Tournois", path: "/tournament", requiresLogin: true },
  { icon: Trophy, label: "Classement", path: "/leaderboard" },
  // {
  //   icon: BookOpen,
  //   label: "Apprentissage",
  //   path: "/learning",
  //   requiresLogin: true,
  // },
  { icon: Newspaper, label: "Actualités", path: "/news" },
  { icon: Swords, label: "Matchs en direct", path: "/challenge/live-matches" },
  { icon: User, label: "Changer d'avatar", path: "/profile", requiresLogin: true },
  {
    icon: Settings,
    label: "Paramètres",
    path: "/settings",
    requiresLogin: true,
  },
   {
    icon: Network,
    label: "Chat public",
    path: "/chat/public",
    requiresLogin: true,
  },
  // { icon: Send, label: "Envoyer une notification", path: "/admin/send-notification", requiresLogin: true },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  // Filtrer les onglets en fonction de l'état de connexion
  const filteredMenuItems = menuItems.filter(
    (item) => !item.requiresLogin || isLoggedIn
  );

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed lg:static inset-y-0 left-0 z-50 w-70 bg-gray-800 border-r border-gray-700 lg:translate-x-0"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">NetWebQuiz</h2>
                <p className="text-xs text-gray-400">Réseaux & Quiz</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {filteredMenuItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "text-gray-300 hover:bg-gray-700 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>

          {/* Connexion et Inscription */}
          {!isLoggedIn && (
            <div className="p-4 border-t border-gray-700">
              <button
                onClick={() => navigate("/auth", { state: { isLogin: true } })}
                className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-medium transition-colors mb-2"
              >
                Connexion
              </button>
              <button
                onClick={() => navigate("/auth", { state: { isLogin: false } })}
                className="w-full bg-gray-600 hover:bg-gray-700 py-2 rounded-lg font-medium transition-colors"
              >
                Inscription
              </button>
            </div>
          )}
          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <div className="text-center text-xs text-gray-400">
              <p>© 2025 NetWebQuiz</p>
              <p>Version 1.0</p>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
};
