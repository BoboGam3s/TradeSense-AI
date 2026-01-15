/**
 * TradeSense AI - API Client
 * Axios configuration for backend communication
 */
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://tradesense-backend-q2ul.onrender.com'

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
  getAlerts: () => api.get('/alerts'),
  createAlert: (data) => api.post('/alerts', data),
  deleteAlert: (id) => api.delete(`/alerts/${id}`),
};

export default api;

// API endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getStats: () => api.get('/auth/stats'),
  updateAcademyProgress: (progress) => api.put('/auth/academy-progress', { progress }),
  completeOnboarding: () => api.post('/auth/complete-onboarding'),
};

export const marketAPI = {
  getSymbols: () => api.get('/market/symbols'),
  getPrice: (symbol) => api.get(`/market/price/${symbol}`),
  getBatchPrices: (symbols) => api.post('/market/prices/batch', { symbols }),
  getHistorical: (symbol, period = '1mo', interval = '1d') => api.get(`/market/historical/${symbol}?period=${period}&interval=${interval}`),
  getAISignal: (symbol) => api.get(`/market/ai-signal/${symbol}`),
  getMarketSummary: () => api.get('/market/market-summary'),
  getNews: () => api.get('/market/news'),
};

export const tradingAPI = {
  getPortfolio: () => api.get('/trading/portfolio'),
  executeTrade: (data) => api.post('/trading/execute', data),
  closePosition: (tradeId, price = null) => api.post('/trading/close', { trade_id: tradeId, price: price }),
  closeAllPositions: () => api.post('/trading/close-all'),
  getHistory: () => api.get('/trading/history'),
  getPerformanceAnalysis: (config = {}) => api.post('/trading/performance-analysis', {}, config),
  getStats: () => api.get('/trading/stats'),
  updateJournal: (tradeId, data) => api.put(`/trading/trades/${tradeId}/journal`, data),
  reset: () => api.post('/trading/reset'),
};

export const challengeAPI = {
  getCurrent: () => api.get('/challenge/current'),
  getHistory: () => api.get('/challenge/history'),
  getLeaderboard: () => api.get('/challenge/leaderboard'),
  verify: (id) => api.post(`/challenge/verify/${id}`),
};

export const paymentAPI = {
  getPlans: () => api.get('/payment/plans'),
  mockPayment: (data) => api.post('/payment/mock-payment', data),
  createPayPalOrder: (data) => api.post('/payment/paypal/create-order', data),
  capturePayPalOrder: (data) => api.post('/payment/paypal/capture-order', data),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getChallenges: () => api.get('/admin/challenges'),
  updateChallengeStatus: (id, status) => api.put(`/admin/challenge/${id}/status`, { status }),
  getPaymentConfig: () => api.get('/admin/payment-config'),
  updatePaymentConfig: (data) => api.put('/admin/payment-config', data),
  getStats: () => api.get('/admin/stats'),
};
