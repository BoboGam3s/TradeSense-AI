'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { tradingAPI, marketAPI, challengeAPI, authAPI } from '../../lib/api';
import { AuthService } from '../../lib/auth';
import { FiTrendingUp, FiDollarSign, FiActivity, FiBriefcase,
  FiLogOut, FiShoppingCart, FiRefreshCw, FiUser, FiFilter, FiMessageSquare, FiCheck, FiPlayCircle, FiLock, FiShield, FiBell, FiPieChart, FiX, FiAward, FiChevronDown, FiAlertTriangle
} from 'react-icons/fi';
import NewsFeed from '../../components/NewsFeed';
import TradingChart from '../../components/TradingChart';
import JournalModal from '../../components/JournalModal';
import OnboardingTour from '../../components/OnboardingTour';
import SetAlertModal from '../../components/SetAlertModal';
import ActiveAlertsModal from '../../components/ActiveAlertsModal';
import NotificationManager from '../../components/NotificationManager';
import EconomicCalendar from '../../components/EconomicCalendar';
import StatsDashboard from '../../components/StatsDashboard';
import { alertsAPI } from '../../lib/api';

// All tradable symbols organized by asset class
const SYMBOLS = [
  // US Stocks
  'AAPL', 'TSLA',
  // Commodities
  'GC=F', 'SI=F',
  // Forex
  'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCHF=X', 'AUDUSD=X',
  // Crypto
  'BTC-USD', 'ETH-USD',
  // Moroccan Stocks
  'IAM.CS', 'ATW.CS', 'BCP.CS', 'CIH.CS', 'LHM.CS'
];

// Symbol display names with emojis
const SYMBOL_NAMES = {
  // US Stocks
  'AAPL': '🍎 Apple',
  'TSLA': '⚡ Tesla',
  
  // Commodities
  'GC=F': '🥇 Gold',
  'SI=F': '🥈 Silver',
  
  // Forex
  'EURUSD=X': '💶 EUR/USD',
  'GBPUSD=X': '💷 GBP/USD',
  'USDJPY=X': '💴 USD/JPY',
  'USDCHF=X': '🇨🇭 USD/CHF',
  'AUDUSD=X': '🇦🇺 AUD/USD',
  
  // Crypto
  'BTC-USD': '₿ Bitcoin',
  'ETH-USD': '⟠ Ethereum',
  
  // Morocco
  'IAM.CS': '🇲🇦 Maroc Telecom',
  'ATW.CS': '🇲🇦 Attijariwafa',
  'BCP.CS': '🇲🇦 BCP',
  'CIH.CS': '🇲🇦 CIH Bank',
  'LHM.CS': '🇲🇦 LafargeHolcim'
};

// Asset categories for filtering
const ASSET_CATEGORIES = {
  stocks: ['AAPL', 'TSLA'],
  commodities: ['GC=F', 'SI=F'],
  forex: ['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCHF=X', 'AUDUSD=X'],
  crypto: ['BTC-USD', 'ETH-USD'],
  morocco: ['IAM.CS', 'ATW.CS', 'BCP.CS', 'CIH.CS', 'LHM.CS']
};

