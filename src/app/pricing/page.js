'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { paymentAPI } from '../../lib/api';   
import { AuthService } from '../../lib/auth';
import { FiCheck, FiTrendingUp } from 'react-icons/fi';

const plans = {
  free: {
    name: 'Essai Démo',
    price: 0,
    currency: 'DH',
    description: 'Pour découvrir l\'interface sans risque.',
    features: [
      'Capital de Test : $500',
      'Accès Terminal de Trading',
      'Données Temps Réel (Limité)',
      'Support Communautaire',
      '❌ Pas d\'Accès Académie',
      '❌ Pas de Signaux IA',
    ],
    free: true,
  },
  mini_funded: {
    name: 'Mini Funded',
    price: 600,
    currency: 'DH',
    description: 'Compte Financé Immédiat - $3,000',
    features: [
      'Capital Direct : $3 000',
      'Profit Split : 80%',
      'Pas de Challenge Requis',
      'Retraits Hebdomadaires',
      'Support IA Standard',
      '❌ Académie Masterclass',
    ],
    highlight: true,
  },
  starter: {
    name: 'Starter Trader',
    price: 200,
    currency: 'DH',
    description: 'L\'essentiel pour débuter sa carrière.',
    features: [
      'Capital Challenge : $5 000',
      'Objectif de Profit : 10%',
      'Support IA Standard 24/7',
      'Marchés US & Crypto',
      'Académie : Niveau 1 Inclus',
      '❌ Signaux IA Premium',
    ],
  },
  pro: {
    name: 'Pro Trader',
    price: 500,
    currency: 'DH',
    description: 'Le choix des gagnants. Performance maximale.',
    features: [
      'Capital Challenge : $50 000',
      'Signaux IA Premium (85% Précision)',
      'Académie : Accès Complet (Niv 1 & 2)',
      'Analyse de Performance par IA',
      'Rapports de Marché Journaliers',
      'Accès Marché Marocain (BVC)',
    ],
    popular: true,
  },
  elite: {
    name: 'Elite Institutional',
    price: 1000,
    currency: 'DH',
    description: 'Gestion de capital haut niveau.',
    features: [
      'Capital Challenge : $200 000',
      'Académie : Masterclass VIP',
      'Coaching 1-on-1 Mensuel',
      'Support Prioritaire 24/7',
      'Paiements Prioritaires Profix',
      'Groupe Discord Privé Elite',
    ],
    isElite: true,
  },
};

