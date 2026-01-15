'use client';

import React from 'react';
import { FiBell, FiX } from 'react-icons/fi';
import AlertsList from './AlertsList';

export default function ActiveAlertsModal({ isOpen, onClose, alerts, setAlerts }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1a1b1e] rounded-2xl w-full max-w-md p-6 border border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FiX className="text-xl" />
        </button>

        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center">
                <FiBell className="mr-2 text-neon-blue" />
                Mes Alertes
            </h2>
            <span className="text-xs text-gray-400 font-bold bg-white/5 px-2 py-1 rounded">{alerts?.length || 0} Active{alerts?.length > 1 ? 's' : ''}</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
            <AlertsList 
                alerts={alerts} 
                onDelete={(id) => setAlerts(prev => prev.filter(a => a.id !== id))} 
            />
        </div>
      </div>
    </div>
  );
}
