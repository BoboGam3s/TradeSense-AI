'use client';

import React, { useEffect, useState } from 'react';
import { alertsAPI } from '../lib/api';
import { FiBell, FiTrash2, FiActivity } from 'react-icons/fi';

export default function AlertsList({ alerts, onDelete, onRefresh }) {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await alertsAPI.deleteAlert(id);
      if (onDelete) onDelete(id);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    } finally {
      setDeletingId(null);
    }
  };

  if (!alerts || alerts.length === 0) {
    return (
        <div className="text-center py-8 text-gray-500">
            <FiBell className="mx-auto text-2xl mb-2 opacity-20" />
            <p className="text-xs">Aucune alerte active</p>
        </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <div key={alert.id} className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors group">
            <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${alert.condition === 'ABOVE' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    <FiActivity className="text-xs" />
                </div>
                <div>
                    <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm">{alert.symbol}</span>
                        <span className="text-[10px] text-gray-500 bg-white/5 px-1.5 rounded">{alert.condition === 'ABOVE' ? '≥' : '≤'}</span>
                    </div>
                    <div className="font-mono text-neon-blue font-bold text-xs">
                        ${alert.target_price.toFixed(2)}
                    </div>
                </div>
            </div>
            <button 
                onClick={() => handleDelete(alert.id)}
                disabled={deletingId === alert.id}
                className="text-gray-600 hover:text-red-400 p-2 rounded-full hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
            >
                {deletingId === alert.id ? (
                    <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <FiTrash2 />
                )}
            </button>
        </div>
      ))}
    </div>
  );
}
