import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home , FileText, Settings, Users, Database, Menu, X } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: FileText, label: 'Gestion des Questions', path: '/admin/questions' },
    { icon: Users, label: 'Gestion des Utilisateurs', path: '/admin/users' },
    { icon: Database, label: 'Gestion des Thèmes', path: '/admin/themes' },
    { icon: Settings, label: 'Paramètres', path: '/admin/settings' },
    { icon:Settings , label: 'News', path: '/admin/News' },
    { icon:Settings , label: 'Notifications', path: '/admin/send/notification' },
  ];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-50 p-3 bg-blue-600 rounded-full shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`w-64 bg-gray-800 border-r border-gray-700 fixed md:static inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-40 transition-transform duration-300 ease-in-out`}
      >
        <div className="p-6 border-b border-gray-700 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            NetWebQuiz Admin
          </h1>
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:ml-64 transition-all duration-300">
        <Outlet />
      </main>
    </div>
  );
};



