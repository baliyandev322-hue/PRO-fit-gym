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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gym-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <WeightlifterIcon className="w-16 h-16 text-gym-lime" isLifting={true} />
          <span className="font-heading uppercase tracking-widest text-sm text-gym-primary font-bold">
            Authenticating Athlete Profile...
          </span>
          <span className="text-xs text-gym-muted font-sans -mt-2">
            Loading your training sanctuary
          </span>
        </div>
      </div>
    );
  }

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
