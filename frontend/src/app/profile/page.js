'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { FiUser, FiMail, FiPhone, FiLock, FiTrendingUp, FiAward, FiCalendar, FiLogOut, FiEdit2, FiSave, FiCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const showWelcome = searchParams?.get('welcome') === 'true';
  
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [welcomeVisible, setWelcomeVisible] = useState(showWelcome);

  // Profile form
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    bio: '',
    language: 'fr'
  });

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && !AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const [profileRes, statsRes] = await Promise.all([
        authAPI.getProfile(),
        authAPI.getStats()
      ]);

      setUser(profileRes.data.user);
      setStats(statsRes.data.stats);
      
      // Initialize form with user data
      setProfileForm({
        full_name: profileRes.data.user.full_name || '',
        phone: profileRes.data.user.phone || '',
        bio: profileRes.data.user.bio || '',
        language: profileRes.data.user.language || 'fr'
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(profileForm);
      setUser(response.data.user);
      // Update localStorage so dashboard and other pages get the updated user data
      AuthService.setUser(response.data.user);
      setEditing(false);
      alert('Profil mis à jour avec succès!');
    } catch (err) {
      alert(err.response?.data?.error || 'Échec de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      alert('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setSaving(true);

    try {
      await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      });
      
      alert('Mot de passe changé avec succès!');
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      alert(err.response?.data?.error || 'Échec du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  const getPlanBadge = (plan) => {
    const badges = {
      free: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
      starter: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
      pro: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
      elite: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    };
    return badges[plan] || badges.free;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
          <p className="mt-4 text-gray-400">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/dashboard" className="inline-flex items-center space-x-2 mb-6 text-gray-400 hover:text-neon-green transition-colors">
          <FiTrendingUp className="text-2xl" />
          <span className="font-bold">← Retour au Dashboard</span>
        </Link>

        <div className="glass-card text-center">
          <div className="mb-4">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-neon-green to-neon-blue mx-auto flex items-center justify-center text-4xl font-bold">
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">{user?.full_name}</h1>
          <p className="text-gray-400 mb-4">{user?.email}</p>
          <div className="flex items-center justify-center space-x-4">
            <span className={`px-4 py-1 rounded-full text-sm font-semibold uppercase ${getPlanBadge(user?.plan_type)}`}>
              {user?.plan_type === 'free' ? '🎁 Gratuit' : user?.plan_type}
            </span>
            <span className="text-sm text-gray-400 flex items-center">
              <FiCalendar className="mr-2" />
              Membre depuis {new Date(user?.created_at).toLocaleDateString('fr-FR')}
            </span>
          </div>
        </div>
      </div>

      {/* Welcome Message for New Users */}
      {welcomeVisible && user?.plan_type === 'free' && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-gradient-to-r from-neon-green/20 to-neon-blue/20 border border-neon-green/30 rounded-xl p-6 relative">
            <button
              onClick={() => setWelcomeVisible(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-start space-x-4">
              <div className="text-4xl">🎉</div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-neon-green">Bienvenue sur TradeSense AI !</h3>
                <p className="text-gray-300 mb-4">
                  Votre compte démo est prêt avec <span className="font-bold text-neon-green">500$ de capital virtuel</span>.
                  Atteignez <span className="font-bold text-neon-green">5% de profit</span> pour valider votre challenge.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm">
                    <FiCheck className="text-neon-green mr-2" />
                    <span>Capital : 500$</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiCheck className="text-neon-green mr-2" />
                    <span>Objectif : +5%</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FiCheck className="text-neon-green mr-2" />
                    <span>7 jours d'accès</span>
                  </div>
                </div>
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn-primary px-6 py-2"
                >
                  Commencer à Trader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex space-x-1 glass-card p-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'info' ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            Informations
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'security' ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sécurité
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              activeTab === 'stats' ? 'bg-neon-green/20 text-neon-green' : 'text-gray-400 hover:text-white'
            }`}
          >
            Statistiques
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto">
        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="glass-card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Informations Personnelles</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="btn-secondary py-2 px-4">
                  <FiEdit2 className="inline mr-2" />
                  Modifier
                </button>
              ) : (
                <button onClick={() => setEditing(false)} className="btn-secondary py-2 px-4">
                  Annuler
                </button>
              )}
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiUser className="inline mr-2" />
                    Nom Complet
                  </label>
                  <input
                    type="text"
                    disabled={!editing}
                    className="input-field"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiMail className="inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    disabled
                    className="input-field opacity-50 cursor-not-allowed"
                    value={user?.email}
                  />
                  <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    <FiPhone className="inline mr-2" />
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    disabled={!editing}
                    className="input-field"
                    placeholder="+212 6XX XXX XXX"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Langue Préférée</label>
                  <select
                    disabled={!editing}
                    className="input-field"
                    value={profileForm.language}
                    onChange={(e) => setProfileForm({ ...profileForm, language: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Biographie</label>
                <textarea
                  disabled={!editing}
                  className="input-field"
                  rows="4"
                  placeholder="Parlez-nous de vous..."
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                ></textarea>
              </div>

              {editing && (
                <button type="submit" disabled={saving} className="btn-primary w-full md:w-auto px-8">
                  <FiSave className="inline mr-2" />
                  {saving ? 'Enregistrement...' : 'Enregistrer les Modifications'}
                </button>
              )}
            </form>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-6">Sécurité</h2>

            <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
              <div>
                <label className="block text-sm font-medium mb-2">
                  <FiLock className="inline mr-2" />
                  Mot de Passe Actuel
                </label>
                <input
                  type="password"
                  required
                  className="input-field"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FiLock className="inline mr-2" />
                  Nouveau Mot de Passe
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="input-field"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  <FiLock className="inline mr-2" />
                  Confirmer le Nouveau Mot de Passe
                </label>
                <input
                  type="password"
                  required
                  minLength="6"
                  className="input-field"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full">
                {saving ? 'Changement...' : 'Changer le Mot de Passe'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
              <button onClick={handleLogout} className="btn-danger w-full md:w-auto px-8">
                <FiLogOut className="inline mr-2" />
                Se Déconnecter
              </button>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="glass-card">
            <h2 className="text-2xl font-bold mb-6">Statistiques</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Challenges Totaux</span>
                  <FiAward className="text-neon-blue" />
                </div>
                <div className="text-3xl font-bold">{stats?.total_challenges || 0}</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Réussis</span>
                  <FiAward className="text-profit" />
                </div>
                <div className="text-3xl font-bold text-profit">{stats?.passed_challenges || 0}</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Échoués</span>
                  <FiAward className="text-loss" />
                </div>
                <div className="text-3xl font-bold text-loss">{stats?.failed_challenges || 0}</div>
              </div>

              <div className="stat-card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Actifs</span>
                  <FiTrendingUp className="text-neon-green" />
                </div>
                <div className="text-3xl font-bold">{stats?.active_challenges || 0}</div>
              </div>

              <div className="stat-card md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Taux de Réussite</span>
                  <FiAward className="text-neon-purple" />
                </div>
                <div className="text-3xl font-bold text-neon-purple">{stats?.success_rate || 0}%</div>
                <div className="mt-4 h-2 glass rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-profit"
                    style={{ width: `${stats?.success_rate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
