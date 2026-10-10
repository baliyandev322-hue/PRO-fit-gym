import React, { createContext, useContext, useState, useEffect } from 'react';
import type { 
  MembershipPlan, 
  Membership, 
  AttendanceRecord, 
  WorkoutPlan, 
  WorkoutExercise,
  WorkoutLog, 
  MemberProgress, 
  PaymentRecord,
  WorkoutCategory
} from '@/types';
import { 
  SEED_PLANS, 
  SEED_MEMBERSHIPS, 
  SEED_ATTENDANCE, 
  SEED_WORKOUT_PLANS, 
  SEED_PROGRESS, 
  SEED_PAYMENTS,
  getLocalData, 
  setLocalData 
} from '@/lib/supabase';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface GymDataContextType {
  plans: MembershipPlan[];
  memberships: Membership[];
  attendance: AttendanceRecord[];
  workoutPlans: WorkoutPlan[];
  workoutLogs: WorkoutLog[];
  progressRecords: MemberProgress[];
  payments: PaymentRecord[];
  
  // Membership & Plans actions
  createPlan: (plan: Omit<MembershipPlan, 'id'>) => void;
  updatePlan: (id: string, updates: Partial<MembershipPlan>) => void;
  deletePlan: (id: string) => void;
  purchaseMembership: (planId: string, paymentMethod?: string) => Promise<boolean>;
  cancelMembership: (membershipId: string) => void;
  
  // Attendance actions
  recordAttendance: (memberId: string, memberName: string, gymLocation?: string, method?: 'qr_scan' | 'manual') => { success: boolean; message: string };
  
  // Workout actions
  createWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'created_at'>) => void;
  logWorkoutSet: (log: Omit<WorkoutLog, 'id' | 'completed_at'>) => void;
  
  // Progress actions
  addProgressMetric: (metric: Omit<MemberProgress, 'id'>) => void;
  
  // Helper getters
  getMemberMembership: (memberId: string) => Membership | undefined;
  getMemberAttendance: (memberId: string) => AttendanceRecord[];
  getMemberWorkouts: (memberId: string) => WorkoutPlan[];
  getMemberLogs: (memberId: string) => WorkoutLog[];
  getMemberProgress: (memberId: string) => MemberProgress[];
}

const GymDataContext = createContext<GymDataContextType | undefined>(undefined);

