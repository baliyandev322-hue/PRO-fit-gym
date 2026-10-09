import React, { createContext, useContext, useState, useEffect } from 'react';
import type { NotificationItem } from '@/types';
import { SEED_NOTIFICATIONS, getLocalData, setLocalData } from '@/lib/supabase';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  addNotification: (item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    return getLocalData<NotificationItem[]>('notifications', SEED_NOTIFICATIONS);
  });
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    setLocalData('notifications', notifications);
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const addNotification = (item: Omit<NotificationItem, 'id' | 'created_at' | 'is_read'>) => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      is_read: false,
      created_at: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        toasts,
        showToast,
        removeToast
      }}
    >
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-4 rounded-sm border shadow-card transition-all transform animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-gym-surface border-gym-lime/50 text-white'
                : toast.type === 'error'
                ? 'bg-gym-surface border-gym-danger/50 text-white'
                : toast.type === 'warning'
                ? 'bg-gym-surface border-gym-warning/50 text-white'
                : 'bg-gym-surface border-gym-border text-white'
            }`}
          >
            <div className="flex-1 mr-3">
              {toast.title && (
                <div className="text-xs uppercase tracking-wider font-bold mb-1 text-gym-lime">
                  {toast.title}
                </div>
              )}
              <div className="text-sm font-sans text-gym-primary">{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gym-muted hover:text-white text-sm"
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
