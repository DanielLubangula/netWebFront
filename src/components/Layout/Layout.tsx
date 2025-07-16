import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const noHeaderRoutes = [
  '/auth',
  '/quiz/play',
  '/players/online',
  '/leaderboard/full',
  '/challenge/room/:roomId'
]; 

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Vérifie si le Header doit être affiché
  const shouldShowHeader = !noHeaderRoutes.some((route) =>
    location.pathname.startsWith(route.replace(':roomId', ''))
  );

  return (
    <div className="flex h-screen bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {shouldShowHeader && <Header onMenuClick={() => setSidebarOpen(true)} />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};