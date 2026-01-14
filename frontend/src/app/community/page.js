'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FiMessageSquare, FiTrendingUp, FiUser, FiSend, FiHeart, FiShare2, FiHome } from 'react-icons/fi';

// Helper for relative time
const formatRelativeTime = (date) => {
  const diffInSeconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (diffInSeconds < 60) return "À l'instant";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `Il y a ${diffInHours}h`;
  return new Date(date).toLocaleDateString();
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState('feed'); // feed, chat
  const [message, setMessage] = useState('');
  const [onlineTraders, setOnlineTraders] = useState([]);
  const [now, setNow] = useState(new Date());

  // Update "now" every minute to refresh timestamps
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Fetch online traders
  useEffect(() => {
    fetch('http://localhost:5000/api/community/users')
      .then(res => res.json())
      .then(data => setOnlineTraders(data))
      .catch(err => console.error("Failed to fetch community users", err));
  }, []);
  
  // Mock Feed Data with ISO timestamps
  const [posts, setPosts] = useState([
    {
      id: 1,
      user: 'CryptoKing',
      avatar: null,
      content: 'Le Bitcoin semble former un double bottom sur le 4h via @TradeSenseAI. Je rentre long ! 🚀',
      likes: 24,
      comments: 5,
      timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
      tag: 'BTC-USD'
    },
    {
      id: 2,
      user: 'SarahTrade',
      avatar: null,
      content: 'Attention à la volatilité sur Tesla demain avec les earnings via @TradeSenseAI.',
      likes: 12,
      comments: 2,
      timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
      tag: 'TSLA'
    },
    {
      id: 3,
      user: 'EliteTrader_01',
      avatar: null,
      content: 'Mon bot vient de passer le challenge de 100k ! Merci pour les signaux IA.',
      likes: 156,
      comments: 18,
      timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
      tag: 'Success'
    }
  ]);

  // Mock Chat Data
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Alex', text: 'Salut tout le monde ! Comment est le marché ajd ?', time: '10:00' },
    { id: 2, user: 'Maria', text: 'Très haussier sur les cryptos ce matin.', time: '10:02' },
    { id: 3, user: 'JohnDoe', text: 'Quelqu\'un a vu le signal sur l\'Or ?', time: '10:05' },
  ]);

  const handlePost = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (activeTab === 'feed') {
      setPosts([{
        id: Date.now(),
        user: 'Vous',
        avatar: null,
        content: message,
        likes: 0,
        comments: 0,
        timestamp: new Date().toISOString(),
        tag: 'Discussion'
      }, ...posts]);
    } else {
      setChatMessages([...chatMessages, {
        id: Date.now(),
        user: 'Vous',
        text: message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }

    setMessage('');
  };

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
          <FiHome />
          <span>Retour au Dashboard</span>
        </Link>
        <div className="text-xl font-bold flex items-center">
          <FiMessageSquare className="mr-2 text-neon-blue" />
          <span className="gradient-text">Zone Communautaire</span>
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Sidebar / Navigation */}
        <div className="space-y-4">
          <div className="glass-card">
            <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs">Navigation</h3>
            <button
              onClick={() => setActiveTab('feed')}
              className={`w-full text-left p-3 rounded-lg mb-2 flex items-center transition-colors ${
                activeTab === 'feed' ? 'bg-neon-blue/20 text-neon-blue border border-neon-blue/50' : 'hover:bg-white/5'
              }`}
            >
              <FiTrendingUp className="mr-3" />
              Flux Trading
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full text-left p-3 rounded-lg flex items-center transition-colors ${
                activeTab === 'chat' ? 'bg-neon-green/20 text-neon-green border border-neon-green/50' : 'hover:bg-white/5'
              }`}
            >
              <FiMessageSquare className="mr-3" />
              Chat Global
            </button>
          </div>

          <div className="glass-card">
            <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs">Traders en Ligne</h3>
            <div className="space-y-3">
              {onlineTraders.length > 0 ? (
                onlineTraders.map((trader) => (
                  <div key={trader.id} className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${trader.is_real ? 'bg-gradient-to-br from-indigo-500 to-purple-500' : 'bg-gradient-to-br from-gray-500 to-gray-700'}`}>
                      {trader.avatar ? (
                        <img src={trader.avatar} alt="" className="w-full h-full rounded-full" />
                      ) : (
                        trader.name[0]
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{trader.name}</div>
                      <div className="text-xs text-green-400 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse"></span>
                        En ligne
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-3 opacity-50">
                    <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-3 bg-gray-700 rounded w-20 animate-pulse"></div>
                      <div className="h-2 bg-gray-700 rounded w-12 animate-pulse"></div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Post Input */}
          <div className="glass-card">
            <form onSubmit={handlePost} className="flex space-x-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <FiUser />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={activeTab === 'feed' ? "Partagez une idée de trade..." : "Envoyer un message..."}
                  className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="h-px bg-white/10 my-2"></div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    Appuyez sur Entrée pour envoyer
                  </div>
                  <button type="submit" className="p-2 rounded-full bg-neon-blue text-dark-bg hover:opacity-90 transition-opacity">
                    <FiSend />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Feed Content */}
          {activeTab === 'feed' && (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="glass-card">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center font-bold">
                        {post.user[0]}
                      </div>
                      <div>
                        <div className="font-bold">{post.user}</div>
                        <div className="text-xs text-gray-400">{formatRelativeTime(post.timestamp)}</div>
                      </div>
                    </div>
                    {post.tag && (
                      <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-neon-green">
                        ${post.tag}
                      </span>
                    )}
                  </div>
                  <p className="mb-4 text-gray-200">{post.content}</p>
                  <div className="flex space-x-6 text-gray-400 text-sm">
                    <button className="flex items-center space-x-2 hover:text-red-400 transition-colors">
                      <FiHeart /> <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-blue-400 transition-colors">
                      <FiMessageSquare /> <span>{post.comments}</span>
                    </button>
                    <button className="flex items-center space-x-2 hover:text-green-400 transition-colors">
                      <FiShare2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Chat Content */}
          {activeTab === 'chat' && (
            <div className="glass-card h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.user === 'Vous' ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-baseline space-x-2 mb-1">
                      <span className="text-xs font-bold text-gray-300">{msg.user}</span>
                      <span className="text-[10px] text-gray-500">{msg.time}</span>
                    </div>
                    <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      msg.user === 'Vous' 
                        ? 'bg-neon-blue/20 text-white rounded-tr-none' 
                        : 'bg-white/10 text-gray-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
