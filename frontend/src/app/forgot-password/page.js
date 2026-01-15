'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiMail, FiArrowLeft, FiCheckCircle, FiTrendingUp } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-neon-blue/20 rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-5xl text-neon-blue" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Email Envoyé!</h2>
          <p className="text-gray-400 mb-6">
            Si un compte existe avec l'adresse <span className="text-neon-blue font-bold">{email}</span>, vous recevrez un lien de réinitialisation.
          </p>
          
          <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-300 mb-2">
              📋 <strong>Pour le développement:</strong>
            </p>
            <p className="text-xs text-gray-500">
              Vérifiez votre <strong>console backend</strong> pour le lien de réinitialisation!
            </p>
          </div>

          <Link href="/login" className="btn-primary w-full">
            Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex justify-center items-center space-x-2 mb-8">
          <FiTrendingUp className="text-neon-green text-3xl" />
          <span className="text-2xl font-bold gradient-text">TradeSense AI</span>
        </Link>

        <div className="glass-card">
          <Link href="/login" className="flex items-center text-gray-400 hover:text-neon-green transition-colors mb-6">
            <FiArrowLeft className="mr-2" />
            Retour à la connexion
          </Link>

          <h1 className="text-3xl font-bold mb-2">Mot de passe oublié?</h1>
          <p className="text-gray-400 mb-6">
            Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  className="input-field pl-10"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
