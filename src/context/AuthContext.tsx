import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, UserRole } from '@/types';
import { SEED_USERS, getLocalData, setLocalData } from '@/lib/supabase';
import { useNotifications } from './NotificationContext';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (email: string, fullName: string, role?: UserRole, password?: string) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserProfile[]>(() => {
    return getLocalData<UserProfile[]>('users', SEED_USERS);
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
    // Default to Alex Vance (Member) for seamless demo
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

  const login = async (email: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));

    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUser(foundUser);
      setIsLoading(false);
      showToast({
        type: 'success',
        title: 'AUTHENTICATION SUCCESSFUL',
        message: `Welcome back, ${foundUser.full_name} (${foundUser.role.toUpperCase()})`
      });
      return true;
    }

    // If user not in seed, create them as member
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      role: 'member',
      full_name: email.split('@')[0].toUpperCase(),
      created_at: new Date().toISOString()
    };
    setUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    setIsLoading(false);
    showToast({
      type: 'success',
      title: 'WELCOME TO PROFIT',
      message: `Signed in as ${newUser.full_name}`
    });
    return true;
  };

  const register = async (email: string, fullName: string, userRole: UserRole = 'member', _password?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setIsLoading(false);
      showToast({
        type: 'error',
        title: 'ACCOUNT EXISTS',
        message: 'An athlete or staff member with this email already exists.'
      });
      return false;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email,
      role: userRole,
      full_name: fullName,
      avatar_url: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80`,
      created_at: new Date().toISOString()
    };

    setUsers(prev => [newUser, ...prev]);
    setUser(newUser);
    setIsLoading(false);

    showToast({
      type: 'success',
      title: 'ONBOARDING COMPLETE',
      message: `Account activated for ${fullName}. Role: ${userRole.toUpperCase()}`
    });
    return true;
  };

  const logout = () => {
    setUser(null);
    showToast({
      type: 'info',
      title: 'SIGNED OUT',
      message: 'You have been safely signed out from PROFIT Training Club.'
    });
  };

  // Quick switch role for effortless live testing
  const switchRole = (newRole: UserRole) => {
    const roleUser = users.find(u => u.role === newRole);
    if (roleUser) {
      setUser(roleUser);
      showToast({
        type: 'info',
        title: 'ROLE SWITCHED',
        message: `Switched demo view to ${roleUser.full_name} (${newRole.toUpperCase()})`
      });
    } else {
      const demoAccount: UserProfile = {
        id: `demo-${newRole}`,
        email: `${newRole}@profitgym.com`,
        role: newRole,
        full_name: `Demo ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
        created_at: new Date().toISOString()
      };
      setUsers(prev => [demoAccount, ...prev]);
      setUser(demoAccount);
      showToast({
        type: 'info',
        title: 'ROLE SWITCHED',
        message: `Switched to ${newRole.toUpperCase()} mode`
      });
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    const updated = { ...user, ...updates };
    setUser(updated);
    setUsers(prev => prev.map(u => u.id === user.id ? updated : u));
    showToast({
      type: 'success',
      title: 'PROFILE UPDATED',
      message: 'Your athlete profile details have been saved.'
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        updateProfile
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
