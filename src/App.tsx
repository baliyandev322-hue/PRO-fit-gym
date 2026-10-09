import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { GymDataProvider } from '@/context/GymDataContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

// Public Pages
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

// Member Pages
import { MemberDashboard } from '@/pages/member/MemberDashboard';
import { MemberAttendancePage } from '@/pages/member/MemberAttendancePage';
import { MemberWorkoutsPage } from '@/pages/member/MemberWorkoutsPage';
import { MemberProgressPage } from '@/pages/member/MemberProgressPage';
import { MemberMembershipPage } from '@/pages/member/MemberMembershipPage';
import { MemberPaymentsPage } from '@/pages/member/MemberPaymentsPage';
import { MemberProfilePage } from '@/pages/member/MemberProfilePage';

// Trainer Pages
import { TrainerDashboard } from '@/pages/trainer/TrainerDashboard';
import { TrainerMembersPage } from '@/pages/trainer/TrainerMembersPage';
import { TrainerWorkoutsPage } from '@/pages/trainer/TrainerWorkoutsPage';
import { TrainerAttendancePage } from '@/pages/trainer/TrainerAttendancePage';

// Admin Pages
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminMembersPage } from '@/pages/admin/AdminMembersPage';
import { AdminTrainersPage } from '@/pages/admin/AdminTrainersPage';
import { AdminMembershipsPage } from '@/pages/admin/AdminMembershipsPage';
import { AdminPaymentsPage } from '@/pages/admin/AdminPaymentsPage';
import { AdminAttendancePage } from '@/pages/admin/AdminAttendancePage';
import { AdminWorkoutsPage } from '@/pages/admin/AdminWorkoutsPage';
import { AdminTrialsPage } from '@/pages/admin/AdminTrialsPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <GymDataProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Member Protected Routes */}
              <Route
                path="/member/*"
                element={
                  <ProtectedRoute allowedRoles={['member', 'trainer', 'admin']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="dashboard" element={<MemberDashboard />} />
                        <Route path="attendance" element={<MemberAttendancePage />} />
                        <Route path="workouts" element={<MemberWorkoutsPage />} />
                        <Route path="progress" element={<MemberProgressPage />} />
                        <Route path="membership" element={<MemberMembershipPage />} />
                        <Route path="payments" element={<MemberPaymentsPage />} />
                        <Route path="profile" element={<MemberProfilePage />} />
                        <Route path="*" element={<Navigate to="/member/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Trainer Protected Routes */}
              <Route
                path="/trainer/*"
                element={
                  <ProtectedRoute allowedRoles={['trainer', 'admin']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="dashboard" element={<TrainerDashboard />} />
                        <Route path="members" element={<TrainerMembersPage />} />
                        <Route path="workouts" element={<TrainerWorkoutsPage />} />
                        <Route path="attendance" element={<TrainerAttendancePage />} />
                        <Route path="*" element={<Navigate to="/trainer/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardLayout>
                      <Routes>
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="members" element={<AdminMembersPage />} />
                        <Route path="trainers" element={<AdminTrainersPage />} />
                        <Route path="memberships" element={<AdminMembershipsPage />} />
                        <Route path="payments" element={<AdminPaymentsPage />} />
                        <Route path="attendance" element={<AdminAttendancePage />} />
                        <Route path="workouts" element={<AdminWorkoutsPage />} />
                        <Route path="trials" element={<AdminTrialsPage />} />
                        <Route path="messages" element={<AdminMessagesPage />} />
                        <Route path="settings" element={<AdminSettingsPage />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
                      </Routes>
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect to Landing */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </GymDataProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  );
};

export default App;
