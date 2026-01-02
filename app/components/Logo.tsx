// app/components/Logo.tsx
'use client';

import React from 'react';

export default function Logo({ size = 'header' }: { size?: 'header' | 'footer' }) {
  const dimensions = size === 'header' 
    ? { width: 120, height: 120 }
    : { width: 80, height: 80 };

  return (
    <div 
      style={{ 
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        backgroundImage: `url(/logo.png)`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        flexShrink: 0
      }}
      aria-label="CuratedAscents AI Logo"
    />
  );
}