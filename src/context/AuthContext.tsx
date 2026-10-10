import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { useNotifications } from './NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, fullName: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('profit_gym_jwt_token');
  });

  // Security Rule: A fresh browser session MUST NOT automatically authenticate as a seed user.
  // We only restore from localStorage if both token AND saved user exist.
  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedToken = localStorage.getItem('profit_gym_jwt_token');
    const savedUser = localStorage.getItem('profit_gym_current_user');
    if (savedToken && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(!!token);
  const { showToast } = useNotifications();

  // Persist session to local storage when state changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem('profit_gym_current_user', JSON.stringify(user));
      localStorage.setItem('profit_gym_jwt_token', token);
    } else {
      localStorage.removeItem('profit_gym_current_user');
      localStorage.removeItem('profit_gym_jwt_token');
    }
  }, [user, token]);

  // Restore & verify session cryptographically via server
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            const verifiedUser: UserProfile = {
              id: data.user.id,
              email: data.user.email,
              role: (data.user.role || 'MEMBER').toLowerCase() as UserRole,
              full_name: data.user.fullName || data.user.full_name || 'Athlete',
              avatar_url: data.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
              phone: data.user.phone,
              created_at: data.user.createdAt || new Date().toISOString(),
            };
            setUser(verifiedUser);
          }
        } else if (res.status === 401) {
          // Token is expired or rejected by server: wipe untrusted session
          setToken(null);
          setUser(null);
          localStorage.removeItem('profit_gym_jwt_token');
          localStorage.removeItem('profit_gym_current_user');
        }
      } catch (err) {
        // Network offline: retain cached verified session
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, [token]);

  /**
   * Genuine Server-side Password Verification Login
   * NEVER bypasses password verification or fabricates a fake session.
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setIsLoading(false);
        showToast({
          type: 'error',
          title: 'AUTHENTICATION FAILED',
          message: data.message || 'Invalid email or password credentials.',
        });
        return false;
      }

      setToken(data.token);
      const loggedUser: UserProfile = {
        id: data.user.id,
        email: data.user.email,
        role: (data.user.role || 'MEMBER').toLowerCase() as UserRole,
        full_name: data.user.fullName || data.user.full_name || 'Athlete',
        avatar_url: data.user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        created_at: new Date().toISOString(),
      };
      setUser(loggedUser);
      setIsLoading(false);

      showToast({
        type: 'success',
        title: 'AUTHENTICATION VERIFIED',
        message: `Welcome back, ${loggedUser.full_name} (${loggedUser.role.toUpperCase()})`,
      });
      return true;
    } catch (err: any) {
      setIsLoading(false);
      showToast({
        type: 'error',
        title: 'NETWORK ERROR',
        message: 'Could not connect to authentication server. Please check your backend connection.',
      });
      return false;
    }
  };

  /**
   * Real Server Registration — Strictly Restricted to Member Role
   * Public users cannot grant themselves Admin or Trainer privileges.
   */
  const register = async (
    email: string,
    fullName: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          role: 'MEMBER', // Enforced server-side & client-side
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setIsLoading(false);
        showToast({
          type: 'error',
          title: 'REGISTRATION FAILED',
          message: data.message || 'Could not complete registration.',
        });
        return false;
      }

      if (data.token) {
        setToken(data.token);
        const newUser: UserProfile = {
          id: data.user.id,
          email: data.user.email,
          role: 'member',
          full_name: fullName.trim(),
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          created_at: new Date().toISOString(),
        };
        setUser(newUser);
        setIsLoading(false);

        showToast({
          type: 'success',
          title: 'REGISTRATION COMPLETE',
          message: `Welcome to PROFIT Training Club, ${fullName}!`,
        });
        return true;
      }

      setIsLoading(false);
      return true;
    } catch (err) {
      setIsLoading(false);
      showToast({
        type: 'error',
        title: 'NETWORK ERROR',
        message: 'Could not connect to registration server. Please try again.',
      });
      return false;
    }
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network failure on logout
      }
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('profit_gym_jwt_token');
    localStorage.removeItem('profit_gym_current_user');

    showToast({
      type: 'info',
      title: 'SIGNED OUT',
      message: 'You have been safely signed out from PROFIT Training Club.',
    });
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    showToast({
      type: 'success',
      title: 'PROFILE UPDATED',
      message: 'Your athlete profile details have been updated.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user && !!token,
        isLoading,
        token,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
