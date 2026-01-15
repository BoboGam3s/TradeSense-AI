/**
 * TradeSense AI - Auth Utilities
 */

export const AuthService = {
  /**
   * Save auth token
   */
  setToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  },

  /**
   * Get auth token
   */
  getToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  },

  /**
   * Remove auth token
   */
  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  },

  /**
   * Save user data
   */
  setUser(user) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  /**
   * Get user data
   */
  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Check if user is admin
   */
  isAdmin() {
    const user = this.getUser();
    return user?.role === 'admin';
  },

  /**
   * Logout user
   */
  logout() {
    this.removeToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
};
