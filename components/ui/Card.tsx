
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;