export const GymDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { showToast, addNotification } = useNotifications();

  const [plans, setPlans] = useState<MembershipPlan[]>(() => 
    getLocalData<MembershipPlan[]>('plans', SEED_PLANS)
  );
  const [memberships, setMemberships] = useState<Membership[]>(() => 
    getLocalData<Membership[]>('memberships', SEED_MEMBERSHIPS)
  );
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => 
    getLocalData<AttendanceRecord[]>('attendance', SEED_ATTENDANCE)
  );
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(() => 
    getLocalData<WorkoutPlan[]>('workoutPlans', SEED_WORKOUT_PLANS)
  );
  const [workoutLogs, setWorkoutLogs] = useState<WorkoutLog[]>(() => 
    getLocalData<WorkoutLog[]>('workoutLogs', [])
  );
  const [progressRecords, setProgressRecords] = useState<MemberProgress[]>(() => 
    getLocalData<MemberProgress[]>('progressRecords', SEED_PROGRESS)
  );
  const [payments, setPayments] = useState<PaymentRecord[]>(() => 
    getLocalData<PaymentRecord[]>('payments', SEED_PAYMENTS)
  );

  // Sync to localStorage
  useEffect(() => { setLocalData('plans', plans); }, [plans]);
  useEffect(() => { setLocalData('memberships', memberships); }, [memberships]);
  useEffect(() => { setLocalData('attendance', attendance); }, [attendance]);
  useEffect(() => { setLocalData('workoutPlans', workoutPlans); }, [workoutPlans]);
  useEffect(() => { setLocalData('workoutLogs', workoutLogs); }, [workoutLogs]);
  useEffect(() => { setLocalData('progressRecords', progressRecords); }, [progressRecords]);
  useEffect(() => { setLocalData('payments', payments); }, [payments]);

  // Plans Management
  const createPlan = (newPlan: Omit<MembershipPlan, 'id'>) => {
    const id = `plan-${Date.now()}`;
    const plan: MembershipPlan = { ...newPlan, id };
    setPlans(prev => [...prev, plan]);
    showToast({ type: 'success', title: 'PLAN CREATED', message: `${plan.name} has been added.` });
  };

  const updatePlan = (id: string, updates: Partial<MembershipPlan>) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    showToast({ type: 'success', title: 'PLAN UPDATED', message: 'Membership tier modified.' });
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(p => p.id !== id));
    showToast({ type: 'warning', title: 'PLAN REMOVED', message: 'Membership tier archived.' });
  };

  // Membership Purchase & Renewal
  const purchaseMembership = async (planId: string, _paymentMethod = 'stripe'): Promise<boolean> => {
    if (!user) return false;
    const targetPlan = plans.find(p => p.id === planId) || plans[0];

    // Compute dates
    const startDate = new Date().toISOString().split('T')[0];
    const expiryDateObj = new Date(Date.now() + targetPlan.duration_days * 86400000);
    const expiryDate = expiryDateObj.toISOString().split('T')[0];

    const newMembership: Membership = {
      id: `mem-${Date.now()}`,
      user_id: user.id,
      plan_id: targetPlan.id,
      plan: targetPlan,
      status: 'active',
      start_date: startDate,
      expiry_date: expiryDate,
      days_remaining: targetPlan.duration_days,
      auto_renew: true,
      created_at: new Date().toISOString()
    };

    // Update memberships
    setMemberships(prev => [newMembership, ...prev.filter(m => m.user_id !== user.id)]);

    const isRazorpay = _paymentMethod.includes('RAZORPAY');
    const inrPrice = targetPlan.id.includes('starter') ? 14900 : targetPlan.id.includes('elite') ? 39900 : 24900;
    const finalAmount = isRazorpay ? inrPrice : targetPlan.price;
    const finalCurrency = isRazorpay ? 'INR' : 'USD';
    const txnId = isRazorpay ? `pay_rzp_${Date.now()}` : `pi_stripe_${Date.now()}`;

    // Record Payment
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      member_id: user.id,
      member_name: user.full_name,
      plan_id: targetPlan.id,
      plan_name: `${targetPlan.name} Plan`,
      amount: finalAmount,
      currency: finalCurrency,
      status: 'paid',
      stripe_payment_intent_id: txnId,
      receipt_url: '#',
      created_at: new Date().toISOString()
    };
    setPayments(prev => [newPayment, ...prev]);

    // Send notifications
    addNotification({
      user_id: user.id,
      title: 'Payment Successful & Plan Activated',
      message: `Your ${targetPlan.name} membership (${isRazorpay ? `₹${inrPrice.toLocaleString()} INR` : `$${targetPlan.price} USD`}) is active for 30 days.`,
      type: 'payment',
      link: '/member/dashboard'
    });

    showToast({
      type: 'success',
      title: 'MEMBERSHIP ACTIVATED',
      message: `Welcome to ${targetPlan.name} Tier! Digital QR turnstile pass synchronized.`
    });

    return true;
  };

  const cancelMembership = (membershipId: string) => {
    setMemberships(prev => prev.map(m => m.id === membershipId ? { ...m, status: 'canceled' } : m));
    showToast({ type: 'warning', title: 'CANCELED', message: 'Auto-renewal deactivated.' });
  };

  // QR Attendance check-in with duplicate prevention (minimum 2 hours between check-ins)
  const recordAttendance = (
    memberId: string, 
    memberName: string, 
    gymLocation = 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan' | 'manual' = 'qr_scan'
  ) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const recentToday = attendance.find(a => 
      a.member_id === memberId && 
      a.date === todayStr &&
      (Date.now() - new Date(a.check_in_time).getTime()) < 1000 * 60 * 120 // 2 hours
    );

    if (recentToday) {
      return {
        success: false,
        message: `Duplicate check-in blocked: Already checked in at ${new Date(recentToday.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
      };
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      member_id: memberId,
      member_name: memberName,
      check_in_time: new Date().toISOString(),
      gym_location: gymLocation,
      method,
      date: todayStr
    };

    setAttendance(prev => [newRecord, ...prev]);

    // Asynchronously synchronize with backend API
    fetch(`${API_URL}/attendance/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        memberId,
        memberName,
        location: gymLocation,
        method
      })
    }).catch(() => {});

    addNotification({
      user_id: memberId,
      title: 'Gym Check-In Confirmed',
      message: `Scanned at ${gymLocation} on ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Have a great session!`,
      type: 'attendance',
      link: '/member/attendance'
    });

    showToast({
      type: 'success',
      title: 'ACCESS GRANTED',
      message: `Verified: ${memberName} checked in at ${gymLocation}.`
    });

    return {
      success: true,
      message: `Successfully verified and checked into ${gymLocation}!`
    };
  };

  // Workout Plans
  const createWorkoutPlan = (planData: Omit<WorkoutPlan, 'id' | 'created_at'>) => {
    const newPlan: WorkoutPlan = {
      ...planData,
      id: `wp-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    setWorkoutPlans(prev => [newPlan, ...prev]);

    // Asynchronously sync with backend API
    fetch(`${API_URL}/workouts/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(planData)
    }).catch(() => {});

    addNotification({
      user_id: planData.member_id,
      title: 'New Workout Assigned',
      message: `A new workout plan "${planData.title}" (${planData.category}) has been assigned to you.`,
      type: 'workout',
      link: '/member/workouts'
    });

    showToast({
      type: 'success',
      title: 'WORKOUT CREATED',
      message: `Plan "${planData.title}" assigned successfully.`
    });
  };

  // Workout Logs
  const logWorkoutSet = (logData: Omit<WorkoutLog, 'id' | 'completed_at'>) => {
    const newLog: WorkoutLog = {
      ...logData,
      id: `wl-${Date.now()}`,
      completed_at: new Date().toISOString()
    };
    setWorkoutLogs(prev => [newLog, ...prev]);

    // Asynchronously sync with backend API
    fetch(`${API_URL}/workouts/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(() => {});

    showToast({
      type: 'success',
      title: 'SET RECORDED',
      message: `Logged: ${logData.actual_sets} sets × ${logData.actual_reps} reps @ ${logData.actual_weight_kg}kg`
    });
  };

  // Progress metrics
  const addProgressMetric = (metricData: Omit<MemberProgress, 'id'>) => {
    const newRecord: MemberProgress = {
      ...metricData,
      id: `prog-${Date.now()}`
    };
    setProgressRecords(prev => [...prev, newRecord]);
    showToast({
      type: 'success',
      title: 'PROGRESS SAVED',
      message: `Body weight ${metricData.body_weight_kg}kg & lift numbers recorded.`
    });
  };

  // Helper getters
  const getMemberMembership = (memberId: string) => {
    const mem = memberships.find(m => m.user_id === memberId);
    if (!mem) return undefined;
    const plan = plans.find(p => p.id === mem.plan_id) || mem.plan;
    
    // Calculate remaining days
    const expiry = new Date(mem.expiry_date).getTime();
    const today = new Date().getTime();
    const daysRemaining = Math.max(0, Math.ceil((expiry - today) / (1000 * 60 * 60 * 24)));
    
    return {
      ...mem,
      plan,
      days_remaining: daysRemaining,
      status: (daysRemaining <= 0 ? 'expired' : daysRemaining <= 5 ? 'expiring_soon' : 'active') as import('@/types').MembershipStatus
    };
  };

  const getMemberAttendance = (memberId: string) => {
    return attendance.filter(a => a.member_id === memberId);
  };

  const getMemberWorkouts = (memberId: string) => {
    return workoutPlans.filter(w => w.member_id === memberId);
  };

  const getMemberLogs = (memberId: string) => {
    return workoutLogs.filter(l => l.member_id === memberId);
  };

  const getMemberProgress = (memberId: string) => {
    return progressRecords
      .filter(p => p.member_id === memberId)
      .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime());
  };

  return (
    <GymDataContext.Provider
      value={{
        plans,
        memberships,
        attendance,
        workoutPlans,
        workoutLogs,
        progressRecords,
        payments,
        createPlan,
        updatePlan,
        deletePlan,
        purchaseMembership,
        cancelMembership,
        recordAttendance,
        createWorkoutPlan,
        logWorkoutSet,
        addProgressMetric,
        getMemberMembership,
        getMemberAttendance,
        getMemberWorkouts,
        getMemberLogs,
        getMemberProgress
      }}
    >
      {children}
    </GymDataContext.Provider>
  );
};

export const useGymData = () => {
  const context = useContext(GymDataContext);
  if (!context) {
    throw new Error('useGymData must be used within GymDataProvider');
  }
  return context;
};
