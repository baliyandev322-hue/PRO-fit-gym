export type UserRole = 'member' | 'trainer' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  emergency_contact?: string;
  bio?: string;
  assigned_trainer_id?: string;
  assigned_trainer_name?: string;
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  duration_days: number;
  description: string;
  features: string[];
  is_popular?: boolean;
  is_active?: boolean;
}

export type MembershipStatus = 'active' | 'expiring_soon' | 'expired' | 'canceled';

export interface Membership {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: MembershipPlan;
  status: MembershipStatus;
  start_date: string;
  expiry_date: string;
  days_remaining?: number;
  auto_renew: boolean;
  stripe_subscription_id?: string;
  created_at: string;
}

export interface AttendanceRecord {
  id: string;
  member_id: string;
  member_name?: string;
  check_in_time: string;
  check_out_time?: string;
  gym_location: string;
  method: 'qr_scan' | 'manual' | 'nfc';
  date: string;
}

export type WorkoutCategory = 
  | 'Push' 
  | 'Pull' 
  | 'Legs' 
  | 'Chest' 
  | 'Back' 
  | 'Shoulders' 
  | 'Arms' 
  | 'Full Body' 
  | 'Cardio & Core';

export interface WorkoutExercise {
  id: string;
  plan_id: string;
  exercise_name: string;
  sets: number;
  reps: number;
  target_weight_kg: number;
  rest_seconds: number;
  order_index: number;
  instructions?: string;
}

export interface WorkoutPlan {
  id: string;
  trainer_id?: string;
  trainer_name?: string;
  member_id: string;
  member_name?: string;
  title: string;
  category: WorkoutCategory;
  notes?: string;
  is_active: boolean;
  exercises?: WorkoutExercise[];
  created_at: string;
}

export interface WorkoutLog {
  id: string;
  member_id: string;
  exercise_id?: string;
  exercise_name?: string;
  plan_id?: string;
  completed_at: string;
  actual_sets: number;
  actual_reps: number;
  actual_weight_kg: number;
  notes?: string;
}

export interface MemberProgress {
  id: string;
  member_id: string;
  recorded_date: string;
  body_weight_kg: number;
  bench_press_1rm?: number;
  squat_1rm?: number;
  deadlift_1rm?: number;
  body_fat_percentage?: number;
  notes?: string;
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';

export interface PaymentRecord {
  id: string;
  member_id: string;
  member_name?: string;
  plan_id?: string;
  plan_name?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripe_payment_intent_id?: string;
  stripe_invoice_id?: string;
  receipt_url?: string;
  created_at: string;
}

export type NotificationType = 'membership' | 'workout' | 'attendance' | 'payment' | 'system';

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  link?: string;
  created_at: string;
}
