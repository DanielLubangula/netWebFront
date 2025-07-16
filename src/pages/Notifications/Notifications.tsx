import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, X, Trophy, Swords, BookOpen, Users, Calendar } from 'lucide-react';

const notifications = [
  {
    id: 1,
    type: 'challenge',
    title: 'Nouveau défi reçu',
    message: 'Alex_Network vous a défié sur le thème "Modèle OSI"',
    time: '5 min',
    read: false,
    icon: Swords,
    color: 'text-purple-400'
  },
  {
    id: 2,
    type: 'achievement',
    title: 'Nouveau succès débloqué',
    message: 'Vous avez obtenu le succès "Expert TCP/IP" !',
    time: '1h',
    read: false,
    icon: Trophy,
    color: 'text-yellow-400'
  },
  {
    id: 3,
    type: 'lesson',
    title: 'Nouvelle leçon disponible',
    message: 'La leçon "Protocoles de routage avancés" est maintenant accessible',
    time: '2h',
    read: true,
    icon: BookOpen,
    color: 'text-green-400'
  },
  {
    id: 4,
    type: 'tournament',
    title: 'Tournoi hebdomadaire',
    message: 'Le tournoi "Maîtres du réseau" commence dans 30 minutes',
    time: '3h',
    read: true,
    icon: Users,
    color: 'text-blue-400'
  },
  {
    id: 5,
    type: 'reminder',
    title: 'Série de victoires',
    message: 'Vous avez une série de 5 victoires ! Continuez sur votre lancée',
    time: '1j',
    read: true,
    icon: Calendar,
    color: 'text-cyan-400'
  }
];

export const Notifications: React.FC = () => {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const markAsRead = (id: number) => {
    setNotificationList(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotificationList(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: number) => {
    setNotificationList(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = filter === 'unread' 
    ? notificationList.filter(notif => !notif.read)
    : notificationList;

  const unreadCount = notificationList.filter(notif => !notif.read).length;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header - Optimisé pour mobile */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 flex items-center gap-2 sm:gap-3">
              <Bell className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              Notifications
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes les notifications sont lues'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
            <div className="flex bg-gray-800 rounded-lg p-0.5 sm:p-1 border border-gray-700">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 sm:px-4 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Non lues ({unreadCount})
              </button>
            </div>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
        </motion.div>

        {/* Notifications List - Version mobile optimisée */}
        <div className="space-y-3 sm:space-y-4">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 sm:py-12"
            >
              <Bell className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-400 mb-1 sm:mb-2">
                {filter === 'unread' ? 'Aucune notification non lue' : 'Aucune notification'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500">
                {filter === 'unread' 
                  ? 'Toutes vos notifications ont été lues !' 
                  : 'Vous n\'avez pas encore de notifications.'}
              </p>
            </motion.div>
          ) : (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.08 }}
                className={`bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all duration-200 hover:border-gray-600 ${
                  notification.read ? 'border-gray-700' : 'border-blue-600 bg-gradient-to-r from-gray-800 to-blue-900/20'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 sm:p-3 rounded-full bg-gray-700 ${notification.color} flex-shrink-0`}>
                    <notification.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                      <h3 className="font-bold text-base sm:text-lg truncate">{notification.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">{notification.time}</span>
                        {!notification.read && (
                          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">{notification.message}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors"
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Marquer comme lu</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors"
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Supprimer</span>
                      </button>
                      
                      {notification.type === 'challenge' && (
                        <button className="bg-purple-600 hover:bg-purple-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors whitespace-nowrap">
                          Accepter le défi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};