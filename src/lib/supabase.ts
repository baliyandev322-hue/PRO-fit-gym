import { createClient } from '@supabase/supabase-js';
import type { 
  UserProfile, 
  MembershipPlan, 
  Membership, 
  AttendanceRecord, 
  WorkoutPlan, 
  WorkoutLog, 
  MemberProgress, 
  PaymentRecord, 
  NotificationItem 
} from '@/types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://mock-profitgym.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

export const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'https://mock-profitgym.supabase.co' && 
  !supabaseUrl.includes('mock');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ============================================================================
// INITIAL SEED DATA FOR LOCAL / DEV RESILIENCE
// ============================================================================
export const SEED_PLANS: MembershipPlan[] = [
  {
    id: 'plan-starter',
    name: 'Starter',
    slug: 'starter',
    price: 149,
    duration_days: 30,
    description: 'Foundational strength access for dedicated athletes starting their journey.',
    features: [
      'Full gym floor access',
      'Locker room & rainfall sauna',
      'Initial biomechanics assessment',
      'PROFIT mobile app access',
      'Basic workout template'
    ],
    is_popular: false,
    is_active: true
  },
  {
    id: 'plan-performance',
    name: 'Performance',
    slug: 'performance',
    price: 249,
    duration_days: 30,
    description: 'The complete high-performance standard. Designed for serious progression.',
    features: [
      'All Starter benefits',
      'Unlimited 24/7 keycard & QR access',
      'Bi-weekly 1-on-1 coach check-ins',
      'Custom periodized programming',
      'Recovery suite (Cold plunge + Sauna)',
      'InBody monthly body composition scan'
    ],
    is_popular: true,
    is_active: true
  },
  {
    id: 'plan-elite',
    name: 'Elite',
    slug: 'elite',
    price: 399,
    duration_days: 30,
    description: 'The pinnacle of bespoke physical preparation with unrestricted VIP access.',
    features: [
      'All Performance benefits',
      'Dedicated Senior Master Coach',
      'Weekly 1-on-1 private lifting sessions',
      'Personal nutrition & macros blueprint',
      'Permanent private executive locker',
      'Complimentary guest pass monthly',
      'Quarterly bloodwork & VO2 Max consult'
    ],
    is_popular: false,
    is_active: true
  }
];

export const SEED_USERS: UserProfile[] = [
  {
    id: 'user-member-1',
    email: 'member@profitgym.com',
    role: 'member',
    full_name: 'Alex Vance',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (212) 555-0192',
    emergency_contact: 'Sarah Vance - +1 (212) 555-0199',
    bio: 'Competitive powerlifter and marathon runner focusing on posterior chain and VO2 max.',
    assigned_trainer_id: 'user-trainer-1',
    assigned_trainer_name: 'Marcus Drake',
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'user-trainer-1',
    email: 'trainer@profitgym.com',
    role: 'trainer',
    full_name: 'Marcus Drake',
    avatar_url: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (212) 555-0183',
    emergency_contact: 'Club HQ - +1 (212) 555-0100',
    bio: 'CSCS Head Strength Specialist with 10+ years Olympic weightlifting & powerlifting coaching.',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString()
  },
  {
    id: 'user-admin-1',
    email: 'admin@profitgym.com',
    role: 'admin',
    full_name: 'Dev Baliyan',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (212) 555-0101',
    emergency_contact: 'Operations Room - +1 (212) 555-0100',
    bio: 'Founder & Managing Director of PROFIT Training Club.',
    created_at: new Date(Date.now() - 365 * 86400000).toISOString()
  },
  {
    id: 'user-member-2',
    email: 'elena.rostova@athlete.com',
    role: 'member',
    full_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (212) 555-0144',
    emergency_contact: 'Mikhail Rostova - +1 (212) 555-0145',
    bio: 'Olympic lifting specialist.',
    assigned_trainer_id: 'user-trainer-1',
    assigned_trainer_name: 'Marcus Drake',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'user-member-3',
    email: 'jordan.bell@business.com',
    role: 'member',
    full_name: 'Jordan Bell',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    phone: '+1 (212) 555-0177',
    emergency_contact: 'Dana Bell - +1 (212) 555-0178',
    bio: 'Executive functional hypertrophy member.',
    assigned_trainer_id: 'user-trainer-1',
    assigned_trainer_name: 'Marcus Drake',
    created_at: new Date(Date.now() - 80 * 86400000).toISOString()
  }
];

