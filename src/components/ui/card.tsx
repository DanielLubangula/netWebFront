import React from 'react';

export const Card = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`bg-gray-900 shadow-md rounded-xl ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <div className={`p-4 ${className}`}>{children}</div>
);
