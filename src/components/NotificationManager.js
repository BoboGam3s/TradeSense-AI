'use client';

import React, { useEffect, useState } from 'react';
import { FiBell } from 'react-icons/fi';

export default function NotificationManager() {
  const [permission, setPermission] = useState('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert("Ce navigateur ne supporte pas les notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);
  };

  if (permission === 'granted' || permission === 'denied') return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom duration-500">
      <div className="bg-[#1a1b1e] border-l-4 border-neon-blue p-4 rounded-lg shadow-2xl max-w-sm flex items-start space-x-4">
        <div className="bg-neon-blue/10 p-2 rounded-full">
            <FiBell className="text-neon-blue text-xl" />
        </div>
        <div>
            <h4 className="text-white font-bold text-sm mb-1">Activez les Alertes</h4>
            <p className="text-gray-400 text-xs mb-3">Ne ratez aucune opportunité de trading. Autorisez les notifications pour recevoir nos signaux.</p>
            <div className="flex space-x-2">
                <button onClick={requestPermission} className="text-xs bg-neon-blue text-black font-bold px-3 py-1.5 rounded hover:bg-neon-blue/90 transition-colors">
                    Activer
                </button>
                <button onClick={() => setPermission('denied')} className="text-xs text-gray-500 hover:text-white px-2 py-1.5">
                    Plus tard
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
