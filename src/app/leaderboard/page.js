'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { challengeAPI } from '../../lib/api';
import { FiAward, FiTrendingUp, FiArrowUp, FiArrowDown } from 'react-icons/fi';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await challengeAPI.getLeaderboard();
      setLeaderboard(response.data.leaderboard);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank;
  };

  const getPlanBadge = (plan) => {
    const colors = {
      starter: 'bg-blue-500/20 text-blue-400',
      pro: 'bg-purple-500/20 text-purple-400',
      elite: 'bg-yellow-500/20 text-yellow-400',
    };
    return colors[plan] || colors.starter;
  };

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <Link href="/" className="inline-flex items-center space-x-2 mb-8 text-gray-400 hover:text-neon-green transition-colors">
          <FiTrendingUp className="text-2xl" />
          <span className="font-bold">← Retour à l'accueil</span>
        </Link>

        <div className="text-center">
          <FiAward className="text-6xl text-neon-green mx-auto mb-4" />
          <h1 className="text-5xl font-bold mb-4">
            <span className="gradient-text">Classement</span> des Traders
          </h1>
          <p className="text-xl text-gray-400">
            Les meilleurs traders de TradeSense AI
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
            <p className="mt-4 text-gray-400">Chargement...</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rang</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Trader</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Plan</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Profit %</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Profit $</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((trader) => (
                    <tr
                      key={trader.rank}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-2xl font-bold">
                          {getRankIcon(trader.rank)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold">{trader.user_name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getPlanBadge(trader.plan_type)}`}>
                          {trader.plan_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`flex items-center justify-end font-bold ${trader.profit_percent >= 0 ? 'text-profit' : 'text-loss'}`}>
                          {trader.profit_percent >= 0 ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
                          {Math.abs(trader.profit_percent).toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-semibold ${trader.total_profit >= 0 ? 'text-profit' : 'text-loss'}`}>
                          ${Math.abs(trader.total_profit).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
                          trader.status === 'passed' ? 'profit-badge' : 
                          trader.status === 'failed' ? 'loss-badge' : 
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {trader.status === 'passed' ? '✅ Réussi' : 
                           trader.status === 'failed' ? '❌ Échoué' : 
                           '🔄 Actif'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400">Aucun trader dans le classement pour le moment</p>
              </div>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-12 text-center glass-card">
          <h3 className="text-2xl font-bold mb-4">Prêt à rejoindre le classement ?</h3>
          <p className="text-gray-400 mb-6">
            Commencez votre challenge et voyez votre nom apparaître parmi les meilleurs !
          </p>
          <Link href="/pricing" className="btn-primary inline-block px-8 py-3">
            Commencer Maintenant
          </Link>
        </div>
      </div>
    </div>
  );
}
