'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiLock, FiCheckCircle, FiXCircle, FiAlertCircle, FiTrendingUp } from 'react-icons/fi';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Token de réinitialisation manquant');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: 'Faible', color: 'bg-red-500' };
    if (strength === 3) return { strength, label: 'Moyen', color: 'bg-yellow-500' };
    return { strength, label: 'Fort', color: 'bg-green-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, new_password: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setError(data.error || 'Échec de la réinitialisation');
      }
    } catch (err) {
      setError('Erreur réseau. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
            <FiCheckCircle className="text-5xl text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-green-500">Mot de passe réinitialisé!</h2>
          <p className="text-gray-400 mb-6">
            Votre mot de passe a été mis à jour avec succès.
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Redirection vers la page de connexion dans 3 secondes...
          </p>
          <Link href="/login" className="btn-primary">
            Se connecter maintenant
          </Link>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full text-center">
          <FiXCircle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Lien Invalide</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/forgot-password" className="btn-secondary">
            Demander un nouveau lien
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
          <h1 className="text-3xl font-bold mb-2">Nouveau mot de passe</h1>
          <p className="text-gray-400 mb-6">
            Choisissez un mot de passe fort pour sécuriser votre compte.
          </p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Nouveau mot de passe</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Force du mot de passe</span>
                    <span className={`text-xs font-bold ${
                      passwordStrength.label === 'Faible' ? 'text-red-500' :
                      passwordStrength.label === 'Moyen' ? 'text-yellow-500' :
                      'text-green-500'
                    }`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${passwordStrength.color} transition-all duration-300`}
                      style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    <PasswordCriteria met={newPassword.length >= 8} text="Au moins 8 caractères" />
                    <PasswordCriteria met={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)} text="Majuscules et minuscules" />
                    <PasswordCriteria met={/\d/.test(newPassword)} text="Au moins un chiffre" />
                    <PasswordCriteria met={/[^a-zA-Z0-9]/.test(newPassword)} text="Caractère spécial (!@#$%...)" />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2">Confirmer le mot de passe</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPassword && (
                  <div className="absolute right-3 top-3.5">
                    {newPassword === confirmPassword ? (
                      <FiCheckCircle className="text-green-500" />
                    ) : (
                      <FiXCircle className="text-red-500" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || newPassword !== confirmPassword}
              className="btn-primary w-full"
            >
              {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-gray-400 hover:text-neon-green transition-colors text-sm">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordCriteria({ met, text }) {
  return (
    <div className="flex items-center text-xs">
      {met ? (
        <FiCheckCircle className="text-green-500 mr-2 flex-shrink-0" />
      ) : (
        <FiAlertCircle className="text-gray-600 mr-2 flex-shrink-0" />
      )}
      <span className={met ? 'text-green-500' : 'text-gray-600'}>{text}</span>
    </div>
  );
}
