import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const BRAND = 'PROFIT - Training Club';

const ROUTE_TITLES: Record<string, string> = {
  '/': BRAND,
  '/about': `About Us | ${BRAND}`,
  '/about-us': `About Us | ${BRAND}`,
  '/contact': `Contact Us | ${BRAND}`,
  '/contact-us': `Contact Us | ${BRAND}`,
  '/blog': `Sports Science & Protocols | ${BRAND}`,
  '/login': `Sign In | ${BRAND}`,
  '/register': `Membership Application | ${BRAND}`,
  '/forgot-password': `Reset Password | ${BRAND}`,
  '/privacy': `Privacy Policy | ${BRAND}`,
  '/privacy-policy': `Privacy Policy | ${BRAND}`,
  '/terms': `Terms of Service | ${BRAND}`,
  '/terms-of-service': `Terms of Service | ${BRAND}`,

  // Member Portal Routes
  '/member': `Athlete Portal | ${BRAND}`,
  '/member/dashboard': `Athlete Dashboard | ${BRAND}`,
  '/member/attendance': `QR Attendance | ${BRAND}`,
  '/member/workouts': `Workouts | ${BRAND}`,
  '/member/progress': `Progress & 1RM | ${BRAND}`,
  '/member/membership': `Membership Tier | ${BRAND}`,
  '/member/payments': `Billing Statements | ${BRAND}`,
  '/member/profile': `Athlete Profile | ${BRAND}`,

  // Trainer Portal Routes
  '/trainer': `Coach Hub | ${BRAND}`,
  '/trainer/dashboard': `Trainer Hub | ${BRAND}`,
  '/trainer/members': `Assigned Athletes | ${BRAND}`,
  '/trainer/workouts': `Workout Programs | ${BRAND}`,
  '/trainer/attendance': `Athlete Attendance | ${BRAND}`,

  // Admin Portal Routes
  '/admin': `Executive Hub | ${BRAND}`,
  '/admin/dashboard': `Executive Hub | ${BRAND}`,
  '/admin/members': `Members Directory | ${BRAND}`,
  '/admin/trainers': `Master Coaches | ${BRAND}`,
  '/admin/memberships': `Membership Plans | ${BRAND}`,
  '/admin/attendance': `Check-In Terminal | ${BRAND}`,
  '/admin/workouts': `Workout Catalog | ${BRAND}`,
  '/admin/trials': `Trial Leads | ${BRAND}`,
  '/admin/messages': `Inbox Messages | ${BRAND}`,
  '/admin/settings': `Facility Settings | ${BRAND}`,
  '/admin/payments': `Payment Ledger | ${BRAND}`,
};

export const RouteTitleHandler: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    // Exact match
    const exactTitle = ROUTE_TITLES[location.pathname];
    if (exactTitle) {
      document.title = exactTitle;
      return;
    }

    // Dynamic blog post routes (/blog/:slug) are handled by BlogPostPage with SEOHead
    if (location.pathname.startsWith('/blog/')) {
      return;
    }

    // Fallback for nested sub-routes
    const matchedPrefix = Object.keys(ROUTE_TITLES).find(
      route => route !== '/' && location.pathname.startsWith(route)
    );
    if (matchedPrefix) {
      document.title = ROUTE_TITLES[matchedPrefix];
    } else {
      document.title = BRAND;
    }
  }, [location.pathname]);

  return null;
};
