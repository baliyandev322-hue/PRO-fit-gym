import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { GymDataProvider } from '@/context/GymDataContext';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { WeightlifterIcon } from '@/components/common/WeightlifterIcon';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

// Sleek Brand Loader for lazy-loaded route transitions
const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-gym-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <WeightlifterIcon className="w-14 h-14 text-gym-lime" isLifting={true} />
      <span className="font-heading text-xs tracking-widest text-gym-secondary uppercase font-bold">
        PRO<span className="text-gym-lime">FIT</span> LOADING...
      </span>
    </div>
  </div>
);

// Public Pages (Code-split)
const LandingPage = lazy(() => import('@/pages/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const BlogListPage = lazy(() => import('@/pages/blog/BlogListPage').then(m => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import('@/pages/blog/BlogPostPage').then(m => ({ default: m.BlogPostPage })));
const PrivacyPolicyPage = lazy(() => import('@/pages/legal/PrivacyPolicyPage').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('@/pages/legal/TermsPage').then(m => ({ default: m.TermsPage })));
const AboutUsPage = lazy(() => import('@/pages/public/AboutUsPage').then(m => ({ default: m.AboutUsPage })));
const ContactUsPage = lazy(() => import('@/pages/public/ContactUsPage').then(m => ({ default: m.ContactUsPage })));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

// Member Pages (Code-split)
const MemberDashboard = lazy(() => import('@/pages/member/MemberDashboard').then(m => ({ default: m.MemberDashboard })));
const MemberAttendancePage = lazy(() => import('@/pages/member/MemberAttendancePage').then(m => ({ default: m.MemberAttendancePage })));
const MemberWorkoutsPage = lazy(() => import('@/pages/member/MemberWorkoutsPage').then(m => ({ default: m.MemberWorkoutsPage })));
const MemberProgressPage = lazy(() => import('@/pages/member/MemberProgressPage').then(m => ({ default: m.MemberProgressPage })));
const MemberMembershipPage = lazy(() => import('@/pages/member/MemberMembershipPage').then(m => ({ default: m.MemberMembershipPage })));
const MemberPaymentsPage = lazy(() => import('@/pages/member/MemberPaymentsPage').then(m => ({ default: m.MemberPaymentsPage })));
const MemberProfilePage = lazy(() => import('@/pages/member/MemberProfilePage').then(m => ({ default: m.MemberProfilePage })));

// Trainer Pages (Code-split)
const TrainerDashboard = lazy(() => import('@/pages/trainer/TrainerDashboard').then(m => ({ default: m.TrainerDashboard })));
const TrainerMembersPage = lazy(() => import('@/pages/trainer/TrainerMembersPage').then(m => ({ default: m.TrainerMembersPage })));
const TrainerWorkoutsPage = lazy(() => import('@/pages/trainer/TrainerWorkoutsPage').then(m => ({ default: m.TrainerWorkoutsPage })));
const TrainerAttendancePage = lazy(() => import('@/pages/trainer/TrainerAttendancePage').then(m => ({ default: m.TrainerAttendancePage })));

// Admin Pages (Code-split)
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminMembersPage = lazy(() => import('@/pages/admin/AdminMembersPage').then(m => ({ default: m.AdminMembersPage })));
const AdminTrainersPage = lazy(() => import('@/pages/admin/AdminTrainersPage').then(m => ({ default: m.AdminTrainersPage })));
const AdminMembershipsPage = lazy(() => import('@/pages/admin/AdminMembershipsPage').then(m => ({ default: m.AdminMembershipsPage })));
const AdminPaymentsPage = lazy(() => import('@/pages/admin/AdminPaymentsPage').then(m => ({ default: m.AdminPaymentsPage })));
const AdminAttendancePage = lazy(() => import('@/pages/admin/AdminAttendancePage').then(m => ({ default: m.AdminAttendancePage })));
const AdminWorkoutsPage = lazy(() => import('@/pages/admin/AdminWorkoutsPage').then(m => ({ default: m.AdminWorkoutsPage })));
const AdminTrialsPage = lazy(() => import('@/pages/admin/AdminTrialsPage').then(m => ({ default: m.AdminTrialsPage })));
const AdminMessagesPage = lazy(() => import('@/pages/admin/AdminMessagesPage').then(m => ({ default: m.AdminMessagesPage })));
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <GymDataProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/about-us" element={<Navigate to="/about" replace />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/contact-us" element={<Navigate to="/contact" replace />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />

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

              {/* 404 Route for Unmatched Paths */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </GymDataProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </ErrorBoundary>
  );
};

export default App;
