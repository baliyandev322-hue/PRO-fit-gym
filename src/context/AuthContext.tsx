import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { SEED_USERS, getLocalData, setLocalData } from '@/lib/supabase';
import { useNotifications } from './NotificationContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, fullName: string, role?: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    return getLocalData<UserProfile[]>('users', SEED_USERS);
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('profit_gym_jwt_token');
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    const savedUser = localStorage.getItem('profit_gym_current_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return SEED_USERS[0];
      }
    }
    return SEED_USERS[0];
  });

  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useNotifications();

  useEffect(() => {
    setLocalData('users', users);
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('profit_gym_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('profit_gym_current_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('profit_gym_jwt_token', token);
    } else {
      localStorage.removeItem('profit_gym_jwt_token');
    }
  }, [token]);

  // Restore session via API if token exists
  useEffect(() => {
    const verifyStoredToken = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser((prev) => ({
              ...prev,
              ...data.user,
              role: (data.user.role || 'MEMBER').toLowerCase() as UserRole,
              full_name: data.user.fullName || data.user.full_name || prev?.full_name,
            }));
          }
        }
      } catch {
        // Server offline; local state retained
      }
    };
    verifyStoredToken();
  }, [token]);

  const login = async (email: string, password = 'password123'): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. Attempt Real Server Authentication via /api/auth/login
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          const loggedUser: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            role: (data.user.role || 'MEMBER').toLowerCase() as UserRole,
            full_name: data.user.fullName || data.user.full_name,
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
        }
      }
    } catch {
      // Graceful fallback to persistent seed records if server is not reachable
    }

    // 2. Resilient local fallback
    await new Promise((r) => setTimeout(r, 400));
    const foundUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'AUTHENTICATION SUCCESSFUL',
        message: `Welcome back, ${foundUser.full_name} (${foundUser.role.toUpperCase()})`,
      });
      return true;
    }

    // Dynamic role mapping if demo email entered
    const userRole: UserRole = email.includes('admin')
      ? 'admin'
      : email.includes('trainer')
      ? 'trainer'
      : 'member';

    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      role: userRole,
      full_name: email.split('@')[0].toUpperCase(),
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    setIsLoading(false);
    showToast({
      type: 'success',
      title: 'SESSION ESTABLISHED',
      message: `Signed in as ${newUser.full_name} (${newUser.role.toUpperCase()})`,
    });
    return true;
  };

  const register = async (
    email: string,
    fullName: string,
    userRole: UserRole = 'member',
    password = 'password123'
  ): Promise<boolean> => {
    setIsLoading(true);

    try {
      // 1. Attempt Real Server Registration
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role: userRole.toUpperCase(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
          const newUser: UserProfile = {
            id: data.user.id,
            email: data.user.email,
            role: userRole,
            full_name: fullName,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            created_at: new Date().toISOString(),
          };
          setUsers((prev) => [newUser, ...prev]);
          setUser(newUser);
          setIsLoading(false);
          showToast({
            type: 'success',
            title: 'REGISTRATION COMPLETE',
            message: `Account activated for ${fullName}. Role: ${userRole.toUpperCase()}`,
          });
          return true;
        }
      }
    } catch {
      // Resilient fallback
    }

    await new Promise((r) => setTimeout(r, 400));
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      role: userRole,
      full_name: fullName,
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      created_at: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    setUser(newUser);
    setIsLoading(false);

    showToast({
      type: 'success',
      title: 'ONBOARDING COMPLETE',
      message: `Account activated for ${fullName}. Role: ${userRole.toUpperCase()}`,
    });
    return true;
  };

  const logout = async () => {
    if (token) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // Ignore network errors on logout
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
    setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    showToast({
      type: 'success',
      title: 'PROFILE UPDATED',
      message: 'Your athlete profile details have been saved.',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
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
