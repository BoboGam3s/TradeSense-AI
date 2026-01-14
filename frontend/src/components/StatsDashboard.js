import React, { useState, useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import { FiX, FiTrendingUp, FiTrendingDown, FiActivity, FiPieChart } from 'react-icons/fi';
import { tradingAPI } from '../lib/api';

export default function StatsDashboard({ isOpen, onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen]);

  // Effect to render chart when stats change
  useEffect(() => {
    if (!stats || !stats.equity_curve || !chartContainerRef.current) return;

    if (chartRef.current) {
        chartRef.current.remove();
    }

    const chart = createChart(chartContainerRef.current, {
        layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#d1d5db',
        },
        grid: {
            vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
            horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
        },
        width: chartContainerRef.current.clientWidth,
        height: 300,
        timeScale: {
            borderColor: 'rgba(255, 255, 255, 0.1)',
        },
    });

    const areaSeries = chart.addAreaSeries({
        lineColor: '#2962FF',
        topColor: '#2962FF',
        bottomColor: 'rgba(41, 98, 255, 0.28)',
    });

    areaSeries.setData(stats.equity_curve);
    
    // Fit content
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
        window.removeEventListener('resize', handleResize);
        if (chartRef.current) {
            try {
                chartRef.current.remove();
            } catch (e) {
                // Ignore disposal errors
            }
            chartRef.current = null;
        }
    };
  }, [stats]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await tradingAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-5xl max-h-[90vh] overflow-y-auto relative border border-white/10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <FiX className="text-2xl" />
        </button>

        <h2 className="text-2xl font-black mb-6 flex items-center">
            <FiPieChart className="mr-3 text-neon-blue" />
            Statistiques de Trading
        </h2>

        {loading ? (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
        ) : !stats ? (
            <div className="text-center p-12 text-gray-500">Aucune donnée disponible</div>
        ) : (
            <div className="space-y-8">
                {/* KPI Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Win Rate</div>
                        <div className={`text-2xl font-black ${stats.win_rate >= 50 ? 'text-neon-green' : 'text-red-400'}`}>
                            {stats.win_rate}%
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Profit Factor</div>
                        <div className={`text-2xl font-black ${stats.profit_factor >= 1.5 ? 'text-neon-green' : 'text-gray-200'}`}>
                            {stats.profit_factor}
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Net Profit</div>
                        <div className={`text-2xl font-black ${stats.net_profit >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                            ${stats.net_profit}
                        </div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <div className="text-gray-400 text-xs font-bold uppercase mb-1">Total Trades</div>
                        <div className="text-2xl font-black text-white">
                            {stats.total_trades}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Equity Curve */}
                    <div className="lg:col-span-2 bg-white/5 p-6 rounded-xl border border-white/5">
                        <h3 className="text-lg font-bold mb-4 flex items-center">
                            <FiActivity className="mr-2 text-neon-blue" /> Equity Curve
                        </h3>
                        <div ref={chartContainerRef} className="w-full h-[300px]"></div>
                    </div>

                    {/* Stats List */}
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 space-y-4">
                        <h3 className="text-lg font-bold mb-4">Métriques Détaillées</h3>
                        
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Moyenne Gain</span>
                            <span className="text-neon-green font-mono font-bold">${stats.avg_win}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Moyenne Perte</span>
                            <span className="text-red-400 font-mono font-bold">-${stats.avg_loss}</span>
                        </div>
                        <div className="flex justify-between items-center pb-2 border-b border-white/5">
                            <span className="text-gray-400 text-sm">Ratio Gain/Perte</span>
                            <span className="text-white font-mono font-bold">
                                {(stats.avg_loss > 0 ? (stats.avg_win / stats.avg_loss).toFixed(2) : '∞')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
