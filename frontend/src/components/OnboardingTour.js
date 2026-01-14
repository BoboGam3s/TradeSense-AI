'use client';

import React, { useState, useEffect } from 'react';
import Joyride, { ACTIONS, EVENTS, STATUS } from 'react-joyride';
import { authAPI } from '../lib/api';
import { AuthService } from '../lib/auth';

export default function OnboardingTour({ run, onFinish }) {
  const [steps] = useState([
    {
      target: 'body',
      content: (
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2 text-neon-blue">Bienvenue sur TradeSense AI! 🚀</h2>
          <p className="text-gray-300">
            Prêt à devenir un trader d'élite ? Laissez-nous vous faire visiter votre nouveau cockpit de trading.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#tour-balance',
      content: 'Voici votre capital de trading et votre progression actuelle. Gardez un œil sur votre "Net Worth" !',
      placement: 'bottom',
    },
    {
      target: '#tour-chart',
      content: 'Analysez les marchés en temps réel avec nos graphiques professionnels TradingView.',
      placement: 'right',
    },
    {
      target: '#tour-trade-panel',
      content: 'Passez vos ordres d\'achat et de vente ici. Gérez vos risques avec les Stop Loss et Take Profit.',
      placement: 'left',
    },
    {
      target: '#tour-journal-btn', 
      content: 'Un bon trader apprend de ses erreurs. Utilisez le Journal pour noter vos stratégies et émotions.',
      placement: 'top',
    },
    {
      target: '#tour-academy',
      content: 'Accédez à la TradeSense Academy pour des formations exclusives et améliorez vos compétences.',
      placement: 'bottom',
    },
    {
        target: 'body',
        content: (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2 text-neon-green">C'est parti ! 📈</h2>
            <p className="text-gray-300">
              Vous êtes prêt. Commencez votre challenge dès maintenant. Bonne chance !
            </p>
          </div>
        ),
        placement: 'center',
    }
  ]);

  const handleJoyrideCallback = async (data) => {
    const { status, type } = data;
    
    // When tour is finished or skipped
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
        try {
            await authAPI.completeOnboarding();
            
            // Update local user data
            const currentUser = AuthService.getUser();
            if (currentUser) {
                currentUser.has_completed_onboarding = true;
                AuthService.setUser(currentUser);
            }
            
            if (onFinish) onFinish();
        } catch (error) {
            console.error('Failed to save onboarding status:', error);
        }
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          arrowColor: '#1a1b1e',
          backgroundColor: '#1a1b1e',
          overlayColor: 'rgba(0, 0, 0, 0.85)',
          primaryColor: '#00ff88',
          textColor: '#fff',
          width: 400,
          zIndex: 10000,
        },
        tooltip: {
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.2)',
        },
        buttonNext: {
            backgroundColor: '#00ff88',
            color: '#000',
            fontWeight: 'bold',
            borderRadius: '8px',
        },
        buttonBack: {
            color: '#888',
        }
      }}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant',
        skip: 'Passer',
      }}
    />
  );
}