const TIMEFRAMES = {
  '1m': { label: '1M', period: '1d', interval: '1m' },
  '5m': { label: '5M', period: '5d', interval: '5m' },
  '15m': { label: '15M', period: '5d', interval: '15m' },
  '1h': { label: '1H', period: '1mo', interval: '1h' },
  '4h': { label: '4H', period: '1mo', interval: '1h' }, // yfinance 4h is tricky, stick to 1h over longer period? yfinance supports 1h. 
  '1d': { label: '1D', period: '1y', interval: '1d' },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [challenge, setChallenge] = useState(null);
  const [positions, setPositions] = useState([]); // Array of open positions
  const [history, setHistory] = useState([]); // Array of recent trades
  const [prices, setPrices] = useState({});
  const [aiSignal, setAiSignal] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const currentSymbolRef = useRef('AAPL'); // Track actual active symbol for async safety
  const [historicalData, setHistoricalData] = useState([]);
  const [activeTab, setActiveTab] = useState('trading'); // 'trading' or 'formation'
  const [tradeForm, setTradeForm] = useState({ action: 'buy', quantity: 1 });
  const [loading, setLoading] = useState(true);
  const [sortMethod, setSortMethod] = useState('default'); // default, gainers, losers, volatile
  const [isTrading, setIsTrading] = useState(false);
  const [timeframe, setTimeframe] = useState('1h'); // Default timeframe
  const [expandedTrades, setExpandedTrades] = useState({});
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);
  const [playingVideoIdx, setPlayingVideoIdx] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState({});
  const [performanceAnalysis, setPerformanceAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const [academyProgress, setAcademyProgress] = useState({
    stage: 1, // 1: Niveau 1, 2: Niveau 2, 3: Masterclass
    completedVideos: [],
    completedTasks: {} // { lvl1_task1: true, ... }
  });
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all'); // all, stocks, commodities, forex, crypto, morocco
  const [searchQuery, setSearchQuery] = useState('');
  
  const [alerts, setAlerts] = useState([]);
  
  // Trading Journal State
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [journalTrade, setJournalTrade] = useState(null);

  // Alerts State
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isActiveAlertsModalOpen, setIsActiveAlertsModalOpen] = useState(false);

  // Load progress when user changes
  useEffect(() => {
    if (user && user.academy_progress) {
      setAcademyProgress(user.academy_progress);
    }
  }, [user]);

  const toggleTradeDetails = (tradeId) => {
    setExpandedTrades(prev => ({
      ...prev,
      [tradeId]: !prev[tradeId]
    }));
  };

  const saveProgress = async (newProgress) => {
    try {
      setAcademyProgress(newProgress);
      await authAPI.updateAcademyProgress(newProgress);
    } catch (err) {
      console.error('Failed to save academy progress:', err);
    }
  };

  // Spread constant (0.04%) simulating real market conditions
  const SPREAD = 0.0004;

  const calculatePL = useCallback((position) => {
    if (!prices[position.symbol]) return 0;
    
    const currentPrice = prices[position.symbol]?.price || position.price;
    let pl = 0;
    
    // Simulate Bid/Ask spread: Buy closes at Bid (Lower), Sell closes at Ask (Higher)
    const bidPrice = currentPrice * (1 - SPREAD / 2);
    const askPrice = currentPrice * (1 + SPREAD / 2);

    if (position.action === 'buy') {
      // Long position: profit when Bid > Entry
      pl = (bidPrice - position.price) * Math.abs(position.quantity);
    } else {
      // Short position: profit when Ask < Entry
      pl = (position.price - askPrice) * Math.abs(position.quantity);
    }
    
    return pl;
  }, [prices]);

  // Initial Auth & Data Load
  useEffect(() => {
    if (typeof window !== 'undefined' && !AuthService.isAuthenticated()) {
      router.push('/login');
      return;
    }
    const userData = AuthService.getUser();
    setUser(userData);

    // Force refresh user profile from server to ensure plan is up to date (e.g. after payment)
    authAPI.getProfile()
      .then(response => {
        if (response.data.user) {
          console.log("Profile synced:", response.data.user.plan_type);
          setUser(response.data.user);
          AuthService.setUser(response.data.user);
        }
      })
      .catch(err => console.error("Failed to sync profile:", err));
    
    // Safety timeout: ensure loading screen disappears after 6s no matter what
    const timer = setTimeout(() => {
      setLoading(false);
    }, 6000);

    loadDashboardData();

    return () => clearTimeout(timer);
  }, []);

  // Real-time Polling
  useEffect(() => {
    if (!user) return;

    // Fast polling for ACTIVE symbol and POSITIONS (100ms) for ultra-live MT4 feel
    const fastInterval = setInterval(() => {
      const symbolsToUpdate = new Set([selectedSymbol]);
      // Also update prices for symbols we have open positions in
      positions.forEach(pos => symbolsToUpdate.add(pos.symbol));
      
      const list = Array.from(symbolsToUpdate).filter(Boolean);
      if (list.length > 0) loadFastPrices(list);
    }, 500);

    // Slow polling for background symbols (10s)
    const slowInterval = setInterval(() => {
      loadOtherPrices();
    }, 10000);
    
    return () => {
      clearInterval(fastInterval);
      clearInterval(slowInterval);
    };
  }, [user, selectedSymbol, positions]);

  // Handle Timeframe or Symbol changes
  useEffect(() => {
    if (user && selectedSymbol) {
      loadPrices(selectedSymbol);
      setAiSignal(null);
    }
  }, [timeframe, selectedSymbol, user]);

  useEffect(() => {
    if (user) {
        loadAlerts();
    }
  }, [user]);

  // Alert Supervision Logic
  useEffect(() => {
    if (alerts.length === 0 || Object.keys(prices).length === 0) return;

    alerts.forEach(alert => {
        const priceData = prices[alert.symbol];
        if (!priceData) return;

        const currentPrice = priceData.price;
        let triggered = false;

        if (alert.condition === 'ABOVE' && currentPrice >= alert.target_price) {
            triggered = true;
        } else if (alert.condition === 'BELOW' && currentPrice <= alert.target_price) {
            triggered = true;
        }

        if (triggered) {
            // Trigger Notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(`🔔 Alerte Prix: ${alert.symbol}`, {
                    body: `${alert.symbol} a atteint votre cible de $${alert.target_price} (Actuel: $${currentPrice})`,
                    icon: '/icon.png' // Optional
                });
            }
            
            // Play Sound
            const audio = new Audio('/notification.mp3'); // Try standard path
            audio.play().catch(e => console.log('Audio play failed', e));

            // Optimistic Update: Remove from list to prevent spam
            setAlerts(prev => prev.filter(a => a.id !== alert.id));
            
            // Delete from backend
            alertsAPI.deleteAlert(alert.id).catch(err => console.error('Failed to auto-delete alert', err));
            
            // Show Alert
            alert(`ALERTE PRIX: ${alert.symbol} a atteint $${alert.target_price}!`);
        }
    });
  }, [prices, alerts]);

  const loadAlerts = async () => {
    try {
        const res = await alertsAPI.getAlerts();
        setAlerts(res.data);
    } catch (err) {
        console.error("Failed to load alerts", err);
    }
  };

  const loadDashboardData = async () => {
    try {
      // Use allSettled to ensure slow market data doesn't block challenge data
      await Promise.allSettled([
        loadChallenge(),
        loadPrices(),
      ]);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChallenge = async () => {
    try {
      const response = await tradingAPI.getPortfolio();
      setChallenge(response.data.challenge);
      setPositions(response.data.positions || []);
      setHistory(response.data.recent_trades || []);
    } catch (err) {
      console.error('No active challenge');
    }
  };

  // Dedicated function for fast updates (100ms)
  const loadFastPrices = async (symbols) => {
    try {
      // 🚀 MT4 Sync: Use batch API to get all prices in one round-trip
      const response = await marketAPI.getBatchPrices(symbols);
      const updates = response.data;
      
      if (updates) {
        // Update historical data for charts in real-time
        if (updates[currentSymbolRef.current] && historicalData.length > 0) {
          const newData = updates[currentSymbolRef.current];
          setHistoricalData(prev => {
            if (prev.length === 0) return prev;
            const lastCandle = { ...prev[prev.length - 1] };
            const currentPrice = newData.price;
            
            lastCandle.close = currentPrice;
            if (currentPrice > lastCandle.high) lastCandle.high = currentPrice;
            if (currentPrice < lastCandle.low) lastCandle.low = currentPrice;
            
            return [...prev.slice(0, -1), lastCandle];
          });
        }
        
        setPrices(prev => ({ ...prev, ...updates }));
      }
    } catch (err) {
      // Silently fail
    }
  };

  // Dedicated function for other symbols (Slow)
  const loadOtherPrices = async () => {
    const otherSymbols = SYMBOLS.filter(sym => sym !== selectedSymbol);
    // Load max 3 at a time to avoid rate limits
    const batchSize = 3;
    for (let i = 0; i < otherSymbols.length; i += batchSize) {
      const batch = otherSymbols.slice(i, i + batchSize);
      try {
        const results = await Promise.allSettled(batch.map(sym => marketAPI.getPrice(sym)));
        const updates = {};
        results.forEach((res, idx) => {
          if (res.status === 'fulfilled') {
            updates[batch[idx]] = res.value.data;
          }
        });
        if (Object.keys(updates).length > 0) {
          setPrices(prev => ({ ...prev, ...updates }));
        }
      } catch (err) {
        console.error('Background price update failed');
      }
    }
  };

  const loadPrices = async (targetSymbol = null) => {
    const symbolToLoad = targetSymbol || selectedSymbol;
    if (!symbolToLoad) return;

    try {
      const tfConfig = TIMEFRAMES[timeframe];

      // 1. Prioritize selected/target symbol data
      try {
          const [priceRes, historyRes] = await Promise.all([
            marketAPI.getPrice(symbolToLoad),
            marketAPI.getHistorical(symbolToLoad, tfConfig.period, tfConfig.interval)
          ]);
          
          // Safety check: only update if this is still the active symbol
          if (currentSymbolRef.current === symbolToLoad) {
            setPrices(prev => ({
              ...prev,
              [symbolToLoad]: priceRes.data
            }));
            setHistoricalData(historyRes.data.data || []);
          }
      } catch (e) {
          console.error("Error loading symbol data:", e);
      }

      // 2. Initial load of all other symbols
      loadOtherPrices();
      
    } catch (err) {
      console.error('Fatal error in loadPrices:', err);
    }
  };



  const loadAISignal = async (symbol) => {
    if (['free', 'starter'].includes(user?.plan_type)) return;
    try {
      setIsGeneratingSignal(true);
      setAiSignal(null); // Clear previous
      const response = await marketAPI.getAISignal(symbol);
      setAiSignal(response.data);
    } catch (err) {
      console.error('Failed to load AI signal');
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  const loadPerformanceAnalysis = async () => {
    if (!user) {
      alert("Erreur: Utilisateur non trouvé. Veuillez vous reconnecter.");
      return;
    }
    
    if (!['pro', 'elite'].includes(user.plan_type)) {
      alert(`Votre plan actuel (${user.plan_type}) ne permet pas d'accéder à cette fonctionnalité.`);
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      console.log("Starting performance analysis...");
      // 20s timeout for stability
      const response = await tradingAPI.getPerformanceAnalysis({ timeout: 20000 });
      console.log("Analysis response:", response.data);
      
      if (response.data) {
        setPerformanceAnalysis(response.data);
      } else {
        setAnalysisError("Le serveur n'a renvoyé aucune donnée.");
      }
    } catch (error) {
      console.error('Error loading AI analysis:', error);
      const msg = error.response?.data?.error || error.message || "Erreur de connexion au serveur.";
      setAnalysisError(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenJournal = (trade, e) => {
    e.stopPropagation(); // Prevent row expansion
    setJournalTrade(trade);
    setIsJournalOpen(true);
  };

  const handleSaveJournal = async (tradeId, data) => {
    try {
      await tradingAPI.updateJournal(tradeId, data);
      
      // Update local state to reflect changes immediately
      setHistory(prev => prev.map(t => 
        t.id === tradeId ? { ...t, ...data, tags: data.tags.split(',') } : t
      ));
    } catch (error) {
      console.error('Error saving journal:', error);
      alert('Erreur lors de la sauvegarde du journal');
    }
  };

  // Handle symbol selection
  const handleSelectSymbol = (symbol) => {
    // FIX: Clear data immediately and update refs/state
    setHistoricalData([]);
    setAiSignal(null);
    // Clear price for the new symbol to avoid showing stale data during load
    setPrices(prev => ({ ...prev, [symbol]: null }));
    currentSymbolRef.current = symbol; // Force ref update immediately
    setSelectedSymbol(symbol);
  };

  const handleTrade = async (e) => {
    e.preventDefault();
    
    if (challenge?.status === 'failed') {
      alert('Votre challenge est échoué. Veuillez cliquer sur "Recommencer" pour continuer à trader.');
      return;
    }

    if (isTrading) return;

    try {
      setIsTrading(true);
      const symbolAtTrade = selectedSymbol; // Closure capture
      
      const response = await tradingAPI.executeTrade({
        symbol: symbolAtTrade,
        action: tradeForm.action,
        quantity: parseFloat(tradeForm.quantity),
        stopLoss: tradeForm.stopLoss ? parseFloat(tradeForm.stopLoss) : null,
        takeProfit: tradeForm.takeProfit ? parseFloat(tradeForm.takeProfit) : null,
      });
      
      // IMMEDIATE UPDATE FROM RESPONSE
      if (response.data.status === 'success') {
        setChallenge(response.data.challenge);
        setPositions(response.data.positions || []);
        setHistory(response.data.recent_trades || []);
      }

    } catch (err) {
      console.error("Trade Error Details:", err);
      const errorMessage = err.response?.data?.error || err.message || 'Trade failed';
      alert(`Erreur Transaction: ${errorMessage}`);
    } finally {
      setIsTrading(false);
    }
  };

  const handleResetChallenge = async () => {
    if (!confirm("Voulez-vous vraiment réinitialiser votre compte ? Cette action effacera votre historique de trading actuel.")) return;
    
    try {
      const response = await tradingAPI.reset();
      
      if (response.data.status === 'success') {
        setChallenge(response.data.challenge);
        setHistory([]);
        setPositions([]);
        alert("Compte réinitialisé avec succès !");
      }
    } catch (err) {
      console.error("Reset error:", err);
      alert("Erreur lors de la réinitialisation: " + (err.response?.data?.error || err.message));
    }
  };

  const handleClosePosition = async (tradeId) => {
    try {
      setIsTrading(true);
      
      // Get the CURRENT price we are seeing for this symbol to lock it in
      const pos = positions.find(p => p.id === tradeId);
      const currentPrice = prices[pos?.symbol]?.price;

      // OPTIMISTIC UI: Remove specific order from list locally
      setPositions(prev => prev.filter(p => p.id !== tradeId));

      const response = await tradingAPI.closePosition(tradeId, currentPrice);
      
      // SYNC IMMEDIATELY FROM RESPONSE
      if (response.data.status === 'success') {
        setChallenge(response.data.challenge);
        setPositions(response.data.positions || []);
        setHistory(response.data.recent_trades || []);
      }

    } catch (err) {
      console.error("Close Error:", err);
      alert(err.response?.data?.error || 'Erreur lors de la clôture');
      loadChallenge(); // Rollback if error
    } finally {
      setIsTrading(false);
    }
  };

  const handleCloseAll = async () => {
    if (!positions.length) return;
    
    if (!confirm('⚠️ Êtes-vous sûr de vouloir fermer TOUTES les positions ?\nCette action est irréversible.')) {
        return;
    }

    try {
        setIsTrading(true);
        // Optimistic UI clear
        setPositions([]);
        
        const response = await tradingAPI.closeAllPositions();
        
        if (response.data.status === 'success') {
            setChallenge(response.data.challenge);
            setPositions(response.data.positions || []);
            setHistory(response.data.recent_trades || []);
        }
    } catch (err) {
        console.error("Close All Error:", err);
        alert(err.response?.data?.error || 'Erreur lors de la clôture globale');
        loadChallenge(); // Rollback
    } finally {
        setIsTrading(false);
    }
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0b0d', color: 'white' }} className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div style={{ width: '48px', height: '48px', border: '2px solid #00ff88', borderTopColor: 'transparent', borderRadius: '50%' }} className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-green"></div>
          <p className="mt-4 text-gray-400">Chargement du dashboard...</p>

        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card max-w-md w-full text-center">
          <FiBriefcase className="text-6xl text-neon-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Aucun Challenge Actif</h2>
          <p className="text-gray-400 mb-6">
            Vous devez d'abord acheter un plan pour commencer à trader.
          </p>
          <button
            onClick={() => router.push('/pricing')}
            className="btn-primary w-full"
          >
            Voir les Plans
          </button>
        </div>
      </div>
    );
  }

  const profitPercent = challenge.profit_percent || 0;
  const isProfit = profitPercent >= 0;

  // Combined Filter and Sort Logic
  const getFilteredAndSortedSymbols = () => {
    let filtered = [...SYMBOLS];
    
    // 1. Category Filter
    if (selectedCategory !== 'all') {
      filtered = ASSET_CATEGORIES[selectedCategory] || [];
    }
    
    // 2. Search Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(symbol => 
        symbol.toLowerCase().includes(query) || 
        (SYMBOL_NAMES[symbol] && SYMBOL_NAMES[symbol].toLowerCase().includes(query))
      );
    }

    // 3. Sorting
    if (sortMethod === 'default') return filtered;

    return filtered.sort((a, b) => {
      const priceA = prices[a] || { change_percent: 0 };
      const priceB = prices[b] || { change_percent: 0 };

      if (sortMethod === 'gainers') return priceB.change_percent - priceA.change_percent;
      if (sortMethod === 'losers') return priceA.change_percent - priceB.change_percent;
      if (sortMethod === 'volatile') return Math.abs(priceB.change_percent) - Math.abs(priceA.change_percent);
      return 0;
    });
  };

  const sortedSymbols = getFilteredAndSortedSymbols();

  // Calculate Live Total P/L and Equity
  const totalOpenPL = positions.reduce((acc, pos) => acc + calculatePL(pos), 0);
  
  // MT4 Liquidity Calculations
  const LEVERAGE = 100;
  const totalMargin = positions.reduce((acc, pos) => {
    const currentPrice = prices[pos.symbol]?.price || pos.price;
    return acc + (Math.abs(pos.quantity) * currentPrice) / LEVERAGE;
  }, 0);

  const totalMarketValue = positions.reduce((acc, pos) => {
    const currentPrice = prices[pos.symbol]?.price || pos.price;
    return acc + (Math.abs(pos.quantity) * currentPrice);
  }, 0);

  // Net Liquidation Value (NLV) = Balance (current_equity) + Floating P/L
  const liveEquity = (challenge?.current_equity || 0) + totalOpenPL;
  const freeMargin = liveEquity - totalMargin;
  const marginLevel = totalMargin > 0 ? (liveEquity / totalMargin) * 100 : 0;
  
  const totalPLPercent = challenge?.initial_balance 
        ? ((liveEquity - challenge.initial_balance) / challenge.initial_balance) * 100 
        : 0;

  return (
    <div className="min-h-screen bg-dark-bg text-white font-medium relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[120px] -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-blue/5 rounded-full blur-[120px] -z-10"></div>

      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-12">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue p-0.5 group-hover:rotate-12 transition-transform">
                  <div className="w-full h-full rounded-xl bg-dark-card flex items-center justify-center">
                    <FiTrendingUp className="text-neon-green text-xl" />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tighter">TradeSense <span className="text-neon-blue">AI</span></h1>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Élite Terminal</p>
                </div>
              </Link>

              {/* Internal Nav */}
              <nav className="hidden xl:flex items-center space-x-8">
                <button 
                  onClick={() => setActiveTab('trading')}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'trading' ? 'text-neon-green' : 'text-gray-500 hover:text-white'}`}
                >
                  Trading Panel
                </button>
                <button 
                  onClick={() => setActiveTab('formation')}
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'formation' ? 'text-neon-purple' : 'text-gray-500 hover:text-white'}`}
                >
                  MasterClass
                </button>
                <Link href="/leaderboard" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                  Classement
                </Link>
                <Link href="/community" className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
                  Communauté
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                 <button 
                   onClick={() => setIsActiveAlertsModalOpen(true)}
                   className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative group"
                 >
                   <FiBell className="text-gray-400 group-hover:text-neon-blue transition-colors" />
                   {alerts.length > 0 && (
                     <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full animate-pulse border-2 border-dark-card"></span>
                   )}
                 </button>
                 <button 
                   onClick={() => setIsStatsOpen(true)}
                   className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group"
                 >
                   <FiPieChart className="text-gray-400 group-hover:text-neon-purple transition-colors" />
                 </button>
              </div>

              <div className="h-8 w-px bg-white/10"></div>

              <div className="flex items-center space-x-4">
                <Link href="/profile" className="flex items-center space-x-3 group/profile">
                  <div className="hidden lg:block text-right">
                    <p className="text-xs font-black text-white group-hover:text-neon-green transition-colors uppercase tracking-widest">{user?.full_name?.split(' ')[0] || 'Trader'}</p>
                    <p className="text-[9px] font-bold text-neon-blue uppercase tracking-tighter">{user?.plan_type || 'Starter'} Plan</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-green via-neon-blue to-neon-purple p-0.5 group-hover:shadow-lg group-hover:shadow-neon-blue/20 transition-all">
                    <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center text-white font-black text-xs">
                      {String(user?.full_name || user?.username || 'U').substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/20 transition-all group"
                  title="Déconnexion"
                >
                  <FiLogOut className="text-red-500 opacity-60 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Account Top Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { 
              label: 'Solde Principal', 
              value: `$${(challenge?.current_equity || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`,
              icon: <FiDollarSign />,
              color: 'text-neon-green',
              glow: 'shadow-neon-green/10'
            },
            { 
              label: 'Équité Totale', 
              value: `$${liveEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}`,
              icon: <FiPieChart />,
              color: 'text-neon-blue',
              glow: 'shadow-neon-blue/10'
            },
            { 
              label: 'P/L Flottant', 
              value: `${totalOpenPL >= 0 ? '+' : ''}$${totalOpenPL.toLocaleString(undefined, {minimumFractionDigits: 2})}`,
              icon: <FiActivity />,
              color: totalOpenPL >= 0 ? 'text-profit' : 'text-loss',
              glow: totalOpenPL >= 0 ? 'shadow-profit/10' : 'shadow-loss/10'
            },
            { 
              label: 'Performance Actuelle', 
              value: `${totalPLPercent >= 0 ? '+' : ''}${totalPLPercent.toFixed(2)}%`,
              icon: <FiTrendingUp />,
              color: totalPLPercent >= 0 ? 'text-profit' : 'text-loss',
              glow: totalPLPercent >= 0 ? 'shadow-profit/10' : 'shadow-loss/10'
            },
          ].map((stat, i) => (
            <div key={i} className={`glass-card p-6 border-b-2 border-white/5 hover:border-white/10 transition-all ${stat.glow}`}>
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</span>
                <div className={`${stat.color} p-2 bg-white/5 rounded-lg`}>{stat.icon}</div>
              </div>
              <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {challenge?.status === 'failed' && (
          <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-red-600/20 to-transparent border border-red-500/30 backdrop-blur-xl flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center border border-red-500/30 animate-pulse">
                 <FiActivity className="text-red-500 text-3xl" />
              </div>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">Challenge Échoué</h2>
                <p className="text-gray-400 text-sm font-medium">Le drawdown maximum a été atteint. Vos performances sont sauvegardées pour analyse.</p>
              </div>
            </div>
            <button 
              onClick={handleResetChallenge}
              className="px-8 py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
            >
              Réinitialiser le Compte
            </button>
          </div>
        )}

      {activeTab === 'trading' ? (
        <>
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Market Selection */}
              <div className="glass-card border-l-4 border-neon-green/30">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center">
                        <FiActivity className="text-neon-green text-xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Actifs Marché</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Filtres & Sélection</p>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-3 w-full md:w-auto">
                    {/* Search Bar */}
                    <div className="relative group/search">
                      <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-neon-blue transition-colors" />
                      <input 
                        type="text"
                        placeholder="Rechercher un actif..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-black/40 border border-white/10 rounded-lg py-1.5 pl-9 pr-4 text-[10px] uppercase font-bold w-full focus:outline-none focus:border-neon-blue focus:bg-white/5 transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-wrap gap-2 text-[8px] uppercase font-black tracking-widest">
                      {[
                        { id: 'all', label: 'Tout' },
                        { id: 'stocks', label: 'Stocks' },
                        { id: 'commodities', label: 'Matières' },
                        { id: 'forex', label: 'Forex' },
                        { id: 'crypto', label: 'Crypto' },
                        { id: 'morocco', label: 'Maroc' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2 py-1 rounded-md border transition-all ${
                            selectedCategory === cat.id
                              ? 'bg-neon-blue text-white border-neon-blue shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                              : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Compact List View */}
                <div className="overflow-hidden border border-white/5 rounded-2xl bg-black/20">
                  <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 text-[10px] uppercase font-black tracking-widest text-gray-500 bg-white/5">
                    <div className="col-span-1">Actif</div>
                    <div className="text-right">Prix</div>
                    <div className="text-right">Variation</div>
                    <div className="text-right">Live</div>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {sortedSymbols.length > 0 ? (
                      sortedSymbols.map((symbol) => (
                        <button
                          key={symbol}
                          onClick={() => handleSelectSymbol(symbol)}
                          className={`w-full grid grid-cols-4 gap-4 p-4 border-b border-white/5 transition-all text-left group items-center ${
                            selectedSymbol === symbol
                              ? 'bg-neon-blue/10 border-l-4 border-l-neon-blue'
                              : 'hover:bg-white/5 border-l-4 border-l-transparent'
                          }`}
                        >
                          <div className="col-span-1 flex flex-col">
                            <span className="font-bold text-xs truncate group-hover:text-neon-blue transition-colors tracking-tight">{SYMBOL_NAMES[symbol] || symbol}</span>
                            <span className="text-[10px] text-gray-500 font-mono">{symbol}</span>
                          </div>
                          <div className="text-right font-mono text-xs font-bold text-white">
                            {symbol.includes('=X') ? 
                              prices[symbol]?.price?.toFixed(4) || '--' : 
                              `$${prices[symbol]?.price?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '--'}`
                            }
                          </div>
                          <div className={`text-right text-[10px] font-black ${prices[symbol]?.change_percent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {prices[symbol]?.change_percent >= 0 ? '+' : ''}{prices[symbol]?.change_percent?.toFixed(2)}%
                          </div>
                          <div className="text-right flex justify-end">
                            <div className={`w-2.5 h-2.5 rounded-full ${prices[symbol]?.is_open ? 'bg-neon-green shadow-[0_0_8px_rgba(74,222,128,0.6)] animate-pulse' : 'bg-red-500/30'}`}></div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="p-12 text-center text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-50">
                        Aucun actif trouvé pour "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chart Section */}
              <div id="tour-chart" className="glass-card border-t-2 border-white/5 overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-neon-green/10 flex items-center justify-center">
                        <FiActivity className="text-neon-green text-xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest">Graphique de Trading</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{SYMBOL_NAMES[selectedSymbol] || selectedSymbol} • TEMPS RÉEL</p>
                    </div>
                  </div>
                  <div className="flex space-x-1.5 bg-black/40 p-1 rounded-xl border border-white/10">
                    {Object.keys(TIMEFRAMES).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setTimeframe(tf)}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${
                          timeframe === tf ? 'bg-neon-green text-black' : 'text-gray-500 hover:text-white'
                        }`}
                      >
                        {TIMEFRAMES[tf].label}
                      </button>
                    ))}
                  </div>
                </div>
                {historicalData.length > 0 ? (
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <TradingChart data={historicalData} />
                  </div>
                ) : (
                  <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 space-y-4">
                    <div className="w-10 h-10 border-2 border-neon-green border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest">Initialisation du flux de données...</p>
                  </div>
                )}
              </div>

              {/* Trading Form */}
              <div id="tour-trade-panel" className="glass-card border-b-4 border-neon-blue/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                        <FiShoppingCart className="text-neon-blue text-xl" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-white">Exécuter un Ordre</h2>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">{SYMBOL_NAMES[selectedSymbol] || selectedSymbol}</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button onClick={() => setIsAlertModalOpen(true)} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all relative group">
                        <FiBell className="text-gray-400 group-hover:text-neon-blue transition-colors" />
                        {alerts.filter(a => a.symbol === selectedSymbol).length > 0 && (
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-neon-blue rounded-full border border-dark-card transition-all group-hover:scale-125"></span>
                        )}
                    </button>
                    <button onClick={loadPrices} className="w-10 h-10 rounded-xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center hover:bg-neon-green/20 transition-all group">
                        <FiRefreshCw className="text-neon-green opacity-60 group-hover:opacity-100 transition-all" />
                    </button>
                  </div>
                </div>
                <form onSubmit={handleTrade} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">SENS DU TRADE</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setTradeForm({ ...tradeForm, action: 'buy' })}
                        className={`py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center transition-all ${
                          tradeForm.action === 'buy' ? 'bg-neon-green text-black shadow-lg shadow-neon-green/20 scale-[1.02]' : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <FiShoppingCart className="mr-2 text-lg" /> ACHETER
                      </button>
                      <button
                        type="button"
                        onClick={() => setTradeForm({ ...tradeForm, action: 'sell' })}
                        className={`py-4 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center transition-all ${
                          tradeForm.action === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-[1.02]' : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <FiDollarSign className="mr-2 text-lg" /> VENDRE
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Taille de la Position</label>
                    <div className="relative group">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        className="bg-black/40 border border-white/10 rounded-2xl py-4 pl-6 pr-24 w-full text-white font-black text-lg focus:outline-none focus:border-neon-blue focus:shadow-[0_0_15px_rgba(59,130,246,0.1)] transition-all"
                        value={tradeForm.quantity}
                        onChange={(e) => setTradeForm({ ...tradeForm, quantity: e.target.value })}
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-neon-blue bg-neon-blue/10 px-3 py-1.5 rounded-xl border border-neon-blue/20">LOTS</div>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-2 font-black uppercase tracking-tighter ml-1">
                      {selectedSymbol?.includes('=X') ? 'EFFET DE LEVIER 1:100 • 1 Lot = 100,000 unités' : 
                       selectedSymbol?.includes('-USD') ? 'EFFET DE LEVIER 1:100 • 1 Lot = 1.00 unité' :
                       selectedSymbol?.includes('=F') ? 'EFFET DE LEVIER 1:100 • 1 Lot = 1 contrat' :
                       `EFFET DE LEVIER 1:100 • 1 Lot = 10 unités`}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Stop Loss</label>
                      <input type="number" step="any" placeholder="Auto-clôture" className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 w-full text-white font-bold text-sm focus:outline-none focus:border-red-500/50 transition-all font-mono" onChange={(e) => setTradeForm({ ...tradeForm, stopLoss: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2">Take Profit</label>
                      <input type="number" step="any" placeholder="Retrait profit" className="bg-black/40 border border-white/10 rounded-xl py-3 px-4 w-full text-white font-bold text-sm focus:outline-none focus:border-green-500/50 transition-all font-mono" onChange={(e) => setTradeForm({ ...tradeForm, takeProfit: e.target.value })} />
                    </div>
                  </div>

                  <div className={`p-6 rounded-2xl border ${tradeForm.action === 'buy' ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'} transition-all duration-500 relative overflow-hidden group/details shadow-inner`}>
                    <div className="absolute top-0 right-0 p-2">
                      <div className="text-[8px] font-black text-neon-blue bg-neon-blue/10 px-2 py-1 rounded-lg uppercase tracking-widest border border-neon-blue/10">TERMINAL_LIVE_MODE</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <p className="text-[9px] text-gray-500 uppercase font-black mb-2 flex items-center tracking-widest"><div className="w-1 h-1 rounded-full bg-red-400 mr-2"></div> BID (VENTE)</p>
                        <p className="text-red-400 font-mono font-black text-2xl tracking-tighter">
                          {selectedSymbol?.includes('=X') ? 
                            (prices[selectedSymbol]?.price * (1 - SPREAD/2))?.toFixed(4) || '--' :
                            `$${(prices[selectedSymbol]?.price * (1 - SPREAD/2))?.toFixed(2) || '--'}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-gray-500 uppercase font-black mb-2 flex items-center justify-end tracking-widest">ASK (ACHAT) <div className="w-1 h-1 rounded-full bg-green-400 ml-2"></div></p>
                        <p className="text-green-400 font-mono font-black text-2xl tracking-tighter">
                          {selectedSymbol?.includes('=X') ? 
                            (prices[selectedSymbol]?.price * (1 + SPREAD/2))?.toFixed(4) || '--' :
                            `$${(prices[selectedSymbol]?.price * (1 + SPREAD/2))?.toFixed(2) || '--'}`
                          }
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500 font-black uppercase tracking-widest">Exécution:</span>
                        <span className={`font-black font-mono text-sm ${tradeForm.action === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                          ${tradeForm.action === 'buy' 
                            ? (prices[selectedSymbol]?.price * (1 + SPREAD/2))?.toFixed(2) 
                            : (prices[selectedSymbol]?.price * (1 - SPREAD/2))?.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-gray-500 font-black uppercase tracking-widest">Frais de Spread:</span>
                        <span className="text-gray-400 font-mono font-bold">
                          -${((prices[selectedSymbol]?.price || 0) * (SPREAD/2) * parseFloat(tradeForm.quantity || 0) * (selectedSymbol?.endsWith('-USD') ? 1 : 10)).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-3 mt-3 border-t border-dashed border-white/10">
                        <span className="text-gray-400 font-black uppercase tracking-widest">Marge Utilisée (1:100):</span>
                        <span className="text-white font-black font-mono text-lg tracking-tighter">
                          ${(((prices[selectedSymbol]?.price || 0) * parseFloat(tradeForm.quantity || 0) * (selectedSymbol?.endsWith('-USD') ? 1 : 10)) / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {challenge?.status === 'failed' && (
                      <div className="absolute inset-0 bg-dark-bg/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 border-2 border-red-500/20 rounded-2xl">
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-red-500/20 border border-red-500/20">
                          <FiAlertTriangle className="text-red-500 text-5xl animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-3">Compte Bloqué</h3>
                        <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl mb-8 max-w-[280px]">
                          <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Raison de l'échec:</p>
                          <p className="text-white text-sm font-bold leading-tight">{challenge.failure_reason || "Limite de risque atteinte"}</p>
                        </div>
                        <Link href="/pricing" className="w-full py-5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-red-500/30 border-b-4 border-red-800">
                          RÉINITIALISER / NOUVEAU PLAN
                        </Link>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isTrading || (!prices[selectedSymbol]?.is_open && !selectedSymbol?.includes('-USD'))} 
                    className={`w-full py-5 rounded-2xl font-black text-lg tracking-widest shadow-2xl transition-all hover:scale-[1.01] active:scale-95 border-b-4 ${isTrading ? 'bg-gray-700 cursor-wait' : !prices[selectedSymbol]?.is_open && !selectedSymbol?.includes('-USD') ? 'bg-dark-card/50 cursor-not-allowed text-gray-600 border-white/5' : tradeForm.action === 'buy' ? 'bg-gradient-to-r from-green-600 to-emerald-500 text-white border-green-700 shadow-green-500/20' : 'bg-gradient-to-r from-red-600 to-rose-500 text-white border-red-700 shadow-red-500/20'}`}
                  >
                    {isTrading ? 'TRANSACTION...' : !prices[selectedSymbol]?.is_open && !selectedSymbol?.includes('-USD') ? 'MARCHÉ FERMÉ' : tradeForm.action === 'buy' ? 'OUVRIR POSITION LONG' : 'OUVRIR POSITION SHORT'}
                  </button>
                </form>
              </div>
            </div>

            <div className="space-y-6">
              <div className="glass-card border-t-2 border-neon-blue/20 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-neon-blue/10 flex items-center justify-center">
                        <FiActivity className="text-neon-blue" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Signal Stratégique IA</h2>
                  </div>
                  {aiSignal && !isGeneratingSignal && (
                    <button 
                      onClick={() => loadAISignal(selectedSymbol)}
                      className="text-[10px] text-neon-blue font-black uppercase tracking-widest flex items-center hover:bg-neon-blue/5 px-3 py-1.5 rounded-xl border border-neon-blue/10 transition-all font-bold"
                    >
                      <FiRefreshCw className="mr-2" /> Rafraîchir
                    </button>
                  )}
                </div>
                
                {isGeneratingSignal && (
                  <div className="space-y-6">
                    <div className="h-32 bg-black/40 rounded-2xl flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                      <div className="w-10 h-10 border-4 border-neon-blue border-t-transparent rounded-full animate-spin mb-3"></div>
                      <p className="text-[10px] text-neon-blue font-black uppercase tracking-widest animate-pulse">Neural Path Analysis...</p>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2.5 bg-white/5 rounded-full w-1/3 animate-pulse"></div>
                      <div className="h-20 bg-white/5 rounded-2xl w-full animate-pulse"></div>
                    </div>
                  </div>
                )}
                
                {!isGeneratingSignal && !aiSignal && selectedSymbol && (
                  ['free', 'starter'].includes(user?.plan_type) ? (
                    <div className="p-8 rounded-3xl bg-black/40 border border-white/10 text-center relative overflow-hidden group">
                      <div className="absolute -top-24 -right-24 w-48 h-48 bg-neon-purple/20 rounded-full blur-[60px] group-hover:bg-neon-purple/30 transition-all"></div>
                      <FiLock className="text-5xl text-neon-purple mx-auto mb-4 animate-bounce" />
                      <h4 className="text-white font-black uppercase tracking-tighter text-lg mb-2">Terminal Élite Verrouillé</h4>
                      <p className="text-gray-500 text-[11px] leading-relaxed mb-6 font-medium px-4">L'analyse prédictive haute fidélité est réservée aux traders <span className="text-neon-purple font-bold">PRO & ELITE</span>.</p>
                      <Link href="/pricing" className="w-full py-4 bg-gradient-to-r from-neon-purple to-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all inline-block shadow-lg shadow-neon-purple/20">DÉVERROUILLER L'IA</Link>
                    </div>
                  ) : (
                    <button onClick={() => loadAISignal(selectedSymbol)} className="w-full py-4 bg-white/5 hover:bg-neon-blue/10 text-white font-black uppercase tracking-widest text-xs rounded-2xl border border-white/10 hover:border-neon-blue/30 transition-all flex items-center justify-center group">
                      <FiActivity className="mr-2 text-neon-blue group-hover:scale-125 transition-transform" /> GÉNÉRER ANALYSE IA
                    </button>
                  )
                )}

                {!isGeneratingSignal && aiSignal && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
                    <div className={`p-6 rounded-3xl text-center relative overflow-hidden shadow-2xl ${['ACHAT', 'BUY'].includes(aiSignal.signal) ? 'bg-green-500/10 border border-green-500/30' : aiSignal.signal === 'HOLD' ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                      <div className={`text-4xl font-black mb-1 tracking-tighter ${['ACHAT', 'BUY'].includes(aiSignal.signal) ? 'text-green-500' : aiSignal.signal === 'HOLD' ? 'text-yellow-500' : 'text-red-500'}`}>
                        {['ACHAT', 'BUY'].includes(aiSignal.signal) ? 'ACHETER' : aiSignal.signal === 'HOLD' ? 'ATTENDRE' : 'VENDRE'}
                      </div>
                      <div className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em] ml-1">Confiance: {aiSignal.confidence}% • STRATÉGIE ÉLITE</div>
                    </div>
                    
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-[9px] text-neon-blue font-black uppercase tracking-widest mb-3 flex items-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-neon-blue mr-2"></div> RAISONNEMENT ALGORITHMIQUE
                        </h4>
                        <div className="text-xs text-gray-300 leading-relaxed font-bold bg-white/5 p-5 rounded-2xl border border-white/5 shadow-inner">
                          {aiSignal.reasoning || aiSignal.analysis}
                        </div>
                      </div>

                      {aiSignal.key_factors && aiSignal.key_factors.length > 0 && (
                        <div>
                          <h4 className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-3">FACTEURS DE DÉCISION</h4>
                          <div className="grid grid-cols-1 gap-2">
                             {aiSignal.key_factors.map((factor, i) => (
                              <div key={i} className="text-[11px] text-white flex items-center bg-black/20 px-4 py-2.5 rounded-xl border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-neon-green mr-3"></div> {factor}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="glass-card border-t-2 border-neon-green/20 shadow-2xl">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-neon-green/10 flex items-center justify-center">
                        <FiAward className="text-neon-green" />
                    </div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Objectifs Challenge</h2>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between text-[10px] mb-2 uppercase tracking-widest font-black">
                      <span className="text-gray-500">Objectif de Profit</span>
                      <span className="text-neon-green font-mono">+{challenge?.profit_target_percent}%</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden p-0.5">
                      <div className="h-full bg-gradient-to-r from-neon-green to-emerald-400 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.3)] transition-all duration-1000" style={{ width: `${Math.min(100, (totalPLPercent / (challenge?.profit_target_percent || 10)) * 100)}%` }}></div>
                    </div>
                  </div>

                  {challenge?.plan_type === 'funded' && (
                    <div className="space-y-4 pt-4 border-t border-white/5">
                      <div>
                        <div className="flex justify-between text-[10px] mb-2 uppercase tracking-widest font-black">
                          <span className="text-gray-500">Perte Quotidienne Max</span>
                          <span className="text-red-400 font-mono">-{challenge?.max_daily_loss_percent}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className="h-full bg-red-400/50 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (Math.max(0, -totalPLPercent) / (challenge?.max_daily_loss_percent || 5)) * 100)}%` }}></div>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] mb-2 uppercase tracking-widest font-black">
                          <span className="text-gray-500">Perte Totale Max</span>
                          <span className="text-red-600 font-mono">-{challenge?.max_total_loss_percent}%</span>
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                          <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (Math.max(0, -totalPLPercent) / (challenge?.max_total_loss_percent || 10)) * 100)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="glass-card h-[400px] overflow-hidden border border-white/5 shadow-2xl"><NewsFeed /></div>
              <div className="glass-card mt-4 overflow-hidden border border-white/5 shadow-2xl bg-black/20"><EconomicCalendar /></div>
            </div>
          </div>

          <div className="max-w-[1600px] mx-auto mt-6 space-y-6">
            {/* Account Bar */}
            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-center">
                <div className="flex flex-col">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Balance Principale</span>
                  <span className="text-base font-black text-white font-mono">${(challenge?.current_equity || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-8">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Équité (Equity)</span>
                  <span className="text-base font-black text-neon-blue font-mono">${liveEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-8">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Marge Utilisée</span>
                  <span className="text-base font-black text-gray-400 font-mono">${totalMargin.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-8">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Marge Libre</span>
                  <span className={`text-base font-black font-mono ${freeMargin >= 0 ? 'text-green-400' : 'text-red-400'}`}>${freeMargin.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
                <div className="flex flex-col border-l border-white/5 pl-8">
                  <span className="text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Niveau de Marge</span>
                  <span className={`text-base font-black font-mono ${
                    marginLevel === 0 ? 'text-gray-500' :
                    marginLevel > 500 ? 'text-green-400' :
                    marginLevel > 200 ? 'text-emerald-400' :
                    marginLevel > 150 ? 'text-yellow-400' :
                    marginLevel > 110 ? 'text-orange-500' :
                    'text-red-500 animate-pulse'
                  }`}>
                    {marginLevel > 0 ? `${marginLevel.toFixed(2)}%` : '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card border-l-4 border-neon-blue/30 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-blue/10 flex items-center justify-center">
                      <FiBriefcase className="text-neon-blue text-xl" />
                  </div>
                  <div>
                      <h2 className="text-sm font-black uppercase tracking-widest text-white">Positions Ouvertes</h2>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Gestion du Portefeuille Live</p>
                  </div>
                </div>
                {positions.length > 0 && (
                  <button 
                    onClick={handleCloseAll}
                    disabled={isTrading}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 group"
                  >
                    <FiX className="text-lg group-hover:rotate-90 transition-transform" /> Fermer Tout ({positions.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black">
                      <th className="pb-4 px-4 font-black">ACTIF / SENS</th>
                      <th className="pb-4 px-4 font-black">VOLUME</th>
                      <th className="pb-4 px-4 font-black">ENTRÉE / ACTUEL</th>
                      <th className="pb-4 px-4 font-black">VALEUR MARTEAU</th>
                      <th className="pb-4 px-4 text-right font-black">P/L LIVE</th>
                      <th className="pb-4 px-4 text-right font-black">REGLAGES</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.length === 0 ? (
                      <tr><td colSpan="6" className="py-20 text-center"><div className="flex flex-col items-center"><FiActivity className="text-4xl text-white/5 mb-4" /><p className="text-gray-500 font-black uppercase text-[10px] tracking-widest italic">Aucun flux de trésorerie actif détecté</p></div></td></tr>
                    ) : (
                      positions.map((pos) => {
                        const currentPrice = prices[pos.symbol]?.price || pos.price;
                        const isShort = pos.action === 'sell';
                        const pl = calculatePL(pos);
                        const plPercent = (pl / (pos.price * Math.abs(pos.quantity))) * 100;
                        const isProfitable = pl >= 0;
                        return (
                          <tr key={pos.id} className="bg-white/5 hover:bg-white/[0.08] transition-all group rounded-2xl">
                            <td className="p-4 rounded-l-2xl border-l border-t border-b border-white/5">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-1.5 h-1.5 rounded-full ${isProfitable ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse' : 'bg-red-400'}`}></div>
                                    <div>
                                        <div className="font-black text-white text-sm tracking-tight">{pos.symbol}</div>
                                        <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${isShort ? 'text-red-400' : 'text-green-400'}`}>{isShort ? 'Short Position' : 'Long Position'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4 border-t border-b border-white/5">
                                <span className="font-black text-xs text-gray-300 font-mono tracking-tighter">{Math.abs(pos.quantity).toFixed(2)}</span>
                                <span className="text-[8px] text-gray-600 font-black ml-1 uppercase">Lots</span>
                            </td>
                            <td className="p-4 border-t border-b border-white/5">
                                <div className="text-gray-500 text-[10px] font-black font-mono tracking-tighter">${pos.price.toFixed(2)}</div>
                                <div className="text-neon-blue text-xs font-black font-mono tracking-tighter">${currentPrice.toFixed(2)}</div>
                            </td>
                            <td className="p-4 border-t border-b border-white/5 text-gray-400 font-black font-mono text-xs">
                                ${(Math.abs(pos.quantity) * currentPrice).toLocaleString(undefined, {maximumFractionDigits: 2})}
                            </td>
                            <td className={`p-4 border-t border-b border-white/5 text-right font-black`}>
                                <div className={`text-sm font-mono tracking-tighter ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>{pl > 0 ? '+' : ''}{pl.toFixed(2)}$</div>
                                <div className={`text-[9px] font-black ${isProfitable ? 'text-green-500/60' : 'text-red-500/60'}`}>({plPercent.toFixed(2)}%)</div>
                            </td>
                            <td className="p-4 rounded-r-2xl border-r border-t border-b border-white/5 text-right">
                              <button onClick={() => handleClosePosition(pos.id)} className="px-4 py-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-white/10 hover:border-red-500/30 transition-all">TERMINER</button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="glass-card">
              <div className="flex justify-between items-center mb-4">
                <h2 id="tour-journal-btn" className="text-xl font-bold flex items-center"><FiRefreshCw className="mr-2 text-neon-green" /> Historique Récent</h2>
                <button 
                  onClick={loadPerformanceAnalysis}
                  disabled={isAnalyzing || !['pro', 'elite'].includes(user?.plan_type)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                    !['pro', 'elite'].includes(user?.plan_type) 
                      ? 'bg-white/5 text-gray-500 border border-white/5 cursor-not-allowed opacity-50' 
                      : 'bg-neon-blue/20 text-neon-blue border border-neon-blue/30 hover:bg-neon-blue/30'
                  }`}
                >
                  {isAnalyzing ? (
                    <div className="w-3 h-3 border-2 border-neon-blue border-t-transparent rounded-full animate-spin"></div>
                  ) : !['pro', 'elite'].includes(user?.plan_type) ? (
                    <FiLock className="text-gray-600" />
                  ) : (
                    <FiActivity />
                  )}
                  <span>{isAnalyzing ? 'ANALYSE...' : 'Analyse de Performance Pro'}</span>
                </button>
              </div>

              {/* ERROR MESSAGE */}
              {analysisError && (
                <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center">
                  <FiActivity className="mr-2" />
                  {analysisError}
                </div>
              )}

              {/* PERFORMANCE ANALYSIS RESULT */}
              {performanceAnalysis && (
                <div className="mb-6 p-5 rounded-2xl bg-gradient-to-r from-neon-blue/10 to-transparent border border-neon-blue/20 animate-slide-down">
                    <div className="flex items-start space-x-4">
                        <div className="bg-neon-blue/20 p-3 rounded-xl border border-neon-blue/30">
                            <FiActivity className="text-2xl text-neon-blue" />
                        </div>
                        <div className="flex-grow">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-white font-black uppercase tracking-tighter text-sm">Rapport Stratégique IA</h4>
                                <span className="text-[10px] bg-neon-blue/10 text-neon-blue px-2 py-1 rounded font-black">ELITE ACCESS</span>
                            </div>
                            <p className="text-gray-400 text-xs leading-relaxed italic mb-4">
                                "{performanceAnalysis.analysis || performanceAnalysis.assessment || "Analyse en direct de vos performances..."}"
                            </p>
                            
                            {/* TOP 5 RECOMMENDATIONS */}
                            {performanceAnalysis.recommendations && Array.isArray(performanceAnalysis.recommendations) && performanceAnalysis.recommendations.length > 0 && (
                              <div className="space-y-2 mb-3">
                                <h5 className="text-[10px] text-neon-blue uppercase font-black tracking-widest flex items-center">
                                  <FiTrendingUp className="mr-1.5" /> Top 5 Recommandations
                                </h5>
                                <div className="grid grid-cols-1 gap-2">
                                  {performanceAnalysis.recommendations.slice(0, 5).map((rec, idx) => (
                                    <div key={idx} className="flex items-start space-x-2 bg-white/3 p-2 rounded-lg border border-white/5 hover:border-neon-blue/30 transition-all group/rec">
                                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-neon-blue/10 flex items-center justify-center border border-neon-blue/20">
                                        <span className="text-neon-blue text-[8px] font-black">{idx + 1}</span>
                                      </div>
                                      <span className="text-gray-400 text-[10px] leading-relaxed group-hover/rec:text-white transition-colors">{rec}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* RISK ADVICE */}
                            {performanceAnalysis.risk_advice && (
                              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mt-3">
                                <p className="text-[10px] text-red-400 font-bold flex items-center">
                                  <FiShield className="mr-2" /> {performanceAnalysis.risk_advice}
                                </p>
                              </div>
                            )}
                        </div>
                        <button onClick={() => setPerformanceAnalysis(null)} className="text-gray-600 hover:text-white transition-colors">
                            <FiX className="text-xl" />
                        </button>
                    </div>
                </div>
              )}

              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-left border-separate border-spacing-y-2">
                  <thead>
                    <tr className="text-[9px] text-gray-500 uppercase tracking-[0.2em] font-black">
                      <th className="pb-4 px-4 font-black">ACTIF / DATE</th>
                      <th className="pb-4 px-4 font-black">VOLUME / PRIX</th>
                      <th className="pb-4 px-4 text-right font-black">RÉSULTAT NET (P/L)</th>
                      <th className="pb-4 px-4 text-right font-black">DÉTAILS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr><td colSpan="4" className="py-20 text-center text-gray-600 font-black uppercase text-[10px] tracking-widest italic">Aucun enregistrement trouvé dans la base de données</td></tr>
                    ) : (
                      history.map((trade) => {
                         if (!trade) return null;
                        const isExpanded = expandedTrades[trade.id];
                        const isProfit = (trade.profit_loss || 0) > 0;
                        const lots = Math.abs(trade.quantity || 0);
                        const symbol = trade.symbol || 'UNKNOWN';
                        const totalValue = lots * (trade.price || 0) * (symbol.endsWith('-USD') ? 1 : 10);
                        const requiredMargin = totalValue / 100;

                        return (
                          <Fragment key={trade.id}>
                            <tr 
                              onClick={() => toggleTradeDetails(trade.id)}
                              className={`bg-white/5 hover:bg-white/[0.08] transition-all cursor-pointer group ${isExpanded ? 'ring-1 ring-neon-blue/30' : ''}`}
                            >
                              <td className="p-4 rounded-l-2xl border-l border-t border-b border-white/5">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] ${isProfit ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {trade.action === 'buy' ? 'B' : 'S'}
                                  </div>
                                  <div>
                                    <div className="text-white font-black text-sm tracking-tight">{symbol}</div>
                                    <div className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{trade.timestamp ? new Date(trade.timestamp).toLocaleDateString() : 'N/A'} • {trade.timestamp ? new Date(trade.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 border-t border-b border-white/5">
                                <div className="font-black text-xs text-gray-300 font-mono">{lots.toFixed(2)} LOTS</div>
                                <div className="text-[9px] text-gray-600 font-bold font-mono">@ ${(trade.price || 0).toFixed(symbol.includes('=X') ? 4 : 2)}</div>
                              </td>
                              <td className="p-4 text-right border-t border-b border-white/5 font-black">
                                 <span className={`text-sm font-mono tracking-tighter ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                                  {isProfit ? '+' : ''}{(trade.profit_loss || 0).toFixed(2)}$
                                </span>
                              </td>
                              <td className="p-4 rounded-r-2xl border-r border-t border-b border-white/5 text-right">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-gray-700 group-hover:text-neon-blue transition-all ${isExpanded ? 'rotate-180 text-neon-blue' : ''}`}>
                                  <FiChevronDown className="text-lg" />
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr className="animate-in slide-in-from-top-2 duration-300">
                                <td colSpan="4" className="p-0">
                                  <div className="bg-black/40 mx-4 mb-2 p-6 rounded-2xl border border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                    
                                    <div>
                                      <p className="text-[9px] text-gray-500 uppercase font-black mb-2 tracking-widest">Type d'Ordre</p>
                                      <div className={`text-[10px] font-black px-2 py-1 rounded-lg inline-block border ${trade.action === 'buy' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                                        {trade.action === 'buy' ? 'BUY MARKET' : 'SELL MARKET'}
                                      </div>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-gray-500 uppercase font-black mb-2 tracking-widest">Exposition Totale</p>
                                      <p className="text-white font-black text-xs font-mono">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] text-gray-500 uppercase font-black mb-2 tracking-widest">Marge Utilisée</p>
                                      <p className="text-neon-blue font-black text-xs font-mono">${(requiredMargin || 0).toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                      <button 
                                        onClick={(e) => handleOpenJournal(trade, e)}
                                        className="flex items-center space-x-2 px-4 py-2 bg-neon-blue text-black rounded-xl transition-all text-[9px] font-black uppercase tracking-widest hover:scale-105 shadow-lg shadow-neon-blue/20"
                                      >
                                        <FiBriefcase className="text-sm" />
                                        <span>Journaliser</span>
                                      </button>
                                    </div>
                                    
                                    <div className="col-span-full pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
                                      <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Hash ID: {trade?.id ? String(trade.id).slice(0, 16) : 'N/A'}...</span>
                                      
                                      {trade.tags && trade.tags.length > 0 && (
                                        <div className="flex space-x-2">
                                          {trade.tags.map(t => <span key={t} className="bg-white/5 text-gray-400 px-2 py-1 rounded-lg text-[8px] font-black uppercase border border-white/5">#{t}</span>)}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* FORMATION SECTION */
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div>
              <h2 className="text-4xl font-black flex items-center tracking-tighter">
                <FiPlayCircle className="mr-3 text-neon-blue text-5xl" />
                TRADESENSE <span className="text-neon-blue ml-2">ACADEMY</span>
              </h2>
              <p className="text-gray-500 mt-2 font-medium">Contenu exclusif réservé aux membres de la communauté.</p>
            </div>
            <button 
              onClick={() => setActiveTab('trading')}
              className="mt-4 md:mt-0 px-8 py-3 bg-neon-blue text-black font-black rounded-xl hover:scale-105 transition-all shadow-lg shadow-neon-blue/20"
            >
              RETOUR AU TERMINAL
            </button>
          </div>

          {user?.plan_type === 'free' ? (
            <div className="glass-card flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-white/10">
              <div className="w-24 h-24 bg-neon-blue/10 rounded-full flex items-center justify-center mb-6">
                <FiLock className="text-5xl text-neon-blue animate-pulse" />
              </div>
              <h3 className="text-3xl font-black mb-4">ACCÈS ACADÉMIE RÉSERVÉ</h3>
              <p className="text-gray-400 max-w-lg mb-8 text-lg font-medium">
                Le plan <span className="text-white font-bold">Essai Démo</span> ne permet pas d'accéder aux formations vidéo. 
                Passez à un plan supérieur pour débloquer les secrets des professionnels.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/pricing"
                  className="px-10 py-4 bg-gradient-to-r from-neon-blue to-neon-purple text-white font-black rounded-xl shadow-xl hover:scale-105 transition-all flex items-center"
                >
                  <FiShield className="mr-2" /> DÉBLOQUER MAINTENANT
                </Link>
                <button 
                  onClick={() => setActiveTab('trading')}
                  className="px-10 py-4 bg-white/5 hover:bg-white/10 text-white font-black rounded-xl transition-all"
                >
                  CONTINUER EN DÉMO
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* VIDEO CARD COMPONENT HELPER (Logical abstraction in JSX) */}
            {[
              {
                file: "/videos/niveau1.mp4",
                level: "NIVEAU 1",
                title: "Fondamentaux du Trading",
                desc: "Maîtrisez les bases indispensables pour naviguer sur les marchés financiers avec confiance.",
                color: "green",
                badge: "DÉBUTANT",
                thumb: "https://images.unsplash.com/photo-1611974717482-982c7c67b051?auto=format&fit=crop&q=80&w=1000",
                tasks: [
                    { id: 'lvl1_graph', label: 'Configurer mon premier graphique' },
                    { id: 'lvl1_sr', label: 'Identifier Support & Résistance' },
                    { id: 'lvl1_demo', label: 'Passer un trade démo' }
                ]
              },
              {
                file: "/videos/niveau2.mp4",
                level: "NIVEAU 2",
                title: "Price Action Stratégique",
                desc: "Apprenez à lire la structure du marché sans indicateurs pour anticiper les mouvements pro.",
                color: "blue",
                badge: "INTERMÉDIAIRE",
                thumb: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=1000",
                tasks: [
                    { id: 'lvl2_pinbar', label: 'Repérer une Pin Bar' },
                    { id: 'lvl2_trend', label: 'Tracer une ligne de tendance' },
                    { id: 'lvl2_retest', label: 'Identifier un Break & Retest' }
                ]
              },
              {
                file: "/videos/masterclass.mp4",
                level: "MASTERCLASS",
                title: "Gestion du Risque Avancée",
                desc: "La clé de la survie et de la rentabilité : apprenez à protéger votre capital comme un hedge fund.",
                color: "purple",
                badge: "EXPERT",
                thumb: "https://images.unsplash.com/photo-1535320903710-d993d3d77d29?auto=format&fit=crop&q=80&w=1000",
                tasks: [
                    { id: 'lvl3_size', label: 'Calculer un Position Size' },
                    { id: 'lvl3_rr', label: 'Définir un Ratio R:R > 2' },
                    { id: 'lvl3_plan', label: 'Rédiger son plan de trading' }
                ]
              }
            ].map((video, idx) => {
              const planGating = {
                0: ['starter', 'pro', 'elite'], // Level 1: Starter+
                1: ['pro', 'elite'],           // Level 2: Pro+
                2: ['elite']                   // Masterclass: Elite only
              };
              
              const isPlanLocked = !planGating[idx].includes(user?.plan_type);
              const isProgressionLocked = (academyProgress?.stage || 1) < idx + 1;
              const isLocked = isProgressionLocked || isPlanLocked;
              
              const isCompleted = (academyProgress?.stage || 1) > idx + 1;
              const currentLvlTasks = video.tasks;
              console.log("Academy Debug:", { stage: academyProgress?.stage, tasks: academyProgress?.completedTasks });
              const completedTasksSafe = academyProgress?.completedTasks || {};
              const allTasksDone = currentLvlTasks.every(t => completedTasksSafe[t.id]);
              const completedVideosSafe = academyProgress?.completedVideos || [];
              const videoDone = completedVideosSafe.includes(video.file);
              const canUnlockNext = videoDone && allTasksDone && (academyProgress?.stage || 1) === idx + 1 && !isPlanLocked;

              return (
                <div key={idx} className={`glass-card border-t-4 ${isLocked ? 'border-gray-700 opacity-60' : `border-neon-${video.color}`} group overflow-hidden flex flex-col h-full transition-all ${!isLocked && 'hover:translate-y-[-4px]'} relative`}>
                  {/* LOCK OVERLAY */}
                  {isLocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                      <FiLock className="text-4xl text-gray-500 mb-2" />
                      <p className="text-white font-black text-sm uppercase tracking-widest">
                        {isPlanLocked ? 'Plan Insuffisant' : 'Contenu Verrouillé'}
                      </p>
                      <p className="text-gray-500 text-[10px] mt-1 font-bold">
                        {isPlanLocked ? `Requis: ${planGating[idx][0].toUpperCase()}` : `Complétez le Niveau ${idx}`}
                      </p>
                      {isPlanLocked && (
                        <button onClick={() => router.push('/pricing')} className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[10px] font-black transition-all">
                          UPGRADER ⚡
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center uppercase tracking-tight">
                      <span className={`${isLocked ? 'bg-gray-800 text-gray-500' : `bg-neon-${video.color}/10 text-neon-${video.color}`} p-2 rounded-lg mr-3 text-sm font-black`}>{video.level}</span>
                      {video.title}
                    </h3>
                    <div className="flex items-center space-x-2">
                        {isCompleted && <FiCheck className="text-green-500 text-xl" />}
                        <span className="text-[10px] bg-white/5 px-2 py-1 rounded text-gray-500 font-bold tracking-widest uppercase">
                            {video.badge}
                        </span>
                    </div>
                  </div>
                  
                  {/* PREMIUM LOCAL VIDEO PLAYER */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-5 border border-white/5 shadow-2xl ring-1 ring-white/10 group-hover:ring-neon-blue/40 transition-all duration-500 group/player">
                    <video 
                      ref={(el) => {
                        if (el) {
                          el.onplay = () => {
                            setPlayingVideoIdx(idx);
                            setVideoPlaying(prev => ({ ...prev, [idx]: true }));
                          };
                          el.onpause = () => {
                            setVideoPlaying(prev => ({ ...prev, [idx]: false }));
                          };
                        }
                      }}
                      controls={!isLocked}
                      controlsList="nodownload" 
                      poster={video.thumb}
                      className={`w-full h-full object-cover ${isLocked ? 'pointer-events-none grayscale' : ''}`}
                      onEnded={() => {
                        setVideoPlaying(prev => ({ ...prev, [idx]: false }));
                        if (!videoDone) {
                          saveProgress({
                            ...academyProgress,
                            completedVideos: [...academyProgress.completedVideos, video.file]
                          });
                        }
                      }}
                    >
                      <source src={video.file} type="video/mp4" />
                    </video>

                    {/* CUSTOM PLAY BUTTON OVERLAY */}
                    {!isLocked && !videoPlaying[idx] && (
                      <div 
                        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-black/20 to-transparent cursor-pointer z-10 group-hover/player:bg-black/40 transition-all duration-300"
                        onClick={(e) => {
                          const videoEl = e.currentTarget.previousSibling;
                          if (videoEl && videoEl.tagName === 'VIDEO') {
                            videoEl.play();
                          }
                        }}
                      >
                        <div className="relative group-hover/player:scale-110 transition-transform duration-300">
                          {/* Outer glow ring */}
                          <div className="absolute inset-0 bg-neon-blue/20 rounded-full blur-2xl animate-pulse"></div>
                          
                          {/* Play button */}
                          <div className={`relative w-20 h-20 rounded-full bg-gradient-to-br from-neon-${video.color} to-${video.color === 'green' ? 'emerald' : video.color === 'blue' ? 'cyan' : 'fuchsia'}-600 flex items-center justify-center shadow-[0_0_30px_rgba(74,222,128,0.4)] border-2 border-white/20 backdrop-blur-sm`}>
                            <FiPlayCircle className="text-white text-4xl ml-1" />
                          </div>
                          
                          {/* Ripple effect */}
                          <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-50"></div>
                        </div>
                        
                        {/* Play text hint */}
                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover/player:opacity-100 transition-opacity duration-300">
                          <span className="text-white text-sm font-bold tracking-wider uppercase px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full border border-white/20">Lire la vidéo</span>
                        </div>
                      </div>
                    )}

                    {/* CUSTOM WATERMARK */}
                    {!isLocked && (
                        <div className="absolute top-4 left-4 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity z-20">
                            <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md border border-white/5 flex items-center space-x-2">
                                <FiShield className="text-neon-blue text-[10px]" />
                                <span className="text-[8px] text-white font-black tracking-[0.2em] uppercase">TradeSense Academy</span>
                                {videoDone && <span className="text-[8px] text-green-500 font-bold ml-2">✓ VU</span>}
                            </div>
                        </div>
                    )}
                  </div>

                  <div className="space-y-4 flex-grow flex flex-col">
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                      {video.desc}
                    </p>

                    {/* TASKS CHECKLIST */}
                    <div className="bg-white/5 rounded-xl p-4 space-y-3 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Objectifs Pratiques</span>
                            <span className="text-[10px] text-neon-blue font-bold">{currentLvlTasks.filter(t => completedTasksSafe[t.id]).length}/{currentLvlTasks.length}</span>
                        </div>
                        {currentLvlTasks.map(task => (
                            <div 
                                key={task.id} 
                                className={`flex items-center space-x-3 p-2 rounded-lg transition-colors cursor-pointer ${isLocked ? 'pointer-events-none opacity-50' : 'hover:bg-white/5'}`}
                                onClick={() => {
                                    if (isLocked) return;
                                    const currentTasks = academyProgress?.completedTasks || {};
                                    const newTasks = { ...currentTasks, [task.id]: !currentTasks[task.id] };
                                    saveProgress({ ...(academyProgress || {}), completedTasks: newTasks, stage: academyProgress?.stage || 1, completedVideos: academyProgress?.completedVideos || [] });
                                }}
                            >
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${completedTasksSafe[task.id] ? 'bg-neon-blue border-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.3)]' : 'border-white/20 bg-white/5'}`}>
                                    {completedTasksSafe[task.id] && <FiCheck className="text-black text-xs font-bold" />}
                                </div>
                                <span className={`text-xs font-medium ${completedTasksSafe[task.id] ? 'text-white line-through opacity-50' : 'text-gray-300'}`}>
                                    {task.label}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* UNLOCK NEXT BUTTON */}
                    {canUnlockNext && (
                        <button 
                            onClick={() => saveProgress({ ...(academyProgress || {}), stage: idx + 2, completedTasks: completedTasksSafe, completedVideos: completedVideosSafe })}
                            className={`w-full py-3 rounded-xl bg-gradient-to-r from-neon-blue to-blue-600 text-black font-black uppercase tracking-widest text-xs mt-4 shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-[1.02] transition-all`}
                        >
                            Débloquer le {idx === 0 ? 'Niveau 2' : 'Masterclass'} 🔓
                        </button>
                    )}

                    {!isLocked && !canUnlockNext && !isCompleted && (
                        <div className="mt-4 p-3 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                            <p className="text-[10px] text-gray-500 font-bold uppercase italic">
                                {!videoDone ? "Regardez la vidéo pour progresser..." : "Complétez les tâches pour débloquer la suite."}
                            </p>
                        </div>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="glass-card flex flex-col justify-center items-center text-center bg-gradient-to-br from-white/5 to-neon-purple/5 border border-neon-purple/20 h-full p-12 lg:min-h-[400px]">
              <div className="bg-neon-purple/20 p-6 rounded-full mb-6 ring-4 ring-neon-purple/10">
                <FiLock className="text-5xl text-neon-purple animate-pulse" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-white uppercase tracking-widest">Plus de Ressources ?</h3>
              <p className="text-gray-400 px-8 mb-8 font-medium">
                Nous ajoutons régulièrement des MasterClasses exclusives. Passez au niveau <span className="text-neon-purple font-bold">ELITE</span> pour débloquer tout le catalogue.
              </p>
              <button 
                onClick={() => router.push('/pricing')}
                className="bg-white text-black px-10 py-4 rounded-xl font-black hover:bg-neon-purple hover:text-white transition-all transform hover:-translate-y-1 shadow-2xl"
              >
                UPGRADER MAINTENANT ⚡
              </button>
            </div>
            {/* End of Formation Grid */}
          </div>
          )}
        </div>
      )}
      </main>
      <JournalModal 
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        trade={journalTrade}
        onSave={handleSaveJournal}
      />
      <ActiveAlertsModal
        isOpen={isActiveAlertsModalOpen}
        onClose={() => setIsActiveAlertsModalOpen(false)}
        alerts={alerts}
        setAlerts={setAlerts}
      />
      {/* Onboarding Tour */}
      <OnboardingTour run={!!user && !loading && !user.has_completed_onboarding} />
      
      {/* Alert Modal */}
      <SetAlertModal 
        isOpen={isAlertModalOpen} 
        onClose={() => setIsAlertModalOpen(false)}
        symbol={selectedSymbol}
        currentPrice={prices[selectedSymbol]?.price}
        onAlertSet={loadAlerts}
      />
      
      {/* Permission Manager */}
      <NotificationManager />

      {/* Stats Dashboard */}
      <StatsDashboard isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      {/* Account Failure Overlay */}
      {challenge?.status === 'failed' && (
        <div className="fixed inset-0 z-[100] bg-dark-bg/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full glass-card border-red-500/30 text-center p-8 animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
              <FiLock className="text-4xl text-red-500" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Compte Suspendu</h2>
            <p className="text-red-400 font-bold mb-6">Challenge Échoué - Limite de perte atteinte</p>
            
            <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-medium">Raison:</span>
                <span className="text-white font-black text-sm uppercase">Violation des Risques</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm font-medium">Statut final:</span>
                <span className="text-red-500 font-black text-sm uppercase">Liquidés</span>
              </div>
              <p className="text-[10px] text-gray-500 italic mt-4 text-center">
                Conformément aux règles de financement, le dépassement des limites de perte entraîne la clôture immédiate du compte.
              </p>
            </div>

            <button 
              onClick={() => router.push('/pricing')}
              className="w-full btn-primary bg-gradient-to-r from-red-600 to-rose-600 py-4 text-lg font-black shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
            >
              OBTENIR UN NOUVEAU FINANCEMENT
            </button>
            <p className="mt-4 text-[10px] text-gray-600 font-bold uppercase tracking-widest">Offres à partir de 60$ (600 DH)</p>
          </div>
        </div>
      )}
    </div>
  );
}
