import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token'); // Vérifie si le token est présent

  if (!token) {
    // Redirige vers la page de connexion si le token est absent
    return <Navigate to="/auth" state={{ isLogin: true }} replace />;
  }

  // Affiche la route protégée si le token est présent
  return children;
};