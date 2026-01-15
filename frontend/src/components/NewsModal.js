'use client';

import { useRouter } from 'next/navigation';
import { FiX, FiLock, FiArrowRight, FiShield } from 'react-icons/fi';
import { AuthService } from '../lib/auth';

export default function NewsModal({ article, isOpen, onClose }) {
  const router = useRouter();
  const user = AuthService.isAuthenticated() ? AuthService.getUser() : null;

  if (!isOpen || !article) return null;

  const getAccessLevel = () => {
    if (!user) return 'guest';
    if (['free', 'starter'].includes(user.plan_type)) return 'basic';
    return 'full';
  };

  const accessLevel = getAccessLevel();
  const canViewFull = accessLevel === 'full';

  // Determine how much content to show
  const getVisibleContent = () => {
    const fullContent = article.content || article.description || 'Contenu non disponible.';
    const words = fullContent.split(' ');
    
    if (accessLevel === 'guest') {
      // Show only first 50 words for guests
      return words.slice(0, 50).join(' ') + '...';
    } else if (accessLevel === 'basic') {
      // Show 50% for registered users
      return words.slice(0, Math.floor(words.length / 2)).join(' ') + '...';
    }
    
    return fullContent;
  };

  const handleUnlockClick = () => {
    if (accessLevel === 'guest') {
      router.push('/register');
    } else {
      router.push('/pricing');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-dark-bg border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp">
        {/* Header with Image */}
        <div className="relative h-64 overflow-hidden">
          <img 
            src={article.image} 
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent"></div>
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full backdrop-blur-sm transition-colors z-10"
          >
            <FiX className="text-2xl text-white" />
          </button>

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
              article.category === 'Crypto' ? 'bg-orange-500/80 text-white' :
              article.category === 'Stocks' ? 'bg-blue-500/80 text-white' :
              'bg-purple-500/80 text-white'
            }`}>
              {article.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[50vh] custom-scrollbar">
          <h2 className="text-3xl font-bold mb-4">{article.title}</h2>
          
          <div className="flex items-center justify-between mb-6 text-sm text-gray-400">
            <span>{article.source}</span>
            <span>{new Date(article.timestamp).toLocaleDateString('fr-FR')}</span>
          </div>

          {/* Article content */}
          <div className="relative">
            <div className="text-gray-300 leading-relaxed space-y-4">
              {getVisibleContent().split('\n').map((paragraph, idx) => {
                if (!paragraph.trim()) return null;
                
                // Parse markdown-style bold **text**
                const parts = paragraph.split(/(\*\*.*?\*\*)/g);
                const rendered = parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
                  }
                  return part;
                });
                
                // Check if it's a bullet point
                if (paragraph.trim().startsWith('•') || paragraph.trim().startsWith('-')) {
                  return (
                    <div key={idx} className="flex items-start space-x-2 ml-4">
                      <span className="text-neon-blue mt-1">•</span>
                      <span>{rendered}</span>
                    </div>
                  );
                }
                
                // Check if it's a checkbox
                if (paragraph.trim().startsWith('☐') || paragraph.trim().startsWith('❌')) {
                  return (
                    <div key={idx} className="flex items-start space-x-2 ml-4">
                      <span className="mt-1">{paragraph.trim()[0]}</span>
                      <span>{rendered.slice(1)}</span>
                    </div>
                  );
                }
                
                // Regular paragraph
                return <p key={idx}>{rendered}</p>;
              })}
            </div>

            {/* Lock overlay for restricted content */}
            {!canViewFull && (
              <div className="mt-8 p-8 rounded-2xl bg-gradient-to-t from-dark-bg via-dark-bg/95 to-transparent border border-white/10 text-center relative overflow-hidden">
                {/* Blur effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-bg backdrop-blur-md"></div>
                
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-neon-blue/20 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-neon-blue/20">
                    <FiLock className="text-3xl text-neon-blue an imate-pulse" />
                  </div>
                  
                  <h3 className="text-2xl font-black mb-2 text-white">
                    {accessLevel === 'guest' ? 'Contenu Réservé aux Membres' : 'Contenu Premium'}
                  </h3>
                  
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    {accessLevel === 'guest' 
                      ? "Inscrivez-vous gratuitement pour accéder à plus de contenu exclusif et d'analyses professionnelles."
                      : "Passez à un plan Pro ou Elite pour débloquer l'intégralité de nos analyses de marché et stratégies avancées."}
                  </p>

                  <button
                    onClick={handleUnlockClick}
                    className="bg-gradient-to-r from-neon-blue to-blue-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:scale-105 transition-transform shadow-lg shadow-neon-blue/30 flex items-center mx-auto"
                  >
                    <FiShield className="mr-2" />
                    {accessLevel === 'guest' ? "S'INSCRIRE GRATUITEMENT" : 'UPGRADER MAINTENANT'}
                    <FiArrowRight className="ml-2" />
                  </button>

                  {accessLevel === 'basic' && (
                    <p className="text-xs text-gray-500 mt-4">
                      Déjà {Math.floor((getVisibleContent().split(' ').length / (article.content?.split(' ').length || 100)) * 100)}% du contenu lu
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
