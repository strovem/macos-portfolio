'use client';

import React, { useState, useEffect } from 'react';

export const Clock: React.FC = () => {
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    setMounted(true);

    const formatMacTime = () => {
      const now = new Date();
      const weekday = now.toLocaleDateString('en-US', { weekday: 'short' });
      const month = now.toLocaleDateString('en-US', { month: 'short' });
      const day = now.getDate();
      const time = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      return `${weekday} ${month} ${day}  ${time}`;
    };

    setTimeString(formatMacTime());

    const interval = setInterval(() => {
      setTimeString(formatMacTime());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="px-2 py-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-default select-none font-medium text-xs whitespace-nowrap text-slate-800 dark:text-slate-200"
      title={mounted ? new Date().toLocaleDateString('en-US', { dateStyle: 'full' }) : undefined}
      suppressHydrationWarning
    >
      {mounted ? timeString : 'Sun Nov 22  2:38 PM'}
    </div>
  );
};
