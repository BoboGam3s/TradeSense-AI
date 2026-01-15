'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { FiMail, FiLock, FiUser, FiTrendingUp, FiCheckCircle, FiRefreshCw } from 'react-icons/fi';

import { useSearchParams } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPlan = searchParams.get('plan');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    language: 'fr',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.register(formData);
      
      // Save token and user data
      AuthService.setToken(response.data.access_token);
      AuthService.setUser(response.data.user);
      
      // Show email verification message
      setRegistered(true);
      setRegisteredEmail(formData.email);
      
      // Redirect after 5 seconds (giving user time to read the message)
      setTimeout(() => {
        if (selectedPlan) {
          if (selectedPlan === 'free') {
            router.push('/profile?welcome=true');
          } else {
            router.push(`/checkout?plan=${selectedPlan}`);
            
            // Also save to localStorage for backup
            if (typeof window !== 'undefined') {
               // Basic reconstruction of plan object for checkout
               const priceMap = { starter: 200, pro: 500, elite: 1000 };
               localStorage.setItem('selectedPlan', JSON.stringify({
                 type: selectedPlan,
                 name: selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1),
                 price: priceMap[selectedPlan] || 200,
                 currency: 'DH'
              }));
            }
          }
        } else {
          // No plan selected, go to pricing to choose
          router.push('/pricing');
        }
      }, 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendingEmail(true);
    try {
      const token = AuthService.getToken();
      await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      alert('Email de vérification renvoyé! Vérifiez votre boîte de réception.');
    } catch (err) {
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setResendingEmail(false);
    }
  };

  // Success state - show after registration
  if (registered) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-neon-green/20 rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-5xl text-neon-green" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Inscription Réussie!</h2>
          <p className="text-gray-400 mb-4">
            Bienvenue chez <span className="text-neon-green font-bold">TradeSense AI</span>!
          </p>
          
          <div className="bg-neon-blue/10 border border-neon-blue/20 rounded-xl p-4 mb-6">
            <FiMail className="text-3xl text-neon-blue mx-auto mb-2" />
            <p className="text-sm text-gray-300 mb-2">
              Un email de vérification a été envoyé à:
            </p>
            <p className="text-neon-blue font-bold mb-3">{registeredEmail}</p>
            <p className="text-xs text-gray-500">
              Vérifiez votre boîte de réception et cliquez sur le lien pour activer votre compte.
            </p>
          </div>

          <button 
            onClick={handleResendEmail}
            disabled={resendingEmail}
            className="btn-secondary w-full mb-4 flex items-center justify-center"
          >
            <FiRefreshCw className={`mr-2 ${resendingEmail ? 'animate-spin' : ''}`} />
            {resendingEmail ? 'Envoi...' : 'Renvoyer l\'email'}
          </button>

          <p className="text-xs text-gray-500 mb-4">
            Redirection automatique dans 5 secondes...
          </p>

          <Link href="/dashboard" className="text-neon-green hover:text-neon-blue transition-colors text-sm">
            Continuer sans vérifier →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex justify-center items-center space-x-2 mb-8">
          <FiTrendingUp className="text-neon-green text-3xl" />
          <span className="text-2xl font-bold gradient-text">TradeSense AI</span>
        </Link>

        {/* Register Card */}
        <div className="glass-card">
          <h1 className="text-3xl font-bold text-center mb-6">Inscription</h1>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Nom Complet</label>
              <div className="relative">
                <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  required
                  className="input-field pl-10"
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="votre@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium mb-2">Langue</label>
              <select
                className="input-field bg-dark-bg"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="fr" className="bg-[#1a1d24] text-white">Français</option>
                <option value="en" className="bg-[#1a1d24] text-white">English</option>
                <option value="ar" className="bg-[#1a1d24] text-white">العربية</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Inscription...' : 'S\'inscrire'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-gray-400">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-neon-green hover:text-neon-blue transition-colors">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
