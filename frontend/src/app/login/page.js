'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { FiMail, FiLock, FiTrendingUp } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
   e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(formData);
      
      // Save token and user data
      AuthService.setToken(response.data.access_token);
      AuthService.setUser(response.data.user);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex justify-center items-center space-x-2 mb-8">
          <FiTrendingUp className="text-neon-green text-3xl" />
          <span className="text-2xl font-bold gradient-text">TradeSense AI</span>
        </Link>

        {/* Login Card */}
        <div className="glass-card">
          <h1 className="text-3xl font-bold text-center mb-6">Connexion</h1>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="input-field pl-10"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-400 hover:text-neon-green transition-colors"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Connexion...' : 'Se Connecter'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center text-gray-400">
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-neon-green hover:text-neon-blue transition-colors">
              S'inscrire
            </Link>
          </div>

          {/* Demo Accounts */}
          <div className="mt-6 p-4 glass rounded-lg">
            <p className="text-sm text-gray-400 text-center mb-2">Comptes de démonstration :</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>👤 Admin: admin@tradesense.ai / admin123</p>
              <p>👤 User: user1@test.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
