import React from 'react';

export const Textarea = ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      className={`rounded-md bg-gray-800 border border-gray-600 p-2 w-full ${className}`}
      {...props}
    />
  );
};