export default function PricingPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = typeof window !== 'undefined' && AuthService.isAuthenticated();

  const handleSelectPlan = async (planType, plan) => {
    if (!isAuthenticated) {
      router.push(`/register?plan=${planType}`);
      return;
    }

    if (planType === 'free') {
      router.push('/profile?welcome=true');
      return;
    }

    setSelectedPlan(planType);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedPlan', JSON.stringify({
        type: planType,
        ...plan
      }));
    }
    
    router.push(`/checkout?plan=${planType}`);
  };

  return (
    <div className="min-h-screen bg-dark-bg py-20 px-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] -z-10"></div>

      <div className="max-w-7xl mx-auto mb-20 text-center">
        <Link href="/" className="inline-flex items-center space-x-2 mb-12 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-neon-green transition-all hover:bg-white/10 group">
          <FiTrendingUp className="text-xl group-hover:rotate-12 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Retour à l'écosystème</span>
        </Link>

        <h1 className="text-5xl md:text-7xl font-black mb-6 text-white tracking-tighter uppercase">
          VOTRE CARRIÈRE <br /><span className="gradient-text">COMMENCE ICI</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
          Choisissez le capital qui correspond à votre ambition. Pas de frais cachés, pas de risques personnels sur votre capital propre.
        </p>
      </div>

      <div className="max-w-7xl mx-auto mb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Object.entries(plans).map(([key, plan]) => {
            const isPro = key === 'pro';
            const isMini = key === 'mini_funded';
            const isFree = key === 'free';
            const isElite = plan.isElite;
            
            return (
              <div
                key={key}
                className={`glass-card relative flex flex-col p-8 transition-all duration-500 hover:translate-y-[-8px] ${
                  isElite ? 'border-[#FFD700] bg-gradient-to-br from-[#FFD700]/10 to-transparent glow-gold lg:scale-[1.05] z-10' :
                  isPro ? 'border-neon-green bg-neon-green/5 shadow-[0_0_40px_rgba(34,197,94,0.1)]' : 
                  isMini ? 'border-neon-purple bg-neon-purple/5 shadow-[0_0_40px_rgba(168,85,247,0.1)]' :
                  'border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 -translate-y-1/2">
                    <span className="bg-neon-green text-dark-bg px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-neon-green/30">
                      RECOMMANDÉ
                    </span>
                  </div>
                )}
                {plan.highlight && (
                  <div className="absolute top-0 right-8 -translate-y-1/2">
                    <span className="bg-neon-purple text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-neon-purple/30">
                      INSTANT FUNDED
                    </span>
                  </div>
                )}
                {isElite && (
                  <div className="absolute top-0 right-8 -translate-y-1/2">
                    <span className="bg-[#FFD700] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#FFD700]/30 glow-gold">
                      VIP INSTITUTIONNEL
                    </span>
                  </div>
                )}

                <div className="mb-8 border-b border-white/5 pb-8 relative">
                  <h2 className={`text-xs font-black uppercase tracking-[0.3em] mb-4 ${isElite ? 'text-gold' : 'text-gray-500'}`}>{plan.name}</h2>
                  <div className="flex items-baseline space-x-2 mb-4">
                    <span className={`text-6xl font-black ${isElite ? 'text-gold' : isPro ? 'text-neon-green' : isMini ? 'text-neon-purple' : 'text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-2xl font-bold uppercase ${isElite ? 'text-gold opacity-80' : 'text-gray-600'}`}>{plan.currency}</span>
                  </div>
                  <p className={`text-sm font-medium leading-relaxed ${isElite ? 'text-gold/60' : 'text-gray-400'}`}>{plan.description}</p>
                </div>

                <div className="flex-grow space-y-5 mb-10">
                  {plan.features.map((feature, idx) => {
                    const isLocked = feature.includes('❌');
                    const text = feature.replace('❌ ', '');
                    return (
                      <div key={idx} className={`flex items-start space-x-3 ${isLocked ? 'opacity-30' : ''}`}>
                        <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isLocked ? 'bg-red-500/20' : isElite ? 'bg-gold-gradient shadow-[0_0_10px_rgba(255,215,0,0.3)]' : isPro ? 'bg-neon-green/20' : isMini ? 'bg-neon-purple/20' : 'bg-white/10'}`}>
                           {isLocked ? <span className="text-[10px] text-red-500 font-black">×</span> : <FiCheck className={`text-[10px] ${isElite ? 'text-black' : isPro ? 'text-neon-green' : isMini ? 'text-neon-purple' : 'text-white'}`} />}
                        </div>
                        <span className={`text-sm font-bold ${isLocked ? 'text-gray-500 line-through' : isElite ? 'text-gold/90' : 'text-gray-300'}`}>
                          {text}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleSelectPlan(key, plan)}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 ${
                    isElite ? 'bg-gold-gradient text-black glow-gold hover:scale-[1.05] shadow-[0_0_30px_rgba(255,215,0,0.2)]' :
                    isPro ? 'bg-neon-green text-dark-bg hover:shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:scale-[1.02]' : 
                    isMini ? 'bg-neon-purple text-white hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-[1.02]' :
                    'bg-white/5 text-white hover:bg-white/10 hover:scale-[1.02]'
                  }`}
                >
                  {isFree ? 'Essayer la Demo' : isMini ? 'Activer le Compte' : 'Lancer le Challenge'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison table or info footer */}
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="glass-card p-10 bg-gradient-to-br from-neon-blue/5 to-transparent border-neon-blue/20">
                <h3 className="text-3xl font-black mb-6 text-white tracking-tight uppercase">Pourquoi TradeSense ?</h3>
                <div className="space-y-6">
                    <div className="flex space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-neon-blue/10 flex items-center justify-center text-neon-blue font-bold flex-shrink-0">80%</div>
                        <div>
                            <p className="text-white font-bold mb-1 uppercase text-xs tracking-widest">Profit Share</p>
                            <p className="text-gray-400 text-sm">Gérez le capital et gardez la majorité de vos profits générés.</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-neon-green/10 flex items-center justify-center text-neon-green font-bold flex-shrink-0">IA</div>
                        <div>
                            <p className="text-white font-bold mb-1 uppercase text-xs tracking-widest">Signaux Inclus</p>
                            <p className="text-gray-400 text-sm">Tous nos plans payants incluent l'accès à l'intelligence artificielle.</p>
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 flex items-center justify-center text-neon-purple font-bold flex-shrink-0">BVC</div>
                        <div>
                            <p className="text-white font-bold mb-1 uppercase text-xs tracking-widest">Marché Global</p>
                            <p className="text-gray-400 text-sm">Tradez New York, les Cryptos et la Bourse de Casablanca.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="text-center md:text-left">
                <h3 className="text-4xl font-black mb-6 text-white uppercase tracking-tighter leading-none">Besoin d'un <br /><span className="text-neon-green">Plan Sur Mesure ?</span></h3>
                <p className="text-gray-400 mb-8 font-medium">
                    Vous gérez une équipe de traders ou souhaitez un capital supérieur à 200,000 $ ? Contactez notre département institutionnel.
                </p>
                <Link href="/contact" className="btn-secondary px-10 py-4 inline-block font-black uppercase text-xs tracking-[0.2em]">
                    Contacter un Expert
                </Link>
            </div>
        </div>
      </div>
    </div>
  );
}