export const SEED_MEMBERSHIPS: Membership[] = [
  {
    id: 'mem-1',
    user_id: 'user-member-1',
    plan_id: 'plan-performance',
    plan: SEED_PLANS[1],
    status: 'active',
    start_date: new Date(Date.now() - 12 * 86400000).toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 18 * 86400000).toISOString().split('T')[0],
    days_remaining: 18,
    auto_renew: true,
    stripe_subscription_id: 'sub_mock_alex_vance',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'mem-2',
    user_id: 'user-member-2',
    plan_id: 'plan-elite',
    plan: SEED_PLANS[2],
    status: 'active',
    start_date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    days_remaining: 25,
    auto_renew: true,
    stripe_subscription_id: 'sub_mock_elena',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'mem-3',
    user_id: 'user-member-3',
    plan_id: 'plan-starter',
    plan: SEED_PLANS[0],
    status: 'expiring_soon',
    start_date: new Date(Date.now() - 28 * 86400000).toISOString().split('T')[0],
    expiry_date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    days_remaining: 2,
    auto_renew: false,
    stripe_subscription_id: 'sub_mock_jordan',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString()
  }
];

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-1',
    member_id: 'user-member-1',
    member_name: 'Alex Vance',
    check_in_time: new Date(Date.now() - 3600000 * 2).toISOString(),
    check_out_time: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    gym_location: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'att-2',
    member_id: 'user-member-1',
    member_name: 'Alex Vance',
    check_in_time: new Date(Date.now() - 86400000 * 1 - 3600000 * 3).toISOString(),
    gym_location: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan',
    date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0]
  },
  {
    id: 'att-3',
    member_id: 'user-member-1',
    member_name: 'Alex Vance',
    check_in_time: new Date(Date.now() - 86400000 * 3 - 3600000 * 4).toISOString(),
    gym_location: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan',
    date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]
  },
  {
    id: 'att-4',
    member_id: 'user-member-2',
    member_name: 'Elena Rostova',
    check_in_time: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    gym_location: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'qr_scan',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'att-5',
    member_id: 'user-member-3',
    member_name: 'Jordan Bell',
    check_in_time: new Date(Date.now() - 3600000 * 4).toISOString(),
    gym_location: 'NYC - NoHo Flagship (Sanctuary 01)',
    method: 'manual',
    date: new Date().toISOString().split('T')[0]
  }
];

export const SEED_WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'wp-1',
    trainer_id: 'user-trainer-1',
    trainer_name: 'Marcus Drake',
    member_id: 'user-member-1',
    member_name: 'Alex Vance',
    title: 'Push Day (Hypertrophy & CNS Activation)',
    category: 'Push',
    notes: 'Focus on 3-second eccentric phase on bench. Keep scapulae retracted.',
    is_active: true,
    created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
    exercises: [
      {
        id: 'ex-1',
        plan_id: 'wp-1',
        exercise_name: 'Barbell Bench Press',
        sets: 4,
        reps: 8,
        target_weight_kg: 85,
        rest_seconds: 120,
        order_index: 1,
        instructions: 'Touch chest under control. Full lockout at top.'
      },
      {
        id: 'ex-2',
        plan_id: 'wp-1',
        exercise_name: 'Incline Dumbbell Press',
        sets: 3,
        reps: 10,
        target_weight_kg: 32.5,
        rest_seconds: 90,
        order_index: 2,
        instructions: '30-degree incline, slight pronation at top.'
      },
      {
        id: 'ex-3',
        plan_id: 'wp-1',
        exercise_name: 'Standing Overhead Barbell Press',
        sets: 4,
        reps: 8,
        target_weight_kg: 55,
        rest_seconds: 90,
        order_index: 3,
        instructions: 'Brace core, glutes tight, bar path straight over midfoot.'
      },
      {
        id: 'ex-4',
        plan_id: 'wp-1',
        exercise_name: 'Cable Tricep Pushdown (V-Bar)',
        sets: 3,
        reps: 12,
        target_weight_kg: 35,
        rest_seconds: 60,
        order_index: 4,
        instructions: 'Elbows pinned to sides, 1s peak contraction.'
      },
      {
        id: 'ex-5',
        plan_id: 'wp-1',
        exercise_name: 'Lateral Dumbbell Raises',
        sets: 4,
        reps: 15,
        target_weight_kg: 14,
        rest_seconds: 60,
        order_index: 5,
        instructions: 'Lead with elbows, pause at parallel.'
      }
    ]
  },
  {
    id: 'wp-2',
    trainer_id: 'user-trainer-1',
    trainer_name: 'Marcus Drake',
    member_id: 'user-member-1',
    member_name: 'Alex Vance',
    title: 'Pull Day (Posterior Kinetic Chain)',
    category: 'Pull',
    notes: 'Prioritize lats engagement before pulling with forearms.',
    is_active: false,
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    exercises: [
      {
        id: 'ex-6',
        plan_id: 'wp-2',
        exercise_name: 'Conventional Deadlift',
        sets: 4,
        reps: 5,
        target_weight_kg: 140,
        rest_seconds: 180,
        order_index: 1,
        instructions: 'Eleiko calibrated plates, dynamic leg drive.'
      },
      {
        id: 'ex-7',
        plan_id: 'wp-2',
        exercise_name: 'Weighted Pull-Ups',
        sets: 4,
        reps: 6,
        target_weight_kg: 15,
        rest_seconds: 120,
        order_index: 2,
        instructions: 'Full dead-hang to chin cleanly over bar.'
      },
      {
        id: 'ex-8',
        plan_id: 'wp-2',
        exercise_name: 'Chest-Supported T-Bar Row',
        sets: 3,
        reps: 10,
        target_weight_kg: 60,
        rest_seconds: 90,
        order_index: 3,
        instructions: 'Neutral grip, drive elbows backwards.'
      }
    ]
  }
];

