import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, Dumbbell, CreditCard, QrCode, ShieldAlert, Sparkles } from 'lucide-react';
import { useNotifications } from '@/context/NotificationContext';
import { Link } from 'react-router-dom';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'workout': return <Dumbbell className="w-4 h-4 text-gym-lime" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-emerald-400" />;
      case 'attendance': return <QrCode className="w-4 h-4 text-cyan-400" />;
      case 'membership': return <Sparkles className="w-4 h-4 text-amber-400" />;
      default: return <ShieldAlert className="w-4 h-4 text-gym-secondary" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gym-secondary hover:text-gym-primary hover:bg-gym-surface-hover rounded transition-colors"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-gym-lime text-gym-black text-[10px] font-bold rounded-full flex items-center justify-center font-sans">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-gym-surface border border-gym-border rounded shadow-card z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gym-border bg-gym-black/40">
            <div className="flex items-center gap-2">
              <span className="font-heading uppercase tracking-wider text-sm font-bold text-gym-primary">
                NOTIFICATIONS
              </span>
              {unreadCount > 0 && (
                <span className="bg-gym-lime/10 text-gym-lime border border-gym-lime/20 text-xs px-2 py-0.5 rounded font-sans font-medium">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-gym-secondary hover:text-gym-lime flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gym-border/40">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gym-muted text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3.5 hover:bg-gym-surface-hover transition-colors flex items-start gap-3 ${
                    !notif.is_read ? 'bg-gym-lime/[0.03]' : ''
                  }`}
                >
                  <div className="mt-0.5 p-1.5 bg-gym-black/60 rounded border border-gym-border">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-gym-primary uppercase tracking-wide truncate">
                        {notif.title}
                      </h4>
                      <button
                        onClick={() => deleteNotification(notif.id)}
                        className="text-gym-muted hover:text-gym-danger transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gym-secondary mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-gym-muted">
                      <span>{new Date(notif.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      {notif.link && (
                        <Link
                          to={notif.link}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="text-gym-lime hover:underline font-medium"
                        >
                          View Details →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
