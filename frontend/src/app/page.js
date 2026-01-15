'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  FiTrendingUp, FiUsers, FiBookOpen, FiGlobe, FiMenu, FiX, 
  FiArrowRight, FiCalendar, FiLock, FiShield, FiZap, 
  FiActivity, FiPieChart, FiLayout, FiCpu, FiMonitor,
  FiAward, FiDollarSign, FiBarChart2, FiLayers
} from 'react-icons/fi';
import NewsModal from '../components/NewsModal';
import { AuthService } from '../lib/auth';

// Enhanced news data
const NEWS_ARTICLES = [
  {
    id: 1,
    title: 'Analyse du Marché - Semaine 1',
    category: 'Stocks',
    image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800',
    teaser: 'Découvrez les tendances du marché et les opportunités de trading pour cette semaine.',
    content: `Les marchés boursiers ont connu une volatilité accrue cette semaine, avec des mouvements significatifs dans les secteurs technologiques et financiers.

**Points Clés de l'Analyse:**

• **Secteur Technologique**: Les valeurs tech ont montré une forte résistance malgré les pressions macro-économiques. Le support clé à surveiller est à 14,500 points sur le NASDAQ.

• **Analyse Technique**: Formation d'un triangle ascendant sur le S&P 500, suggérant une potentielle cassure haussière. Les niveaux de Fibonacci indiquent un support solide à 4,350 points.

• **Volume et Momentum**: Augmentation du volume d'échanges de 23% par rapport à la semaine dernière, confirmant la conviction des investisseurs institutionnels.

**Stratégies Recommandées:**
1. Position longue sur les valeurs tech avec stop-loss serré
2. Surveillance des niveaux de résistance pour les sorties
3. Diversification dans les secteurs défensifs pour la gestion du risque

**Indicateurs à Surveiller:**
- RSI: Actuellement à 58 (zone neutre)
- MACD: Croisement haussier détecté
- Moyennes mobiles: EMA 20 au-dessus de EMA 50 (signal positif)`,
    source: 'TradeSense Research',
    timestamp: new Date().toISOString(),
    sentiment: 'positive',
    requiredPlan: 'starter'
  },
  {
    id: 2,
    title: 'Bitcoin: Analyse Price Action Stratégique',
    category: 'Crypto',
    image: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&q=80&w=800',
    teaser: 'Analyse approfondie des niveaux critiques du Bitcoin et prévisions pour les prochaines semaines.',
    content: `Le Bitcoin continue de consolider dans une zone de forte accumulation entre 40,000$ et 42,000$, créant une opportunité intéressante pour les traders techniques.

**Structure du Marché:**

La structure actuelle montre une compression de volatilité classique, souvent précurseur de mouvements importants. Les indicateurs on-chain confirment cette analyse.

• **Accumulation Institutionnelle**: Les adresses whale (>1000 BTC) ont augmenté leurs positions de 8% ce mois-ci
• **Volume On-Chain**: Augmentation de 45% du volume de transactions, signalant une activité accrue
• **Métriques On-Chain**: Le ratio MVRV se situe dans la zone d'accumulation historique

**Niveaux Techniques Critiques:**
- Résistance majeure: 43,500$ (zone de rejet multiple)
- Support clé: 39,800$ (niveau de Fibonacci 0.618)
- Zone de consolidation: 40,000$ - 42,000$

**Scénarios Possibles:**

**Scénario Haussier (60% de probabilité):**
Cassure au-dessus de 43,500$ avec volume confirmerait un mouvement vers 48,000$ puis 52,000$. Les indicateurs momentum supportent ce scénario.

**Scénario Baissier (40% de probabilité):**
Rupture du support 39,800$ pourrait déclencher une cascade vers 36,000$. Ce niveau correspond à la moyenne mobile 200 jours.

**Plan de Trading Recommandé:**
1. Attendre la confirmation de cassure avec volume
2. Entry: Au-dessus de 43,500$ avec retest
3. Stop-loss: En dessous de 42,000$
4. Take-profit: 48,000$ (TP1), 52,000$ (TP2)
5. Risk/Reward: 1:3 minimum`,
    source: 'Crypto Analytics Pro',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    sentiment: 'positive',
    requiredPlan: 'pro'
  },
  {
    id: 3,
    title: 'Stratégies de Gestion du Risque Avancées',
    category: 'Forex',
    image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800',
    teaser: 'Maîtrisez les techniques professionnelles de gestion du risque pour protéger votre capital.',
    content: `La gestion du risque est la pierre angulaire du succès en trading professionnel. Sans elle, même les meilleures stratégies échouent.

**Principes Fondamentaux:**

• **Règle des 2%**: Ne jamais risquer plus de 2% du capital sur un trade unique. Cette règle a prouvé sa robustesse sur des décennies de trading professionnel.

• **Position Sizing**: Calculez la taille de position en fonction de la distance au stop-loss, pas du "feeling". Formule: (Capital × % Risque) / Distance en pips au SL

• **Ratio Risk/Reward**: Minimum 1:2, idéalement 1:3 ou plus. Ne prenez que des trades où le gain potentiel est au moins le double du risque.

**Techniques Avancées:**

**1. Scaling In/Out:**
- Entrée progressive: 50% position initiale, 25% sur confirmation, 25% sur cassure
- Sortie pyramidale: 33% à TP1, 33% à TP2, 33% trailing stop

**2. Stop-Loss Dynamique:**
- Au-delà de la moyenne mobile 20 pour les swings
- Derrière les niveaux de structure pour le price action
- Utilisation de l'ATR pour volatilité

**3. Hedging Stratégique:**
- Couverture partielle sur positions importantes
- Options pour protection asymétrique
- Corrélation inverse entre actifs

**Gestion Psychologique du Risque:**

Le risque n'est pas seulement mathématique, il est aussi psychologique. Un trade à 2% de risque devient un trade à 10% si vous ne pouvez pas l'accepter mentalement.

**Checklist Avant Chaque Trade:**
☐ Taille de position calculée selon règle des 2%
☐ Stop-loss défini AVANT l'entrée
☐ Ratio R:R minimum de 1:2 validé
☐ Contexte de marché favorable
☐ Plan de sortie complet (TP1, TP2, TP3)
☐ État émotionnel neutre

**Erreurs Courantes à Éviter:**
❌ Déplacer le stop-loss dans la mauvaise direction
❌ Moyenner à la baisse (adding to losers)
❌ Sur-levier après une série de gains
❌ Absence de corrélation entre positions

La discipline dans la gestion du risque sépare les traders amateurs des professionnels qui durent dans le temps.`,
    source: 'TradeSense Academy',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    sentiment: 'neutral',
    requiredPlan: 'elite'
  }
];

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      setUser(AuthService.getUser());
    }
  }, []);

  const handleReadMore = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };
  
  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  return (
    <div className="min-h-screen bg-dark-bg selection:bg-neon-green/30 selection:text-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue p-0.5 group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(0,255,136,0.2)]">
                <div className="w-full h-full rounded-xl bg-[#0d0f14] flex items-center justify-center">
                  <FiTrendingUp className="text-neon-green text-xl" />
                </div>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-black uppercase tracking-tighter text-white">TradeSense <span className="text-neon-green">AI</span></h1>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mt-0.5">Élite Terminal</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-10">
              <div className="flex items-center space-x-8">
                <Link href="#ecosystem" className="text-[11px] font-black text-gray-400 hover:text-neon-green uppercase tracking-[0.2em] transition-all">ÉCOSYSTÈME</Link>
                <Link href="#dashboard" className="text-[11px] font-black text-gray-400 hover:text-neon-blue uppercase tracking-[0.2em] transition-all">INTERFACE</Link>
                <Link href="#markets" className="text-[11px] font-black text-gray-400 hover:text-neon-purple uppercase tracking-[0.2em] transition-all">MARCHÉS</Link>
                <Link href="/leaderboard" className="text-[11px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all">CLASSEMENT</Link>
                <Link href="/pricing" className="text-[11px] font-black text-gray-400 hover:text-white uppercase tracking-[0.2em] transition-all">TARIFS</Link>
              </div>
              
              <div className="h-6 w-px bg-white/5"></div>

              {user ? (
                <div className="flex items-center space-x-6">
                  <Link href="/profile" className="flex items-center space-x-3 group/profile">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-neon-green via-neon-blue to-neon-purple p-0.5 group-hover/profile:shadow-[0_0_15px_rgba(0,243,255,0.3)] transition-all">
                      <div className="w-full h-full rounded-full bg-[#0d0f14] flex items-center justify-center text-white font-black text-[10px]">
                        {(user.full_name || user.username || user.email || 'U').substring(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-white group-hover/profile:text-neon-green transition-colors uppercase tracking-widest">{user.full_name?.split(' ')[0] || 'Trader'}</p>
                      <p className="text-[9px] font-bold text-neon-blue uppercase tracking-tighter opacity-80">PROFIL CONNECTÉ</p>
                    </div>
                  </Link>
                  <Link href="/dashboard" className="px-6 py-2.5 bg-neon-green text-black text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:scale-105 transition-all shadow-lg shadow-neon-green/20">
                    PLATEFORME
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-6">
                  <Link href="/login" className="text-[11px] font-black text-white hover:text-neon-green uppercase tracking-[0.2em] transition-colors">CONNEXION</Link>
                  <Link href="/register" className="px-8 py-3 bg-gradient-to-r from-neon-green to-neon-blue text-black text-[11px] font-black uppercase tracking-[0.15em] rounded-xl hover:scale-105 transition-all shadow-xl shadow-neon-green/20">
                    REJOINDRE
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden glass border-t border-white/10 animate-slide-down">
            <div className="px-6 py-8 space-y-6">
              {user && (
                <Link href="/profile" className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                   <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neon-green via-neon-blue to-neon-purple p-0.5 shadow-lg shadow-neon-blue/20">
                    <div className="w-full h-full rounded-full bg-[#0d0f14] flex items-center justify-center text-white font-black">
                        {(user.full_name || user.username || 'U').substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold">{user.full_name || 'Trader TradeSense'}</p>
                    <p className="text-xs text-neon-blue font-bold">Voir mon profil</p>
                  </div>
                </Link>
              )}
              <Link href="#ecosystem" className="block text-lg font-bold text-white uppercase tracking-widest text-sm">L'Écosystème</Link>
              <Link href="#dashboard" className="block text-lg font-bold text-white uppercase tracking-widest text-sm">L'Interface</Link>
              <Link href="#markets" className="block text-lg font-bold text-white uppercase tracking-widest text-sm">Marchés</Link>
              <Link href="/leaderboard" className="block text-lg font-bold text-white uppercase tracking-widest text-sm">Classement</Link>
              <Link href="/pricing" className="block text-lg font-bold text-white uppercase tracking-widest text-sm">Tarification</Link>
              <div className="pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
                {user ? (
                   <Link href="/dashboard" className="btn-primary col-span-2 text-center py-3">Ma Plateforme</Link>
                ) : (
                  <>
                    <Link href="/login" className="btn-secondary text-center py-3">Connexion</Link>
                    <Link href="/register" className="btn-primary text-center py-3">Inscription</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* 1. HERO SECTION */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-neon-green/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-ping"></span>
              <span className="text-xs font-bold text-neon-green uppercase tracking-widest">Financement Immédiat Disponible</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] animate-slide-up">
              TRADER LE <br />
              <span className="gradient-text uppercase">Succès</span> AVEC L'IA
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl leading-relaxed animate-fade-in delay-100">
              Obtenez jusqu'à <span className="text-white font-bold">200 000 $ de financement</span>. 
              Maîtrisez les marchés US et Marocains avec des signaux prédictifs générés par notre <span className="text-neon-blue font-bold">Moteur de Trading Quantique</span>.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 animate-slide-up delay-200">
              <Link href="/register?plan=starter" className="btn-primary px-10 py-5 text-xl group">
                COMMENCER LE CHALLENGE
                <FiZap className="inline ml-3 group-hover:scale-125 transition-transform" />
              </Link>
              <Link href="#dashboard" className="btn-secondary px-10 py-5 text-xl flex items-center justify-center">
                VOIR L'INTERFACE IA
              </Link>
            </div>

            {/* Quick Stats Banner */}
            <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-5xl">
              {[
                { label: 'Capital Max', value: '200K$', icon: <FiDollarSign /> },
                { label: 'Profit Client', value: '80%', icon: <FiPieChart /> },
                { label: 'Support IA', value: '24/7', icon: <FiCpu /> },
                { label: 'Activ. Instant.', value: '<1min', icon: <FiZap /> },
              ].map((stat, i) => (
                <div key={i} className="glass-card flex flex-col items-center py-6 hover:bg-white/10 transition-colors">
                  <div className="text-neon-green text-xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-black text-white">{stat.value}</div>
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ÉCOSYSTÈME SECTION */}
      <section id="ecosytem" className="py-32 px-4 bg-dark-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 text-white uppercase tracking-tighter">L'ÉCOSYSTÈME <br /><span className="text-neon-blue uppercase">Propriétaire</span></h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Une architecture unique combinant capital institutionnel, intelligence artificielle de pointe et formation d'élite.
              </p>
            </div>
            <Link href="/pricing" className="hidden md:flex items-center text-neon-blue font-bold hover:text-neon-green transition-colors">
              VOIR TOUS LES PLANS <FiArrowRight className="ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Prop Firm Card */}
            <div className="glass-card relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FiAward size={120} />
              </div>
              <FiDollarSign className="text-4xl text-neon-green mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">Levier Institutionnel</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Accédez à des comptes financés de 5k$ à 100k$. Gardez 80% de vos gains sans risquer votre propre capital.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-300"><FiShield className="mr-2 text-neon-green" /> Retraits chaque semaine</li>
                <li className="flex items-center text-sm text-gray-300"><FiShield className="mr-2 text-neon-green" /> Pas de limites de temps</li>
              </ul>
            </div>

            {/* AI Card */}
            <div className="glass-card relative overflow-hidden border-neon-blue/30 group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FiCpu size={120} />
              </div>
              <FiCpu className="text-4xl text-neon-blue mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">IA TradeSense Elite</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Notre algorithme propriétaire analyse le marché en temps réel et génère des signaux prédictifs précis pour orienter vos décisions.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-300"><FiActivity className="mr-2 text-neon-blue" /> Analyse Technique IA</li>
                <li className="flex items-center text-sm text-gray-300"><FiActivity className="mr-2 text-neon-blue" /> Alertes en Temps Réel</li>
              </ul>
            </div>

            {/* Academy Card */}
            <div className="glass-card relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FiBookOpen size={120} />
              </div>
              <FiBookOpen className="text-4xl text-neon-purple mb-6" />
              <h3 className="text-2xl font-bold mb-4 text-white uppercase tracking-tight">MasterClass Academy</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Formation complète 100% en ligne. Apprenez les stratégies des institutions et maîtrisez l'outil IA.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-sm text-gray-300"><FiMonitor className="mr-2 text-neon-purple" /> Modules Vidéos HD</li>
                <li className="flex items-center text-sm text-gray-300"><FiMonitor className="mr-2 text-neon-purple" /> Mentorat Communautaire</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERFACE PREVIEW SECTION - ENHANCED */}
      <section id="dashboard" className="py-32 px-4 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-neon-blue/5 rounded-full blur-[160px] -z-10"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6 text-white uppercase tracking-tighter">Votre futur <span className="text-neon-blue">Terminal</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
              Oubliez la complexité. Tradez avec une interface unifiée injectée d'Intelligence Artificielle en temps réel.
            </p>
          </div>

          <div className="relative mx-auto max-w-6xl group">
            {/* Dashboard Mockup Layered UI */}
            <div className="absolute -inset-4 bg-gradient-to-br from-neon-green/20 via-neon-blue/20 to-neon-purple/20 rounded-[40px] blur-2xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#0d0f14] rounded-3xl p-1.5 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {/* Fake Window Controls */}
              <div className="bg-[#1a1d24] border-b border-white/5 rounded-t-2xl py-3 px-6 flex justify-between items-center">
                 <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/30"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/30"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/30"></div>
                 </div>
                 <div className="text-[10px] font-black text-gray-600 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/5">
                    terminal.tradesense.ai — (DÉMO INTERACTIVE)
                 </div>
                 <div className="w-10"></div>
              </div>
              
              <div className="relative aspect-[16/9] overflow-hidden bg-[#0a0c10]">
                {/* Main Mockup Image */}
                <img 
                  src="/real-dashboard-preview.png" 
                  className="w-full h-full object-cover contrast-110 saturate-[0.85]" 
                  alt="Interface Terminal TradeSense"
                />

                {/* Lock Overlay for Non-Connected Users */}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-6 group-hover:backdrop-blur-0 transition-all duration-700">
                  <div className="text-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-700 opacity-90 group-hover:opacity-100">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-blue/20 border border-neon-blue/30 mb-6 shadow-[0_0_30px_rgba(0,136,255,0.2)]">
                      <FiMonitor className="text-2xl text-neon-blue" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Accès Restreint</h3>
                    <p className="text-gray-300 text-sm max-w-xs mx-auto mb-8 font-medium">
                      Connectez-vous pour accéder au terminal complet et recevoir des signaux IA en temps réel.
                    </p>
                    <Link href="/login" className="btn-primary px-8 py-3 text-sm inline-block shadow-neon-blue/20">
                      SE CONNECTER AU TERMINAL
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-20">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-neon-green/10 rounded-xl text-neon-green"><FiLayout size={24} /></div>
              <div>
                <h4 className="text-xl font-bold mb-2">Workspace Modulable</h4>
                <p className="text-gray-400 text-sm">Personnalisez votre interface selon votre style de trading.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-neon-blue/10 rounded-xl text-neon-blue"><FiZap size={24} /></div>
              <div>
                <h4 className="text-xl font-bold mb-2">Exécution Ultra-Rapide</h4>
                <p className="text-gray-400 text-sm">Passez vos ordres en millisecondes avec notre moteur de trading optimisé.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-neon-purple/10 rounded-xl text-neon-purple"><FiPieChart size={24} /></div>
              <div>
                <h4 className="text-xl font-bold mb-2">Analyse de Performance</h4>
                <p className="text-gray-400 text-sm">Suivez vos statistiques détaillées (Winrate, Profit Factor, Drawdown).</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. MARCHÉS SECTION */}
      <section id="markets" className="py-32 px-4 bg-dark-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8">ACCÈS AUX MARCHÉS <br /><span className="text-neon-blue">INTERNATIONAUX</span></h2>
              <div className="space-y-8">
                <div className="flex items-center p-6 glass-card group hover:border-neon-green">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                    <FiGlobe className="text-3xl text-neon-green" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Marché US (Nyse/Nasdaq)</h4>
                    <p className="text-gray-400 text-sm">Tradez Apple, Tesla, Nvidia et les plus grandes valeurs technologiques.</p>
                  </div>
                </div>
                
                <div className="flex items-center p-6 glass-card group hover:border-neon-blue">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                    <FiAward className="text-3xl text-neon-blue" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Marché Marocain (BVC)</h4>
                    <p className="text-gray-400 text-sm">Accès exclusif aux actions du MASI (Attijari, Itissalat, etc.).</p>
                  </div>
                </div>

                <div className="flex items-center p-6 glass-card group hover:border-neon-purple">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mr-6 group-hover:scale-110 transition-transform">
                    <FiZap className="text-3xl text-neon-purple" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-1">Crypto-monnaies</h4>
                    <p className="text-gray-400 text-sm">Le marché ne dort jamais. Tradez les cryptos 24h/24, 7j/7.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Abstract Visual of Market Bubbles/Heatmap */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card flex flex-col items-center justify-center h-48 border-neon-green/20 animate-slide-up">
                  <span className="text-gray-500 text-xs font-bold uppercase mb-2">NASDAQ</span>
                  <span className="text-3xl font-black text-neon-green">+2.45%</span>
                  <span className="text-white font-bold mt-2">NVDA</span>
                </div>
                <div className="glass-card flex flex-col items-center justify-center h-48 border-neon-red/20 animate-slide-up delay-100">
                  <span className="text-gray-500 text-xs font-bold uppercase mb-2">BVC</span>
                  <span className="text-3xl font-black text-neon-red">-0.12%</span>
                  <span className="text-white font-bold mt-2">IAM</span>
                </div>
                <div className="glass-card flex flex-col items-center justify-center h-48 border-neon-blue/20 animate-slide-up delay-200 col-span-2">
                   <FiActivity className="text-neon-blue text-4xl mb-4" />
                   <span className="text-white font-black text-xl">Signaux IA Actifs</span>
                   <span className="text-gray-500 text-xs mt-1">Plus de 50 actifs analysés par minute</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. NEWS & COMMUNITY */}
      <section id="news" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-6">ACTUALITÉS & <span className="text-neon-purple">COMMUNAUTÉ</span></h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Restez informé des derniers mouvements de marché et interagissez avec une communauté de traders passionnés.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {NEWS_ARTICLES.slice(0, 3).map((article, idx) => {
              const isLocked = !user && idx > 0;
              return (
                <div key={article.id} className="glass-card flex flex-col group relative overflow-hidden h-full">
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center">
                      <FiLock className="text-4xl text-neon-blue mb-4 animate-bounce" />
                      <h4 className="text-white font-bold mb-2">CONTENU PREMIUM</h4>
                      <p className="text-gray-500 text-xs mb-6">Inscrivez-vous pour débloquer toutes les analyses de marché.</p>
                      <Link href="/register" className="btn-primary py-2 px-6 text-xs font-bold">REJOINDRE GRATUITEMENT</Link>
                    </div>
                  )}
                  <div className="h-48 overflow-hidden -mx-6 -mt-6 mb-6">
                    <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 flex-grow line-clamp-2">{article.title}</h3>
                  <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-white/5">
                    <span className="font-bold text-neon-blue uppercase">{article.category}</span>
                    <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Social Proof */}
          <div className="mt-20 glass-card p-12 text-center bg-gradient-to-r from-neon-blue/5 to-neon-purple/5">
            <FiUsers className="text-5xl text-neon-blue mx-auto mb-6" />
            <h3 className="text-3xl font-black mb-4">+1,240 TRADERS ACTIFS</h3>
            <p className="text-gray-400 max-w-2xl mx-auto mb-10">
              Notre communauté ne cesse de croître. Partagez des idées, suivez les meilleurs traders dans le classement et progressez ensemble.
            </p>
            <div className="flex justify-center space-x-8">
              <Link href="/leaderboard" className="text-neon-blue font-bold hover:underline flex items-center">
                Voir le Classement <FiArrowRight className="ml-2" />
              </Link>
              <Link href="/community" className="text-neon-purple font-bold hover:underline flex items-center">
                Entrer dans la Zone Community <FiArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-40 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-neon-green/5 -skew-y-3"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1]">
            PRÊT À RÉVÉLER LE <br /><span className="gradient-text uppercase">TRADER</span> QUI EST EN VOUS ?
          </h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Pas de délais, pas de paperasse. Support PayPal et Stripe disponible pour une activation immédiate de votre capital.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register" className="btn-primary px-12 py-6 text-2xl font-black">
              CRÉER MON COMPTE
            </Link>
            <div className="flex items-center justify-center space-x-6">
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-6 opacity-30 invert" alt="PayPal" />
              <div className="h-6 w-px bg-white/20"></div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" className="h-6 opacity-30 invert" alt="Stripe" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-24 px-4 bg-black/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-neon-green rounded-lg flex items-center justify-center">
                  <FiTrendingUp className="text-dark-bg text-lg" />
                </div>
                <span className="text-xl font-bold tracking-tighter text-white">TRADESENSE AI</span>
              </Link>
              <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
                La première plateforme de prop trading assistée par IA conçue pour l'émergence des talents du trading en Afrique et au Maroc.
              </p>
            </div>
            <div>
              <h5 className="font-black text-white text-xs uppercase tracking-widest mb-6">Plateforme</h5>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="#ecosytem" className="hover:text-neon-green transition-colors">Écosystème</Link></li>
                <li><Link href="#dashboard" className="hover:text-neon-green transition-colors">Interface Pro</Link></li>
                <li><Link href="#markets" className="hover:text-neon-green transition-colors">Marchés & Prix</Link></li>
                <li><Link href="/pricing" className="hover:text-neon-green transition-colors">Tarification</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-black text-white text-xs uppercase tracking-widest mb-6">Legal & Support</h5>
              <ul className="space-y-4 text-sm text-gray-500">
                <li><Link href="/terms" className="hover:text-neon-green transition-colors">Conditions Générales</Link></li>
                <li><Link href="/privacy" className="hover:text-neon-green transition-colors">Confidentialité</Link></li>
                <li><Link href="/contact" className="hover:text-neon-green transition-colors">Contact Expert</Link></li>
                <li><Link href="#academy" className="hover:text-neon-green transition-colors">MasterClass FAQ</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-white/5">
            <p className="text-gray-600 text-xs font-bold uppercase tracking-widest mb-4 md:mb-0">
              © 2026 TRADESENSE AI. DÉVELOPPÉ PAR AKKAD ABDELMOUGHIT.
            </p>
            <div className="flex space-x-8">
              <FiGlobe className="text-gray-600 hover:text-white transition-colors cursor-pointer" />
              <FiUsers className="text-gray-600 hover:text-white transition-colors cursor-pointer" />
              <FiShield className="text-gray-600 hover:text-white transition-colors cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <NewsModal article={selectedArticle} isOpen={isModalOpen} onClose={closeModal} />
    </div>
  );
}
