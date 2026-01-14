'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentAPI } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { FiCheck, FiCreditCard, FiLock, FiTrendingUp, FiArrowLeft } from 'react-icons/fi';
import { FaPaypal, FaBitcoin } from 'react-icons/fa';

const COUNTRIES = ['Maroc', 'France', 'Belgique', 'Suisse', 'Canada', 'Autre'];

// Helper component to load PayPal SDK stably
function PayPalLoader({ amount, onSuccess }) {
  const renderedRef = useRef(false);

  useEffect(() => {
    // Prevent double rendering which causes lag/loops
    if (renderedRef.current) return;

    const loadPayPal = async () => {
      if (window.paypal) {
        renderButtons();
        return;
      }

      // Check if global script already exists
      if (!document.getElementById('paypal-sdk-script')) {
        const script = document.createElement('script');
        script.id = 'paypal-sdk-script';
        script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD&disable-funding=credit,card";
        script.async = true;
        script.onload = renderButtons;
        script.onerror = () => alert("Erreur lors du chargement de PayPal SDK");
        document.body.appendChild(script);
      }
    };

    const renderButtons = () => {
      // Small timeout to ensure container is in DOM
      setTimeout(() => {
        if (window.paypal && document.getElementById('paypal-button-container') && !renderedRef.current) {
          const container = document.getElementById('paypal-button-container');
          container.innerHTML = '';
          renderedRef.current = true;
          
          const usdAmount = (parseFloat(amount) / 10).toFixed(2);

          window.paypal.Buttons({
            style: {
              layout: 'vertical',
              color: 'gold',
              shape: 'rect',
              label: 'paypal'
            },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [{
                  amount: {
                    currency_code: 'USD',
                    value: usdAmount
                  },
                  description: `TradeSense AI - Plan (${amount} DH)`
                }]
              });
            },
            onApprove: (data, actions) => {
              return actions.order.capture().then((details) => {
                onSuccess(data.orderID);
              });
            },
            onError: (err) => {
              console.error('PayPal Buttons Error:', err);
              renderedRef.current = false; // Allow retry on error
            }
          }).render('#paypal-button-container');
        }
      }, 100);
    };

    loadPayPal();
  }, [amount, onSuccess]);

  return null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planType = searchParams.get('plan');

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    postal_code: '',
    country: 'Maroc',
    card_number: '',
    card_expiry: '',
    card_cvv: '',
    card_name: '',
  });

  const [expiryError, setExpiryError] = useState('');

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined' && !AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }

    // Load user data
    const userData = AuthService.getUser();
    if (userData) {
      setFormData(prev => ({
        ...prev,
        full_name: userData.full_name || '',
        email: userData.email || '',
      }));
    }

    // Load plan data from localStorage
    const storedPlan = localStorage.getItem('selectedPlan');
    if (storedPlan) {
      setPlan(JSON.parse(storedPlan));
    } else if (!planType) {
      router.push('/pricing');
    }

    // Handle PayPal Success Event
    const handlePayPalSuccess = async (e) => {
      const { orderID } = e.detail;
      setLoading(true);
      try {
        await paymentAPI.capturePayPalOrder({
          orderID: orderID,
          plan_type: plan?.type || planType
        });
        alert('Félicitations ! Votre paiement PayPal a été confirmé.');
        localStorage.removeItem('selectedPlan');
        router.push('/dashboard');
      } catch (err) {
        alert('Erreur lors de la confirmation du paiement PayPal.');
        setLoading(false);
      }
    };

    window.addEventListener('paypal-success', handlePayPalSuccess);
    return () => window.removeEventListener('paypal-success', handlePayPalSuccess);
  }, [planType, router, plan]);

  const handlePayPalButtonSuccess = useCallback((orderID) => {
    const event = new CustomEvent('paypal-success', { detail: { orderID } });
    window.dispatchEvent(event);
  }, []);

  const validateExpiryDate = (expiry) => {
    if (!expiry) {
      setExpiryError('Date d\'expiration requise');
      return false;
    }

    if (!expiry.includes('/') || expiry.length !== 5) {
      setExpiryError('Format invalide. Utilisez MM/YY');
      return false;
    }

    const [monthStr, yearStr] = expiry.split('/');
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10) + 2000; // Assume 20xx

    if (month < 1 || month > 12) {
      setExpiryError('Mois invalide (01-12)');
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setExpiryError('Carte expirée');
      return false;
    }

    if (year > currentYear + 20) {
      setExpiryError('Année d\'expiration invalide');
      return false;
    }

    setExpiryError('');
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'card_number') {
      const cleaned = value.replace(/\s/g, '');
      const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
      setFormData({ ...formData, [name]: formatted });
    }
    // Format expiry date
    else if (name === 'card_expiry') {
      const cleaned = value.replace(/\D/g, '');
      const formatted = cleaned.length >= 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}` : cleaned;
      setFormData({ ...formData, [name]: formatted });
      
      // Validate on blur or when complete
      if (formatted.length === 5) {
        validateExpiryDate(formatted);
      } else {
        setExpiryError('');
      }
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate payment method
      if (paymentMethod === 'card') {
        if (!formData.card_number || !formData.card_expiry || !formData.card_cvv) {
          alert('Veuillez remplir tous les champs de la carte');
          setLoading(false);
          return;
        }
        
        // Validate expiration date
        if (!validateExpiryDate(formData.card_expiry)) {
          alert('Date d\'expiration invalide ou carte expirée');
          setLoading(false);
          return;
        }
      }

      // Process payment (mock for now)
      const response = await paymentAPI.mockPayment({ 
        plan_type: plan?.type || planType,
        payment_method: paymentMethod,
        billing_info: {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postal_code: formData.postal_code,
          country: formData.country,
          card_expiry: formData.card_expiry,
        }
      });

      alert('Paiement réussi! Votre challenge a été créé.');
      localStorage.removeItem('selectedPlan');
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || 'Échec du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
          <p className="mt-4 text-gray-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/pricing" className="inline-flex items-center space-x-2 mb-6 text-gray-400 hover:text-neon-green transition-colors">
          <FiArrowLeft className="text-xl" />
          <span className="font-bold">Retour aux Plans</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <FiLock className="inline text-neon-green mr-3" />
            Paiement <span className="gradient-text">Sécurisé</span>
          </h1>
          <p className="text-gray-400">Complétez votre achat pour commencer à trader</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card sticky top-24">
              <h2 className="text-2xl font-bold mb-4">Récapitulatif</h2>
              
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Plan sélectionné</span>
                  <span className="font-bold text-neon-green">{plan.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Prix</span>
                  <span className="text-2xl font-bold">{plan.price} {plan.currency}</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <h3 className="font-semibold mb-3">Inclus dans le plan :</h3>
                <ul className="space-y-2">
                  {plan.features?.map((feature, idx) => {
                    const isNegative = feature.startsWith('❌');
                    const cleanFeature = isNegative ? feature.replace('❌ ', '') : feature;
                    return (
                      <li key={idx} className={`flex items-start text-sm ${isNegative ? 'opacity-40' : ''}`}>
                        {isNegative ? (
                          <span className="text-red-500 mr-2 font-bold flex-shrink-0">✕</span>
                        ) : (
                          <FiCheck className="text-neon-green mr-2 mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-gray-300 ${isNegative ? 'italic' : ''}`}>{cleanFeature}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total à payer</span>
                  <span className="text-neon-green">{plan.price} {plan.currency}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                  <div className="flex items-center">
                    <FiLock className="mr-1" />
                    Sécurisé SSL
                  </div>
                  <div>|</div>
                  <div>Garantie 30j</div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="glass-card">
                <h2 className="text-xl font-bold mb-4">Informations Personnelles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nom Complet *</label>
                    <input
                      type="text"
                      name="full_name"
                      required
                      className="input-field"
                      value={formData.full_name}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="input-field"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="+212 6XX XXX XXX"
                      className="input-field"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="glass-card">
                <h2 className="text-xl font-bold mb-4">Adresse de Facturation</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Adresse *</label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="123 Rue Exemple"
                      className="input-field"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Complément d'adresse</label>
                    <input
                      type="text"
                      name="address2"
                      placeholder="Appartement, étage, etc."
                      className="input-field"
                      value={formData.address2}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Ville *</label>
                      <input
                        type="text"
                        name="city"
                        required
                        className="input-field"
                        value={formData.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Code Postal *</label>
                      <input
                        type="text"
                        name="postal_code"
                        required
                        className="input-field"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Pays *</label>
                      <select
                        name="country"
                        required
                        className="input-field"
                        value={formData.country}
                        onChange={handleInputChange}
                      >
                        {COUNTRIES.map(country => (
                          <option key={country} value={country}>{country}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="glass-card">
                <h2 className="text-xl font-bold mb-4">Méthode de Paiement</h2>

                {/* Payment Method Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <FiCreditCard className="text-2xl mx-auto mb-2" />
                    <div className="text-sm font-semibold">Carte Bancaire</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <FaPaypal className="text-2xl mx-auto mb-2" />
                    <div className="text-sm font-semibold">PayPal</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'bank'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mx-auto mb-2">🏦</div>
                    <div className="text-sm font-semibold">Virement</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'crypto'
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="text-2xl mx-auto mb-2 text-orange-500"><FaBitcoin className="inline" /></div>
                    <div className="text-sm font-semibold">Crypto</div>
                  </button>
                </div>

                {/* Card Payment Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Numéro de carte *</label>
                      <input
                        type="text"
                        name="card_number"
                        required
                        placeholder="4242 4242 4242 4242"
                        maxLength="19"
                        className="input-field"
                        value={formData.card_number}
                        onChange={handleInputChange}
                      />
                      <p className="text-xs text-gray-400 mt-1">Demo: utilisez 4242 4242 4242 4242</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiration *</label>
                        <input
                          type="text"
                          name="card_expiry"
                          required
                          placeholder="MM/YY"
                          maxLength="5"
                          className={`input-field ${
                            expiryError ? 'border-red-500 focus:border-red-500' : ''
                          }`}
                          value={formData.card_expiry}
                          onChange={handleInputChange}
                          onBlur={() => formData.card_expiry && validateExpiryDate(formData.card_expiry)}
                        />
                        {expiryError && (
                          <p className="text-red-500 text-xs mt-1 flex items-center">
                            <span className="mr-1">⚠️</span>
                            {expiryError}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV *</label>
                        <input
                          type="text"
                          name="card_cvv"
                          required
                          placeholder="123"
                          maxLength="4"
                          className="input-field"
                          value={formData.card_cvv}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Nom sur la carte *</label>
                      <input
                        type="text"
                        name="card_name"
                        required
                        placeholder="NOM PRENOM"
                        className="input-field"
                        value={formData.card_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                )}

                {/* PayPal Integration */}
                {paymentMethod === 'paypal' && (
                  <div className="text-center py-8">
                    <FaPaypal className="text-6xl mx-auto mb-4 text-blue-500" />
                    <p className="text-gray-400 mb-6">Paiement sécurisé via PayPal Smart Buttons</p>
                    
                    <div id="paypal-button-container" className="max-w-sm mx-auto min-h-[150px]">
                      {/* PayPal Button will be rendered here */}
                      <div className="animate-pulse bg-white/5 h-24 rounded-lg flex items-center justify-center text-xs text-gray-500 italic">
                        Chargement de PayPal...
                      </div>
                    </div>

                    <PayPalLoader 
                      amount={plan.price} 
                      onSuccess={handlePayPalButtonSuccess} 
                    />
                    
                    <p className="text-sm text-gray-500 mt-4">
                        Paiement sécurisé et instantané via le réseau PayPal.<br/>
                        Une fois le paiement autorisé, votre compte sera activé automatiquement.
                    </p>
                  </div>
                )}

                {/* Bank Transfer */}
                {paymentMethod === 'bank' && (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                    <h3 className="font-bold mb-4">Instructions pour virement bancaire</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bénéficiaire:</span>
                        <span className="font-semibold">TradeSense AI</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">IBAN:</span>
                        <span className="font-mono">MA00 0000 0000 0000 0000 0000</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">BIC:</span>
                        <span className="font-mono">XXXXMACAXXX</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Référence:</span>
                        <span className="font-semibold">{AuthService.getUser()?.id}-{plan.type}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">
                      Votre compte sera activé sous 1-2 jours ouvrés après réception du paiement.
                    </p>
                  </div>
                )}

                {/* Crypto Payment */}
                {paymentMethod === 'crypto' && (
                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
                    <h3 className="font-bold mb-4 flex items-center">
                      <FaBitcoin className="mr-2 text-orange-500" /> 
                      Paiement Crypto (USDT/BTC)
                    </h3>
                    
                    <div className="flex flex-col md:flex-row gap-6 items-center mb-6">
                        {/* Fake QR Code */}
                        <div className="bg-white p-2 rounded-lg w-32 h-32 flex-shrink-0">
                            <img 
                                src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=0x71C7656EC7ab88b098defB751B7401B5f6d8976F" 
                                alt="Wallet QR"
                                className="w-full h-full"
                            />
                        </div>
                        
                        <div className="space-y-3 w-full">
                            <div>
                                <div className="text-xs text-gray-400 mb-1">USDT (TRC20) Address</div>
                                <div className="bg-dark-bg p-3 rounded border border-white/10 font-mono text-xs break-all flex justify-between items-center group cursor-pointer"
                                     onClick={() => navigator.clipboard.writeText('0x00000000000000000000000000000000deadbeef')}>
                                    0x00000000000000000000000000000000deadbeef
                                    <span className="opacity-0 group-hover:opacity-100 text-neon-green ml-2">Copier</span>
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-gray-400 mb-1">Montant à envoyer</div>
                                <div className="font-bold text-xl">{plan.price} {plan.currency} <span className="text-sm font-normal text-gray-400">(~{(parseFloat(plan.price) / 10).toFixed(2)} USDT)</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-yellow-500/80 bg-yellow-500/10 p-3 rounded border border-yellow-500/20">
                        <p>⚠️ <strong>Important:</strong> Envoyez uniquement des USDT sur le réseau TRC20. Les autres dépôts seront perdus.</p>
                        <p className="mt-2">Après l'envoi, cliquez sur "Confirmer le Paiement" ci-dessous. L'activation est immédiate (simulation).</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              {paymentMethod !== 'paypal' && (
                <div className="glass-card">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                        Traitement...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <FiLock className="mr-2" />
                        Confirmer le Paiement - {plan.price} {plan.currency}
                      </span>
                    )}
                  </button>
                  <p className="text-xs text-gray-400 text-center mt-4">
                    En cliquant, vous acceptez nos conditions générales de vente
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
