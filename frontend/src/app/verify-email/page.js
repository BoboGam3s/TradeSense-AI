'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FiCheckCircle, FiXCircle, FiMail, FiLoader } from 'react-icons/fi';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token de vérification manquant');
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('Votre email a été vérifié avec succès!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'La vérification a échoué');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card max-w-md w-full text-center">
        {status === 'verifying' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <FiLoader className="text-6xl text-neon-blue mx-auto animate-spin" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Vérification en cours...</h2>
            <p className="text-gray-400">
              Veuillez patienter pendant que nous vérifions votre email.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center">
              <FiCheckCircle className="text-5xl text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-green-500">Email Vérifié!</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">Redirection automatique vers la page de connexion...</p>
              <Link href="/login" className="btn-primary">
                Aller à la connexion
              </Link>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-red-500/20 rounded-full flex items-center justify-center">
              <FiXCircle className="text-5xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-500">Vérification Échouée</h2>
            <p className="text-gray-400 mb-6">{message}</p>
            <div className="flex flex-col gap-3">
              <Link href="/register" className="btn-secondary">
                Créer un nouveau compte
              </Link>
              <Link href="/login" className="text-neon-blue hover:text-neon-green transition-colors text-sm">
                Retour à la connexion
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
