import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Check, 
  X, 
  Trophy, 
  Swords, 
  BookOpen, 
  Users, 
  Calendar, 
  Info, 
  AlertTriangle,
  AlertCircle,
  Award,
  ShieldAlert
} from 'lucide-react';
import { getNotifications, markNotificationAsRead, deleteNotification as deleteNotifApi } from '../../services/notificationService';
import Toast from '../../components/ui/Toast';

export const Notifications: React.FC = () => {
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const token = localStorage.getItem('token');
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  // Fonction pour obtenir l'icône et la couleur en fonction du type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'info':
        return { icon: Info, color: 'text-blue-400' };
      case 'success':
        return { icon: Check, color: 'text-green-400' };
      case 'warning':
        return { icon: AlertTriangle, color: 'text-yellow-400' };
      case 'error':
        return { icon: AlertCircle, color: 'text-red-400' };
      case 'challenge':
        return { icon: Swords, color: 'text-purple-400' };
      case 'achievement':
        return { icon: Trophy, color: 'text-amber-400' };
      default:
        return { icon: Info, color: 'text-blue-400' };
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;
      try {
        const notifications = await getNotifications(token);
        setNotificationList(notifications);
        
      } catch {
        setNotificationList([]);
      }
    };
    fetchNotifications();
  }, [token]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    await markNotificationAsRead(id, token);
    setNotificationList(prev => prev.map(notif => notif._id === id ? { ...notif, read: true } : notif));
    setToast({ message: 'Notification marquée comme lue', type: 'success' });
  };

  const markAllAsRead = async () => {
    if (!token) return;
    await Promise.all(notificationList.filter(n => !n.read).map(n => markNotificationAsRead(n._id, token)));
    setNotificationList(prev => prev.map(notif => ({ ...notif, read: true })));
    setToast({ message: 'Toutes les notifications sont marquées comme lues', type: 'success' });
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    await deleteNotifApi(id, token);
    setNotificationList(prev => prev.filter(notif => notif._id !== id));
    setToast({ message: 'Notification supprimée', type: 'info' });
  };
  
  const filteredNotifications = filter === 'unread' 
    ? notificationList.filter(notif => !notif.read)
    : notificationList;

  const unreadCount = notificationList?.filter(notif => !notif.read).length;

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        {/* Notifications List */}
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
            filteredNotifications.map((notification, index) => {
              const { icon: IconComponent, color } = getNotificationIcon(notification.type);
              
              return (
                <motion.div
                  key={notification._id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.08 }}
                  className={`bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border transition-all duration-200 hover:border-gray-600 ${
                    notification.read ? 'border-gray-700' : 'border-blue-600 bg-gradient-to-r from-gray-800 to-blue-900/20'
                  }`}
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className={`p-2 sm:p-3 rounded-full bg-gray-700 ${color} flex-shrink-0`}>
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2 mb-2">
                        <h3 className="font-bold text-base sm:text-lg truncate">{notification.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm text-gray-400 whitespace-nowrap">
                            {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">{notification.message}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification._id)}
                            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded text-xs sm:text-sm font-medium transition-colors"
                          >
                            <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Marquer comme lu</span>
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification._id)}
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
              );
            })
          )}
        </div>
      </div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};