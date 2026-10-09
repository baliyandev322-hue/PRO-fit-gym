import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Dumbbell, Calendar, Mail, Phone, ChevronRight } from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';

export const TrainerMembersPage: React.FC = () => {
  const { memberships, attendance, progressRecords } = useGymData();

  const athleteRoster = [
    {
      id: 'user-member-1',
      name: 'Alex Vance',
      email: 'alex.vance@athlete.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (212) 555-0192',
      tier: 'Performance Tier',
      status: 'Active',
      deadliftPR: '180 kg',
      bodyWeight: '79.8 kg',
      sessionsLogged: 24,
      program: 'Push Day (Hypertrophy & CNS Activation)'
    },
    {
      id: 'user-member-2',
      name: 'Elena Rostova',
      email: 'elena.rostova@athlete.com',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (212) 555-0144',
      tier: 'Elite VIP Tier',
      status: 'Active',
      deadliftPR: '155 kg',
      bodyWeight: '64.2 kg',
      sessionsLogged: 19,
      program: 'Olympic Clean & Jerk Cycle'
    },
    {
      id: 'user-member-3',
      name: 'Jordan Bell',
      email: 'jordan.bell@business.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      phone: '+1 (212) 555-0177',
      tier: 'Starter Tier',
      status: 'Expiring Soon',
      deadliftPR: '140 kg',
      bodyWeight: '84.5 kg',
      sessionsLogged: 12,
      program: 'Full Body Functional Base'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
          ASSIGNED ATHLETES DIRECTORY
        </h2>
        <p className="text-xs text-gym-secondary">
          Detailed biomechanics, program status, and performance cards for athletes under your supervision
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {athleteRoster.map(athlete => (
          <div key={athlete.id} className="bg-gym-surface border border-gym-border rounded-sm p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={athlete.avatar}
                  alt={athlete.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-gym-lime"
                />
                <div>
                  <h3 className="font-heading text-lg font-black uppercase text-gym-primary">
                    {athlete.name}
                  </h3>
                  <span className="text-xs text-gym-lime font-mono block">
                    {athlete.tier}
                  </span>
                  <span className="text-[10px] text-gym-muted block">
                    {athlete.email}
                  </span>
                </div>
              </div>

              <div className="space-y-2 py-3 border-y border-gym-border text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Active Program:</span>
                  <span className="text-gym-primary font-bold truncate max-w-[150px]">{athlete.program}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Body Weight:</span>
                  <span className="text-white font-mono">{athlete.bodyWeight}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Deadlift 1RM:</span>
                  <span className="text-gym-lime font-mono font-bold">{athlete.deadliftPR}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gym-secondary">Visits This Month:</span>
                  <span className="text-white font-mono">{athlete.sessionsLogged} Sessions</span>
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-2">
              <Link
                to="/trainer/workouts"
                className="w-full py-2 bg-gym-lime hover:bg-gym-lime-hover text-gym-black font-heading font-black uppercase text-xs rounded text-center shadow-lime-glow transition-all"
              >
                Assign / Adjust Routine
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
