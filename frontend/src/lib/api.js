/**
 * TradeSense AI - API Client
 * Axios configuration for backend communication
 */
import axios from 'axios';

// Base URL for API requests
let API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tradesense-backend-q2ul.onrender.com';

// Local dev override
if (typeof window !== 'undefined') {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      API_URL = 'http://localhost:5000';
    }
  }
}

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const alertsAPI = {
  getAlerts: () => api.get('/api/alerts'),
  createAlert: (data) => api.post('/api/alerts', data),
  deleteAlert: (id) => api.delete(`/api/alerts/${id}`),
};

export default api;

// API endpoints
export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  getProfile: () => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/me', data),
  changePassword: (data) => api.put('/api/auth/change-password', data),
  getStats: () => api.get('/api/auth/stats'),
  updateAcademyProgress: (progress) => api.put('/api/auth/academy-progress', { progress }),
  completeOnboarding: () => api.post('/api/auth/complete-onboarding'),
};

export const marketAPI = {
  getSymbols: () => api.get('/api/market/symbols'),
  getPrice: (symbol) => api.get(`/api/market/price/${symbol}`),
  getBatchPrices: (symbols) => api.post('/api/market/prices/batch', { symbols }),
  getHistorical: (symbol, period = '1mo', interval = '1d') => api.get(`/api/market/historical/${symbol}?period=${period}&interval=${interval}`),
  getAISignal: (symbol) => api.get(`/api/market/ai-signal/${symbol}`),
  getMarketSummary: () => api.get('/api/market/market-summary'),
  getNews: () => api.get('/api/market/news'),
};

export const tradingAPI = {
  getPortfolio: () => api.get('/api/trading/portfolio'),
  executeTrade: (data) => api.post('/api/trading/execute', data),
  closePosition: (tradeId, price = null) => api.post('/api/trading/close', { trade_id: tradeId, price: price }),
  closeAllPositions: () => api.post('/api/trading/close-all'),
  getHistory: () => api.get('/api/trading/history'),
  getPerformanceAnalysis: (config = {}) => api.post('/api/trading/performance-analysis', {}, config),
  getStats: () => api.get('/api/trading/stats'),
  updateJournal: (tradeId, data) => api.put(`/api/trading/trades/${tradeId}/journal`, data),
  reset: () => api.post('/api/trading/reset'),
};

export const challengeAPI = {
  getCurrent: () => api.get('/api/challenge/current'),
  getHistory: () => api.get('/api/challenge/history'),
  getLeaderboard: () => api.get('/api/challenge/leaderboard'),
  verify: (id) => api.post(`/api/challenge/verify/${id}`),
};

export const paymentAPI = {
  getPlans: () => api.get('/api/payment/plans'),
  mockPayment: (data) => api.post('/api/payment/mock-payment', data),
  createPayPalOrder: (data) => api.post('/api/payment/paypal/create-order', data),
  capturePayPalOrder: (data) => api.post('/api/payment/paypal/capture-order', data),
};

export const adminAPI = {
  getUsers: () => api.get('/api/admin/users'),
  getChallenges: () => api.get('/api/admin/challenges'),
  updateChallengeStatus: (id, status) => api.put(`/api/admin/challenge/${id}/status`, { status }),
  getPaymentConfig: () => api.get('/api/admin/payment-config'),
  updatePaymentConfig: (data) => api.put('/api/admin/payment-config', data),
  getStats: () => api.get('/api/admin/stats'),
};
