'use client';

import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../lib/api';
import { FiBell, FiX } from 'react-icons/fi';

export default function SetAlertModal({ isOpen, onClose, symbol, currentPrice, onAlertSet }) {
  const [targetPrice, setTargetPrice] = useState(currentPrice || '');
  const [condition, setCondition] = useState('ABOVE');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && currentPrice) {
      setTargetPrice(currentPrice);
    }
  }, [isOpen, currentPrice]);

  useEffect(() => {
    if (targetPrice && currentPrice) {
      setCondition(parseFloat(targetPrice) > currentPrice ? 'ABOVE' : 'BELOW');
    }
  }, [targetPrice, currentPrice]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await alertsAPI.createAlert({
        symbol,
        target_price: targetPrice,
        condition
      });
      if (onAlertSet) onAlertSet();
      onClose();
    } catch (error) {
      console.error('Failed to set alert:', error);
      alert('Erreur lors de la création de l\'alerte');
    } finally {
      setLoading(false);
    }
  };

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

        <h2 className="text-xl font-bold mb-1 flex items-center">
          <FiBell className="mr-2 text-neon-blue" />
          Définir une Alerte - {symbol}
        </h2>
        <p className="text-gray-400 text-sm mb-6">Recevez une notification push quand le prix atteint votre cible.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-gray-400 font-bold uppercase">Prix Actuel</span>
              <span className="text-white font-mono font-bold">${currentPrice?.toFixed(2)}</span>
            </div>
            
            <div className="relative">
              <label className="text-xs text-gray-500 font-bold uppercase mb-1 block">Prix Cible ($)</label>
              <input 
                type="number" 
                step="0.01" 
                value={targetPrice} 
                onChange={(e) => setTargetPrice(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white font-mono focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none transition-all"
                required
              />
            </div>
            
            <div className="mt-4 flex items-center justify-center space-x-2">
                <span className="text-gray-500 text-xs">Condition Automatique:</span>
                <span className={`text-xs font-black px-2 py-0.5 rounded ${condition === 'ABOVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {condition === 'ABOVE' ? 'CROISE À LA HAUSSE ↗' : 'CROISE À LA BAISSE ↘'}
                </span>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-neon-blue text-black font-bold rounded-xl hover:bg-neon-blue/90 transition-all flex items-center justify-center"
          >
            {loading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'CRÉER L\'ALERTE'}
          </button>
        </form>
      </div>
    </div>
  );
}
