import React from 'react';
import { Dumbbell, Plus, Layers, Sparkles } from 'lucide-react';
import { useGymData } from '@/context/GymDataContext';

export const AdminWorkoutsPage: React.FC = () => {
  const { workoutPlans } = useGymData();

  const standardMovements = [
    { name: 'Barbell Bench Press', category: 'Push', target: 'Pectoralis Major, Anterior Deltoid' },
    { name: 'Conventional Deadlift', category: 'Pull', target: 'Posterior Kinetic Chain, Erectors' },
    { name: 'Low Bar Back Squat', category: 'Legs', target: 'Quadriceps, Gluteus Maximus' },
    { name: 'Standing Overhead Press', category: 'Push', target: 'Deltoids, Triceps Brachii' },
    { name: 'Weighted Pull-Ups', category: 'Pull', target: 'Latissimus Dorsi, Biceps' },
    { name: 'Barbell Romanian Deadlift', category: 'Legs', target: 'Hamstrings, Glute Ham Tie-In' },
    { name: 'Cable Lateral Raise', category: 'Shoulders', target: 'Lateral Deltoid isolation' },
    { name: 'Close-Grip Bench Press', category: 'Arms', target: 'Triceps medial & lateral heads' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
          EXERCISE TAXONOMY & WORKOUT CATALOG
        </h2>
        <p className="text-xs text-gym-secondary">
          Global database of calibrated exercise movements, categories, and active training plans
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Plans Assigned */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-gym-lime" />
            DEPLOYED ATHLETE ROUTINES ({workoutPlans.length})
          </h3>

          <div className="space-y-3">
            {workoutPlans.map(plan => (
              <div key={plan.id} className="p-3 bg-gym-black rounded border border-gym-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-white uppercase block">{plan.title}</span>
                  <span className="text-gym-secondary text-[11px]">Athlete: {plan.member_name || 'Alex Vance'} &bull; {plan.category}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] bg-gym-lime/10 text-gym-lime border border-gym-lime/20 font-mono">
                  {plan.exercises?.length || 0} Ex.
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Global Exercise Database */}
        <div className="bg-gym-surface border border-gym-border rounded-sm p-6">
          <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-4 flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-cyan-400" />
            STANDARDIZED MOVEMENT TAXONOMY
          </h3>

          <div className="space-y-2.5 max-h-96 overflow-y-auto">
            {standardMovements.map((m, i) => (
              <div key={i} className="p-3 bg-gym-black rounded border border-gym-border flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-gym-primary uppercase block">{m.name}</span>
                  <span className="text-[11px] text-gym-muted">{m.target}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-heading font-black uppercase bg-gym-surface text-gym-lime border border-gym-border">
                  {m.category}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
