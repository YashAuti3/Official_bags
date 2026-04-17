import React from 'react';

export default function Skeleton({ className, circle = false }) {
  return (
    <div 
      className={`bg-gray-200 animate-pulse ${circle ? 'rounded-full' : 'rounded-2xl'} ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, #f0f0f0 25%, #f8f8f8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite linear'
      }}
    />
  );
}
