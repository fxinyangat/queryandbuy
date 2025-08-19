import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshTokenValue, setRefreshTokenValue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from sessionStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const storedToken = sessionStorage.getItem('token');
        const storedRefresh = sessionStorage.getItem('refresh_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          
          // Verify token is still valid
          const isValid = await verifyToken(storedToken);
          
          if (isValid) {
            setUser(userData);
            setToken(storedToken);
            setRefreshTokenValue(storedRefresh || null);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, clear storage
            clearAuthData();
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      return response.ok;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Store auth data securely
        sessionStorage.setItem('user', JSON.stringify(data.user));
        sessionStorage.setItem('token', data.token.access_token);
        sessionStorage.setItem('refresh_token', data.token.refresh_token);
        
        setUser(data.user);
        setToken(data.token.access_token);
        setRefreshTokenValue(data.token.refresh_token);
        setIsAuthenticated(true);
        
        return { success: true, user: data.user };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        // Do NOT auto-login after registration. Return success and let the UI redirect to Login.
        return { success: true, user: data.user, message: 'Account created successfully. Please sign in.' };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate server-side session
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: sessionStorage.getItem('refresh_token') || null }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local auth data regardless of server response
      clearAuthData();
    }
  };

  const clearAuthData = () => {
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
    setToken(null);
    setRefreshTokenValue(null);
    setIsAuthenticated(false);
    // Broadcast to other tabs
    localStorage.setItem('auth_event', JSON.stringify({ type: 'logout', ts: Date.now() }));
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...user, ...updatedUserData };
    sessionStorage.setItem('user', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const refreshToken = async () => {
    try {
      if (!refreshTokenValue) return { success: false, error: 'No refresh token' };
      const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshTokenValue })
      });

      if (response.ok) {
        const data = await response.json();
        sessionStorage.setItem('token', data.token.access_token);
        sessionStorage.setItem('refresh_token', data.token.refresh_token);
        setToken(data.token.access_token);
        setRefreshTokenValue(data.token.refresh_token);
        // Broadcast update
        localStorage.setItem('auth_event', JSON.stringify({ type: 'refreshed', ts: Date.now() }));
        
        return { success: true, token: data.token.access_token };
      } else {
        // Token refresh failed, logout user
        clearAuthData();
        return { success: false, error: 'Session expired' };
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuthData();
      return { success: false, error: 'Network error' };
    }
  };

  // Silent refresh scheduled shortly before expiry (~2 minutes before 30m)
  useEffect(() => {
    if (!token) return;
    const timeout = setTimeout(async () => {
      await refreshToken();
    }, 28 * 60 * 1000);
    return () => clearTimeout(timeout);
  }, [token, refreshTokenValue]);

  // Cross-tab auth sync via storage events
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key !== 'auth_event') return;
      try {
        const evt = JSON.parse(e.newValue || '{}');
        if (evt.type === 'logout') {
          setUser(null);
          setToken(null);
          setRefreshTokenValue(null);
          setIsAuthenticated(false);
        } else if (evt.type === 'refreshed') {
          const t = sessionStorage.getItem('token');
          const r = sessionStorage.getItem('refresh_token');
          if (t) setToken(t);
          if (r) setRefreshTokenValue(r);
        }
      } catch (_) {}
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const value = {
    user,
    token,
    refreshTokenValue,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
