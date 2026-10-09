import React, { useState } from 'react';
import { 
  Dumbbell, 
  CheckCircle, 
  Clock, 
  Flame, 
  Plus, 
  Calendar, 
  Award, 
  ChevronRight,
  TrendingUp,
  Layers
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useGymData } from '@/context/GymDataContext';
import type { WorkoutExercise, WorkoutCategory } from '@/types';

export const MemberWorkoutsPage: React.FC = () => {
  const { user } = useAuth();
  const { getMemberWorkouts, getMemberLogs, logWorkoutSet } = useGymData();

  const [activePlanIndex, setActivePlanIndex] = useState(0);
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  
  // Form state for logging a set
  const [actualSets, setActualSets] = useState(4);
  const [actualReps, setActualReps] = useState(8);
  const [actualWeight, setActualWeight] = useState(85);
  const [logNotes, setLogNotes] = useState('');
  const [completedExercises, setCompletedExercises] = useState<string[]>([]);

  if (!user) return null;

  const workoutPlans = getMemberWorkouts(user.id);
  const currentPlan = workoutPlans[activePlanIndex] || workoutPlans[0];
  const workoutLogs = getMemberLogs(user.id);

  const handleOpenLogger = (exercise: WorkoutExercise) => {
    setSelectedExercise(exercise);
    setActualSets(exercise.sets);
    setActualReps(exercise.reps);
    setActualWeight(exercise.target_weight_kg || 0);
    setLogNotes('');
  };

  const handleSaveLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise) return;

    logWorkoutSet({
      member_id: user.id,
      exercise_id: selectedExercise.id,
      exercise_name: selectedExercise.exercise_name,
      plan_id: currentPlan?.id,
      actual_sets: Number(actualSets),
      actual_reps: Number(actualReps),
      actual_weight_kg: Number(actualWeight),
      notes: logNotes
    });

    if (!completedExercises.includes(selectedExercise.id)) {
      setCompletedExercises(prev => [...prev, selectedExercise.id]);
    }

    setSelectedExercise(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
            ATHLETIC PROGRAMMING & SET LOGGER
          </h2>
          <p className="text-xs text-gym-secondary">
            Periodized training assigned by Master Coach {user.assigned_trainer_name || 'Marcus Drake'}
          </p>
        </div>

        {/* Plan Switcher Pills */}
        <div className="flex items-center gap-2 bg-gym-surface p-1 rounded border border-gym-border overflow-x-auto">
          {workoutPlans.map((plan, index) => (
            <button
              key={plan.id}
              onClick={() => setActivePlanIndex(index)}
              className={`px-3 py-1.5 rounded text-xs font-heading uppercase font-bold tracking-wider whitespace-nowrap transition-colors ${
                activePlanIndex === index
                  ? 'bg-gym-lime text-gym-black shadow-lime-glow'
                  : 'text-gym-secondary hover:text-white'
              }`}
            >
              {plan.title.split(' ')[0]} ({plan.category})
            </button>
          ))}
        </div>
      </div>

      {currentPlan ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Program Exercises List (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gym-surface border border-gym-border rounded-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gym-border pb-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-heading text-xl font-black uppercase text-gym-primary tracking-wide">
                      {currentPlan.title}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-heading uppercase font-bold bg-gym-lime/10 text-gym-lime border border-gym-lime/20">
                      {currentPlan.category}
                    </span>
                  </div>
                  <p className="text-xs text-gym-secondary mt-1">
                    {currentPlan.notes || 'Follow calibrated lifting cadence. Rest as indicated.'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-gym-muted block">Completion Today</span>
                  <span className="font-heading font-black text-sm text-gym-lime">
                    {completedExercises.length} / {currentPlan.exercises?.length || 0} Exercises Completed
                  </span>
                </div>
              </div>

              {/* Exercise Cards */}
              <div className="space-y-3">
                {currentPlan.exercises?.map((exercise, idx) => {
                  const isDone = completedExercises.includes(exercise.id);
                  return (
                    <div
                      key={exercise.id}
                      className={`p-4 rounded-sm border transition-all ${
                        isDone
                          ? 'bg-gym-black/40 border-gym-lime/40'
                          : 'bg-gym-black border-gym-border hover:border-gym-muted'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span className="w-7 h-7 rounded-sm bg-gym-surface border border-gym-border flex items-center justify-center font-heading font-bold text-xs text-gym-lime shrink-0">
                            0{idx + 1}
                          </span>
                          <div>
                            <h4 className="font-heading font-black uppercase text-base text-gym-primary tracking-wide">
                              {exercise.exercise_name}
                            </h4>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gym-secondary mt-1">
                              <span><strong className="text-gym-primary">{exercise.sets}</strong> Sets</span>
                              <span>&bull;</span>
                              <span><strong className="text-gym-primary">{exercise.reps}</strong> Reps</span>
                              <span>&bull;</span>
                              <span>Target: <strong className="text-gym-lime">{exercise.target_weight_kg > 0 ? `${exercise.target_weight_kg} kg` : 'Bodyweight'}</strong></span>
                              <span>&bull;</span>
                              <span className="flex items-center gap-1 text-gym-muted">
                                <Clock className="w-3 h-3" /> {exercise.rest_seconds}s rest
                              </span>
                            </div>
                            {exercise.instructions && (
                              <p className="text-[11px] text-gym-muted mt-1.5 italic">
                                "{exercise.instructions}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Log Button */}
                        <button
                          onClick={() => handleOpenLogger(exercise)}
                          className={`px-4 py-2 rounded-sm text-xs font-heading font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 ${
                            isDone
                              ? 'bg-gym-surface hover:bg-gym-surface-hover text-gym-lime border border-gym-lime/30'
                              : 'bg-gym-lime text-gym-black hover:bg-gym-lime-hover shadow-lime-glow'
                          }`}
                        >
                          {isDone ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" /> Log Another Set
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" /> Record Set
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Training History Logged Today / Recently */}
          <div className="space-y-4">
            <div className="bg-gym-surface border border-gym-border rounded-sm p-5">
              <h3 className="font-heading text-lg font-black uppercase tracking-wider text-gym-primary mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-gym-lime" />
                RECORDED SETS TODAY
              </h3>

              {workoutLogs.length === 0 ? (
                <div className="py-8 text-center text-gym-muted text-xs">
                  No sets logged in this session yet. Hit "Record Set" on any exercise to begin tracking your volume.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-96 overflow-y-auto">
                  {workoutLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 bg-gym-black rounded border border-gym-border flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-gym-primary uppercase block">
                          {log.exercise_name || 'Exercise'}
                        </span>
                        <span className="text-[11px] text-gym-muted">
                          {log.actual_sets} sets &times; {log.actual_reps} reps
                        </span>
                        {log.notes && (
                          <span className="text-[10px] text-gym-secondary block italic mt-0.5">
                            "{log.notes}"
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="font-heading font-black text-sm text-gym-lime block">
                          {log.actual_weight_kg} kg
                        </span>
                        <span className="text-[10px] text-gym-muted font-mono">
                          {new Date(log.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Coach's Periodization Note */}
            <div className="bg-gym-surface border border-gym-border rounded-sm p-5">
              <h4 className="font-heading text-xs font-black uppercase tracking-wider text-gym-muted mb-2">
                COACHING DIRECTIVE &bull; NO COMPROMISE
              </h4>
              <p className="text-xs text-gym-secondary leading-relaxed">
                Prioritize bar speed and mechanical tension over ego lifting. If 4th set drops below RPE 9, reduce 5% load and maintain full range of motion.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gym-surface border border-gym-border p-12 text-center text-gym-secondary">
          No workout plans assigned yet.
        </div>
      )}

      {/* ================= MODAL: RECORD SET ================= */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gym-surface border border-gym-border rounded-sm max-w-md w-full p-6 relative shadow-card animate-in fade-in zoom-in-95">
            <button
              onClick={() => setSelectedExercise(null)}
              className="absolute top-4 right-4 text-gym-muted hover:text-white text-sm"
            >
              ✕
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-heading font-black uppercase text-gym-lime tracking-widest">
                RECORD WORKOUT PERFORMANCE
              </span>
              <h3 className="font-heading text-2xl font-black uppercase text-gym-primary tracking-wide">
                {selectedExercise.exercise_name}
              </h3>
              <p className="text-xs text-gym-secondary">
                Target: {selectedExercise.sets} sets &times; {selectedExercise.reps} reps @ {selectedExercise.target_weight_kg} kg
              </p>
            </div>

            <form onSubmit={handleSaveLog} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Sets Completed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={actualSets}
                    onChange={(e) => setActualSets(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded-sm text-gym-primary font-bold text-center focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Reps / Set
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={actualReps}
                    onChange={(e) => setActualReps(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded-sm text-gym-primary font-bold text-center focus:outline-none focus:border-gym-lime"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="500"
                    value={actualWeight}
                    onChange={(e) => setActualWeight(Number(e.target.value))}
                    required
                    className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded-sm text-gym-primary font-bold text-center focus:outline-none focus:border-gym-lime"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-heading font-bold uppercase text-gym-secondary mb-1">
                  Athlete Notes / RPE (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Felt solid, RPE 8.5, paused 1s at bottom"
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full py-2 px-3 bg-gym-black border border-gym-border rounded-sm text-gym-primary text-xs focus:outline-none focus:border-gym-lime"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedExercise(null)}
                  className="w-1/2 py-2.5 bg-gym-black hover:bg-gym-surface border border-gym-border text-gym-secondary text-xs uppercase font-heading font-bold rounded-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-gym-lime hover:bg-gym-lime-hover text-gym-black text-xs uppercase font-heading font-black tracking-wider rounded-sm shadow-lime-glow"
                >
                  Confirm & Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
