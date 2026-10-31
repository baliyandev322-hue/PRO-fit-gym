import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { WeightlifterIcon } from '@/components/common/WeightlifterIcon';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // 1. Instant Navigation: If the athlete profile is already active or cached,
  // render immediately! Do not block navigation with full-screen loading screens.
  if (user && isAuthenticated) {
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
      if (role === 'trainer') return <Navigate to="/trainer/dashboard" replace />;
      return <Navigate to="/member/dashboard" replace />;
    }
    return <>{children}</>;
  }

  // 2. Only show full-page loading if an unverified token is active with NO cached user profile yet
  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gym-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <WeightlifterIcon className="w-14 h-14 text-gym-lime" isLifting={true} />
          <span className="font-heading uppercase tracking-widest text-sm text-gym-primary font-bold">
            Authenticating Profile...
          </span>
        </div>
      </div>
    );
  }

  // 3. Not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to the appropriate home for their role
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'trainer') return <Navigate to="/trainer/dashboard" replace />;
    return <Navigate to="/member/dashboard" replace />;
  }

  return <>{children}</>;
};
