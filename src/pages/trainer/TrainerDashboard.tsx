import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Dumbbell, 
  CalendarCheck, 
  TrendingUp, 
  Plus, 
  ArrowUpRight,
  Flame,
  Award,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';

export const TrainerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { workoutPlans, attendance, memberships } = useGymData();

  if (!user) return null;

  // Mock list of assigned athletes to Marcus Drake
  const assignedAthletes = [
    {
      id: 'user-member-1',
      name: 'Alex Vance',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      tier: 'Performance Tier',
      status: 'Active',
      lastCheckIn: 'Today, 2:30 PM',
      focus: 'Deadlift & Posterior Chain 1RM'
    },
    {
      id: 'user-member-2',
      name: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      tier: 'Elite VIP Tier',
      status: 'Active',
      lastCheckIn: 'Today, 1:15 PM',
      focus: 'Olympic Clean & Jerk technique'
    },
    {
      id: 'user-member-3',
      name: 'Jordan Bell',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      tier: 'Starter Tier',
      status: 'Expiring Soon',
      lastCheckIn: 'Yesterday',
      focus: 'Hypertrophy baseline'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gym-surface to-gym-black border border-gym-border rounded-sm p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading text-2xl sm:text-3xl font-black uppercase text-gym-primary tracking-wide">
              COACH {user.full_name.toUpperCase()}
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-heading font-black uppercase tracking-wider rounded bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
              Senior Strength Specialist
            </span>
          </div>
          <p className="text-xs text-gym-secondary mt-1">
            Managing periodization and progressive overload for 3 assigned elite athletes
          </p>
        </div>

        <Link
          to="/trainer/workouts"
          className="flex items-center gap-2 px-5 py-2.5 rounded-sm font-heading uppercase font-bold text-xs bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Assign New Workout Plan</span>
        </Link>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Assigned Athletes</span>
            <Users className="w-4 h-4 text-gym-lime" />
          </div>
          <span className="font-heading text-4xl font-black text-gym-primary">
            {assignedAthletes.length}
          </span>
          <span className="text-[10px] text-gym-secondary block mt-1">All in active periodization</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Today's Athletes In Gym</span>
            <CalendarCheck className="w-4 h-4 text-gym-lime" />
          </div>
          <span className="font-heading text-4xl font-black text-gym-lime">
            2
          </span>
          <span className="text-[10px] text-gym-secondary block mt-1">Checked in on lifting floor</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Active Programs</span>
            <Dumbbell className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="font-heading text-4xl font-black text-gym-primary">
            {workoutPlans.length}
          </span>
          <span className="text-[10px] text-gym-secondary block mt-1">Custom periodized routines</span>
        </div>

        <div className="bg-gym-surface border border-gym-border p-5 rounded-sm">
          <div className="flex items-center justify-between text-gym-muted mb-2">
            <span className="text-[11px] font-heading font-bold uppercase tracking-wider">Athletic PRs Logged</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-heading text-4xl font-black text-gym-primary">
            18
          </span>
          <span className="text-[10px] text-emerald-400 block mt-1 font-semibold">4 new PRs this week</span>
        </div>
      </div>

      {/* Assigned Athletes Grid */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
            ATHLETE ROSTER & PROGRESS STATUS
          </h3>
          <Link to="/trainer/members" className="text-xs text-gym-lime hover:underline font-bold uppercase font-heading">
            View All Athletes →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {assignedAthletes.map(athlete => (
            <div key={athlete.id} className="bg-gym-black border border-gym-border p-4 rounded-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={athlete.avatar}
                    alt={athlete.name}
                    className="w-12 h-12 rounded-full object-cover border border-gym-lime"
                  />
                  <div>
                    <h4 className="font-heading font-black uppercase text-base text-gym-primary">
                      {athlete.name}
                    </h4>
                    <span className="text-[10px] text-gym-lime font-mono block">
                      {athlete.tier}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-gym-secondary mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gym-muted">Last Gate Check-In:</span>
                    <span className="text-white font-medium">{athlete.lastCheckIn}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gym-muted">Focus Area:</span>
                    <span className="text-gym-primary font-medium">{athlete.focus}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gym-border flex gap-2">
                <Link
                  to="/trainer/workouts"
                  className="w-full py-2 bg-gym-surface hover:bg-gym-surface-hover border border-gym-border text-center rounded text-xs font-heading font-bold uppercase tracking-wider text-gym-primary transition-colors"
                >
                  Edit / Assign Workout
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Workout Programs Assigned */}
      <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary">
            ACTIVE TRAINING SPLITS DEPLOYED
          </h3>
          <Link to="/trainer/workouts" className="text-xs text-gym-lime hover:underline font-bold uppercase font-heading">
            Open Program Architect →
          </Link>
        </div>

        <div className="space-y-3">
          {workoutPlans.map(plan => (
            <div key={plan.id} className="p-4 bg-gym-black border border-gym-border rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black uppercase text-base text-gym-primary">
                    {plan.title}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-heading uppercase font-bold bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
                    {plan.category}
                  </span>
                </div>
                <div className="text-xs text-gym-secondary mt-1">
                  Athlete: <strong className="text-white">{plan.member_name || 'Alex Vance'}</strong> &bull; {plan.exercises?.length || 0} Calibrated Exercises
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to="/trainer/workouts"
                  className="px-3 py-1.5 bg-gym-surface hover:bg-gym-surface-hover border border-gym-border text-xs font-heading font-bold uppercase tracking-wider text-gym-primary rounded"
                >
                  Modify Sets
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
