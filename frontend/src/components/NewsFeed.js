import { useState, useEffect } from 'react';
import { marketAPI } from '../lib/api';
import { FiTrendingUp, FiTrendingDown, FiActivity, FiGlobe } from 'react-icons/fi';

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await marketAPI.getNews();
      setNews(response.data.news);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return <FiTrendingUp className="text-profit" />;
      case 'negative':
        return <FiTrendingDown className="text-loss" />;
      default:
        return <FiActivity className="text-gray-400" />;
    }
  };

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = (now - date) / 1000 / 60; // diff in minutes

    if (diff < 60) return `${Math.floor(diff)} min`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="glass-card h-full">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <FiGlobe className="mr-2 text-neon-blue" />
          Actualités
        </h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex space-x-3">
              <div className="h-10 w-10 bg-white/5 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/5 rounded w-3/4"></div>
                <div className="h-3 bg-white/5 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card h-full overflow-hidden flex flex-col">
      <h2 className="text-xl font-bold mb-4 flex items-center justify-between">
        <span className="flex items-center">
          <FiGlobe className="mr-2 text-neon-blue" />
          Hub Actualités
        </span>
        <span className="text-xs font-normal text-gray-400 animate-pulse">
          ● En direct
        </span>
      </h2>
      
      <div className="space-y-4 overflow-y-auto pr-2 custom-scrollbar">
        {news.map((item) => (
          <div key={item.id} className="p-3 glass rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="flex justify-between items-start mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                item.category === 'Crypto' ? 'bg-orange-500/20 text-orange-400' :
                item.category === 'Stocks' ? 'bg-blue-500/20 text-blue-400' :
                'bg-purple-500/20 text-purple-400'
              }`}>
                {item.category}
              </span>
              <span className="text-xs text-gray-500">{formatTime(item.timestamp)}</span>
            </div>
            
            <h3 className="font-semibold text-sm mb-2 group-hover:text-neon-blue transition-colors">
              {item.title}
            </h3>
            
            <div className="flex justify-between items-center text-xs text-gray-400">
              <span>{item.source}</span>
              <div className="flex items-center space-x-1">
                {getSentimentIcon(item.sentiment)}
                <span className="capitalize">{item.sentiment}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