export const SEED_PROGRESS: MemberProgress[] = [
  {
    id: 'prog-1',
    member_id: 'user-member-1',
    recorded_date: new Date(Date.now() - 35 * 86400000).toISOString().split('T')[0],
    body_weight_kg: 78.5,
    bench_press_1rm: 95,
    squat_1rm: 130,
    deadlift_1rm: 165,
    body_fat_percentage: 14.8,
    notes: 'Baseline check at onboarding.'
  },
  {
    id: 'prog-2',
    member_id: 'user-member-1',
    recorded_date: new Date(Date.now() - 21 * 86400000).toISOString().split('T')[0],
    body_weight_kg: 79.2,
    bench_press_1rm: 100,
    squat_1rm: 135,
    deadlift_1rm: 172.5,
    body_fat_percentage: 14.2,
    notes: 'Power output rising.'
  },
  {
    id: 'prog-3',
    member_id: 'user-member-1',
    recorded_date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    body_weight_kg: 79.8,
    bench_press_1rm: 105,
    squat_1rm: 142.5,
    deadlift_1rm: 180,
    body_fat_percentage: 13.6,
    notes: 'New 1RM PR on Deadlift!'
  }
];

export const SEED_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay-1',
    member_id: 'user-member-1',
    member_name: 'Alex Vance',
    plan_id: 'plan-performance',
    plan_name: 'Performance Plan',
    amount: 249,
    currency: 'USD',
    status: 'paid',
    stripe_payment_intent_id: 'pi_3Lkm09923847',
    receipt_url: '#',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString()
  },
  {
    id: 'pay-2',
    member_id: 'user-member-2',
    member_name: 'Elena Rostova',
    plan_id: 'plan-elite',
    plan_name: 'Elite Plan',
    amount: 399,
    currency: 'USD',
    status: 'paid',
    stripe_payment_intent_id: 'pi_3Lkm88219384',
    receipt_url: '#',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 'pay-3',
    member_id: 'user-member-3',
    member_name: 'Jordan Bell',
    plan_id: 'plan-starter',
    plan_name: 'Starter Plan',
    amount: 149,
    currency: 'USD',
    status: 'paid',
    stripe_payment_intent_id: 'pi_3Lkm55219904',
    receipt_url: '#',
    created_at: new Date(Date.now() - 28 * 86400000).toISOString()
  }
];

export const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    user_id: 'user-member-1',
    title: 'Membership Active',
    message: 'Your Performance Membership is confirmed. 18 days remaining.',
    type: 'membership',
    is_read: false,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'user-member-1',
    title: 'New Workout Assigned',
    message: 'Coach Marcus Drake updated your "Push Day (Hypertrophy & CNS)" plan.',
    type: 'workout',
    is_read: false,
    link: '/member/workouts',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'notif-3',
    user_id: 'user-member-1',
    title: 'Check-In Confirmed',
    message: 'You checked into NYC - NoHo Flagship today.',
    type: 'attendance',
    is_read: true,
    link: '/member/attendance',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

// Local State Store Helpers
const STORAGE_PREFIX = 'profit_gym_saas_';

export function getLocalData<T>(key: string, defaultData: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch {
    return defaultData;
  }
}

export function setLocalData<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}
